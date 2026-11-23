import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, Directive, TemplateRef, ViewEncapsulation, contentChild, inject, input } from '@angular/core';
import { HuIcon } from '../icon/icon.component';

export type HuTimelineColor = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface HuTimelineEvent {
  title: string;
  description?: string;
  /** Karşı tarafta (veya başlığın üstünde) gösterilen tarih / saat metni. */
  date?: string;
  icon?: string;
  color?: HuTimelineColor;
  /** `done` dolu, `current` vurgulu (halkalı), `todo` boş işaret. */
  status?: 'done' | 'current' | 'todo';
}

interface Ctx<T> {
  $implicit: T;
  index: number;
}

/** Olay içeriği şablonu: `<ng-template huTimelineContent let-e>` */
@Directive({ selector: 'ng-template[huTimelineContent]' })
export class HuTimelineContent<T = HuTimelineEvent> {
  readonly of = input<readonly T[]>(undefined, { alias: 'huTimelineContentOf' });
  readonly template = inject<TemplateRef<Ctx<T>>>(TemplateRef);
  static ngTemplateContextGuard<T>(_d: HuTimelineContent<T>, ctx: unknown): ctx is Ctx<T> {
    return true;
  }
}

/** Karşı taraf şablonu (tarih yerine kendi içeriğiniz). */
@Directive({ selector: 'ng-template[huTimelineOpposite]' })
export class HuTimelineOpposite<T = HuTimelineEvent> {
  readonly of = input<readonly T[]>(undefined, { alias: 'huTimelineOppositeOf' });
  readonly template = inject<TemplateRef<Ctx<T>>>(TemplateRef);
  static ngTemplateContextGuard<T>(_d: HuTimelineOpposite<T>, ctx: unknown): ctx is Ctx<T> {
    return true;
  }
}

/** İşaret şablonu (daire yerine avatar, rozet…). */
@Directive({ selector: 'ng-template[huTimelineMarker]' })
export class HuTimelineMarker<T = HuTimelineEvent> {
  readonly of = input<readonly T[]>(undefined, { alias: 'huTimelineMarkerOf' });
  readonly template = inject<TemplateRef<Ctx<T>>>(TemplateRef);
  static ngTemplateContextGuard<T>(_d: HuTimelineMarker<T>, ctx: unknown): ctx is Ctx<T> {
    return true;
  }
}

/**
 * Zaman çizelgesi: süreç adımları, geçmiş, sipariş durumu. Dikey (sol, sağ, dönüşümlü)
 * veya yatay. Olaylar `events` ile; içerik, karşı taraf ve işaret şablonla özelleştirilir.
 *
 * @example
 * <hu-timeline [events]="steps" align="alternate" />
 */
@Component({
  selector: 'hu-timeline',
  imports: [NgTemplateOutlet, HuIcon],
  template: `
    <ol class="hu-timeline__list">
      @for (e of events(); track $index; let i = $index; let last = $last) {
        <li class="hu-timeline__event" [attr.data-color]="colorOf(e)" [attr.data-status]="statusOf(e)" [class.hu-timeline__event--last]="last">
          @if (hasOpposite()) {
            <div class="hu-timeline__opposite">
              @if (oppositeTpl(); as tpl) {
                <ng-container *ngTemplateOutlet="tpl.template; context: { $implicit: e, index: i }" />
              } @else {
                <time>{{ asEvent(e).date }}</time>
              }
            </div>
          }
          <div class="hu-timeline__separator" aria-hidden="true">
            @if (markerTpl(); as tpl) {
              <ng-container *ngTemplateOutlet="tpl.template; context: { $implicit: e, index: i }" />
            } @else {
              <span class="hu-timeline__marker">
                @if (asEvent(e).icon) {
                  <hu-icon [name]="asEvent(e).icon!" [size]="14" />
                } @else if (statusOf(e) === 'done') {
                  <hu-icon name="check" [size]="12" />
                }
              </span>
            }
            <span class="hu-timeline__line"></span>
          </div>
          <div class="hu-timeline__content">
            @if (contentTpl(); as tpl) {
              <ng-container *ngTemplateOutlet="tpl.template; context: { $implicit: e, index: i }" />
            } @else {
              @if (!hasOpposite() && asEvent(e).date) {
                <time class="hu-timeline__date">{{ asEvent(e).date }}</time>
              }
              <span class="hu-timeline__title">{{ asEvent(e).title }}</span>
              @if (asEvent(e).description) {
                <span class="hu-timeline__description">{{ asEvent(e).description }}</span>
              }
              @if (statusOf(e) === 'current') {
                <span class="hu-sr-only">(şu anki adım)</span>
              }
            }
          </div>
        </li>
      }
    </ol>
  `,
  styleUrl: './timeline.component.scss',
  host: {
    class: 'hu-timeline',
    '[attr.data-layout]': 'layout()',
    '[attr.data-align]': 'align()',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuTimeline<T = HuTimelineEvent> {
  readonly events = input<readonly T[]>([]);
  readonly layout = input<'vertical' | 'horizontal'>('vertical');
  /** Dikeyde içeriğin yeri: `right` (tarih solda), `left`, `alternate` (sırayla). */
  readonly align = input<'left' | 'right' | 'alternate'>('right');
  /** Tarihi karşı tarafta göster (varsayılan: dikeyde açık, yatayda kapalı). */
  readonly opposite = input<boolean | null>(null);

  protected readonly contentTpl = contentChild(HuTimelineContent);
  protected readonly oppositeTpl = contentChild(HuTimelineOpposite);
  protected readonly markerTpl = contentChild(HuTimelineMarker);

  protected hasOpposite(): boolean {
    if (this.oppositeTpl()) return true;
    const o = this.opposite();
    return o ?? (this.layout() === 'vertical' && this.align() !== 'left' && this.events().some((e) => !!this.asEvent(e).date));
  }

  protected asEvent(e: T): HuTimelineEvent {
    return e as unknown as HuTimelineEvent;
  }

  protected colorOf(e: T): HuTimelineColor {
    const ev = this.asEvent(e);
    return ev.color ?? (ev.status === 'todo' ? 'neutral' : 'primary');
  }

  protected statusOf(e: T): string {
    return this.asEvent(e).status ?? 'done';
  }
}
