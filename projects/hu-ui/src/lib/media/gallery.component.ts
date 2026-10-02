import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
  untracked,
} from '@angular/core';
import { HuIcon } from '../icon/icon.component';
import { HuLightbox } from './lightbox.component';
import { HuMediaImage } from './media.types';

/**
 * Görsel galerisi.
 * - `inline`: büyük görsel + ileri/geri + küçük görsel şeridi; tam ekran butonu.
 * - `grid`: küçük görsel ızgarası; tıklayınca tam ekran görüntüleyici.
 *
 * @example
 * <hu-gallery [images]="photos" />
 * <hu-gallery [images]="photos" mode="grid" />
 */
@Component({
  selector: 'hu-gallery',
  imports: [HuIcon, HuLightbox],
  template: `
    @if (mode() === 'inline') {
      <div class="hu-gallery__main" role="region" aria-roledescription="galeri" [attr.aria-label]="ariaLabel()" (keydown)="onKeydown($event)">
        @if (current(); as img) {
          <img class="hu-gallery__img" [src]="img.src" [alt]="img.alt" />
          @if (img.caption || img.description) {
            <div class="hu-gallery__caption">
              @if (img.caption) {
                <strong>{{ img.caption }}</strong>
              }
              @if (img.description) {
                <span>{{ img.description }}</span>
              }
            </div>
          }
        }
        @if (images().length > 1) {
          <button type="button" class="hu-gallery__nav hu-gallery__nav--prev" aria-label="Önceki görsel" (click)="go(-1)">
            <hu-icon name="chevron-left" [size]="22" />
          </button>
          <button type="button" class="hu-gallery__nav hu-gallery__nav--next" aria-label="Sonraki görsel" (click)="go(1)">
            <hu-icon name="chevron-right" [size]="22" />
          </button>
          <span class="hu-gallery__count" aria-live="polite">{{ safeIndex() + 1 }} / {{ images().length }}</span>
        }
        @if (fullscreen()) {
          <button type="button" class="hu-gallery__full" aria-label="Tam ekran" title="Tam ekran" (click)="viewer.set(true)">
            <hu-icon name="maximize" [size]="18" />
          </button>
        }
      </div>

      @if (showThumbnails() && images().length > 1) {
        <div class="hu-gallery__thumbs" role="tablist" aria-label="Küçük görseller">
          @for (img of images(); track $index; let i = $index) {
            <button
              type="button"
              role="tab"
              class="hu-gallery__thumb"
              [attr.aria-selected]="i === safeIndex()"
              [attr.aria-label]="img.alt || 'Görsel ' + (i + 1)"
              [tabIndex]="i === safeIndex() ? 0 : -1"
              (click)="activeIndex.set(i)"
              (keydown)="onThumbKeydown($event, i)"
            >
              <img [src]="img.thumbnail ?? img.src" alt="" loading="lazy" />
            </button>
          }
        </div>
      }
    } @else {
      <ul class="hu-gallery__grid" [style.--hu-gallery-min]="minColumnWidth()" [attr.aria-label]="ariaLabel()">
        @for (img of images(); track $index; let i = $index) {
          <li>
            <button type="button" class="hu-gallery__tile" [attr.aria-label]="(img.alt || 'Görsel ' + (i + 1)) + ' — büyüt'" (click)="openAt(i)">
              <img [src]="img.thumbnail ?? img.src" [alt]="img.alt" loading="lazy" />
              @if (img.caption) {
                <span class="hu-gallery__tile-caption">{{ img.caption }}</span>
              }
            </button>
          </li>
        }
      </ul>
    }

    <hu-lightbox [images]="images()" [(index)]="activeIndex" [(open)]="viewer" />
  `,
  styleUrl: './gallery.component.scss',
  host: { class: 'hu-gallery', '[attr.data-mode]': 'mode()' },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuGallery {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  readonly images = input<readonly HuMediaImage[]>([]);
  readonly mode = input<'inline' | 'grid'>('inline');
  readonly activeIndex = model(0);
  readonly showThumbnails = input(true, { transform: booleanAttribute });
  /** Tam ekran butonu (inline). */
  readonly fullscreen = input(true, { transform: booleanAttribute });
  /** Izgarada en küçük kutu genişliği. */
  readonly minColumnWidth = input('10rem');
  readonly ariaLabel = input('Galeri');

  protected readonly viewer = signal(false);
  protected readonly safeIndex = computed(() => Math.max(0, Math.min(this.activeIndex(), this.images().length - 1)));
  protected readonly current = computed<HuMediaImage | undefined>(() => this.images()[this.safeIndex()]);

  constructor() {
    // Aktif küçük görsel şeritte ortalansın (yalnızca şerit kayar, sayfa değil)
    effect(() => {
      const i = this.safeIndex();
      untracked(() =>
        afterNextRender(
          () => {
            const strip = this.host.nativeElement.querySelector<HTMLElement>('.hu-gallery__thumbs');
            const thumb = strip?.querySelectorAll<HTMLElement>('.hu-gallery__thumb')[i];
            if (strip && thumb) strip.scrollTo({ left: thumb.offsetLeft - (strip.clientWidth - thumb.offsetWidth) / 2, behavior: 'smooth' });
          },
          { injector: this.injector },
        ),
      );
    });
  }

  go(step: number): void {
    const count = this.images().length;
    if (count > 1) this.activeIndex.set((this.safeIndex() + step + count) % count);
  }

  protected openAt(i: number): void {
    this.activeIndex.set(i);
    this.viewer.set(true);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') this.go(-1);
    else if (event.key === 'ArrowRight') this.go(1);
  }

  /** Küçük görsel şeridinde sekme gibi gezinme. */
  protected onThumbKeydown(event: KeyboardEvent, i: number): void {
    const count = this.images().length;
    let next = -1;
    if (event.key === 'ArrowRight') next = (i + 1) % count;
    else if (event.key === 'ArrowLeft') next = (i - 1 + count) % count;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = count - 1;
    if (next < 0) return;
    event.preventDefault();
    this.activeIndex.set(next);
    afterNextRender(() => this.host.nativeElement.querySelectorAll<HTMLElement>('.hu-gallery__thumb')[next]?.focus(), { injector: this.injector });
  }
}
