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
import { HuIcon } from '../icon/icon.component';
import { huUniqueId } from '../core/unique-id';

/**
 * Onay kutusu. Reactive/template-driven formlarla ya da `[(checked)]` ile çalışır.
 *
 * `indeterminate` (kısmen seçili) yalnızca görsel bir durumdur ve tıklanınca
 * tarayıcı standardı gereği kalkar; değeri alt seçimlerden hesaplayıp siz verin:
 *
 * @example
 * <hu-checkbox formControlName="kvkk">KVKK metnini okudum</hu-checkbox>
 *
 * <!-- "Tümünü seç" -->
 * <hu-checkbox [checked]="allSelected()" [indeterminate]="someSelected()" (checkedChange)="selectAll($event)">
 *   Tümünü seç
 * </hu-checkbox>
 */
@Component({
  selector: 'hu-checkbox',
  imports: [HuIcon],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HuCheckbox), multi: true }],
  template: `
    <label class="hu-check" [class.hu-check--disabled]="isDisabled()">
      <input
        type="checkbox"
        class="hu-check__input"
        [id]="inputId()"
        [checked]="checked()"
        [indeterminate]="indeterminate()"
        [disabled]="isDisabled()"
        [attr.name]="name() || null"
        [attr.aria-label]="ariaLabel()"
        (change)="onInputChange($event)"
        (blur)="onTouched()"
      />
      <span class="hu-check__box" aria-hidden="true">
        <hu-icon [name]="indeterminate() ? 'minus' : 'check'" [size]="12" [strokeWidth]="3.5" />
      </span>
      <span class="hu-check__label"><ng-content /></span>
    </label>
  `,
  styleUrl: './checkbox.component.scss',
  host: { class: 'hu-checkbox' },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuCheckbox implements ControlValueAccessor {
  readonly checked = model(false);
  readonly indeterminate = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly name = input<string>();
  readonly inputId = input(huUniqueId('hu-checkbox'));
  /** Görünür etiket yoksa ekran okuyucu etiketi. */
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });

  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  private onChange: (value: boolean) => void = () => {};
  protected onTouched: () => void = () => {};

  protected onInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).checked;
    this.indeterminate.set(false);
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
