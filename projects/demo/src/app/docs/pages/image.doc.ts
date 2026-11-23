import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HuImage } from '@ucme-ui/angular';
import { demoImage } from '../demo-images';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

@Component({
  selector: 'app-image-doc',
  imports: [DocPage, DocExample, HuImage],
  template: `
    <app-doc-page slug="image">
      <app-doc-example
        title="Önizlemeli"
        description="preview ile görselin üstüne gelince büyüteç çıkar; tıklayınca yakınlaştırılabilir lightbox açılır. previewSrc ile önizlemede daha büyük bir dosya gösterilebilir."
        [code]="previewCode"
      >
        <div class="row">
          <hu-image [src]="small" [previewSrc]="large" alt="Göl kıyısı manzarası" caption="Göl kıyısı" [width]="320" [height]="213" preview />
          <hu-image [src]="small2" [previewSrc]="large2" alt="Orman manzarası" caption="Orman" [width]="320" [height]="213" preview />
        </div>
      </app-doc-example>

      <app-doc-example
        title="Yükleniyor ve hata durumu"
        description="Görsel yüklenene kadar iskelet animasyonu görünür; yüklenemezse fallback görseli, o da yoksa yer tutucu gösterilir. lazy (varsayılan açık) ekrana gelince yükler."
        [code]="stateCode"
      >
        <div class="row">
          <hu-image [src]="broken" alt="Yüklenemeyen görsel" [width]="200" [height]="140" caption="Yer tutucu" />
          <hu-image [src]="broken" [fallback]="fallback" alt="Yedek görsel" [width]="200" [height]="140" caption="fallback" />
        </div>
      </app-doc-example>

      <app-doc-example title="Sığdırma ve köşeler" description="fit: cover (kırp) veya contain (tamamını göster); rounded=false keskin köşe." [code]="fitCode">
        <div class="row">
          <hu-image [src]="wide" alt="Geniş görsel, kırpılmış" [width]="160" [height]="160" fit="cover" caption="cover" />
          <hu-image [src]="wide" alt="Geniş görsel, tamamı" [width]="160" [height]="160" fit="contain" caption="contain" class="contain" />
          <hu-image [src]="wide" alt="Keskin köşeli görsel" [width]="160" [height]="160" [rounded]="false" caption="rounded=false" />
        </div>
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `.contain img { background: var(--hu-surface-2); }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageDoc {
  protected readonly small = demoImage(1, 480, 320);
  protected readonly large = demoImage(1, 1800, 1200);
  protected readonly small2 = demoImage(2, 480, 320);
  protected readonly large2 = demoImage(2, 1800, 1200);
  protected readonly fallback = demoImage(4, 400, 280, false);
  protected readonly wide = demoImage(3, 900, 300);
  /** Ağ isteği yapmadan bozuk görsel. */
  protected readonly broken = 'data:image/png;base64,AAAA';

  protected readonly previewCode = `
<hu-image src="https://picsum.photos/id/1015/480/320" previewSrc="https://picsum.photos/id/1015/1800/1200"
          alt="Göl kıyısı manzarası" caption="Göl kıyısı" [width]="320" [height]="213" preview />`;

  protected readonly stateCode = `
<hu-image src="/olmayan-gorsel.jpg" alt="Yüklenemeyen görsel" [width]="200" [height]="140" />
<hu-image src="/olmayan-gorsel.jpg" fallback="/assets/varsayilan.png" alt="Yedek görsel" [width]="200" [height]="140" />`;

  protected readonly fitCode = `
<hu-image src="https://picsum.photos/id/1016/900/300" alt="Kırpılmış" [width]="160" [height]="160" fit="cover" />
<hu-image src="https://picsum.photos/id/1016/900/300" alt="Tamamı" [width]="160" [height]="160" fit="contain" />
<hu-image src="https://picsum.photos/id/1016/900/300" alt="Keskin köşe" [width]="160" [height]="160" [rounded]="false" />`;
}
