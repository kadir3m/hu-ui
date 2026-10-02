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
  forwardRef,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl, ValidationErrors } from '@angular/forms';
import { HuIcon } from '../icon/icon.component';
import { huUniqueId } from '../core/unique-id';
import { HU_FORM_FIELD, HuFormFieldControl } from '../form-field/form-field.tokens';
import { HuInputSize } from '../form-field/input.directive';

export interface HuSelectOption<T = string> {
  label: string;
  value: T;
  /** Etiketin altında küçük açıklama. */
  description?: string;
  icon?: string;
  disabled?: boolean;
  /** Aynı gruptaki seçenekler bir başlık altında listelenir. */
  group?: string;
}

export type HuMultiSelectDisplay = 'chips' | 'text';

type Row<T> = { kind: 'group'; label: string } | { kind: 'option'; option: HuSelectOption<T>; index: number };

/**
 * Çoklu seçim kutusu. Değer seçilen `value`'ların dizisidir (`T[]`); formlarla veya
 * `[(value)]` ile çalışır. Arama Türkçe karakterleri yok sayar ("ogr" → "Öğrenci").
 *
 * @example
 * <hu-form-field label="Bölümler">
 *   <hu-multi-select formControlName="departments" [options]="departments" placeholder="Bölüm seçin" />
 * </hu-form-field>
 *
 * departments: HuSelectOption[] = [
 *   { label: 'Bilgisayar Mühendisliği', value: 'bm', group: 'Mühendislik' },
 *   { label: 'Matematik', value: 'mat', group: 'Fen' },
 * ];
 */
