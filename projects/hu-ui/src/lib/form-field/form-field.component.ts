import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
} from '@angular/core';
import { HuIcon } from '../icon/icon.component';
import { huUniqueId } from '../core/unique-id';
import { HU_ERROR_MESSAGES, HU_FORM_FIELD, HuFormFieldControl, HuFormFieldParent } from './form-field.tokens';

/** Kontrolün soluna yerleşen içerik (ikon, para birimi vb.). */
@Directive({ selector: '[huPrefix]', host: { class: 'hu-field__prefix' } })
export class HuPrefix {}

/** Kontrolün sağına yerleşen içerik. */
@Directive({ selector: '[huSuffix]', host: { class: 'hu-field__suffix' } })
export class HuSuffix {}

/**
 * Label, yardım metni ve validasyon hatasını bir kontrol etrafında toplar.
 * Reactive form hataları otomatik olarak Türkçe mesaja çevrilir.
 *
 * @example
 * <hu-form-field label="E-posta" hint="Kurumsal adresinizi kullanın" required>
 *   <hu-icon huPrefix name="mail" />
 *   <input huInput type="email" formControlName="email" />
 * </hu-form-field>
 */
@Component({
  selector: 'hu-form-field',
  imports: [HuIcon],
  providers: [{ provide: HU_FORM_FIELD, useExisting: HuFormField }],
  template: `
    @if (label()) {
      <label class="hu-field__label" [attr.for]="control()?.id()">
        {{ label() }}
        @if (required()) {
          <span class="hu-field__required" aria-hidden="true">*</span>
        }
      </label>
    }
    <div class="hu-field__control">
      <ng-content select="[huPrefix]" />
      <ng-content />
      <ng-content select="[huSuffix]" />
    </div>
    @if (showError()) {
      <p class="hu-field__message hu-field__message--error" [id]="errorId">
        <hu-icon name="alert-circle" [size]="14" />
        {{ errorText() }}
      </p>
    } @else if (hint()) {
      <p class="hu-field__message" [id]="hintId">{{ hint() }}</p>
    }
  `,
  styleUrl: './form-field.component.scss',
  host: { class: 'hu-field' },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuFormField implements HuFormFieldParent {
  private readonly messages = inject(HU_ERROR_MESSAGES);

  readonly label = input<string>();
  readonly hint = input<string>();
  /** Sabit hata mesajı. Verilmezse validator hatasından üretilir. */
  readonly error = input<string | null>();
  readonly required = input(false, { transform: booleanAttribute });

  protected readonly control = contentChild<HuFormFieldControl>(HuFormFieldControl);

  protected readonly hintId = huUniqueId('hu-hint');
  protected readonly errorId = huUniqueId('hu-error');

  protected readonly errorText = computed(() => {
    const explicit = this.error();
    if (explicit) return explicit;
    const errors = this.control()?.errors();
    if (!errors) return null;
    // Birden çok hata varsa daha açıklayıcı olanı göster: geçersiz metin (örn.
    // 31.02.2026) kontrolü boş bırakıp ayrıca `required` tetikleyebilir.
    const keys = Object.keys(errors);
    const key = keys.find((k) => k !== 'required') ?? keys[0];
    const message = this.messages[key];
    if (typeof message === 'function') return message(errors[key]);
    return message ?? 'Geçersiz değer.';
  });

  readonly showError = computed(() => {
    const control = this.control();
    if (control?.hasControl) return control.controlErrorVisible() && !!this.errorText();
    return !!this.error();
  });

  readonly describedBy = computed(() => {
    if (this.showError()) return this.errorId;
    return this.hint() ? this.hintId : null;
  });
}
