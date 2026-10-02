import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HU_CARD_IMPORTS, HuBadge, HuButton, HuColumn, HuIcon, HuTable } from '@ucme-ui/angular';
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
    </app-doc-page>
  `,
  styles: `.demo-card { max-width: 26rem; }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardDoc {
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
}
