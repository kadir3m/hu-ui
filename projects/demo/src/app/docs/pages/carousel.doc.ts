import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HU_CARD_IMPORTS, HU_CAROUSEL_IMPORTS, HuBadge, HuButton, HuCarouselBreakpoint, HuRating } from '@ucme-ui/angular';
import { demoImage, demoImages } from '../demo-images';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

interface Product {
  name: string;
  price: number;
  rating: number;
  image: string;
  stock: 'var' | 'az' | 'yok';
}

@Component({
  selector: 'app-carousel-doc',
  imports: [DocPage, DocExample, HU_CAROUSEL_IMPORTS, HU_CARD_IMPORTS, HuBadge, HuButton, HuRating],
  template: `
    <app-doc-page slug="carousel">
      <app-doc-example
        title="Afiş, otomatik geçiş"
        description="autoplay milisaniye cinsinden; üzerine gelince, odaklanınca veya durdur düğmesiyle durur. ←/→ tuşları ve kaydırma hareketi çalışır."
        [code]="bannerCode"
      >
        <hu-carousel [items]="slides" [autoplay]="4000" [(page)]="page" ariaLabel="Duyurular">
          <ng-template huCarouselItem [huCarouselItemOf]="slides" let-s>
            <div class="banner">
              <img [src]="s.src" [alt]="s.alt" />
              <div class="banner__text">
                <strong>{{ s.caption }}</strong>
                <span>{{ s.description }}</span>
              </div>
            </div>
          </ng-template>
        </hu-carousel>
        <p class="demo-label">Sayfa: {{ page() + 1 }}</p>
      </app-doc-example>

      <app-doc-example
        title="Çoklu öğe ve kırılım noktaları"
        description="breakpoints carousel'in kendi genişliğine göre çalışır (ekran değil): dar alanda 1, orta 2, geniş 3 kart."
        [code]="productCode"
      >
        <hu-carousel [items]="products" [numVisible]="3" [breakpoints]="breakpoints" [circular]="false" ariaLabel="Ürünler">
          <ng-template huCarouselItem [huCarouselItemOf]="products" let-p>
            <hu-card class="product" padding="sm">
              <img huCardMedia [src]="p.image" alt="" width="400" height="240" />
              <div class="product__body">
                <strong>{{ p.name }}</strong>
                <hu-rating [value]="p.rating" readonly size="sm" />
                <div class="product__foot">
                  <span class="product__price">{{ p.price.toLocaleString('tr-TR') }} ₺</span>
                  @switch (p.stock) {
                    @case ('az') {
                      <hu-badge variant="warning">Son ürünler</hu-badge>
                    }
                    @case ('yok') {
                      <hu-badge variant="neutral">Tükendi</hu-badge>
                    }
                  }
                </div>
                <button hu-button size="sm" block [disabled]="p.stock === 'yok'">Sepete ekle</button>
              </div>
            </hu-card>
          </ng-template>
        </hu-carousel>
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `
    .banner { position: relative; aspect-ratio: 21 / 9; overflow: hidden; border-radius: var(--hu-radius-lg); }
    .banner img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .banner__text {
      position: absolute; inset: auto 0 0 0; display: flex; flex-direction: column; gap: 2px;
      padding: var(--hu-space-6) var(--hu-space-5) var(--hu-space-4); color: #fff;
      background: linear-gradient(transparent, rgb(0 0 0 / 0.6));
    }
    .banner__text strong { font-size: var(--hu-text-lg); }
    .product { margin: 0 var(--hu-space-2); height: 100%; }
    .product__body { display: flex; flex-direction: column; gap: var(--hu-space-2); }
    .product__foot { display: flex; align-items: center; justify-content: space-between; }
    .product__price { font-weight: 600; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselDoc {
  protected readonly slides = demoImages(5);
  protected readonly page = signal(0);
  protected readonly breakpoints: HuCarouselBreakpoint[] = [
    { minWidth: 0, numVisible: 1 },
    { minWidth: 520, numVisible: 2 },
    { minWidth: 820, numVisible: 3 },
  ];
  protected readonly products: Product[] = [
    { name: 'Defter seti', price: 189, rating: 4.5, stock: 'var' },
    { name: 'Termos', price: 459, rating: 4.8, stock: 'az' },
    { name: 'Sırt çantası', price: 1290, rating: 4.2, stock: 'var' },
    { name: 'Kupa', price: 149, rating: 3.9, stock: 'yok' },
    { name: 'Kalem kutusu', price: 99, rating: 4.1, stock: 'var' },
    { name: 'Şemsiye', price: 349, rating: 4.4, stock: 'var' },
  ].map((p, i) => ({ ...p, stock: p.stock as Product['stock'], image: demoImage(i + 1, 400, 240, false) }));

  protected readonly bannerCode = `
slides = [
  { src: 'https://picsum.photos/id/1018/1200/514', alt: 'Dağ manzarası', caption: 'Bahar dönemi başlıyor', description: 'Ders kayıtları 10 Şubat’ta açılıyor.' },
  { src: 'https://picsum.photos/id/1015/1200/514', alt: 'Nehir', caption: 'Kütüphane 7/24 açık', description: 'Sınav haftası boyunca kesintisiz hizmet.' },
];
page = signal(0);

<hu-carousel [items]="slides" [autoplay]="4000" [(page)]="page" ariaLabel="Duyurular">
  <ng-template huCarouselItem [huCarouselItemOf]="slides" let-s>
    <img [src]="s.src" [alt]="s.alt" />
    <strong>{{ s.caption }}</strong>
    <span>{{ s.description }}</span>
  </ng-template>
</hu-carousel>`;

  protected readonly productCode = `
products = [
  { name: 'Defter seti', price: 189, image: 'https://picsum.photos/id/24/400/240' },
  { name: 'Termos', price: 459, image: 'https://picsum.photos/id/30/400/240' },
  { name: 'Sırt çantası', price: 1290, image: 'https://picsum.photos/id/21/400/240' },
  { name: 'Kupa', price: 149, image: 'https://picsum.photos/id/42/400/240' },
];
breakpoints: HuCarouselBreakpoint[] = [
  { minWidth: 0, numVisible: 1 },
  { minWidth: 520, numVisible: 2 },
  { minWidth: 820, numVisible: 3 },
];

<hu-carousel [items]="products" [numVisible]="3" [breakpoints]="breakpoints" [circular]="false">
  <ng-template huCarouselItem [huCarouselItemOf]="products" let-p>
    <hu-card padding="sm">
      <img huCardMedia [src]="p.image" alt="" width="400" height="240" />
      <strong>{{ p.name }}</strong> {{ p.price }} ₺
    </hu-card>
  </ng-template>
</hu-carousel>`;
}
