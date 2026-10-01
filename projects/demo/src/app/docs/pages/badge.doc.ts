import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HuBadge } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

@Component({
  selector: 'app-badge-doc',
  imports: [DocPage, DocExample, HuBadge],
  template: `
    <app-doc-page slug="badge">
      <app-doc-example title="Renkler" [code]="basicCode">
        <div class="row">
          <hu-badge>Nötr</hu-badge>
          <hu-badge variant="primary">Birincil</hu-badge>
          <hu-badge variant="info">Bilgi</hu-badge>
          <hu-badge variant="success">Başarılı</hu-badge>
          <hu-badge variant="warning">Uyarı</hu-badge>
          <hu-badge variant="danger">Tehlikeli</hu-badge>
        </div>
      </app-doc-example>
      <app-doc-example title="Noktalı" description="Tablo durum sütunları için." [code]="dotCode">
        <div class="row">
          <hu-badge variant="success" dot>Aktif</hu-badge>
          <hu-badge variant="warning" dot>Beklemede</hu-badge>
          <hu-badge variant="neutral" dot>Pasif</hu-badge>
          <hu-badge variant="danger" dot>Reddedildi</hu-badge>
        </div>
      </app-doc-example>
    </app-doc-page>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeDoc {
  protected readonly basicCode = `
<hu-badge>Nötr</hu-badge>
<hu-badge variant="primary">Birincil</hu-badge>
<hu-badge variant="success">Başarılı</hu-badge>`;
  protected readonly dotCode = `<hu-badge variant="success" dot>Aktif</hu-badge>`;
}
