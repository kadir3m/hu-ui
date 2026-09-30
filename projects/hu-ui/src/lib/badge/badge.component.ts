import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, input } from '@angular/core';

export type HuBadgeVariant = 'neutral' | 'primary' | 'info' | 'success' | 'warning' | 'danger';

/**
 * Durum etiketi.
 * @example <hu-badge variant="success" dot>Aktif</hu-badge>
 */
@Component({
  selector: 'hu-badge',
  template: `
    @if (dot()) {
      <span class="hu-badge__dot" aria-hidden="true"></span>
    }
    <ng-content />
  `,
  styles: `
    .hu-badge {
      --_bg: var(--hu-surface-3);
      --_fg: var(--hu-text-muted);
      --_dot: var(--hu-text-subtle);
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      height: 1.375rem;
      padding: 0 0.5rem;
      font-size: var(--hu-text-xs);
      font-weight: 500;
      line-height: 1;
      white-space: nowrap;
      color: var(--_fg);
      background: var(--_bg);
      border-radius: var(--hu-radius-full);
    }
    .hu-badge[data-variant='primary'] { --_bg: var(--hu-primary-soft); --_fg: var(--hu-primary-soft-fg); --_dot: var(--hu-primary); }
    .hu-badge[data-variant='info'] { --_bg: var(--hu-info-soft); --_fg: var(--hu-info-fg); --_dot: var(--hu-info); }
    .hu-badge[data-variant='success'] { --_bg: var(--hu-success-soft); --_fg: var(--hu-success-fg); --_dot: var(--hu-success); }
    .hu-badge[data-variant='warning'] { --_bg: var(--hu-warning-soft); --_fg: var(--hu-warning-fg); --_dot: var(--hu-warning); }
    .hu-badge[data-variant='danger'] { --_bg: var(--hu-danger-soft); --_fg: var(--hu-danger-fg); --_dot: var(--hu-danger); }
    .hu-badge__dot { width: 6px; height: 6px; background: var(--_dot); border-radius: 50%; }
  `,
  host: { class: 'hu-badge', '[attr.data-variant]': 'variant()' },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuBadge {
  readonly variant = input<HuBadgeVariant>('neutral');
  readonly dot = input(false, { transform: booleanAttribute });
}
