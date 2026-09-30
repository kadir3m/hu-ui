import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { HuIcon } from '../icon/icon.component';

export type HuStatusVariant = 'info' | 'success' | 'warning' | 'danger';

export const HU_STATUS_ICONS: Record<HuStatusVariant, string> = {
  info: 'info',
  success: 'check-circle',
  warning: 'alert-triangle',
  danger: 'alert-circle',
};

/**
 * Sayfa içi bilgi / uyarı mesajı.
 * @example <hu-alert variant="warning" title="Dikkat">Dönem kayıtları 5 gün içinde kapanacak.</hu-alert>
 */
@Component({
  selector: 'hu-alert',
  imports: [HuIcon],
  template: `
    <hu-icon class="hu-alert__icon" [name]="icon()" [size]="18" />
    <div class="hu-alert__content">
      @if (title()) {
        <p class="hu-alert__title">{{ title() }}</p>
      }
      <div class="hu-alert__body"><ng-content /></div>
    </div>
    @if (dismissible()) {
      <button type="button" class="hu-alert__close" aria-label="Kapat" (click)="dismiss()">
        <hu-icon name="x" [size]="16" />
      </button>
    }
  `,
  styles: `
    .hu-alert {
      display: flex;
      align-items: flex-start;
      gap: var(--hu-space-3);
      padding: var(--hu-space-3) var(--hu-space-4);
      font-size: var(--hu-text-sm);
      color: var(--_fg);
      background: var(--_bg);
      border: 1px solid color-mix(in srgb, var(--_accent) 25%, transparent);
      border-radius: var(--hu-radius-lg);
    }
    .hu-alert[hidden] { display: none; }
    .hu-alert[data-variant='info'] { --_bg: var(--hu-info-soft); --_fg: var(--hu-info-fg); --_accent: var(--hu-info); }
    .hu-alert[data-variant='success'] { --_bg: var(--hu-success-soft); --_fg: var(--hu-success-fg); --_accent: var(--hu-success); }
    .hu-alert[data-variant='warning'] { --_bg: var(--hu-warning-soft); --_fg: var(--hu-warning-fg); --_accent: var(--hu-warning); }
    .hu-alert[data-variant='danger'] { --_bg: var(--hu-danger-soft); --_fg: var(--hu-danger-fg); --_accent: var(--hu-danger); }
    .hu-alert__icon { margin-top: 1px; color: var(--_accent); }
    .hu-alert__content { flex: 1; min-width: 0; }
    .hu-alert__title { margin-bottom: 2px; font-weight: 600; }
    .hu-alert__close {
      display: inline-flex;
      margin: -2px -6px 0 0;
      padding: 4px;
      color: inherit;
      background: none;
      border: 0;
      border-radius: var(--hu-radius-sm);
      opacity: 0.7;
      cursor: pointer;
    }
    .hu-alert__close:hover { opacity: 1; background: color-mix(in srgb, var(--_accent) 12%, transparent); }
  `,
  host: {
    class: 'hu-alert',
    '[attr.data-variant]': 'variant()',
    '[attr.role]': 'variant() === "danger" || variant() === "warning" ? "alert" : "status"',
    '[attr.hidden]': 'dismissed() ? "" : null',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuAlert {
  readonly variant = input<HuStatusVariant>('info');
  readonly title = input<string>();
  readonly dismissible = input(false, { transform: booleanAttribute });
  readonly dismissed = signal(false);
  readonly closed = output<void>();

  protected readonly icon = computed(() => HU_STATUS_ICONS[this.variant()]);

  dismiss(): void {
    this.dismissed.set(true);
    this.closed.emit();
  }
}
