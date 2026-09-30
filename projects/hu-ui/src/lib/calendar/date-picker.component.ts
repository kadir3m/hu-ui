import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  DoCheck,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  model,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  NgControl,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { HuButton } from '../button/button.component';
import { HuIcon } from '../icon/icon.component';
import { huUniqueId } from '../core/unique-id';
import { HU_FORM_FIELD, HuFormFieldControl } from '../form-field/form-field.tokens';
import { HuInputSize } from '../form-field/input.directive';
import { HuCalendar, HuCalendarMarker, HuCalendarMode } from './calendar.component';
import {
  HuDateRange,
  compareDays,
  formatDate,
  formatRange,
  isValidDate,
  parseDate,
  parseRange,
  startOfDay,
} from './date-utils';

export type HuDatePickerValue = Date | HuDateRange | null;

/**
 * Tarih seçici form kontrolü. Tarih elle (`gg.aa.yyyy`) yazılabilir veya
 * takvimden seçilebilir. `mode="range"` ile değer `{ start, end }` olur.
 * Validasyon hataları: `huDateParse`, `huDateMin`, `huDateMax`, `huDateUnavailable`.
 *
 * @example
 * <hu-form-field label="Başlangıç tarihi">
 *   <hu-date-picker formControlName="startDate" [min]="today" />
 * </hu-form-field>
 * <hu-date-picker mode="range" [(value)]="period" placeholder="Tarih aralığı" />
 */
