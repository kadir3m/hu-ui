import {
  ChangeDetectionStrategy,
  Component,
  DoCheck,
  Injector,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  model,
  numberAttribute,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl, ValidationErrors } from '@angular/forms';
import { HuIcon } from '../icon/icon.component';
import { huUniqueId } from '../core/unique-id';
import { HU_FORM_FIELD, HuFormFieldControl } from '../form-field/form-field.tokens';

export type HuRatingSize = 'sm' | 'md' | 'lg';

/**
 * Yıldızla puanlama. Her yıldız görünmez bir radyo düğmesidir: ok tuşlarıyla puan verilir,
 * ekran okuyucu "5 üzerinden 4" okur. Seçili yıldıza tekrar tıklamak puanı temizler.
 * `readonly` ile ortalama gibi ondalık değerler kısmi dolu yıldızla gösterilir.
 *
 * @example
 * <hu-form-field label="Memnuniyet"><hu-rating formControlName="score" /></hu-form-field>
 * <hu-rating [value]="4.3" readonly />
 */
@Component({
  selector: 'hu-rating',
  imports: [HuIcon],
  template: `
    @if (readonly()) {
      <span class="hu-rating__stars" role="img" [attr.aria-label]="readonlyLabel()">
        @for (i of stars(); track i) {
          <span class="hu-rating__star" [style.--fill]="fillOf(i)">
            <hu-icon name="star" [size]="iconSize()" class="hu-rating__base" />
            <hu-icon name="star" [size]="iconSize()" class="hu-rating__fill" />
          </span>
        }
      </span>
    } @else {
      <span class="hu-rating__stars" role="radiogroup" [id]="id()" [attr.aria-labelledby]="labelledBy()" [attr.aria-label]="labelledBy() ? null : ariaLabel()" (mouseleave)="hover.set(0)">
        @for (i of stars(); track i) {
          <label
            class="hu-rating__star"
            [class.hu-rating__star--on]="i <= display()"
            [class.hu-rating__star--disabled]="isDisabled()"
            (mouseenter)="!isDisabled() && hover.set(i)"
          >
            <input
              type="radio"
              class="hu-rating__input"
              [name]="name"
              [value]="i"
              [checked]="value() === i"
              [disabled]="isDisabled()"
              [attr.aria-label]="i + ' / ' + stars().length + (labels()[i - 1] ? ', ' + labels()[i - 1] : '')"
              (click)="onClick(i)"
              (change)="select(i)"
              (blur)="onTouched()"
            />
            <hu-icon name="star" [size]="iconSize()" />
          </label>
        }
      </span>
      @if (showLabel() && (labels()[display() - 1] || display())) {
        <span class="hu-rating__label" aria-hidden="true">{{ labels()[display() - 1] ?? display() + ' / ' + stars().length }}</span>
      }
    }
  `,
  styleUrl: './rating.component.scss',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HuRating), multi: true },
    { provide: HuFormFieldControl, useExisting: forwardRef(() => HuRating) },
  ],
  host: {
    class: 'hu-rating',
    '[attr.data-size]': 'size()',
    '[class.hu-rating--readonly]': 'readonly()',
    '[class.hu-rating--invalid]': 'isInvalid()',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuRating implements ControlValueAccessor, HuFormFieldControl, DoCheck {
  private readonly injector = inject(Injector);
  protected readonly field = inject(HU_FORM_FIELD, { optional: true, host: true });

  /** 0 = puan yok. */
  readonly value = model(0);
  readonly max = input(5, { transform: numberAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Seçili yıldıza tekrar tıklayınca puanı temizle. */
  readonly clearable = input(true, { transform: booleanAttribute });
  /** Yıldızların yanında etiket ("Çok iyi" veya "4 / 5"). */
  readonly showLabel = input(false, { transform: booleanAttribute });
  /** Puan etiketleri (1'den başlar). */
  readonly labels = input<readonly string[]>(['Çok kötü', 'Kötü', 'Orta', 'İyi', 'Çok iyi']);
  readonly size = input<HuRatingSize>('md');
  readonly ariaLabel = input('Puan');
  readonly id = input(huUniqueId('hu-rating'));

  protected readonly name = huUniqueId('hu-rating-name');
  protected readonly hover = signal(0);
  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected readonly stars = computed(() => Array.from({ length: Math.max(1, this.max()) }, (_, i) => i + 1));
  protected readonly display = computed(() => this.hover() || Math.round(this.value() ?? 0));
  protected readonly iconSize = computed(() => ({ sm: 16, md: 22, lg: 30 })[this.size()]);
  protected readonly labelledBy = computed(() => (this.field ? `${this.id()}-label` : null));
  protected readonly readonlyLabel = computed(() => {
    const v = (this.value() ?? 0).toLocaleString('tr-TR', { maximumFractionDigits: 1 });
    return `${this.ariaLabel()}: ${v} / ${this.max()}`;
  });

  // --- HuFormFieldControl -----------------------------------------------------------
  private ngControl: NgControl | null | undefined;
  get hasControl(): boolean {
    return !!this.resolveControl();
  }
  readonly controlErrorVisible = signal(false);
  readonly errors = signal<ValidationErrors | null>(null);
  protected readonly isInvalid = computed(() => this.controlErrorVisible() || (this.field?.showError() ?? false));

  private onChange: (value: number) => void = () => {};
  protected onTouched: () => void = () => {};

  ngDoCheck(): void {
    const c = this.resolveControl();
    if (!c) return;
    this.controlErrorVisible.set(!!c.invalid && !!(c.touched || c.dirty));
    this.errors.set(c.errors);
  }

  /** Salt okunur yıldızın doluluk oranı (0–100%). */
  protected fillOf(i: number): string {
    const v = this.value() ?? 0;
    return `${Math.round(Math.max(0, Math.min(1, v - (i - 1))) * 1000) / 10}%`;
  }

  protected select(i: number): void {
    if (this.isDisabled()) return;
    this.value.set(i);
    this.onChange(i);
  }

  /** Seçili yıldıza tekrar tıklama: change olayı gelmez, burada temizlenir. */
  protected onClick(i: number): void {
    if (this.clearable() && this.value() === i && !this.isDisabled()) {
      // Klavyeyle (boşluk tuşu) seçimde de click gelir; yalnızca zaten seçiliyse temizle
      queueMicrotask(() => {
        if (this.value() === i) {
          this.value.set(0);
          this.hover.set(0);
          this.onChange(0);
        }
      });
    }
  }

  writeValue(value: unknown): void {
    const n = Number(value);
    this.value.set(Number.isFinite(n) ? n : 0);
  }
  registerOnChange(fn: (value: number) => void): void {
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
