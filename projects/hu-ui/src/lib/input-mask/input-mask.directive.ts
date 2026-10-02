import { Directive, ElementRef, booleanAttribute, effect, forwardRef, inject, input, untracked } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';

/**
 * Hazır maskeler. Maske karakterleri: `9` rakam, `a` harf, `*` harf veya rakam;
 * diğer karakterler sabittir (`\9` ile kaçış).
 */
export const HU_MASKS = {
  phone: '(999) 999 99 99',
  mobile: '0(999) 999 99 99',
  date: '99.99.9999',
  time: '99:99',
  tckn: '99999999999',
  iban: 'TR99 9999 9999 9999 9999 9999 99',
  card: '9999 9999 9999 9999',
  postalCode: '99999',
} as const;

type Slot = { kind: 'slot'; test: (c: string) => boolean } | { kind: 'literal'; char: string };

const LETTER = /^[a-zA-ZçğıöşüÇĞİÖŞÜ]$/;
const DIGIT = /^\d$/;

function parseMask(mask: string): Slot[] {
  const slots: Slot[] = [];
  for (let i = 0; i < mask.length; i++) {
    const c = mask[i];
    if (c === '\\' && i + 1 < mask.length) {
      slots.push({ kind: 'literal', char: mask[++i] });
    } else if (c === '9') slots.push({ kind: 'slot', test: (x) => DIGIT.test(x) });
    else if (c === 'a') slots.push({ kind: 'slot', test: (x) => LETTER.test(x) });
    else if (c === '*') slots.push({ kind: 'slot', test: (x) => DIGIT.test(x) || LETTER.test(x) });
    else slots.push({ kind: 'literal', char: c });
  }
  return slots;
}

interface Applied {
  /** Maskeli metin. */
  text: string;
  /** Yalnızca kullanıcının girdiği karakterler. */
  raw: string;
  /** Her ham karakterin metindeki bitiş konumu (imleç için). */
  ends: number[];
  /** Tüm boşluklar dolu mu? */
  complete: boolean;
  /** Ham karakter yokken baştaki sabitlerin uzunluğu. */
  lead: number;
}

/**
 * Girdiyi maskeye yerleştirir. Sabit karakterler yalnızca arkasından ham karakter
 * geldikçe eklenir; girdideki sabitler (yapıştırılan "(555) 123…") atlanır.
 */
function applyMask(slots: Slot[], input: string, upper: boolean): Applied {
  let text = '';
  let raw = '';
  const ends: number[] = [];
  let i = 0;
  let pendingLiterals = '';
  let lead = 0;
  let filled = 0;
  const total = slots.filter((s) => s.kind === 'slot').length;

  for (const slot of slots) {
    if (slot.kind === 'literal') {
      pendingLiterals += slot.char;
      // Girdide aynı sabit varsa tüket ("(" yazıldıysa çift olmasın)
      if (input[i] === slot.char) i++;
      continue;
    }
    // Uygun ilk karakteri bul
    while (i < input.length && !slot.test(input[i])) i++;
    if (i >= input.length) break;
    if (!raw) lead = pendingLiterals.length;
    text += pendingLiterals;
    pendingLiterals = '';
    const c = upper && LETTER.test(input[i]) ? input[i].toLocaleUpperCase('tr-TR') : input[i];
    text += c;
    raw += c;
    ends.push(text.length);
    filled++;
    i++;
  }
  if (!raw) lead = slots.findIndex((s) => s.kind === 'slot');
  return { text, raw, ends, complete: filled === total && total > 0, lead: Math.max(0, lead) };
}

/**
 * Input maskesi: telefon, tarih, IBAN, plaka… Yazarken biçimlendirir, yapıştırmayı
 * düzeltir, sabit karakterlerin üzerinden silmeyi bilir. Formda değer maskeli metindir
 * (`unmask` ile yalnızca girilen karakterler). Eksik girişte `huMask` hatası verir.
 *
 * @example
 * <input huInput huMask="(999) 999 99 99" formControlName="phone" />
 * <input huInput [huMask]="masks.iban" unmask formControlName="iban" />
 */
