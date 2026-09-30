import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';

export type HuSpinnerSize = 'sm' | 'md' | 'lg';

/** @example <hu-spinner />  <hu-spinner size="lg" label="Veriler yükleniyor" /> */
@Component({
  selector: 'hu-spinner',
  template: `
    <svg viewBox="0 0 24 24" class="hu-spinner__svg" aria-hidden="true">
      <circle class="hu-spinner__track" cx="12" cy="12" r="10" fill="none" stroke-width="3" />
      <circle class="hu-spinner__arc" cx="12" cy="12" r="10" fill="none" stroke-width="3" stroke-linecap="round" />
    </svg>
  `,
  styles: `
    .hu-spinner {
      display: inline-flex;
      width: 1.25rem;
      height: 1.25rem;
      color: var(--hu-primary);
      flex-shrink: 0;
    }
    .hu-spinner[data-size='sm'] { width: 1rem; height: 1rem; }
    .hu-spinner[data-size='lg'] { width: 2rem; height: 2rem; }
    .hu-spinner__svg {
      width: 100%;
      height: 100%;
      animation: hu-spin 0.8s linear infinite;
    }
    .hu-spinner__track { stroke: currentColor; opacity: 0.2; }
    .hu-spinner__arc { stroke: currentColor; stroke-dasharray: 20 63; }
    @keyframes hu-spin { to { transform: rotate(360deg); } }
  `,
  host: {
    class: 'hu-spinner',
    role: 'status',
    '[attr.data-size]': 'size()',
    '[attr.aria-label]': 'label()',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuSpinner {
  readonly size = input<HuSpinnerSize>('md');
  readonly label = input('Yükleniyor');
}
