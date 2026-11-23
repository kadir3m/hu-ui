import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  DoCheck,
  ElementRef,
  Injector,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  model,
  numberAttribute,
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
import { HuIcon } from '../icon/icon.component';
import { huUniqueId } from '../core/unique-id';
import { HU_FORM_FIELD, HuFormFieldControl } from '../form-field/form-field.tokens';
import { HuInputSize } from '../form-field/input.directive';

export type HuInputNumberButtons = 'none' | 'stacked' | 'horizontal';
export type HuInputNumberMode = 'decimal' | 'currency';

const optionalNumber = (v: unknown): number | null => (v == null || v === '' ? null : numberAttribute(v));

/**
 * Sayı girişi. Türkçe biçimde gösterir (`1.234,56`), yazarken basamakları gruplar.
 * ↑/↓ ile `step` kadar artırır (Shift ile 10 katı). Değer `number | null`'dır.
 * `min`/`max` dışındaki değer odaktan çıkınca sınıra çekilir; formda `min`/`max` hatası da verir.
 *
 * @example
 * <hu-form-field label="Kontenjan">
 *   <hu-input-number formControlName="quota" [min]="1" [max]="500" buttons="horizontal" />
 * </hu-form-field>
 *
 * <hu-input-number [(value)]="price" mode="currency" currency="TRY" />
 * <hu-input-number [(value)]="weight" [maxFractionDigits]="2" suffix="kg" />
 */