@Directive({
  selector: 'input[huMask]',
  exportAs: 'huMask',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HuInputMask), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => HuInputMask), multi: true },
  ],
  host: {
    autocomplete: 'off',
    '[attr.placeholder]': 'placeholderText()',
    '[attr.inputmode]': "numericOnly() ? 'numeric' : null",
    '(input)': 'onInput()',
    '(keydown)': 'onKeydown($event)',
    '(blur)': 'onTouched()',
  },
})
export class HuInputMask implements ControlValueAccessor, Validator {
  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;

  readonly mask = input.required<string>({ alias: 'huMask' });
  /** Forma yalnızca girilen karakterleri ver (`5551234567`), maskeli metni değil. */
  readonly unmask = input(false, { transform: booleanAttribute });
  /** Harfleri büyük yaz (plaka, IBAN). */
  readonly uppercase = input(true, { transform: booleanAttribute });
  /** Boş alanda görünen örnek. Verilmezse maskeden üretilir: `(___) ___ __ __`. */
  readonly placeholder = input<string>();
  /** Boş alan karakteri (placeholder için). */
  readonly slotChar = input('_');

  private slots: Slot[] = [];
  private lastComplete = true;
  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};
  private onValidatorChange: () => void = () => {};

  constructor() {
    effect(() => {
      this.slots = parseMask(this.mask() ?? '');
      untracked(() => {
        // Maske değişirse mevcut metni yeniden biçimlendir
        if (this.el.value) this.update(this.el.value, null);
        this.onValidatorChange();
      });
    });
  }

  protected placeholderText(): string {
    const p = this.placeholder();
    if (p !== undefined) return p;
    return parseMask(this.mask() ?? '')
      .map((s) => (s.kind === 'slot' ? this.slotChar() : s.char))
      .join('');
  }

  protected numericOnly(): boolean {
    return (this.mask() ?? '').replace(/\\./g, '').split('').every((c) => c !== 'a' && c !== '*');
  }

  // --- Olaylar ------------------------------------------------------------------------
  protected onInput(): void {
    const value = this.el.value;
    const caret = this.el.selectionStart ?? value.length;
    // İmleçten önce kaç ham karakter vardı?
    const before = applyMask(this.slots, value.slice(0, caret), this.uppercase()).raw.length;
    this.update(value, before);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Backspace' && event.key !== 'Delete') return;
    const start = this.el.selectionStart ?? 0;
    const end = this.el.selectionEnd ?? start;
    if (start !== end) return; // seçimi tarayıcı siler, input olayı düzeltir
    const current = applyMask(this.slots, this.el.value, this.uppercase());
    // İmleçten önceki ham karakter sayısı
    const k = current.ends.filter((e) => e <= start).length;
    const index = event.key === 'Backspace' ? k - 1 : k;
    if (index < 0 || index >= current.raw.length) return;
    event.preventDefault();
    const raw = current.raw.slice(0, index) + current.raw.slice(index + 1);
    this.update(raw, index);
  }

  // --- ControlValueAccessor / Validator ---------------------------------------------------
  writeValue(value: unknown): void {
    const text = value == null ? '' : String(value);
    const applied = applyMask(this.slots, text, this.uppercase());
    this.el.value = applied.text;
    this.lastComplete = applied.complete || !applied.raw;
  }
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.el.disabled = disabled;
  }
  validate(_control: AbstractControl): ValidationErrors | null {
    return this.lastComplete ? null : { huMask: { mask: this.mask() ?? '' } };
  }
  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  /** Değerin tamamı girildi mi? */
  get complete(): boolean {
    return applyMask(this.slots, this.el.value, this.uppercase()).complete;
  }

  /** Metni maskele, imleci `rawBefore` ham karakterden sonraya koy, formu bilgilendir. */
  private update(input: string, rawBefore: number | null): void {
    const applied = applyMask(this.slots, input, this.uppercase());
    this.el.value = applied.text;
    if (rawBefore !== null && this.el.ownerDocument.activeElement === this.el) {
      const pos = rawBefore <= 0 ? (applied.raw ? applied.lead : 0) : (applied.ends[Math.min(rawBefore, applied.ends.length) - 1] ?? applied.text.length);
      this.el.setSelectionRange(pos, pos);
    }
    this.lastComplete = applied.complete || !applied.raw;
    this.onChange(this.unmask() ? applied.raw : applied.text);
  }
}
