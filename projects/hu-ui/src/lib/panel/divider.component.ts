import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';

/**
 * Ayraç. İçerik verilirse çizginin ortasında (veya `align` ile başında / sonunda) etiket olur.
 *
 * @example
 * <hu-divider />
 * <hu-divider>veya</hu-divider>
 * <hu-divider layout="vertical" />
 */
@Component({
  selector: 'hu-divider',
  template: `<span class="hu-divider__content"><ng-content /></span>`,
  styles: `
    .hu-divider {
      --_line: var(--hu-divider-color, var(--hu-border));
      display: flex;
      align-items: center;
      gap: var(--hu-space-3);
      margin: var(--hu-divider-margin, var(--hu-space-4)) 0;
      font-size: var(--hu-text-xs);
      font-weight: 500;
      color: var(--hu-text-muted);
    }
    .hu-divider::before,
    .hu-divider::after {
      content: '';
      flex: 1 1 0;
      border-top: 1px var(--_style, solid) var(--_line);
    }
    .hu-divider[data-type='dashed'] { --_style: dashed; }
    .hu-divider[data-type='dotted'] { --_style: dotted; }
    .hu-divider[data-align='start']::before,
    .hu-divider[data-align='end']::after { flex: 0 0 var(--hu-space-4); }
    .hu-divider__content:empty { display: none; }
    .hu-divider:has(.hu-divider__content:empty) { gap: 0; }
    .hu-divider__content { display: inline-flex; align-items: center; gap: var(--hu-space-2); white-space: nowrap; }

    .hu-divider[data-layout='vertical'] {
      flex-direction: column;
      align-self: stretch;
      min-height: 1rem;
      margin: 0 var(--hu-divider-margin, var(--hu-space-3));
    }
    .hu-divider[data-layout='vertical']::before,
    .hu-divider[data-layout='vertical']::after {
      border-top: 0;
      border-left: 1px var(--_style, solid) var(--_line);
    }
  `,
  host: {
    class: 'hu-divider',
    role: 'separator',
    '[attr.aria-orientation]': 'layout()',
    '[attr.data-layout]': 'layout()',
    '[attr.data-align]': 'align()',
    '[attr.data-type]': 'type()',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuDivider {
  readonly layout = input<'horizontal' | 'vertical'>('horizontal');
  /** Etiketin yeri. */
  readonly align = input<'start' | 'center' | 'end'>('center');
  readonly type = input<'solid' | 'dashed' | 'dotted'>('solid');
}
