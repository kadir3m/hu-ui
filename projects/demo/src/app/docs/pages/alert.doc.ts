import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HuAlert } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

@Component({
  selector: 'app-alert-doc',
  imports: [DocPage, DocExample, HuAlert],
  template: `
    <app-doc-page slug="alert">
      <app-doc-example title="Türler" [code]="variantsCode">
        <div class="stack">
          <hu-alert variant="info" title="Bilgi">Yeni dönem ders programı yayınlandı.</hu-alert>
          <hu-alert variant="success">Başvurunuz başarıyla alındı.</hu-alert>
          <hu-alert variant="warning" title="Dikkat">Oturumunuz 5 dakika içinde sona erecek.</hu-alert>
          <hu-alert variant="danger" title="Hata">Sunucuya ulaşılamadı. Lütfen daha sonra tekrar deneyin.</hu-alert>
        </div>
      </app-doc-example>
      <app-doc-example title="Kapatılabilir" [code]="dismissCode">
        <hu-alert variant="info" dismissible>Bu mesajı kapatabilirsiniz.</hu-alert>
      </app-doc-example>
    </app-doc-page>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertDoc {
  protected readonly variantsCode = `
<hu-alert variant="info" title="Bilgi">Yeni dönem ders programı yayınlandı.</hu-alert>
<hu-alert variant="success">Başvurunuz başarıyla alındı.</hu-alert>
<hu-alert variant="warning" title="Dikkat">…</hu-alert>
<hu-alert variant="danger" title="Hata">…</hu-alert>`;
  protected readonly dismissCode = `<hu-alert variant="info" dismissible (closed)="onClose()">…</hu-alert>`;
}
