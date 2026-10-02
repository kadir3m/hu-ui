import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input, signal } from '@angular/core';
import { HuIcon } from '../icon/icon.component';
import { HuLightbox } from './lightbox.component';

/**
 * Görsel: yüklenirken iskelet, hata olursa yedek görsel veya ikon, `preview` ile
 * tıklayınca tam ekran (yakınlaştırma, döndürme). Varsayılan olarak tembel yüklenir.
 *
 * @example
 * <hu-image src="/foto.jpg" alt="Bina girişi" width="320" height="200" preview />
 */
@Component({
  selector: 'hu-image',
  imports: [NgTemplateOutlet, HuIcon, HuLightbox],
  template: `
    @if (preview() && !failed()) {
      <button type="button" class="hu-image__frame hu-image__trigger" [style.aspect-ratio]="ratio()" [attr.aria-label]="(alt() || 'Görsel') + ' — büyüt'" (click)="open.set(true)">
        <ng-container *ngTemplateOutlet="img" />
        <span class="hu-image__overlay" aria-hidden="true"><hu-icon name="zoom-in" [size]="22" /></span>
      </button>
    } @else {
      <span class="hu-image__frame" [style.aspect-ratio]="ratio()">
        <ng-container *ngTemplateOutlet="img" />
      </span>
    }

    @if (caption()) {
      <span class="hu-image__caption">{{ caption() }}</span>
    }

    <ng-template #img>
      @if (!failed() || fallback()) {
        <img
          class="hu-image__img"
          [src]="failed() ? fallback() : src()"
          [alt]="alt()"
          [attr.width]="width() ?? null"
          [attr.height]="height() ?? null"
          [attr.loading]="lazy() ? 'lazy' : null"
          [attr.decoding]="'async'"
          [style.object-fit]="fit()"
          [class.hu-image__img--loading]="!loaded()"
          (load)="loaded.set(true)"
          (error)="onError()"
        />
      } @else {
        <span class="hu-image__broken" role="img" [attr.aria-label]="alt() || 'Görsel yüklenemedi'">
          <hu-icon name="image" [size]="28" />
          <span>Görsel yüklenemedi</span>
        </span>
      }
    </ng-template>

    @if (preview()) {
      <hu-lightbox [images]="images()" [(open)]="open" [loop]="false" />
    }
  `,
  styleUrl: './image.component.scss',
  host: {
    class: 'hu-image',
    '[class.hu-image--loaded]': 'loaded()',
    '[class.hu-image--rounded]': 'rounded()',
    '[style.width]': "width() ? width() + 'px' : null",
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuImage {
  readonly src = input.required<string>();
  readonly alt = input('');
  /** Tam ekran görüntüleyicide açılacak büyük görsel (verilmezse `src`). */
  readonly previewSrc = input<string>();
  /** Görselin altında (ve önizlemede) gösterilen alt yazı. */
  readonly caption = input<string>();
  /** Tıklayınca tam ekran görüntüleyici. */
  readonly preview = input(false, { transform: booleanAttribute });
  readonly width = input<number | string>();
  readonly height = input<number | string>();
  readonly fit = input<'cover' | 'contain'>('cover');
  readonly rounded = input(true, { transform: booleanAttribute });
  readonly lazy = input(true, { transform: booleanAttribute });
  /** Yüklenemezse gösterilecek görsel. Verilmezse ikon ve metin. */
  readonly fallback = input<string>();

  protected readonly ratio = computed(() => (this.width() && this.height() ? `${this.width()} / ${this.height()}` : null));
  protected readonly open = signal(false);
  protected readonly loaded = signal(false);
  protected readonly failed = signal(false);
  protected readonly images = computed(() => [
    { src: this.previewSrc() ?? this.src(), alt: this.alt(), caption: this.caption() },
  ]);

  protected onError(): void {
    if (this.failed()) return; // yedek de yüklenemedi
    this.failed.set(true);
    this.loaded.set(!!this.fallback());
  }
}
