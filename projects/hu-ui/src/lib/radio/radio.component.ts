import {
  ChangeDetectionStrategy,
  Component,
  DoCheck,
  Injector,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChildren,
  forwardRef,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl, ValidationErrors } from '@angular/forms';
import { huUniqueId } from '../core/unique-id';
import { HU_FORM_FIELD, HuFormFieldControl } from '../form-field/form-field.tokens';

export interface HuRadioOption<T = string> {
  label: string;
  value: T;
  /** Kart görünümünde etiketin altında açıklama. */
  description?: string;
  disabled?: boolean;
}

/**
 * Tek bir seçenek. `hu-radio-group` içinde kullanılır.
 * @example <hu-radio value="card">Kredi kartı</hu-radio>
 */
@Component({
  selector: 'hu-radio',
  template: `
    <label class="hu-radio__label" [class.hu-radio__label--disabled]="isDisabled()">
      <input
        type="radio"
        class="hu-radio__input"
        [id]="inputId"
        [name]="group.name"
        [checked]="checked()"
        [disabled]="isDisabled()"
        [attr.aria-describedby]="description() ? inputId + '-desc' : null"
        (change)="group.select(value())"
        (blur)="group.touch()"
      />
      <span class="hu-radio__circle" aria-hidden="true"></span>
      <span class="hu-radio__text">
        <span class="hu-radio__title"><ng-content /></span>
        @if (description()) {
          <span class="hu-radio__description" [id]="inputId + '-desc'">{{ description() }}</span>
        }
      </span>
    </label>
  `,
  host: {
    class: 'hu-radio',
    '[class.hu-radio--checked]': 'checked()',
    '[class.hu-radio--disabled]': 'isDisabled()',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuRadio<T = string> {
  protected readonly group = inject(forwardRef(() => HuRadioGroup)) as HuRadioGroup<T>;

  readonly value = input.required<T>();
  readonly description = input<string>();
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly inputId = huUniqueId('hu-radio');
  protected readonly checked = computed(() => this.group.isSelected(this.value()));
  protected readonly isDisabled = computed(() => this.disabled() || this.group.isDisabled());
}

/**
 * Radyo düğmesi grubu: tek seçim. Formlarla veya `[(value)]` ile çalışır; ok tuşlarıyla
 * seçenekler arasında gezilir. Seçenekler `options` ile veya içeride `hu-radio` olarak verilir.
 *
 * @example
 * <hu-form-field label="Ödeme yöntemi" required>
 *   <hu-radio-group formControlName="payment" [options]="payments" variant="card" />
 * </hu-form-field>
 *
 * <hu-radio-group [(value)]="size" orientation="horizontal" aria-label="Boyut">
 *   <hu-radio value="s">Küçük</hu-radio>
 *   <hu-radio value="m">Orta</hu-radio>
 * </hu-radio-group>
 */
@Component({
  selector: 'hu-radio-group',
  imports: [forwardRef(() => HuRadio)],
  template: `
    @for (o of options(); track o.value) {
      <hu-radio [value]="o.value" [description]="o.description" [disabled]="!!o.disabled">{{ o.label }}</hu-radio>
    }
    <ng-content />
  `,
  styleUrl: './radio.component.scss',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HuRadioGroup), multi: true },
    { provide: HuFormFieldControl, useExisting: forwardRef(() => HuRadioGroup) },
  ],
  host: {
    class: 'hu-radio-group',
    role: 'radiogroup',
    '[id]': 'id()',
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-variant]': 'variant()',
    '[attr.aria-labelledby]': 'labelledBy()',
    '[attr.aria-describedby]': 'field?.describedBy() ?? null',
    '[attr.aria-invalid]': 'isInvalid() || null',
    '[attr.aria-required]': 'required() || null',
    '[attr.aria-disabled]': 'isDisabled() || null',
    '[class.hu-radio-group--invalid]': 'isInvalid()',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuRadioGroup<T = string> implements ControlValueAccessor, HuFormFieldControl, DoCheck {
  private readonly injector = inject(Injector);
  protected readonly field = inject(HU_FORM_FIELD, { optional: true, host: true });

  readonly value = model<T | null>(null);
  readonly options = input<readonly HuRadioOption<T>[]>([]);
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');
  /** `default` sade daire, `card` çerçeveli seçenek kutuları. */
  readonly variant = input<'default' | 'card'>('default');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  /** Nesne değerlerde eşitlik. */
  readonly compareWith = input<(a: T, b: T) => boolean>(Object.is);
  /** hu-form-field label'ının bağlandığı id (grup etiketi). */
  readonly id = input(huUniqueId('hu-radio-group'));

  /** @internal Tüm seçeneklerin ortak `name` değeri (ok tuşlarıyla gezinme için). */
  readonly name = huUniqueId('hu-radio-name');
  protected readonly children = contentChildren(HuRadio);
  private readonly formDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  /** Form alanının label'ı grubu adlandırsın. */
  protected readonly labelledBy = computed(() => (this.field ? `${this.id()}-label` : null));

  // --- HuFormFieldControl -----------------------------------------------------------
  private ngControl: NgControl | null | undefined;
  get hasControl(): boolean {
    return !!this.resolveControl();
  }
  readonly controlErrorVisible = signal(false);
  readonly errors = signal<ValidationErrors | null>(null);
  protected readonly isInvalid = computed(() => this.controlErrorVisible() || (this.field?.showError() ?? false));

  private onChange: (value: T | null) => void = () => {};
  private onTouched: () => void = () => {};

  ngDoCheck(): void {
    const c = this.resolveControl();
    if (!c) return;
    this.controlErrorVisible.set(!!c.invalid && !!(c.touched || c.dirty));
    this.errors.set(c.errors);
  }

  /** @internal */
  isSelected(value: T): boolean {
    const current = this.value();
    return current !== null && current !== undefined && this.compareWith()(current, value);
  }

  /** @internal */
  select(value: T): void {
    if (this.isDisabled()) return;
    this.value.set(value);
    this.onChange(value);
  }

  /** @internal */
  touch(): void {
    this.onTouched();
  }

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
  }

  private resolveControl(): NgControl | null {
    if (this.ngControl === undefined) {
      this.ngControl = this.injector.get(NgControl, null, { self: true, optional: true });
    }
    return this.ngControl;
  }
}
