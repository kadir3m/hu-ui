import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  input,
} from '@angular/core';

/** Kart başlığının sağındaki aksiyonlar. */
@Directive({ selector: '[huCardActions]', host: { class: 'hu-card__actions' } })
export class HuCardActions {}

/** Kartın üstünde kenarlara dayanan kapak görseli / medya. */
@Directive({ selector: '[huCardMedia]', host: { class: 'hu-card__media' } })
export class HuCardMedia {}

/** Kart alt bilgisi. */
@Directive({ selector: '[huCardFooter]', host: { class: 'hu-card__footer' } })
export class HuCardFooter {}

export type HuCardPadding = 'none' | 'sm' | 'md';
export type HuCardVariant = 'outlined' | 'elevated' | 'flat' | 'soft';

/**
 * İçerik kartı.
 * @example
 * <hu-card title="Son başvurular" subtitle="Son 7 gün">
 *   <button huCardActions hu-button variant="ghost" size="sm">Tümü</button>
 *   ...
 *   <div huCardFooter>...</div>
 * </hu-card>
 */
@Component({
  selector: 'hu-card',
  template: `
    <ng-content select="[huCardMedia]" />
    <div class="hu-card__header" [hidden]="!hasHeader()">
      <div class="hu-card__heading">
        @if (title()) {
          <h3 class="hu-card__title">{{ title() }}</h3>
        }
        @if (subtitle()) {
          <p class="hu-card__subtitle">{{ subtitle() }}</p>
        }
      </div>
      <ng-content select="[huCardActions]" />
    </div>
    <div class="hu-card__body">
      <ng-content />
    </div>
    <ng-content select="[huCardFooter]" />
  `,
  styles: `
    .hu-card {
      display: flex;
      flex-direction: column;
      min-width: 0;
      background: var(--hu-surface);
      border: 1px solid var(--hu-border);
      border-radius: var(--hu-radius-lg);
      box-shadow: var(--hu-shadow-sm);
      overflow: clip;
    }
    .hu-card[data-variant='elevated'] { border-color: transparent; box-shadow: var(--hu-shadow-md); }
    .hu-card[data-variant='flat'] { box-shadow: none; }
    .hu-card[data-variant='soft'] { background: var(--hu-surface-2); border-color: transparent; box-shadow: none; }
    .hu-card--hoverable { transition: box-shadow 150ms, transform 150ms, border-color 150ms; }
    .hu-card--hoverable:hover { border-color: var(--hu-border-strong); box-shadow: var(--hu-shadow-lg); transform: translateY(-2px); }
    .hu-card--hoverable:has(:focus-visible) { box-shadow: var(--hu-ring); }
    @media (prefers-reduced-motion: reduce) { .hu-card--hoverable:hover { transform: none; } }
    .hu-card__media { display: block; }
    .hu-card__media:is(img, video), .hu-card__media > :is(img, video) { display: block; width: 100%; height: auto; object-fit: cover; }
    .hu-card__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--hu-space-3);
      padding: var(--hu-space-4) var(--hu-space-5);
      border-bottom: 1px solid var(--hu-border);
    }
    .hu-card__header[hidden] { display: none; }
    .hu-card__heading { min-width: 0; }
    .hu-card__title { font-size: 0.9375rem; font-weight: 600; }
    .hu-card__subtitle { margin-top: 2px; font-size: var(--hu-text-xs); color: var(--hu-text-muted); }
    .hu-card__actions { display: flex; align-items: center; gap: var(--hu-space-2); flex-shrink: 0; }
    .hu-card__body { flex: 1; padding: var(--hu-space-5); }
    .hu-card[data-padding='sm'] .hu-card__body { padding: var(--hu-space-3); }
    .hu-card[data-padding='none'] .hu-card__body { padding: 0; }
    .hu-card__footer {
      display: flex;
      align-items: center;
      gap: var(--hu-space-2);
      padding: var(--hu-space-3) var(--hu-space-5);
      border-top: 1px solid var(--hu-border);
    }
  `,
  host: {
    class: 'hu-card',
    '[attr.data-padding]': 'padding()',
    '[attr.data-variant]': 'variant()',
    '[class.hu-card--hoverable]': 'hoverable()',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuCard {
  readonly title = input<string>();
  readonly subtitle = input<string>();
  readonly padding = input<HuCardPadding>('md');
  /** `outlined` çerçeve + hafif gölge, `elevated` gölgeli, `flat` yalnız çerçeve, `soft` dolgu. */
  readonly variant = input<HuCardVariant>('outlined');
  /** Üzerine gelince öne çıkar (tıklanabilir kartlar için). */
  readonly hoverable = input(false, { transform: booleanAttribute });

  private readonly actions = contentChild(HuCardActions);
  protected readonly hasHeader = computed(() => !!(this.title() || this.subtitle() || this.actions()));
}