@Component({
  selector: 'hu-input-number',
  imports: [HuIcon],
  templateUrl: './input-number.component.html',
  styleUrl: './input-number.component.scss',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HuInputNumber), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => HuInputNumber), multi: true },
    { provide: HuFormFieldControl, useExisting: forwardRef(() => HuInputNumber) },
  ],
  host: {
    class: 'hu-input-number',
    '[attr.data-buttons]': 'buttons()',
    '[attr.data-size]': 'size()',
    '[class.hu-input-number--disabled]': 'isDisabled()',
    '[class.hu-input-number--invalid]': 'isInvalid()',
    // Ön/son ek genişliği kadar iç boşluk (yaklaşık, karakter sayısına göre)
    '[style.--hu-affix-prefix]': "(prefixText()?.length ?? 0) + 'ch'",
    '[style.--hu-affix-suffix]': "(suffix()?.length ?? 0) + 'ch'",
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuInputNumber implements ControlValueAccessor, Validator, HuFormFieldControl, DoCheck {
  private readonly injector = inject(Injector);
  protected readonly field = inject(HU_FORM_FIELD, { optional: true, host: true });

  readonly value = model<number | null>(null);
  readonly min = input(null, { transform: optionalNumber });
  readonly max = input(null, { transform: optionalNumber });
  readonly step = input(1, { transform: numberAttribute });
  readonly mode = input<HuInputNumberMode>('decimal');
  /** ISO para birimi kodu (`mode="currency"` ile): `'TRY'`, `'USD'`, `'EUR'`. */
  readonly currency = input('TRY');
  /** Ondalık basamak sayısı. Varsayılan: decimal → 0–0, currency → 2–2. */
  readonly minFractionDigits = input(null, { transform: optionalNumber });
  readonly maxFractionDigits = input(null, { transform: optionalNumber });
  /** Binlik ayracı (`1.234`). */
  readonly useGrouping = input(true, { transform: booleanAttribute });
  /** Kutunun solunda / sağında sabit metin: `'%'`, `'kg'`, `'adet'`. */
  readonly prefix = input<string>();
  readonly suffix = input<string>();
  /** Artır / azalt butonları. */
  readonly buttons = input<HuInputNumberButtons>('none');
  readonly placeholder = input<string>();
  readonly size = input<HuInputSize>('md');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string>();
  readonly id = input(huUniqueId('hu-input-number'));

  protected readonly text = signal('');
  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  protected readonly fraction = computed(() => {
    const currency = this.mode() === 'currency';
    const max = this.maxFractionDigits() ?? (currency ? 2 : 0);
    const min = Math.min(this.minFractionDigits() ?? (currency ? 2 : 0), max);
    return { min, max };
  });
  /** Para biriminin simgesi: TRY → ₺ */
  protected readonly prefixText = computed(() => {
    if (this.prefix()) return this.prefix();
    if (this.mode() !== 'currency') return undefined;
    try {
      return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: this.currency() })
        .formatToParts(0)
        .find((p) => p.type === 'currency')?.value;
    } catch {
      return this.currency();
    }
  });
  protected readonly canDecrement = computed(() => {
    const v = this.value();
    const min = this.min();
    return !this.isDisabled() && !this.readonly() && (v == null || min == null || v > min);
  });
  protected readonly canIncrement = computed(() => {
    const v = this.value();
    const max = this.max();
    return !this.isDisabled() && !this.readonly() && (v == null || max == null || v < max);
  });

  // --- HuFormFieldControl -----------------------------------------------------------
  private ngControl: NgControl | null | undefined;
  get hasControl(): boolean {
    return !!this.resolveControl();
  }
  readonly controlErrorVisible = signal(false);
  readonly errors = signal<ValidationErrors | null>(null);
  protected readonly isInvalid = computed(() => this.controlErrorVisible() || (this.field?.showError() ?? false));

  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');
  private focused = false;
  private repeatTimer?: ReturnType<typeof setTimeout>;
  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};
  private onValidatorChange: () => void = () => {};

  constructor() {
    // Değer dışarıdan değişince metni güncelle (yazarken kullanıcının metnine dokunma).
    effect(() => {
      const value = this.value();
      this.fraction();
      this.useGrouping();
      untracked(() => {
        if (!this.focused || parseNumber(this.text()) !== value) this.text.set(this.format(value));
      });
    });
    effect(() => {
      this.min();
      this.max();
      untracked(() => this.onValidatorChange());
    });
    inject(DestroyRef).onDestroy(() => this.stopRepeat());
  }

  ngDoCheck(): void {
    const c = this.resolveControl();
    if (!c) return;
    this.controlErrorVisible.set(!!c.invalid && !!(c.touched || c.dirty));
    this.errors.set(c.errors);
  }

  /** Değeri `step` kadar artırır (`direction` -1 ile azaltır). */
  spin(direction: 1 | -1, multiplier = 1): void {
    if (this.isDisabled() || this.readonly()) return;
    const current = this.value() ?? (direction > 0 ? (this.min() ?? 0) - this.step() : (this.max() ?? 0) + this.step());
    // Kayan nokta hatası olmasın: 0.1 + 0.2 → 0.3
    const next = this.round(current + direction * this.step() * multiplier);
    this.commit(this.clamp(next));
  }

  // --- Olaylar -----------------------------------------------------------------------
  protected onFocus(): void {
    this.focused = true;
  }

  protected onBlur(): void {
    this.focused = false;
    const parsed = parseNumber(this.text());
    this.commit(parsed == null ? null : this.clamp(this.round(parsed)));
    this.onTouched();
  }

  protected onKeydown(event: KeyboardEvent): void {
    const multiplier = event.shiftKey ? 10 : 1;
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        return this.spin(1, multiplier);
      case 'ArrowDown':
        event.preventDefault();
        return this.spin(-1, multiplier);
      case 'Home':
        if (this.min() != null) {
          event.preventDefault();
          this.commit(this.min());
        }
        return;
      case 'End':
        if (this.max() != null) {
          event.preventDefault();
          this.commit(this.max());
        }
        return;
      case 'Enter':
        this.onBlur();
        this.focused = true;
        return;
      case '.':
      case 'Decimal':
        // Nokta da ondalık ayıracı gibi çalışsın (Türkçe klavyede alışkanlık)
        if (this.fraction().max > 0 && !event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          this.insertText(',');
        }
        return;
    }
  }

  protected onInput(event: Event): void {
    const el = event.target as HTMLInputElement;
    const caret = el.selectionStart ?? el.value.length;
    // İmleçten önceki anlamlı karakter sayısı: yeniden biçimlenince imleç yerinde kalsın
    const before = significant(el.value.slice(0, caret));
    const formatted = this.formatLive(el.value);
    el.value = formatted;
    this.text.set(formatted);
    const pos = positionAfter(formatted, before);
    el.setSelectionRange(pos, pos);

    const parsed = parseNumber(formatted);
    if (parsed !== this.value()) {
      this.value.set(parsed);
      this.onChange(parsed);
    }
  }

  protected startRepeat(direction: 1 | -1, event: PointerEvent): void {
    if (event.button !== 0) return;
    event.preventDefault(); // odak inputta kalsın
    this.input().nativeElement.focus({ preventScroll: true });
    this.spin(direction);
    // Basılı tutunca hızlanarak tekrar et
    const repeat = (delay: number) => {
      this.repeatTimer = setTimeout(() => {
        this.spin(direction);
        repeat(Math.max(40, delay * 0.85));
      }, delay);
    };
    this.stopRepeat();
    this.repeatTimer = setTimeout(() => repeat(80), 400);
  }

  protected stopRepeat(): void {
    clearTimeout(this.repeatTimer);
    this.repeatTimer = undefined;
  }

  // --- ControlValueAccessor / Validator ---------------------------------------------
  writeValue(value: unknown): void {
    const n = value == null || value === '' ? null : Number(value);
    this.value.set(n == null || Number.isNaN(n) ? null : n);
    this.text.set(this.format(this.value()));
  }
  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }
  validate(_control: AbstractControl): ValidationErrors | null {
    const v = this.value();
    if (v == null) return null;
    const min = this.min();
    const max = this.max();
    if (min != null && v < min) return { min: { min, actual: v } };
    if (max != null && v > max) return { max: { max, actual: v } };
    return null;
  }
  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  // --- Yardımcılar ---------------------------------------------------------------------
  private commit(value: number | null): void {
    this.text.set(this.format(value));
    const el = this.input().nativeElement;
    if (el.value !== this.text()) el.value = this.text();
    if (value === this.value()) return;
    this.value.set(value);
    this.onChange(value);
  }

  private clamp(value: number): number {
    const min = this.min();
    const max = this.max();
    if (min != null && value < min) return min;
    if (max != null && value > max) return max;
    return value;
  }

  private round(value: number): number {
    const digits = Math.max(this.fraction().max, decimalsOf(this.step()));
    return Number(value.toFixed(Math.min(digits, 20)));
  }

  /** `1234.5` → `"1.234,5"` (min/max ondalık basamağa göre). */
  private format(value: number | null): string {
    if (value == null || Number.isNaN(value)) return '';
    const { min, max } = this.fraction();
    let [int, frac = ''] = Math.abs(value).toFixed(max).split('.');
    frac = frac.replace(/0+$/, '').padEnd(min, '0');
    if (this.useGrouping()) int = group(int);
    return `${value < 0 ? '-' : ''}${int}${frac ? ',' + frac : ''}`;
  }

  /** Yazarken: yalnızca rakam, bir virgül ve baştaki eksi kalır; tam kısım gruplanır. */
  private formatLive(raw: string): string {
    const allowNegative = this.min() == null || this.min()! < 0;
    const negative = allowNegative && raw.trim().startsWith('-');
    const maxFraction = this.fraction().max;
    const clean = raw.replace(/[^\d,]/g, '');
    const comma = clean.indexOf(',');
    let int = (comma < 0 ? clean : clean.slice(0, comma)).replace(/,/g, '');
    let frac = comma < 0 ? null : clean.slice(comma + 1).replace(/,/g, '').slice(0, maxFraction);
    if (maxFraction === 0) frac = null;
    int = int.replace(/^0+(?=\d)/, ''); // baştaki sıfırlar
    if (this.useGrouping()) int = group(int);
    if (!int && frac !== null) int = '0';
    return `${negative ? '-' : ''}${int}${frac !== null ? ',' + frac : ''}`;
  }

  private insertText(text: string): void {
    const el = this.input().nativeElement;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? start;
    el.setRangeText(text, start, end, 'end');
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }

  private resolveControl(): NgControl | null {
    if (this.ngControl === undefined) {
      this.ngControl = this.injector.get(NgControl, null, { self: true, optional: true });
    }
    return this.ngControl;
  }
}

function group(int: string): string {
  return int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** `"1.234,5"` → `1234.5`; boş veya yalnızca `-` → `null`. */
function parseNumber(text: string): number | null {
  const clean = text.replace(/[^\d,-]/g, '').replace(',', '.');
  if (!clean || clean === '-' || clean === '.' || clean === '-.') return null;
  const n = Number(clean.endsWith('.') ? clean.slice(0, -1) : clean);
  return Number.isNaN(n) ? null : n;
}

function significant(text: string): number {
  return text.replace(/[^\d,-]/g, '').length;
}

/** Biçimli metinde `count` anlamlı karakterden sonraki konum. */
function positionAfter(text: string, count: number): number {
  if (count <= 0) return text.startsWith('-') ? 0 : 0;
  let seen = 0;
  for (let i = 0; i < text.length; i++) {
    if (/[\d,-]/.test(text[i])) seen++;
    if (seen === count) return i + 1;
  }
  return text.length;
}

function decimalsOf(n: number): number {
  const s = String(n);
  return s.includes('.') ? s.split('.')[1].length : 0;
}
