import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HU_TABS_IMPORTS } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

@Component({
  selector: 'app-tabs-doc',
  imports: [DocPage, DocExample, HU_TABS_IMPORTS],
  template: `
    <app-doc-page slug="tabs">
      <app-doc-example title="Çizgili (line)" description="Ok tuşları ve Home/End ile gezilir; devre dışı sekme atlanır." [code]="lineCode">
        <hu-tabs [(selectedIndex)]="tab">
          <hu-tab label="Genel" icon="info">Genel bilgiler sekmesi içeriği.</hu-tab>
          <hu-tab label="Dersler" icon="book-open">Ders listesi sekmesi içeriği.</hu-tab>
          <hu-tab label="Takvim" icon="calendar">Takvim sekmesi içeriği.</hu-tab>
          <hu-tab label="Arşiv" disabled>Arşiv</hu-tab>
        </hu-tabs>
        <p class="demo-label">selectedIndex: {{ tab() }}</p>
      </app-doc-example>

      <app-doc-example title="Kapsül (pills)" [code]="pillsCode">
        <hu-tabs variant="pills">
          <hu-tab label="Günlük">Günlük görünüm</hu-tab>
          <hu-tab label="Haftalık">Haftalık görünüm</hu-tab>
          <hu-tab label="Aylık">Aylık görünüm</hu-tab>
        </hu-tabs>
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `.demo-label { margin-top: var(--hu-space-3); }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsDoc {
  protected readonly tab = signal(0);

  protected readonly lineCode = `
<hu-tabs [(selectedIndex)]="tab">
  <hu-tab label="Genel" icon="info">…</hu-tab>
  <hu-tab label="Dersler" icon="book-open">…</hu-tab>
  <hu-tab label="Arşiv" disabled>…</hu-tab>
</hu-tabs>`;

  protected readonly pillsCode = `
<hu-tabs variant="pills">
  <hu-tab label="Günlük">…</hu-tab>
  <hu-tab label="Haftalık">…</hu-tab>
</hu-tabs>`;
}