@Component({
  selector: 'hu-multi-select',
  imports: [HuIcon],
  templateUrl: './multi-select.component.html',
  styleUrl: './multi-select.component.scss',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HuMultiSelect), multi: true },
    { provide: HuFormFieldControl, useExisting: forwardRef(() => HuMultiSelect) },
  ],
  host: {
    class: 'hu-multi-select',
    '[class.hu-multi-select--open]': 'open()',
    '[class.hu-multi-select--disabled]': 'isDisabled()',
    '[attr.data-size]': 'size()',
    '(focusout)': 'onFocusOut($event)',
    '(document:mousedown)': 'onDocumentPointer($event)',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuMultiSelect<T = string> implements ControlValueAccessor, HuFormFieldControl, DoCheck {
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly win = inject(DOCUMENT).defaultView;
  protected readonly field = inject(HU_FORM_FIELD, { optional: true, host: true });

  readonly options = input<readonly HuSelectOption<T>[]>([]);
  readonly value = model<T[]>([]);
  /** null/undefined verilirse boş dizi (henüz yüklenmemiş veri, form reset vb.). */
  protected readonly values = computed(() => this.value() ?? []);
  readonly placeholder = input('Seçin');
  /** Panelde arama kutusu. */
  readonly filter = input(true, { transform: booleanAttribute });
  readonly filterPlaceholder = input('Ara…');
  /** "Tümünü seç" satırı (görünen, yani aramaya uyan seçenekler için). */
  readonly showSelectAll = input(true, { transform: booleanAttribute });
  /** Kutunun içindeki ✕ ile seçimi temizleme. */
  readonly showClear = input(true, { transform: booleanAttribute });
  /** Seçilenler çip olarak mı, virgüllü metin olarak mı gösterilsin. */
  readonly display = input<HuMultiSelectDisplay>('chips');
  /** Bundan fazla seçimde "5 seçildi" yazılır. */
  readonly maxSelectedLabels = input(3, { transform: numberAttribute });
  /** En fazla seçim sayısı. */
  readonly selectionLimit = input<number | null>(null);
  readonly emptyMessage = input('Sonuç bulunamadı');
  readonly size = input<HuInputSize>('md');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string>();
  readonly id = input(huUniqueId('hu-multi-select'));
  /** Seçenekleri karşılaştırma (nesne değerlerde, örn. `(a, b) => a.id === b.id`). */
  readonly compareWith = input<(a: T, b: T) => boolean>(Object.is);

  /** Panel kapandığında. */
  readonly closed = output<void>();

  protected readonly open = signal(false);
  protected readonly query = signal('');
  /** Klavyeyle üzerinde durulan seçenek (görünen listedeki sırası). */
  protected readonly activeIndex = signal(-1);
  protected readonly listId = huUniqueId('hu-multi-select-list');
  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  protected readonly selectedOptions = computed(() => {
    const cmp = this.compareWith();
    return this.values()
      .map((v) => this.options().find((o) => cmp(o.value, v)))
      .filter((o): o is HuSelectOption<T> => !!o);
  });
  protected readonly visible = computed(() => {
    const q = fold(this.query().trim());
    return q ? this.options().filter((o) => fold(o.label).includes(q) || fold(o.description ?? '').includes(q)) : [...this.options()];
  });
  protected readonly rows = computed<Row<T>[]>(() => {
    const rows: Row<T>[] = [];
    let group: string | undefined;
    this.visible().forEach((option, index) => {
      if (option.group && option.group !== group) rows.push({ kind: 'group', label: option.group });
      group = option.group;
      rows.push({ kind: 'option', option, index });
    });
    return rows;
  });
  protected readonly selectable = computed(() => this.visible().filter((o) => !o.disabled));
  protected readonly allSelected = computed(() => {
    const list = this.selectable();
    return list.length > 0 && list.every((o) => this.isSelected(o));
  });
  protected readonly someSelected = computed(() => !this.allSelected() && this.selectable().some((o) => this.isSelected(o)));
  protected readonly limitReached = computed(() => {
    const limit = this.selectionLimit();
    return limit != null && this.values().length >= limit;
  });
  /** Tetikleyicide gösterilecek metin (`display="text"` veya çok seçimde). */
  protected readonly summary = computed(() => {
    const selected = this.selectedOptions();
    if (selected.length > this.maxSelectedLabels()) return `${selected.length} seçildi`;
    return selected.map((o) => o.label).join(', ');
  });
  protected readonly showChips = computed(
    () => this.display() === 'chips' && this.selectedOptions().length <= this.maxSelectedLabels(),
  );

  // --- HuFormFieldControl -----------------------------------------------------------
  private ngControl: NgControl | null | undefined;
  get hasControl(): boolean {
    return !!this.resolveControl();
  }
  readonly controlErrorVisible = signal(false);
  readonly errors = signal<ValidationErrors | null>(null);
  protected readonly isInvalid = computed(() => this.controlErrorVisible() || (this.field?.showError() ?? false));

  private readonly trigger = viewChild.required<ElementRef<HTMLElement>>('trigger');
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');
  private readonly search = viewChild<ElementRef<HTMLInputElement>>('search');
  private readonly listbox = viewChild<ElementRef<HTMLElement>>('listbox');
  protected readonly supportsPopover = typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype;
  private pointerInside = false;
  private onChange: (value: T[]) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
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
    else this.show();
  }

  show(): void {
    if (this.isDisabled() || this.open()) return;
    this.query.set('');
    this.open.set(true);
    const first = this.visible().findIndex((o) => this.isSelected(o));
    this.activeIndex.set(first >= 0 ? first : this.nextEnabled(-1, 1));
    afterNextRender(
      () => {
        if (!this.open()) return;
        if (this.supportsPopover) this.panel().nativeElement.showPopover();
        this.positionPanel();
        (this.search() ?? this.listbox())?.nativeElement.focus({ preventScroll: true });
        this.scrollActiveIntoView();
      },
      { injector: this.injector },
    );
  }

  close(restoreFocus = false): void {
    if (!this.open()) return;
    this.open.set(false);
    const panel = this.panel().nativeElement;
    if (this.supportsPopover && panel.matches(':popover-open')) panel.hidePopover();
    if (restoreFocus) this.trigger().nativeElement.focus();
    this.closed.emit();
  }

  // --- Seçim -------------------------------------------------------------------------
  protected isSelected(option: HuSelectOption<T>): boolean {
    const cmp = this.compareWith();
    return this.values().some((v) => cmp(v, option.value));
  }

  protected toggleOption(option: HuSelectOption<T>): void {
    if (option.disabled || this.isDisabled()) return;
    const cmp = this.compareWith();
    if (this.isSelected(option)) {
      this.commit(this.values().filter((v) => !cmp(v, option.value)));
    } else if (!this.limitReached()) {
      // Seçenek sırasını koru (seçim sırasına göre değil)
      const next = [...this.values(), option.value];
      this.commit(this.sortByOptions(next));
    }
  }

  protected toggleAll(): void {
    const cmp = this.compareWith();
    const visible = this.selectable();
    if (this.allSelected()) {
      this.commit(this.values().filter((v) => !visible.some((o) => cmp(o.value, v))));
    } else {
      const add = visible.filter((o) => !this.isSelected(o)).map((o) => o.value);
      const limit = this.selectionLimit();
      const room = limit == null ? add.length : Math.max(0, limit - this.values().length);
      this.commit(this.sortByOptions([...this.values(), ...add.slice(0, room)]));
    }
  }

  protected remove(option: HuSelectOption<T>, event: Event): void {
    event.stopPropagation();
    if (this.isDisabled()) return;
    const cmp = this.compareWith();
    this.commit(this.values().filter((v) => !cmp(v, option.value)));
  }

  protected clearAll(event: Event): void {
    event.stopPropagation();
    if (this.isDisabled()) return;
    this.commit([]);
    this.trigger().nativeElement.focus();
  }

  // --- Klavye --------------------------------------------------------------------------
  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      this.show();
    } else if (event.key === 'Backspace' && !this.open() && this.values().length) {
      // Son seçimi kaldır
      this.commit(this.values().slice(0, -1));
    }
  }

  protected onPanelKeydown(event: KeyboardEvent): void {
    const visible = this.visible();
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex.set(this.nextEnabled(this.activeIndex(), 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.set(this.nextEnabled(this.activeIndex(), -1));
        break;
      case 'Home':
        if (event.target === this.search()?.nativeElement) return; // metin içinde gezinme
        event.preventDefault();
        this.activeIndex.set(this.nextEnabled(-1, 1));
        break;
      case 'End':
        if (event.target === this.search()?.nativeElement) return;
        event.preventDefault();
        this.activeIndex.set(this.nextEnabled(visible.length, -1));
        break;
      case 'Enter':
        event.preventDefault();
        if (visible[this.activeIndex()]) this.toggleOption(visible[this.activeIndex()]);
        break;
      case ' ':
        // Arama kutusunda boşluk yazılabilsin
        if (event.target === this.search()?.nativeElement) return;
        event.preventDefault();
        if (visible[this.activeIndex()]) this.toggleOption(visible[this.activeIndex()]);
        break;
      case 'a':
        if ((event.ctrlKey || event.metaKey) && event.target !== this.search()?.nativeElement) {
          event.preventDefault();
          this.toggleAll();
        }
        return;
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        this.close(true);
        return;
      case 'Tab':
        this.close();
        return;
      default:
        return;
    }
    this.scrollActiveIntoView();
  }

  protected onQuery(value: string): void {
    this.query.set(value);
    this.activeIndex.set(this.nextEnabled(-1, 1));
  }

  protected optionId(index: number): string {
    return `${this.listId}-${index}`;
  }

  // --- Odak / dış tıklama -------------------------------------------------------------
  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && this.host.nativeElement.contains(next)) return;
    if (!next && this.pointerInside && this.open()) return;
    this.close();
    this.onTouched();
  }

  protected onDocumentPointer(event: MouseEvent): void {
    this.pointerInside = this.host.nativeElement.contains(event.target as Node);
    if (this.open() && !this.pointerInside) this.close();
  }

  // --- ControlValueAccessor ------------------------------------------------------------
  writeValue(value: unknown): void {
    this.value.set(Array.isArray(value) ? (value as T[]) : value == null ? [] : [value as T]);
  }
  registerOnChange(fn: (value: T[]) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
    if (disabled) this.close();
  }

  // --- Yardımcılar ---------------------------------------------------------------------
  private commit(value: T[]): void {
    this.value.set(value);
    this.onChange(value);
    // Çip sayısı değişince tetikleyici büyüyebilir: paneli yeniden hizala
    if (this.open()) afterNextRender(() => this.positionPanel(), { injector: this.injector });
  }

  private sortByOptions(values: T[]): T[] {
    const cmp = this.compareWith();
    const order = (v: T) => {
      const i = this.options().findIndex((o) => cmp(o.value, v));
      return i < 0 ? Number.MAX_SAFE_INTEGER : i;
    };
    return [...values].sort((a, b) => order(a) - order(b));
  }

  private nextEnabled(from: number, direction: 1 | -1): number {
    const list = this.visible();
    for (let i = from + direction; i >= 0 && i < list.length; i += direction) {
      if (!list[i].disabled) return i;
    }
    return from >= 0 && from < list.length ? from : -1;
  }

  private scrollActiveIntoView(): void {
    afterNextRender(
      () =>
        this.panel()
          .nativeElement.querySelector('.hu-multi-select__option--active')
          ?.scrollIntoView({ block: 'nearest' }),
      { injector: this.injector },
    );
  }

  private positionPanel(): void {
    const panel = this.panel().nativeElement;
    if (!this.supportsPopover || !this.win) return;
    const anchor = this.trigger().nativeElement.getBoundingClientRect();
    panel.style.width = `${anchor.width}px`;
    const { offsetWidth: width, offsetHeight: height } = panel;
    const gap = 4;
    const spaceBelow = this.win.innerHeight - anchor.bottom;
    const top = spaceBelow < height + gap && anchor.top > height + gap ? anchor.top - height - gap : anchor.bottom + gap;
    const left = Math.max(8, Math.min(anchor.left, this.win.innerWidth - width - 8));
    panel.style.top = `${top}px`;
    panel.style.left = `${left}px`;
  }

  private resolveControl(): NgControl | null {
    if (this.ngControl === undefined) {
      this.ngControl = this.injector.get(NgControl, null, { self: true, optional: true });
    }
    return this.ngControl;
  }
}

/** Arama için: küçük harf, Türkçe karakterler ve aksanlar yok sayılır ("Öğrenci" → "ogrenci"). */
function fold(text: string): string {
  return text
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}
