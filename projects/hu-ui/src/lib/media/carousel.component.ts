import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  inject,
  input,
  model,
  numberAttribute,
  signal,
  untracked,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { HuIcon } from '../icon/icon.component';

export interface HuCarouselItemContext<T> {
  $implicit: T;
  index: number;
}

/** Slayt şablonu. `[huCarouselItemOf]` ile öğe tipi çıkarılır. */
@Directive({ selector: 'ng-template[huCarouselItem]' })
export class HuCarouselItem<T = any> {
  readonly of = input<readonly T[]>(undefined, { alias: 'huCarouselItemOf' });
  readonly template = inject<TemplateRef<HuCarouselItemContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T>(_dir: HuCarouselItem<T>, ctx: unknown): ctx is HuCarouselItemContext<T> {
    return true;
  }
}

/** Genişliğe göre görünen öğe sayısı: `{ minWidth: 768, numVisible: 2 }`. */
export interface HuCarouselBreakpoint {
  minWidth: number;
  numVisible: number;
  numScroll?: number;
}

/**
 * Carousel: aynı anda bir veya birden çok öğe, genişliğe göre değişen öğe sayısı,
 * döngü, otomatik oynatma (üzerine gelince / odaklanınca durur, durdur butonu),
 * noktalı gösterge, ←/→ tuşları ve kaydırma hareketi.
 *
 * @example
 * <hu-carousel [items]="news" [numVisible]="3" [breakpoints]="[{ minWidth: 0, numVisible: 1 }, { minWidth: 640, numVisible: 2 }]">
 *   <ng-template huCarouselItem [huCarouselItemOf]="news" let-n>…</ng-template>
 * </hu-carousel>
 */
