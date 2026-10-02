import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HU_CARD_IMPORTS, HuBadge, HuButton, HuColumn, HuIcon, HuTable } from '@ucme-ui/angular';
import { demoImage } from '../demo-images';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

interface Row {
  kod: string;
  ad: string;
}

@Component({
  selector: 'app-card-doc',
  imports: [DocPage, DocExample, HU_CARD_IMPORTS, HuBadge, HuButton, HuIcon, HuTable],
  template: `
    <app-doc-page slug="card">
      <app-doc-example title="Başlık ve alt başlık" [code]="basicCode">
        <hu-card title="Duyuru" subtitle="2 saat önce" class="demo-card">
          Bahar dönemi akademik takvimi yayınlandı.
        </hu-card>
      </app-doc-example>

      <app-doc-example title="Aksiyon ve alt bilgi" [code]="slotsCode">
        <hu-card title="Başvuru" subtitle="BİL 203 — Veri Yapıları" class="demo-card">
          <hu-badge huCardActions variant="warning" dot>Beklemede</hu-badge>
          Danışman onayı bekleniyor.
          <div huCardFooter>
            <button hu-button size="sm">Onayla</button>
            <button hu-button size="sm" variant="ghost">Reddet</button>
          </div>
        </hu-card>
      </app-doc-example>

      <app-doc-example title="Kenara dayalı içerik" description="padding=&quot;none&quot; tablo gibi içerikler için." [code]="tableCode">
        <hu-card title="Dersler" padding="none">
          <button huCardActions hu-button variant="ghost" size="sm">Tümü <hu-icon name="chevron-right" [size]="14" /></button>
          <hu-table [data]="rows" [columns]="columns" dense />
        </hu-card>
      </app-doc-example>
      <app-doc-example
        title="Kapak görseli"
        description="huCardMedia içeriği kartın kenarlarına dayanır; hoverable tıklanabilir kartlarda üzerine gelince öne çıkarır."
        [code]="mediaCode"
      >
        <div class="cards">
          @for (e of events; track e.title) {
            <hu-card [title]="e.title" [subtitle]="e.date" hoverable>
              <img huCardMedia [src]="e.image" alt="" width="600" height="300" />
              {{ e.text }}
              <div huCardFooter>
                <button hu-button size="sm" variant="soft">Ayrıntılar</button>
              </div>
            </hu-card>
          }
        </div>
      </app-doc-example>

      <app-doc-example title="Görünümler" description="variant: outlined (varsayılan), elevated, flat, soft." [code]="variantCode">
        <div class="cards">
          @for (v of variants; track v) {
            <hu-card [variant]="v" [title]="v" padding="sm">variant="{{ v }}"</hu-card>
          }
        </div>
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `
    .demo-card { max-width: 26rem; }
    .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr)); gap: var(--hu-space-4); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardDoc {
  protected readonly variants = ['outlined', 'elevated', 'flat', 'soft'] as const;
  protected readonly events = [
    { title: 'Bahar şenliği', date: '12 Mayıs', text: 'Konserler ve atölyeler üç gün boyunca sürecek.', image: demoImage(7, 600, 300, false) },
    { title: 'Doğa yürüyüşü', date: '18 Mayıs', text: 'Kayıtlar öğrenci topluluğu sayfasından alınıyor.', image: demoImage(2, 600, 300, false) },
    { title: 'Gece gözlemi', date: '24 Mayıs', text: 'Teleskoplarla gökyüzü gözlem etkinliği.', image: demoImage(6, 600, 300, false) },
  ];

  protected readonly rows: Row[] = [
    { kod: 'BİL 101', ad: 'Programlamaya Giriş' },
    { kod: 'MAT 123', ad: 'Analiz I' },
  ];
  protected readonly columns: HuColumn<Row>[] = [
    { key: 'kod', header: 'Kod', width: '120px' },
    { key: 'ad', header: 'Ders' },
  ];

  protected readonly basicCode = `
<hu-card title="Duyuru" subtitle="2 saat önce">
  Bahar dönemi akademik takvimi yayınlandı.
</hu-card>`;

  protected readonly slotsCode = `
<hu-card title="Başvuru" subtitle="BİL 203 — Veri Yapıları">
  <hu-badge huCardActions variant="warning" dot>Beklemede</hu-badge>
  Danışman onayı bekleniyor.
  <div huCardFooter>
    <button hu-button size="sm">Onayla</button>
  </div>
</hu-card>`;

  protected readonly tableCode = `
<hu-card title="Dersler" padding="none">
  <a huCardActions hu-button variant="ghost" size="sm" routerLink="/dersler">Tümü</a>
  <hu-table [data]="rows" [columns]="columns" dense />
</hu-card>`;

  protected readonly mediaCode = `
<hu-card title="Bahar şenliği" subtitle="12 Mayıs" hoverable>
  <img huCardMedia src="https://picsum.photos/id/1015/600/300" alt="" width="600" height="300" />
  Konserler ve atölyeler üç gün boyunca sürecek.
  <div huCardFooter>
    <button hu-button size="sm" variant="soft">Ayrıntılar</button>
  </div>
</hu-card>`;

  protected readonly variantCode = `
<hu-card variant="elevated" title="Gölgeli">…</hu-card>
<hu-card variant="flat" title="Yalnız çerçeve">…</hu-card>
<hu-card variant="soft" title="Dolgulu">…</hu-card>`;
}
