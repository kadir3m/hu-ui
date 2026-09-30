import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  computed,
  contentChild,
  input,
} from '@angular/core';

/** Kart başlığının sağındaki aksiyonlar. */
@Directive({ selector: '[huCardActions]', host: { class: 'hu-card__actions' } })
export class HuCardActions {}

/** Kart alt bilgisi. */
@Directive({ selector: '[huCardFooter]', host: { class: 'hu-card__footer' } })
export class HuCardFooter {}

export type HuCardPadding = 'none' | 'sm' | 'md';

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
    }
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
  host: { class: 'hu-card', '[attr.data-padding]': 'padding()' },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuCard {
  readonly title = input<string>();
  readonly subtitle = input<string>();
  readonly padding = input<HuCardPadding>('md');

  private readonly actions = contentChild(HuCardActions);
  protected readonly hasHeader = computed(() => !!(this.title() || this.subtitle() || this.actions()));
}
