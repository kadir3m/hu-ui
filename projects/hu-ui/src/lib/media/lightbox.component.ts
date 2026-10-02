import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  input,
  model,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { HuIcon } from '../icon/icon.component';
import { huUniqueId } from '../core/unique-id';
import { HuMediaImage } from './media.types';

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

/**
 * Tam ekran görsel görüntüleyici: yakınlaştırma (butonlar, +/−, tekerlek), sürükleyerek
 * kaydırma, döndürme, ileri/geri (oklar, ←/→, kaydırma hareketi) ve açıklama. Native
 * `<dialog>` kullanır: odak hapsi ve Esc tarayıcıdan gelir. `hu-image` ve `hu-gallery`
 * kendisi açar; doğrudan da kullanılabilir.
 *
 * @example <hu-lightbox [images]="photos" [(index)]="current" [(open)]="viewerOpen" />
 */
@Component({
  selector: 'hu-lightbox',
  imports: [HuIcon],
  template: `
    <dialog
      #dialog
      class="hu-lightbox"
      [attr.aria-labelledby]="titleId"
      (close)="open.set(false)"
      (keydown)="onKeydown($event)"
      (click)="onBackdrop($event)"
    >
      <h2 class="hu-sr-only" [id]="titleId">{{ current()?.alt || 'Görsel' }}</h2>
      <div class="hu-lightbox__bar">
        @if (images().length > 1) {
          <span class="hu-lightbox__count" aria-live="polite">{{ safeIndex() + 1 }} / {{ images().length }}</span>
        }
        <span class="hu-lightbox__spacer"></span>
        <button type="button" class="hu-lightbox__btn" aria-label="Uzaklaştır" title="Uzaklaştır (−)" [disabled]="zoom() <= 1" (click)="zoomBy(-0.5)">
          <hu-icon name="zoom-out" [size]="20" />
        </button>
        <span class="hu-lightbox__zoom" aria-live="polite">%{{ (zoom() * 100).toFixed(0) }}</span>
        <button type="button" class="hu-lightbox__btn" aria-label="Yakınlaştır" title="Yakınlaştır (+)" [disabled]="zoom() >= maxZoom" (click)="zoomBy(0.5)">
          <hu-icon name="zoom-in" [size]="20" />
        </button>
        @if (rotatable()) {
          <button type="button" class="hu-lightbox__btn" aria-label="Sola döndür" title="Sola döndür" (click)="rotate(-90)">
            <hu-icon name="rotate-ccw" [size]="20" />
          </button>
          <button type="button" class="hu-lightbox__btn" aria-label="Sağa döndür" title="Sağa döndür" (click)="rotate(90)">
            <hu-icon name="rotate-cw" [size]="20" />
          </button>
        }
        <button type="button" class="hu-lightbox__btn" aria-label="Kapat" title="Kapat (Esc)" (click)="close()">
          <hu-icon name="x" [size]="22" />
        </button>
      </div>

      <div
        class="hu-lightbox__stage"
        [class.hu-lightbox__stage--zoomed]="zoom() > 1"
        (wheel)="onWheel($event)"
        (pointerdown)="onPointerDown($event)"
        (pointermove)="onPointerMove($event)"
        (pointerup)="onPointerUp($event)"
        (pointercancel)="onPointerUp($event)"
        (dblclick)="zoom() > 1 ? reset() : zoomBy(1)"
      >
        @if (current(); as img) {
          <img
            class="hu-lightbox__img"
            draggable="false"
            [src]="img.src"
            [alt]="img.alt"
            [style.transform]="transform()"
            (load)="loaded.set(true)"
          />
        }
      </div>

      @if (images().length > 1) {
        <button type="button" class="hu-lightbox__nav hu-lightbox__nav--prev" aria-label="Önceki görsel" [disabled]="!loop() && safeIndex() === 0" (click)="go(-1)">
          <hu-icon name="chevron-left" [size]="28" />
        </button>
        <button type="button" class="hu-lightbox__nav hu-lightbox__nav--next" aria-label="Sonraki görsel" [disabled]="!loop() && safeIndex() === images().length - 1" (click)="go(1)">
          <hu-icon name="chevron-right" [size]="28" />
        </button>
      }

      @if (current()?.caption || current()?.description) {
        <div class="hu-lightbox__caption">
          @if (current()!.caption) {
            <strong>{{ current()!.caption }}</strong>
          }
          @if (current()!.description) {
            <span>{{ current()!.description }}</span>
          }
        </div>
      }
    </dialog>
  `,
  styleUrl: './lightbox.component.scss',
  host: { class: 'hu-lightbox-host' },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuLightbox {
  readonly images = input<readonly HuMediaImage[]>([]);
  readonly index = model(0);
  readonly open = model(false);
  /** Son görselden ilkine dön. */
  readonly loop = input(true, { transform: booleanAttribute });
  readonly rotatable = input(true, { transform: booleanAttribute });

  protected readonly titleId = huUniqueId('hu-lightbox');
  protected readonly maxZoom = MAX_ZOOM;
  protected readonly zoom = signal(1);
  protected readonly rotation = signal(0);
  protected readonly pan = signal({ x: 0, y: 0 });
  protected readonly loaded = signal(false);
  private drag: { id: number; x: number; y: number; px: number; py: number; moved: boolean } | null = null;
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private returnFocus: HTMLElement | null = null;

  protected readonly safeIndex = computed(() => Math.max(0, Math.min(this.index(), this.images().length - 1)));
  protected readonly current = computed<HuMediaImage | undefined>(() => this.images()[this.safeIndex()]);
  protected readonly transform = computed(() => {
    const { x, y } = this.pan();
    return `translate(${x}px, ${y}px) scale(${this.zoom()}) rotate(${this.rotation()}deg)`;
  });

  constructor() {
    effect(() => {
      const open = this.open();
      const el = this.dialog().nativeElement;
      untracked(() => {
        if (open && !el.open) {
          this.returnFocus = el.ownerDocument.activeElement as HTMLElement | null;
          this.reset();
          el.showModal();
        } else if (!open && el.open) {
          el.close();
          this.returnFocus?.focus?.();
        }
      });
    });
    // Görsel değişince yakınlaştırmayı sıfırla
    effect(() => {
      this.index();
      untracked(() => this.reset());
    });
  }

  close(): void {
    this.open.set(false);
  }

  /** Önceki (-1) / sonraki (1) görsel. */
  go(step: number): void {
    const count = this.images().length;
    if (count < 2) return;
    let next = this.safeIndex() + step;
    if (this.loop()) next = (next + count) % count;
    else next = Math.max(0, Math.min(count - 1, next));
    this.index.set(next);
  }

  protected zoomBy(delta: number): void {
    const z = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.round((this.zoom() + delta) * 4) / 4));
    this.zoom.set(z);
    if (z === 1) this.pan.set({ x: 0, y: 0 });
  }

  protected rotate(deg: number): void {
    this.rotation.update((r) => r + deg);
  }

  protected reset(): void {
    this.zoom.set(1);
    this.rotation.set(0);
    this.pan.set({ x: 0, y: 0 });
  }

  protected onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        return this.go(-1);
      case 'ArrowRight':
        event.preventDefault();
        return this.go(1);
      case '+':
      case '=':
        event.preventDefault();
        return this.zoomBy(0.5);
      case '-':
        event.preventDefault();
        return this.zoomBy(-0.5);
      case '0':
        return this.reset();
    }
  }

  protected onWheel(event: WheelEvent): void {
    event.preventDefault();
    this.zoomBy(event.deltaY < 0 ? 0.25 : -0.25);
  }

  /** Görsel dışındaki koyu alana tıklayınca kapan. */
  protected onBackdrop(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target === this.dialog().nativeElement) return this.close();
    if (!target.classList.contains('hu-lightbox__stage') || this.zoom() > 1 || this.drag?.moved) return;
    // Görselin kendisine tıklanınca kapanmasın (görsel pointer-events: none)
    const img = target.querySelector('img')?.getBoundingClientRect();
    const inside = img && event.clientX >= img.left && event.clientX <= img.right && event.clientY >= img.top && event.clientY <= img.bottom;
    if (!inside) this.close();
  }

  // --- Sürükleme: yakınken kaydır, normalde sağa/sola çekince görsel değiştir ----------
  protected onPointerDown(event: PointerEvent): void {
    if (event.button !== 0) return;
    const { x, y } = this.pan();
    this.drag = { id: event.pointerId, x: event.clientX, y: event.clientY, px: x, py: y, moved: false };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  protected onPointerMove(event: PointerEvent): void {
    const d = this.drag;
    if (!d || d.id !== event.pointerId) return;
    const dx = event.clientX - d.x;
    const dy = event.clientY - d.y;
    if (Math.hypot(dx, dy) > 5) d.moved = true;
    if (this.zoom() > 1) this.pan.set({ x: d.px + dx, y: d.py + dy });
  }

  protected onPointerUp(event: PointerEvent): void {
    const d = this.drag;
    if (!d || d.id !== event.pointerId) return;
    const dx = event.clientX - d.x;
    if (this.zoom() === 1 && Math.abs(dx) > 60) this.go(dx < 0 ? 1 : -1);
    // click olayı drag bilgisini görsün diye bir tur sonra temizle
    setTimeout(() => (this.drag = null));
  }
}
