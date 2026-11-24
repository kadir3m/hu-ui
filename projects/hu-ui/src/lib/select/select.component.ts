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
import { huFold as fold } from '../core/text';
import { huUniqueId } from '../core/unique-id';
import { HU_FORM_FIELD, HuFormFieldControl } from '../form-field/form-field.tokens';
import { HuInputSize } from '../form-field/input.directive';
import { HuSelectOption } from '../multi-select/multi-select.component';

type Row<T> = { kind: 'group'; label: string } | { kind: 'option'; option: HuSelectOption<T>; index: number };

/**
 * Tek seçimli açılır liste. Native `<select>`'in yerine: tema renklerinde panel,
 * arama (Türkçe karakterleri yok sayar: "ogr" → "Öğrenci"), gruplar, ikon ve
 * açıklamalı seçenekler. Formlarla veya `[(value)]` ile çalışır.
 *
 * @example
 * <hu-form-field label="Fakülte">
 *   <hu-select formControlName="faculty" [options]="faculties" placeholder="Fakülte seçin" />
 * </hu-form-field>
 */
@Component({
  selector: 'hu-select',
  imports: [HuIcon],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HuSelect), multi: true },
    { provide: HuFormFieldControl, useExisting: forwardRef(() => HuSelect) },
  ],
  host: {
    class: 'hu-select',
    '[class.hu-select--open]': 'open()',
    '[class.hu-select--disabled]': 'isDisabled()',
    '[attr.data-size]': 'size()',
    '(focusout)': 'onFocusOut($event)',
    '(document:mousedown)': 'onDocumentPointer($event)',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuSelect<T = string> implements ControlValueAccessor, HuFormFieldControl, DoCheck {
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly win = inject(DOCUMENT).defaultView;
  protected readonly field = inject(HU_FORM_FIELD, { optional: true, host: true });

  readonly options = input<readonly HuSelectOption<T>[]>([]);
  readonly value = model<T | null>(null);
  readonly placeholder = input('Seçin');
  /**
   * Panelde arama kutusu. Varsayılan: seçenek sayısı `filterThreshold`'u
   * aşınca açılır; `true` / `false` ile zorlanabilir.
   */
  readonly filter = input<boolean | 'auto', unknown>('auto', {
    transform: (v: unknown) => (v === 'auto' ? 'auto' : booleanAttribute(v)),
  });
  /** `filter="auto"` iken arama kutusunun çıktığı seçenek sayısı. */
  readonly filterThreshold = input(7, { transform: numberAttribute });
  readonly filterPlaceholder = input('Ara…');
  /** Kutunun içindeki ✕ ile seçimi temizleme. */
  readonly showClear = input(false, { transform: booleanAttribute });
  readonly emptyMessage = input('Sonuç bulunamadı');
  readonly size = input<HuInputSize>('md');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string>();
  readonly id = input(huUniqueId('hu-select'));
  /** Seçenekleri karşılaştırma (nesne değerlerde, örn. `(a, b) => a.id === b.id`). */
  readonly compareWith = input<(a: T, b: T) => boolean>(Object.is);

  /** Kullanıcı bir seçenek seçince (veya temizleyince). */
  readonly selectionChange = output<T | null>();
  /** Panel kapandığında. */
  readonly closed = output<void>();

  protected readonly open = signal(false);
  protected readonly query = signal('');
  /** Klavyeyle / fareyle üzerinde durulan seçenek (görünen listedeki sırası). */
  protected readonly activeIndex = signal(-1);
  protected readonly listId = huUniqueId('hu-select-list');
  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  protected readonly showFilter = computed(() => {
    const f = this.filter();
    return f === 'auto' ? this.options().length > this.filterThreshold() : f;
  });
  protected readonly selectedOption = computed(() => {
    const value = this.value();
    if (value == null) return undefined;
    const cmp = this.compareWith();
    return this.options().find((o) => cmp(o.value, value));
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
  private onChange: (value: T | null) => void = () => {};
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

  /** Paneli açar; `initialQuery` verilirse arama kutusuna yazılır (kapalıyken yazmaya başlama). */
  show(initialQuery = ''): void {
    if (this.isDisabled() || this.open()) return;
    this.query.set(initialQuery);
    this.open.set(true);
    const selected = this.visible().findIndex((o) => this.isSelected(o));
    this.activeIndex.set(!initialQuery && selected >= 0 ? selected : this.nextEnabled(-1, 1));
    afterNextRender(
      () => {
        if (!this.open()) return;
        if (this.supportsPopover) this.panel().nativeElement.showPopover();
        this.positionPanel();
        (this.search() ?? this.listbox())?.nativeElement.focus({ preventScroll: true });
        this.scrollActiveIntoView('center');
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
    const value = this.value();
    return value != null && this.compareWith()(option.value, value);
  }

  protected choose(option: HuSelectOption<T>): void {
    if (option.disabled || this.isDisabled()) return;
    if (!this.isSelected(option)) this.commit(option.value);
    this.close(true);
  }

  protected clear(event: Event): void {
    event.stopPropagation();
    if (this.isDisabled()) return;
    this.commit(null);
    this.trigger().nativeElement.focus();
  }

  // --- Klavye --------------------------------------------------------------------------
  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (['Enter', ' ', 'ArrowDown', 'ArrowUp', 'F4'].includes(event.key) || (event.altKey && event.key === 'ArrowDown')) {
      event.preventDefault();
      this.show();
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      // Kapalıyken yazmaya başlamak paneli açar ve aramaya yazar
      event.preventDefault();
      if (this.showFilter()) this.show(event.key);
      else this.jumpTo(event.key);
    } else if ((event.key === 'Delete' || event.key === 'Backspace') && this.showClear() && this.value() != null) {
      event.preventDefault();
      this.commit(null);
    }
  }

  protected onPanelKeydown(event: KeyboardEvent): void {
    const visible = this.visible();
    const inSearch = event.target === this.search()?.nativeElement;
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
        if (inSearch) return; // metin içinde gezinme
        event.preventDefault();
        this.activeIndex.set(this.nextEnabled(-1, 1));
        break;
      case 'End':
        if (inSearch) return;
        event.preventDefault();
        this.activeIndex.set(this.nextEnabled(visible.length, -1));
        break;
      case 'PageDown':
      case 'PageUp': {
        event.preventDefault();
        const step = event.key === 'PageDown' ? 1 : -1;
        let i = this.activeIndex();
        for (let n = 0; n < 8; n++) i = this.nextEnabled(i, step);
        this.activeIndex.set(i);
        break;
      }
      case 'Enter':
        event.preventDefault();
        if (visible[this.activeIndex()]) this.choose(visible[this.activeIndex()]);
        return;
      case ' ':
        if (inSearch) return; // arama kutusunda boşluk yazılabilsin
        event.preventDefault();
        if (visible[this.activeIndex()]) this.choose(visible[this.activeIndex()]);
        return;
      case 'Escape':
        event.preventDefault();
        event.stopPropagation(); // dialog içindeyse dialog kapanmasın
        this.close(true);
        return;
      case 'Tab':
        this.close();
        return;
      default:
        if (!inSearch && event.key.length === 1 && !event.ctrlKey && !event.metaKey) this.jumpTo(event.key);
        return;
    }
    this.scrollActiveIntoView();
  }

  protected onQuery(value: string): void {
    this.query.set(value);
    this.activeIndex.set(this.nextEnabled(-1, 1));
    this.scrollActiveIntoView();
  }

  protected onOptionHover(index: number, option: HuSelectOption<T>): void {
    if (!option.disabled && this.activeIndex() !== index) this.activeIndex.set(index);
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
    this.value.set((value ?? null) as T | null);
  }
  registerOnChange(fn: (value: T | null) => void): void {
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
  private commit(value: T | null): void {
    this.value.set(value);
    this.onChange(value);
    this.selectionChange.emit(value);
  }

  /** Aramasız listede harfe basınca o harfle başlayan sonraki seçeneğe git. */
  private jumpTo(char: string): void {
    const list = this.visible();
    const c = fold(char);
    const start = this.open() ? this.activeIndex() : list.findIndex((o) => this.isSelected(o));
    for (let n = 1; n <= list.length; n++) {
      const i = (start + n + list.length) % list.length;
      if (!list[i].disabled && fold(list[i].label).startsWith(c)) {
        if (this.open()) {
          this.activeIndex.set(i);
          this.scrollActiveIntoView();
        } else {
          this.commit(list[i].value);
        }
        return;
      }
    }
  }

  private nextEnabled(from: number, direction: 1 | -1): number {
    const list = this.visible();
    for (let i = from + direction; i >= 0 && i < list.length; i += direction) {
      if (!list[i].disabled) return i;
    }
    return from >= 0 && from < list.length ? from : -1;
  }

  private scrollActiveIntoView(block: ScrollLogicalPosition = 'nearest'): void {
    afterNextRender(
      () =>
        this.panel()
          .nativeElement.querySelector('.hu-select__option--active')
          ?.scrollIntoView({ block }),
      { injector: this.injector },
    );
  }

  private positionPanel(): void {
    const panel = this.panel().nativeElement;
    if (!this.supportsPopover || !this.win) return;
    const anchor = this.trigger().nativeElement.getBoundingClientRect();
    panel.style.minWidth = `${anchor.width}px`;
    const { offsetWidth: width, offsetHeight: height } = panel;
    const gap = 6;
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
