import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject, input } from '@angular/core';
import { HuIcon } from '../icon/icon.component';
import { HU_STATUS_ICONS } from '../alert/alert.component';
import { HuToastService } from './toast.service';

export type HuToasterPosition = 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';

/** Toast'ların gösterildiği alan. Kök componentte bir kez kullanın: `<hu-toaster />` */
@Component({
  selector: 'hu-toaster',
  imports: [HuIcon],
  template: `
    @for (toast of service.toasts(); track toast.id) {
      <div class="hu-toast" [attr.data-variant]="toast.variant" [attr.role]="toast.variant === 'danger' ? 'alert' : 'status'">
        <hu-icon class="hu-toast__icon" [name]="icons[toast.variant]" [size]="18" />
        <div class="hu-toast__content">
          @if (toast.title) {
            <p class="hu-toast__title">{{ toast.title }}</p>
          }
          <p class="hu-toast__message">{{ toast.message }}</p>
        </div>
        <button type="button" class="hu-toast__close" aria-label="Bildirimi kapat" (click)="service.dismiss(toast.id)">
          <hu-icon name="x" [size]="16" />
        </button>
      </div>
    }
  `,
  styles: `
    .hu-toaster {
      position: fixed;
      z-index: 1100;
      display: flex;
      flex-direction: column;
      gap: var(--hu-space-2);
      width: min(380px, calc(100vw - 2rem));
      pointer-events: none;
    }
    .hu-toaster[data-position^='top'] { top: var(--hu-space-4); }
    .hu-toaster[data-position^='bottom'] { bottom: var(--hu-space-4); flex-direction: column-reverse; }
    .hu-toaster[data-position$='right'] { right: var(--hu-space-4); }
    .hu-toaster[data-position$='center'] { left: 50%; transform: translateX(-50%); }
    .hu-toast {
      display: flex;
      align-items: flex-start;
      gap: var(--hu-space-3);
      padding: var(--hu-space-3) var(--hu-space-4);
      background: var(--hu-surface);
      border: 1px solid var(--hu-border);
      border-left: 3px solid var(--_accent);
      border-radius: var(--hu-radius-lg);
      box-shadow: var(--hu-shadow-lg);
      pointer-events: auto;
      animation: hu-toast-in 200ms cubic-bezier(0.2, 0.9, 0.3, 1.2);
    }
    .hu-toast[data-variant='info'] { --_accent: var(--hu-info); }
    .hu-toast[data-variant='success'] { --_accent: var(--hu-success); }
    .hu-toast[data-variant='warning'] { --_accent: var(--hu-warning); }
    .hu-toast[data-variant='danger'] { --_accent: var(--hu-danger); }
    .hu-toast__icon { margin-top: 1px; color: var(--_accent); }
    .hu-toast__content { flex: 1; min-width: 0; }
    .hu-toast__title { font-weight: 600; }
    .hu-toast__message { color: var(--hu-text-muted); }
    .hu-toast__close {
      display: inline-flex;
      margin: -2px -6px 0 0;
      padding: 4px;
      color: var(--hu-text-subtle);
      background: none;
      border: 0;
      border-radius: var(--hu-radius-sm);
      cursor: pointer;
    }
    .hu-toast__close:hover { color: var(--hu-text); background: var(--hu-surface-3); }
    @keyframes hu-toast-in {
      from { opacity: 0; transform: translateY(-8px) scale(0.98); }
    }
  `,
  host: {
    class: 'hu-toaster',
    '[attr.data-position]': 'position()',
    'aria-live': 'polite',
    role: 'region',
    'aria-label': 'Bildirimler',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuToaster {
  protected readonly service = inject(HuToastService);
  protected readonly icons = HU_STATUS_ICONS;
  readonly position = input<HuToasterPosition>('top-right');
}
