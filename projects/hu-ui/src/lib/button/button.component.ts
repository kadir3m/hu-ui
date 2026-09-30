import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { HuSpinner } from '../spinner/spinner.component';

/** Görünüm. */
export type HuButtonVariant = 'solid' | 'soft' | 'outline' | 'ghost' | 'link';
/** Renk. */
export type HuButtonColor = 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';
export type HuButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** Renk verilmezse görünüme göre varsayılan: dolgulu butonlar markalı, çerçeveli olanlar nötr. */
const DEFAULT_COLOR: Record<HuButtonVariant, HuButtonColor> = {
  solid: 'primary',
  soft: 'primary',
  link: 'primary',
  outline: 'neutral',
  ghost: 'neutral',
};

/**
 * Buton. Native `<button>` ve `<a>` elementlerine uygulanır; böylece form
 * davranışı, routerLink ve erişilebilirlik tarayıcıdan hazır gelir.
 *
 * Görünüm (`variant`) ve renk (`color`) birbirinden bağımsızdır:
 * 5 görünüm × 6 renk.
 *
 * @example
 * <button hu-button>Kaydet</button>
 * <button hu-button variant="soft" color="success">Onayla</button>
 * <button hu-button variant="outline" color="danger" size="sm"><hu-icon name="trash" /> Sil</button>
 * <button hu-button variant="ghost" iconOnly aria-label="Düzenle"><hu-icon name="edit" /></button>
 * <a hu-button variant="link" routerLink="/users">Tüm kullanıcılar</a>
 */
@Component({
  selector: 'button[hu-button], a[hu-button]',
  imports: [HuSpinner],
  template: `
    @if (loading()) {
      <hu-spinner class="hu-button__spinner" size="sm" />
    }
    <ng-content />
  `,
  styleUrl: './button.component.scss',
  host: {
    class: 'hu-button',
    '[attr.data-variant]': 'variant()',
    '[attr.data-color]': 'resolvedColor()',
    '[attr.data-size]': 'size()',
    '[class.hu-button--block]': 'block()',
    '[class.hu-button--icon]': 'iconOnly()',
    '[class.hu-button--pill]': 'pill()',
    '[class.hu-button--loading]': 'loading()',
    '[attr.disabled]': 'isButton && isDisabled() ? "" : null',
    '[attr.aria-disabled]': '!isButton && isDisabled() ? "true" : null',
    '[attr.tabindex]': '!isButton && isDisabled() ? -1 : null',
    '[attr.aria-busy]': 'loading() || null',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuButton {
  protected readonly isButton = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName === 'BUTTON';

  readonly variant = input<HuButtonVariant>('solid');
  /** Verilmezse: solid/soft/link → primary, outline/ghost → neutral. */
  readonly color = input<HuButtonColor>();
  readonly size = input<HuButtonSize>('md');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  /** Butonu kapsayıcı genişliğine yayar. */
  readonly block = input(false, { transform: booleanAttribute });
  /** Kare, yalnızca ikon içeren buton. `aria-label` vermeyi unutmayın. */
  readonly iconOnly = input(false, { transform: booleanAttribute });
  /** Tam yuvarlak köşeler. */
  readonly pill = input(false, { transform: booleanAttribute });

  protected readonly resolvedColor = computed(() => this.color() ?? DEFAULT_COLOR[this.variant()]);
  protected readonly isDisabled = computed(() => this.disabled() || this.loading());
}
