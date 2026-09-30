import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { huUniqueId } from '../core/unique-id';

/**
 * Açık/kapalı anahtarı (ayarlar için). Formlarla ya da `[(checked)]` ile çalışır.
 * @example <hu-switch formControlName="emailNotifications">E-posta bildirimleri</hu-switch>
 */
@Component({
  selector: 'hu-switch',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HuSwitch), multi: true }],
  template: `
    <label class="hu-switch__root" [class.hu-switch__root--disabled]="isDisabled()">
      <input
        type="checkbox"
        role="switch"
        class="hu-switch__input"
        [id]="inputId()"
        [checked]="checked()"
        [disabled]="isDisabled()"
        [attr.aria-checked]="checked()"
        [attr.aria-label]="ariaLabel()"
        (change)="onInputChange($event)"
        (blur)="onTouched()"
      />
      <span class="hu-switch__track" aria-hidden="true"><span class="hu-switch__thumb"></span></span>
      <span class="hu-switch__label"><ng-content /></span>
    </label>
  `,
  styles: `
    .hu-switch { display: inline-flex; width: fit-content; max-width: 100%; }
    .hu-switch__root {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: var(--hu-space-3);
      font-size: var(--hu-text-sm);
      cursor: pointer;
      user-select: none;
    }
    .hu-switch__root--disabled { color: var(--hu-text-subtle); cursor: not-allowed; }
    .hu-switch__input { position: absolute; width: 2.25rem; height: 1.25rem; margin: 0; opacity: 0; cursor: inherit; }
    .hu-switch__track {
      position: relative;
      flex-shrink: 0;
      width: 2.25rem;
      height: 1.25rem;
      background: var(--hu-border-strong);
      border-radius: var(--hu-radius-full);
      transition: background-color var(--hu-transition), box-shadow var(--hu-transition);
    }
    .hu-switch__thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 1rem;
      height: 1rem;
      background: #fff;
      border-radius: 50%;
      box-shadow: 0 1px 3px rgb(0 0 0 / 0.25);
      transition: transform var(--hu-transition);
    }
    .hu-switch__input:checked + .hu-switch__track { background: var(--hu-primary); }
    .hu-switch__input:checked + .hu-switch__track .hu-switch__thumb { transform: translateX(1rem); }
    .hu-switch__input:focus-visible + .hu-switch__track { box-shadow: var(--hu-ring); }
    .hu-switch__input:disabled + .hu-switch__track { opacity: 0.5; }
    .hu-switch__label:empty { display: none; }
  `,
  host: { class: 'hu-switch' },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuSwitch implements ControlValueAccessor {
  readonly checked = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly inputId = input(huUniqueId('hu-switch'));
  /** Görünür etiket yoksa ekran okuyucu etiketi. */
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });

  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  private onChange: (value: boolean) => void = () => {};
  protected onTouched: () => void = () => {};

  protected onInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).checked;
    this.checked.set(value);
    this.onChange(value);
  }

  writeValue(value: unknown): void {
    this.checked.set(!!value);
  }
  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }
}
