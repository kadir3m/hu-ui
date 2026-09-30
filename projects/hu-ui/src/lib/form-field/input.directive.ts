import { Directive, DoCheck, booleanAttribute, computed, inject, input, signal } from '@angular/core';
import { NgControl, ValidationErrors } from '@angular/forms';
import { huUniqueId } from '../core/unique-id';
import { HU_FORM_FIELD, HuFormFieldControl } from './form-field.tokens';

export type HuInputSize = 'sm' | 'md' | 'lg';

/**
 * Native input / textarea / select elementlerine HU görünümünü ve
 * hu-form-field entegrasyonunu (label, hata, aria) ekler.
 *
 * @example <input huInput formControlName="email" placeholder="ornek@example.com" />
 */
@Directive({
  selector: 'input[huInput], textarea[huInput], select[huInput]',
  exportAs: 'huInput',
  providers: [{ provide: HuFormFieldControl, useExisting: HuInput }],
  host: {
    class: 'hu-input',
    '[id]': 'id()',
    '[attr.data-size]': 'size()',
    '[class.hu-input--invalid]': 'isInvalid()',
    '[attr.aria-invalid]': 'isInvalid() || null',
    '[attr.aria-describedby]': 'field?.describedBy() ?? null',
  },
})
export class HuInput implements HuFormFieldControl, DoCheck {
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  protected readonly field = inject(HU_FORM_FIELD, { optional: true, host: true });

  readonly id = input(huUniqueId('hu-input'));
  readonly size = input<HuInputSize>('md');
  /** Form kontrolü olmadan hatalı görünümü zorlar. */
  readonly invalid = input(false, { transform: booleanAttribute });

  /** Bir Angular form kontrolüne bağlı mı? */
  readonly hasControl = this.ngControl !== null;
  /** Kontrol geçersiz ve kullanıcı etkileşime girmiş. */
  readonly controlErrorVisible = signal(false);
  readonly errors = signal<ValidationErrors | null>(null);

  protected readonly isInvalid = computed(
    () => this.invalid() || this.controlErrorVisible() || (this.field?.showError() ?? false),
  );

  // Reactive form durumu signal değildir; her change detection turunda eşitlenir.
  ngDoCheck(): void {
    const c = this.ngControl;
    if (!c) return;
    this.controlErrorVisible.set(!!c.invalid && !!(c.touched || c.dirty));
    this.errors.set(c.errors);
  }
}
