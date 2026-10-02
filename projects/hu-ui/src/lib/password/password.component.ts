import {
  ChangeDetectionStrategy,
  Component,
  DoCheck,
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

export interface HuPasswordRule {
  label: string;
  test: (value: string) => boolean;
}

/** Varsayılan kurallar (kural listesi ve güç hesabı için). */
export const HU_PASSWORD_RULES: HuPasswordRule[] = [
  { label: 'En az 8 karakter', test: (v) => v.length >= 8 },
  { label: 'Büyük harf', test: (v) => /[A-ZÇĞİÖŞÜ]/.test(v) },
  { label: 'Küçük harf', test: (v) => /[a-zçğıöşü]/.test(v) },
  { label: 'Rakam', test: (v) => /\d/.test(v) },
  { label: 'Sembol (!?@#…)', test: (v) => /[^\p{L}\p{N}\s]/u.test(v) },
];

const STRENGTH_LABELS = ['Çok zayıf', 'Zayıf', 'Orta', 'İyi', 'Güçlü'];

/**
 * 0–4 arası şifre gücü. Uzunluk ve karakter çeşitliliğine bakar; tekrar eden ve
 * sıralı karakterler (aaaa, 1234, abcd) puan düşürür.
 */
export function huPasswordStrength(value: string): number {
  if (!value) return 0;
  const kinds = [/[a-zçğıöşü]/, /[A-ZÇĞİÖŞÜ]/, /\d/, /[^\p{L}\p{N}\s]/u].filter((r) => r.test(value)).length;
  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  score += Math.max(0, kinds - 1);
  if (/(.)\1{2,}/.test(value)) score--;
  if (/(0123|1234|2345|3456|4567|5678|6789|abcd|bcde|qwer|asdf)/i.test(value)) score--;
  if (value.length < 6) score = Math.min(score, 1);
  return Math.max(0, Math.min(4, score));
}

/**
 * Şifre girişi: göster/gizle, güç göstergesi, kural listesi ve Caps Lock uyarısı.
 * `minStrength` verilirse yetersiz şifrede `huPasswordWeak` hatası verir.
 *
 * @example
 * <hu-form-field label="Yeni şifre">
 *   <hu-password formControlName="password" feedback [minStrength]="3" autocomplete="new-password" />
 * </hu-form-field>
 */
@Component({
  selector: 'hu-password',
  imports: [HuIcon],
  template: `
    <div class="hu-password__control">
      <input
        class="hu-input hu-password__input"
        [type]="visible() ? 'text' : 'password'"
        [id]="id()"
        [attr.data-size]="size()"
        [attr.autocomplete]="autocomplete()"
        [attr.placeholder]="placeholder() ?? null"
        [attr.aria-invalid]="isInvalid() || null"
        [attr.aria-describedby]="describedBy()"
        [attr.aria-label]="ariaLabel() || null"
        [class.hu-input--invalid]="isInvalid()"
        [value]="value()"
        [disabled]="isDisabled()"
        spellcheck="false"
        autocapitalize="off"
        (input)="onInput($any($event.target).value)"
        (keydown)="checkCaps($event)"
        (keyup)="checkCaps($event)"
        (blur)="onBlur()"
      />
      @if (toggleMask()) {
        <button
          type="button"
          class="hu-password__toggle"
          [attr.aria-label]="visible() ? 'Şifreyi gizle' : 'Şifreyi göster'"
          [attr.aria-pressed]="visible()"
          [attr.aria-controls]="id()"
          [disabled]="isDisabled()"
          (mousedown)="$event.preventDefault()"
          (click)="visible.set(!visible())"
        >
          <hu-icon [name]="visible() ? 'eye-off' : 'eye'" [size]="16" />
        </button>
      }
    </div>

    @if (capsLock()) {
      <p class="hu-password__caps" role="status"><hu-icon name="alert-triangle" [size]="14" /> Caps Lock açık</p>
    }

    @if (feedback() && value()) {
      <div class="hu-password__meter" [attr.data-strength]="strength()" [id]="meterId">
        <span class="hu-password__bars" aria-hidden="true">
          @for (i of [0, 1, 2, 3]; track i) {
            <span [class.hu-password__bar--on]="i < strength()"></span>
          }
        </span>
        <span class="hu-password__label" aria-live="polite">Güç: {{ strengthLabel() }}</span>
      </div>
    }

    @if (showRules() && (value() || rulesAlways())) {
      <ul class="hu-password__rules" [id]="rulesId" aria-label="Şifre kuralları">
        @for (r of ruleState(); track r.label) {
          <li [class.hu-password__rule--ok]="r.ok">
            <hu-icon [name]="r.ok ? 'check' : 'minus'" [size]="12" />
            {{ r.label }}<span class="hu-sr-only">{{ r.ok ? ' (sağlandı)' : ' (sağlanmadı)' }}</span>
          </li>
        }
      </ul>
    }
  `,
  styleUrl: './password.component.scss',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HuPassword), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => HuPassword), multi: true },
    { provide: HuFormFieldControl, useExisting: forwardRef(() => HuPassword) },
  ],
  host: { class: 'hu-password' },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuPassword implements ControlValueAccessor, Validator, HuFormFieldControl, DoCheck {
  private readonly injector = inject(Injector);
  protected readonly field = inject(HU_FORM_FIELD, { optional: true, host: true });

  readonly value = model('');
  /** Göz ikonuyla göster/gizle. */
  readonly toggleMask = input(true, { transform: booleanAttribute });
  /** Güç göstergesi (yeni şifre belirlerken açın). */
  readonly feedback = input(false, { transform: booleanAttribute });
  /** Kural listesi. */
  readonly showRules = input(false, { transform: booleanAttribute });
  /** Kurallar alan boşken de görünsün. */
  readonly rulesAlways = input(false, { transform: booleanAttribute });
  readonly rules = input<readonly HuPasswordRule[]>(HU_PASSWORD_RULES);
  /** Bu güçten (0–4) zayıf şifrede `huPasswordWeak` hatası. 0 → kontrol yok. */
  readonly minStrength = input(0, { transform: numberAttribute });
  /** `current-password` (giriş) veya `new-password` (kayıt / değiştirme). */
  readonly autocomplete = input<'current-password' | 'new-password' | 'off'>('current-password');
  readonly placeholder = input<string>();
  readonly size = input<HuInputSize>('md');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string>();
  readonly id = input(huUniqueId('hu-password'));

  protected readonly visible = signal(false);
  protected readonly capsLock = signal(false);
  protected readonly meterId = huUniqueId('hu-password-meter');
  protected readonly rulesId = huUniqueId('hu-password-rules');
  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  protected readonly strength = computed(() => huPasswordStrength(this.value() ?? ''));
  protected readonly strengthLabel = computed(() => STRENGTH_LABELS[this.strength()]);
  protected readonly ruleState = computed(() => this.rules().map((r) => ({ label: r.label, ok: r.test(this.value() ?? '') })));
  protected readonly describedBy = computed(() => {
    const ids = [this.field?.describedBy(), this.feedback() && this.value() ? this.meterId : null, this.showRules() ? this.rulesId : null];
    return ids.filter(Boolean).join(' ') || null;
  });

  // --- HuFormFieldControl -----------------------------------------------------------
  private ngControl: NgControl | null | undefined;
  get hasControl(): boolean {
    return !!this.resolveControl();
  }
  readonly controlErrorVisible = signal(false);
  readonly errors = signal<ValidationErrors | null>(null);
  protected readonly isInvalid = computed(() => this.controlErrorVisible() || (this.field?.showError() ?? false));

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private onValidatorChange: () => void = () => {};

  constructor() {
    effect(() => {
      this.minStrength();
      untracked(() => this.onValidatorChange());
    });
  }

  ngDoCheck(): void {
    const c = this.resolveControl();
    if (!c) return;
    this.controlErrorVisible.set(!!c.invalid && !!(c.touched || c.dirty));
    this.errors.set(c.errors);
  }

  protected onInput(value: string): void {
    this.value.set(value);
    this.onChange(value);
  }

  protected onBlur(): void {
    this.capsLock.set(false);
    this.onTouched();
  }

  protected checkCaps(event: KeyboardEvent): void {
    if (typeof event.getModifierState === 'function') this.capsLock.set(event.getModifierState('CapsLock'));
  }

  writeValue(value: unknown): void {
    this.value.set(value == null ? '' : String(value));
  }
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }
  validate(_control: AbstractControl): ValidationErrors | null {
    const min = this.minStrength();
    const value = this.value() ?? '';
    if (!min || !value) return null;
    const strength = huPasswordStrength(value);
    return strength < min ? { huPasswordWeak: { required: min, actual: strength } } : null;
  }
  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  private resolveControl(): NgControl | null {
    if (this.ngControl === undefined) {
      this.ngControl = this.injector.get(NgControl, null, { self: true, optional: true });
    }
    return this.ngControl;
  }
}
