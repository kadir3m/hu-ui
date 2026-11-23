import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HuGallery, HuLightbox, HuButton } from '@ucme-ui/angular';
import { demoImages } from '../demo-images';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

@Component({
  selector: 'app-gallery-doc',
  imports: [DocPage, DocExample, HuGallery, HuLightbox, HuButton],
  template: `
    <app-doc-page slug="gallery">
      <app-doc-example
        title="Ana görsel ve küçük resimler"
        description="Küçük resim şeridinde ←/→ ile gezilir. Tam ekran düğmesi lightbox'ı açar: yakınlaştırma (düğmeler, +/− tuşları, fare tekerleği), yakınken sürükleyerek kaydırma, döndürme, Esc ile kapatma."
        [code]="inlineCode"
      >
        <hu-gallery [images]="images" [(activeIndex)]="active" ariaLabel="Manzara galerisi" />
        <p class="demo-label">Seçili: {{ active() + 1 }} / {{ images.length }}</p>
      </app-doc-example>

      <app-doc-example title="Izgara" description="mode=&quot;grid&quot; döşemeler genişliğe göre dizilir; tıklayınca lightbox açılır." [code]="gridCode">
        <hu-gallery [images]="images" mode="grid" minColumnWidth="9rem" />
      </app-doc-example>

      <app-doc-example
        title="Yalnızca lightbox"
        description="Kendi düzeninizde hu-lightbox'ı doğrudan kullanabilirsiniz: [(open)] ve [(index)] ile kontrol edilir."
        [code]="lightboxCode"
      >
        <div class="row">
          <button hu-button variant="outline" (click)="lightboxIndex.set(0); lightboxOpen.set(true)">Fotoğrafları göster ({{ images.length }})</button>
        </div>
        <hu-lightbox [images]="images" [(open)]="lightboxOpen" [(index)]="lightboxIndex" />
      </app-doc-example>
    </app-doc-page>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryDoc {
  protected readonly images = demoImages();
  protected readonly active = signal(0);
  protected readonly lightboxOpen = signal(false);
  protected readonly lightboxIndex = signal(0);

  protected readonly inlineCode = `
images: HuMediaImage[] = [
  { src: 'https://picsum.photos/id/1018/1200/800', thumbnail: 'https://picsum.photos/id/1018/240/160', alt: 'Dağlar', caption: 'Dağlar' },
  { src: 'https://picsum.photos/id/1015/1200/800', thumbnail: 'https://picsum.photos/id/1015/240/160', alt: 'Nehir', caption: 'Nehir', description: 'Vadiden geçen nehir.' },
  { src: 'https://picsum.photos/id/1016/1200/800', thumbnail: 'https://picsum.photos/id/1016/240/160', alt: 'Kanyon', caption: 'Kanyon' },
];
active = signal(0);

<hu-gallery [images]="images" [(activeIndex)]="active" ariaLabel="Manzara galerisi" />`;

  protected readonly gridCode = `
images: HuMediaImage[] = [
  { src: 'https://picsum.photos/id/1018/1200/800', thumbnail: 'https://picsum.photos/id/1018/240/160', alt: 'Dağlar' },
  { src: 'https://picsum.photos/id/1015/1200/800', thumbnail: 'https://picsum.photos/id/1015/240/160', alt: 'Nehir' },
];

<hu-gallery [images]="images" mode="grid" minColumnWidth="9rem" />`;

  protected readonly lightboxCode = `
images: HuMediaImage[] = [
  { src: 'https://picsum.photos/id/1018/1200/800', alt: 'Dağlar', caption: 'Dağlar' },
  { src: 'https://picsum.photos/id/1015/1200/800', alt: 'Nehir', caption: 'Nehir' },
];
open = signal(false);
index = signal(0);

<button hu-button variant="outline" (click)="index.set(0); open.set(true)">Fotoğrafları göster</button>
<hu-lightbox [images]="images" [(open)]="open" [(index)]="index" />`;
}