@Component({
  selector: 'hu-carousel',
  imports: [NgTemplateOutlet, HuIcon],
  template: `
    <div
      class="hu-carousel__viewport"
      tabindex="0"
      role="region"
      aria-roledescription="carousel"
      [attr.aria-label]="ariaLabel()"
      (keydown)="onKeydown($event)"
      (focusin)="focusInside.set(true)"
      (focusout)="onFocusOut($event)"
      (mouseenter)="hovered.set(true)"
      (mouseleave)="hovered.set(false)"
      (pointerdown)="onPointerDown($event)"
      (pointermove)="onPointerMove($event)"
      (pointerup)="onPointerUp($event)"
      (pointercancel)="onPointerUp($event)"
    >
      <div
        class="hu-carousel__track"
        [class.hu-carousel__track--dragging]="dragOffset() !== 0"
        [style.transform]="'translateX(calc(' + -(start() * 100) / visible() + '% + ' + dragOffset() + 'px))'"
        [attr.aria-live]="playing() ? 'off' : 'polite'"
      >
        @for (item of items(); track $index; let i = $index) {
          <div
            class="hu-carousel__item"
            role="group"
            aria-roledescription="slayt"
            [attr.aria-label]="i + 1 + ' / ' + items().length"
            [attr.aria-hidden]="!isVisible(i) || null"
            [attr.inert]="!isVisible(i) || null"
            [style.flex-basis]="100 / visible() + '%'"
          >
            @if (template(); as tpl) {
              <ng-container *ngTemplateOutlet="tpl.template; context: { $implicit: item, index: i }" />
            }
          </div>
        }
      </div>

      @if (pageCount() > 1 && showNavigators()) {
        <button type="button" class="hu-carousel__nav hu-carousel__nav--prev" aria-label="Önceki" [disabled]="!circular() && page() === 0" (click)="prev()">
          <hu-icon name="chevron-left" [size]="20" />
        </button>
        <button type="button" class="hu-carousel__nav hu-carousel__nav--next" aria-label="Sonraki" [disabled]="!circular() && page() === pageCount() - 1" (click)="next()">
          <hu-icon name="chevron-right" [size]="20" />
        </button>
      }
    </div>

    @if (pageCount() > 1 && (showIndicators() || autoplay())) {
      <div class="hu-carousel__footer">
        @if (autoplay()) {
          <button type="button" class="hu-carousel__play" [attr.aria-label]="paused() ? 'Otomatik geçişi başlat' : 'Otomatik geçişi durdur'" (click)="paused.set(!paused())">
            <hu-icon [name]="paused() ? 'play' : 'pause'" [size]="14" />
          </button>
        }
        @if (showIndicators()) {
          <div class="hu-carousel__dots" role="group" aria-label="Sayfalar">
            @for (p of pages(); track p) {
              <button
                type="button"
                class="hu-carousel__dot"
                [attr.aria-label]="'Sayfa ' + (p + 1)"
                [attr.aria-current]="p === page() || null"
                (click)="page.set(p)"
              ></button>
            }
          </div>
        }
      </div>
    }
  `,
  styleUrl: './carousel.component.scss',
  host: { class: 'hu-carousel' },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuCarousel<T = any> {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly items = input<readonly T[]>([]);
  /** Aynı anda görünen öğe. `breakpoints` verilirse genişliğe göre değişir. */
  readonly numVisible = input(1, { transform: numberAttribute });
  /** Bir adımda kayan öğe. Verilmezse `numVisible`. */
  readonly numScroll = input<number | null>(null);
  /** Bileşen genişliğine göre (ekrana değil): küçükten büyüğe. */
  readonly breakpoints = input<HuCarouselBreakpoint[]>([]);
  readonly circular = input(true, { transform: booleanAttribute });
  /** Otomatik geçiş aralığı (ms). 0 → kapalı. */
  readonly autoplay = input(0, { transform: numberAttribute });
  readonly showIndicators = input(true, { transform: booleanAttribute });
  readonly showNavigators = input(true, { transform: booleanAttribute });
  readonly ariaLabel = input('Carousel');
  /** Gösterilen sayfa. */
  readonly page = model(0);

  protected readonly template = contentChild(HuCarouselItem);
  protected readonly width = signal(0);
  protected readonly hovered = signal(false);
  protected readonly focusInside = signal(false);
  protected readonly paused = signal(false);
  protected readonly dragOffset = signal(0);
  private drag: { id: number; x: number; moved: boolean } | null = null;

  /** Geçerli kırılıma göre görünen ve kayan öğe sayısı. */
  private readonly active = computed(() => {
    const bp = [...this.breakpoints()].sort((a, b) => a.minWidth - b.minWidth).filter((b) => this.width() >= b.minWidth).at(-1);
    const visible = Math.max(1, bp?.numVisible ?? this.numVisible());
    return { visible, scroll: Math.max(1, Math.min(visible, bp?.numScroll ?? this.numScroll() ?? visible)) };
  });
  protected readonly visible = computed(() => Math.min(this.active().visible, Math.max(1, this.items().length)));
  protected readonly step = computed(() => this.active().scroll);
  protected readonly pageCount = computed(() => Math.max(1, Math.ceil((this.items().length - this.visible()) / this.step()) + 1));
  /** Sayfanın ilk öğesi; son sayfada kartlar sona hizalanır. */
  protected readonly start = computed(() => Math.min(this.page() * this.step(), Math.max(0, this.items().length - this.visible())));
  protected readonly pages = computed(() => Array.from({ length: this.pageCount() }, (_, i) => i));
  /** Otomatik geçiş gerçekten çalışıyor mu (duraklatılmadı, üzerinde / odakta değil). */
  protected readonly playing = computed(() => this.autoplay() > 0 && !this.paused() && !this.hovered() && !this.focusInside());

  constructor() {
    // Genişlik izlenir (kırılımlar bileşen genişliğine göre); yalnızca tarayıcıda
    let observer: ResizeObserver | undefined;
    afterNextRender(() => {
      observer = new ResizeObserver(([entry]) => this.width.set(entry.contentRect.width));
      observer.observe(this.host.nativeElement);
    });
    const destroy = inject(DestroyRef);
    destroy.onDestroy(() => observer?.disconnect());

    // Sayfa sayısı küçülürse (genişlik / öğe değişti) sınıra çek
    effect(() => {
      const last = this.pageCount() - 1;
      untracked(() => {
        if (this.page() > last) this.page.set(last);
      });
    });

    // Otomatik geçiş
    let timer: ReturnType<typeof setInterval> | undefined;
    effect(() => {
      clearInterval(timer);
      if (!this.playing() || this.pageCount() < 2) return;
      timer = setInterval(() => this.next(), this.autoplay());
    });
    destroy.onDestroy(() => clearInterval(timer));
  }

  next(): void {
    const last = this.pageCount() - 1;
    if (this.page() < last) this.page.update((p) => p + 1);
    else if (this.circular()) this.page.set(0);
  }

  prev(): void {
    if (this.page() > 0) this.page.update((p) => p - 1);
    else if (this.circular()) this.page.set(this.pageCount() - 1);
  }

  protected isVisible(i: number): boolean {
    const start = this.start();
    return i >= start && i < start + this.visible();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.prev();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.next();
    }
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (!next || !this.host.nativeElement.contains(next)) this.focusInside.set(false);
  }

  // --- Kaydırma hareketi -----------------------------------------------------------
  protected onPointerDown(event: PointerEvent): void {
    if (event.button !== 0 || (event.target as HTMLElement).closest('button, a, input')) return;
    this.drag = { id: event.pointerId, x: event.clientX, moved: false };
  }

  protected onPointerMove(event: PointerEvent): void {
    const d = this.drag;
    if (!d || d.id !== event.pointerId) return;
    const dx = event.clientX - d.x;
    if (!d.moved && Math.abs(dx) < 6) return;
    if (!d.moved) (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    d.moved = true;
    this.dragOffset.set(dx);
  }

  protected onPointerUp(event: PointerEvent): void {
    const d = this.drag;
    this.drag = null;
    if (!d || d.id !== event.pointerId || !d.moved) return;
    const dx = event.clientX - d.x;
    const threshold = Math.min(80, this.host.nativeElement.clientWidth / (this.visible() * 4));
    this.dragOffset.set(0);
    if (dx < -threshold) this.next();
    else if (dx > threshold) this.prev();
  }
}
