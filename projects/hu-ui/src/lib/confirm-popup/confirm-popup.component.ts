import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  inject,
  output,
  signal,
} from '@angular/core';
import { HuButton, HuButtonColor } from '../button/button.component';
import { HuIcon } from '../icon/icon.component';
import { huUniqueId } from '../core/unique-id';

export interface HuConfirmOptions {
  /** Popup'ın bağlanacağı element (genellikle tıklanan buton). */
  target: EventTarget | HTMLElement | null;
  message: string;
  /** Mesajın üstünde kalın başlık (isteğe bağlı). */
  header?: string;
  /** Varsayılan `'alert-triangle'`. `null` verilirse ikon gösterilmez. */
  icon?: string | null;
  acceptLabel?: string;
  rejectLabel?: string;
  /** Onay butonunun rengi. Silme gibi işlemlerde `'danger'` verin. */
  acceptColor?: HuButtonColor;
  /** Açılınca odaklanacak buton. Varsayılan `'accept'`. */
  defaultFocus?: 'accept' | 'reject';
}

type Placement = 'bottom' | 'top';

/**
 * Tetikleyicinin yanında açılan küçük onay kutusu. Doğrudan kullanılmaz:
 * `huConfirm` direktifi veya `HuConfirmPopupService` ile açılır.
 */
@Component({
  selector: 'hu-confirm-popup',
  imports: [HuButton, HuIcon],
  template: `
    <span class="hu-confirm__arrow" aria-hidden="true"></span>
    <div class="hu-confirm__body">
      @if (options().icon !== null) {
        <hu-icon class="hu-confirm__icon" [name]="options().icon ?? 'alert-triangle'" [size]="22" />
      }
      <div class="hu-confirm__text">
        @if (options().header) {
          <p class="hu-confirm__header" [id]="id + '-header'">{{ options().header }}</p>
        }
        <p class="hu-confirm__message" [id]="id + '-message'">{{ options().message }}</p>
      </div>
    </div>
    <div class="hu-confirm__actions">
      <button hu-button size="sm" variant="ghost" type="button" data-action="reject" (click)="resolve(false)">
        {{ options().rejectLabel ?? 'Hayır' }}
      </button>
      <button
        hu-button
        size="sm"
        type="button"
        data-action="accept"
        [color]="options().acceptColor ?? 'primary'"
        (click)="resolve(true)"
      >
        {{ options().acceptLabel ?? 'Evet' }}
      </button>
    </div>
  `,
  styleUrl: './confirm-popup.component.scss',
  host: {
    class: 'hu-confirm',
    role: 'alertdialog',
    '[attr.popover]': "supportsPopover ? 'manual' : null",
    '[attr.aria-labelledby]': "options().header ? id + '-header' : null",
    '[attr.aria-describedby]': "id + '-message'",
    '[attr.data-placement]': 'placement()',
    '(keydown)': 'onKeydown($event)',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuConfirmPopup {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly options = signal<HuConfirmOptions>({ target: null, message: '' });
  /** Kullanıcı karar verdiğinde (onay: `true`). */
  readonly closed = output<boolean>();

  protected readonly id = huUniqueId('hu-confirm');
  protected readonly placement = signal<Placement>('bottom');
  protected readonly supportsPopover = typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype;
  private done = false;

  constructor() {
    const el = this.host.nativeElement;
    const doc = el.ownerDocument;
    const win = doc.defaultView;

    const reposition = () => this.position();
    // Dışarı tıklama. Tetikleyiciye tıklama hariç: onu servis aç/kapa olarak işler.
    const outside = (e: PointerEvent) => {
      const node = e.target as Node;
      if (!el.contains(node) && !this.targetElement()?.contains(node)) this.resolve(false, false);
    };

    afterNextRender(() => {
      if (this.supportsPopover) el.showPopover();
      this.position();
      const focus = this.options().defaultFocus === 'reject' ? 'reject' : 'accept';
      el.querySelector<HTMLElement>(`[data-action="${focus}"]`)?.focus({ preventScroll: true });
      // Popup'ı açan tıklamanın kendisi "dışarı tıklama" sayılmasın
      setTimeout(() => doc.addEventListener('pointerdown', outside, true));
      win?.addEventListener('resize', reposition);
      win?.addEventListener('scroll', reposition, true);
    });

    inject(DestroyRef).onDestroy(() => {
      doc.removeEventListener('pointerdown', outside, true);
      win?.removeEventListener('resize', reposition);
      win?.removeEventListener('scroll', reposition, true);
    });
  }

  /** @internal */
  resolve(accepted: boolean, restoreFocus = true): void {
    if (this.done) return;
    this.done = true;
    if (restoreFocus) this.targetElement()?.focus({ preventScroll: true });
    this.closed.emit(accepted);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation(); // dialog içindeyse dialog kapanmasın
      this.resolve(false);
    } else if (event.key === 'Tab') {
      // Odak iki buton arasında kalsın
      const buttons = Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>('.hu-confirm__actions button'));
      const index = buttons.indexOf(this.host.nativeElement.ownerDocument.activeElement as HTMLElement);
      const next = event.shiftKey ? (index <= 0 ? buttons.length - 1 : index - 1) : (index + 1) % buttons.length;
      event.preventDefault();
      buttons[next]?.focus();
    }
  }

  private targetElement(): HTMLElement | null {
    const target = this.options().target;
    return target instanceof HTMLElement ? target : null;
  }

  /** Tetikleyicinin altına (yer yoksa üstüne) yerleştir; ok tetikleyicinin ortasını göstersin. */
  private position(): void {
    const el = this.host.nativeElement;
    const target = this.targetElement();
    const win = el.ownerDocument.defaultView;
    if (!target || !win) return;
    if (!target.isConnected) return this.resolve(false, false);

    const anchor = target.getBoundingClientRect();
    const { offsetWidth: width, offsetHeight: height } = el;
    const gap = 10; // ok için boşluk
    const edge = 8;

    let left = anchor.left;
    left = Math.max(edge, Math.min(left, win.innerWidth - width - edge));

    const below = anchor.bottom + gap;
    const above = anchor.top - gap - height;
    const fitsBelow = below + height <= win.innerHeight - edge;
    const placement: Placement = fitsBelow || above < edge ? 'bottom' : 'top';
    this.placement.set(placement);

    // Ok, tetikleyicinin ortasına (ama popup'ın köşesinden en az 14px içeride)
    const arrow = Math.max(14, Math.min(anchor.left + anchor.width / 2 - left, width - 14));
    el.style.left = `${left}px`;
    el.style.top = `${placement === 'bottom' ? below : above}px`;
    el.style.setProperty('--hu-confirm-arrow-x', `${arrow}px`);
  }
}