@Component({
  selector: 'hu-date-picker',
  imports: [HuButton, HuCalendar, HuIcon],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HuDatePicker), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => HuDatePicker), multi: true },
    { provide: HuFormFieldControl, useExisting: forwardRef(() => HuDatePicker) },
  ],
  host: {
    class: 'hu-date-picker',
    '[class.hu-date-picker--open]': 'open()',
    '(focusout)': 'onFocusOut($event)',
    '(document:mousedown)': 'onDocumentPointer($event)',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuDatePicker implements ControlValueAccessor, Validator, HuFormFieldControl, DoCheck {
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly win = inject(DOCUMENT).defaultView;
  protected readonly field = inject(HU_FORM_FIELD, { optional: true, host: true });

  readonly mode = input<HuCalendarMode>('single');
  readonly value = model<HuDatePickerValue>(null);
  readonly min = input<Date | null>(null);
  readonly max = input<Date | null>(null);
  readonly dateFilter = input<((date: Date) => boolean) | null>(null);
  readonly markers = input<HuCalendarMarker[]>([]);
  readonly placeholder = input<string>();
  readonly size = input<HuInputSize>('md');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly id = input(huUniqueId('hu-date-picker'));

  protected readonly open = signal(false);
  protected readonly text = signal('');
  protected readonly panelId = huUniqueId('hu-date-picker-panel');
  private readonly parseError = signal(false);
  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  // --- HuFormFieldControl -----------------------------------------------------------
  // NgControl, NG_VALUE_ACCESSOR döngüsüne girmemek için geç çözülür.
  private ngControl: NgControl | null | undefined;
  get hasControl(): boolean {
    return !!this.resolveControl();
  }
  readonly controlErrorVisible = signal(false);
  readonly errors = signal<ValidationErrors | null>(null);
  protected readonly isInvalid = computed(() => this.controlErrorVisible() || (this.field?.showError() ?? false));

  protected readonly placeholderText = computed(
    () => this.placeholder() ?? (this.mode() === 'range' ? 'gg.aa.yyyy – gg.aa.yyyy' : 'gg.aa.yyyy'),
  );
  protected readonly singleValue = computed(() => {
    const v = this.value();
    return v instanceof Date ? v : null;
  });
  protected readonly rangeValue = computed(() => {
    const v = this.value();
    return v && !(v instanceof Date) ? v : null;
  });
  /** Takvimde aralık seçilirken geçici değer (bitiş seçilene kadar forma yazılmaz). */
  protected readonly draftRange = signal<HuDateRange | null>(null);

  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');
  private readonly calendar = viewChild(HuCalendar);
  protected readonly supportsPopover = typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype;
  /** Son fare basışı bileşenin içinde mi? (DOM'dan kalkan butonlar focusout'u yanıltmasın) */
  private pointerInside = false;

  private onChange: (value: HuDatePickerValue) => void = () => {};
  private onTouched: () => void = () => {};
  private onValidatorChange: () => void = () => {};

  constructor() {
    // Değer dışarıdan (model) değişirse metni güncelle.
    effect(() => {
      const value = this.value();
      untracked(() => this.text.set(this.format(value)));
    });
    // Sınırlar değişince validasyonu yeniden çalıştır.
    effect(() => {
      this.min();
      this.max();
      this.dateFilter();
      untracked(() => this.onValidatorChange());
    });

    const reposition = () => this.open() && this.positionPanel();
    this.win?.addEventListener('resize', reposition);
    this.win?.addEventListener('scroll', reposition, true);
    inject(DestroyRef).onDestroy(() => {
      this.win?.removeEventListener('resize', reposition);
      this.win?.removeEventListener('scroll', reposition, true);
    });
  }

  ngDoCheck(): void {
    const c = this.resolveControl();
    if (!c) return;
    this.controlErrorVisible.set(!!c.invalid && !!(c.touched || c.dirty));
    this.errors.set(c.errors);
  }

  // --- Açma / kapama ----------------------------------------------------------------
  toggle(): void {
    if (this.open()) this.close(true);
    else this.openPanel();
  }

  openPanel(): void {
    if (this.isDisabled() || this.open()) return;
    this.commitText();
    this.draftRange.set(this.rangeValue());
    this.open.set(true);
    // Takvim render edildikten sonra göster, ölç ve odakla.
    afterNextRender(
      () => {
        if (!this.open()) return;
        if (this.supportsPopover) this.panel().nativeElement.showPopover();
        this.positionPanel();
        this.calendar()?.focusActiveCell();
      },
      { injector: this.injector },
    );
  }

  close(restoreFocus = false): void {
    if (!this.open()) return;
    this.open.set(false);
    this.draftRange.set(null);
    if (this.supportsPopover && this.panel().nativeElement.matches(':popover-open')) {
      this.panel().nativeElement.hidePopover();
    }
    if (restoreFocus) this.input().nativeElement.focus();
  }

  private positionPanel(): void {
    const panel = this.panel().nativeElement;
    if (!this.supportsPopover || !this.win) return;
    const anchor = this.host.nativeElement.getBoundingClientRect();
    const { offsetWidth: width, offsetHeight: height } = panel;
    const gap = 6;
    const spaceBelow = this.win.innerHeight - anchor.bottom;
    const top = spaceBelow < height + gap && anchor.top > height + gap ? anchor.top - height - gap : anchor.bottom + gap;
    const left = Math.max(8, Math.min(anchor.left, this.win.innerWidth - width - 8));
    panel.style.top = `${top}px`;
    panel.style.left = `${left}px`;
  }

  // --- Takvimden seçim ------------------------------------------------------------
  protected onCalendarDate(date: Date): void {
    if (this.mode() !== 'single') return;
    this.commit(date);
    this.close(true);
  }

  protected onCalendarRange(range: HuDateRange | null): void {
    this.draftRange.set(range);
    if (range?.start && range.end) {
      this.commit(range);
      this.close(true);
    }
  }

  protected selectToday(): void {
    const today = startOfDay(new Date());
    if (this.mode() === 'single') {
      this.commit(today);
      this.close(true);
    } else {
      this.onCalendarRange({ start: today, end: null });
    }
  }

  protected clear(): void {
    this.commit(null);
    this.close(true);
  }

  // --- Metin girişi ---------------------------------------------------------------
  protected onInput(event: Event): void {
    this.text.set((event.target as HTMLInputElement).value);
  }

  protected onInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.commitText();
    } else if (event.key === 'ArrowDown' && (event.altKey || !this.open())) {
      event.preventDefault();
      this.openPanel();
    } else if (event.key === 'Escape' && this.open()) {
      event.preventDefault();
      this.close(true);
    }
  }

  protected onPanelKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.close(true);
    }
  }

  private commitText(): void {
    const text = this.text().trim();
    const current = this.value();
    if (text === this.format(current)) return;

    if (!text) {
      this.commit(null);
      return;
    }
    const parsed = this.mode() === 'range' ? parseRange(text) : parseDate(text);
    if (parsed) {
      this.commit(parsed);
    } else {
      // Metni koru ki kullanıcı düzeltebilsin; forma null + parse hatası yaz.
      this.parseError.set(true);
      this.value.set(null);
      this.text.set(text);
      this.onChange(null);
    }
  }

  private commit(value: HuDatePickerValue): void {
    this.parseError.set(false);
    this.value.set(value);
    this.text.set(this.format(value));
    this.onChange(value);
  }

  // --- Odak / dış tıklama -----------------------------------------------------------
  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && this.host.nativeElement.contains(next)) return;
    // Panel içinde tıklanan buton yeniden render ile kalktıysa odak "hiçbir yere" gider; kapatma.
    if (!next && this.pointerInside && this.open()) return;
    this.commitText();
    this.close();
    this.onTouched();
  }

  protected onDocumentPointer(event: MouseEvent): void {
    this.pointerInside = this.host.nativeElement.contains(event.target as Node);
    if (this.open() && !this.pointerInside) this.close();
  }

  // --- ControlValueAccessor / Validator ---------------------------------------------
  writeValue(value: unknown): void {
    this.parseError.set(false);
    if (value == null || value === '') this.value.set(null);
    else if (isValidDate(value)) this.value.set(startOfDay(value));
    else if (typeof value === 'object' && 'start' in value) this.value.set(value as HuDateRange);
    else this.value.set(null);
    this.text.set(this.format(this.value()));
  }

  registerOnChange(fn: (value: HuDatePickerValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
    if (disabled) this.close();
  }

  validate(_control: AbstractControl): ValidationErrors | null {
    if (this.parseError()) return { huDateParse: true };
    const value = this.value();
    const dates = value instanceof Date ? [value] : [value?.start, value?.end].filter((d): d is Date => !!d);
    const min = this.min();
    const max = this.max();
    for (const d of dates) {
      if (min && compareDays(d, min) < 0) return { huDateMin: { min: formatDate(min), actual: d } };
      if (max && compareDays(d, max) > 0) return { huDateMax: { max: formatDate(max), actual: d } };
      if (this.dateFilter() && !this.dateFilter()!(d)) return { huDateUnavailable: true };
    }
    return null;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  private format(value: HuDatePickerValue): string {
    if (value instanceof Date) return formatDate(value);
    return value ? formatRange(value) : '';
  }

  private resolveControl(): NgControl | null {
    if (this.ngControl === undefined) {
      this.ngControl = this.injector.get(NgControl, null, { self: true, optional: true });
    }
    return this.ngControl;
  }
}
