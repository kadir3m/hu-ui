import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HU_ORG_CHART_IMPORTS, HuBadge, HuButton, HuIcon, HuOrgChartKey, HuOrgChartNode } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

const COMPANY: HuOrgChartNode = {
  key: 'ceo',
  label: 'Elif Arslan',
  title: 'Genel Müdür',
  avatar: true,
  color: 'primary',
  children: [
    {
      key: 'cto',
      label: 'Burak Şahin',
      title: 'Teknoloji Direktörü',
      avatar: true,
      color: 'info',
      children: [
        { key: 'dev', label: 'Selin Koç', title: 'Yazılım Ekip Lideri', avatar: true },
        { key: 'ops', label: 'Can Öztürk', title: 'Altyapı Sorumlusu', avatar: true },
      ],
    },
    {
      key: 'cfo',
      label: 'Deniz Aydın',
      title: 'Finans Direktörü',
      avatar: true,
      color: 'success',
      children: [{ key: 'acc', label: 'Merve Çelik', title: 'Muhasebe Uzmanı', avatar: true }],
    },
    {
      key: 'coo',
      label: 'Emre Yıldız',
      title: 'Operasyon Direktörü',
      avatar: true,
      color: 'warning',
      children: [
        { key: 'hr', label: 'Gizem Kurt', title: 'İnsan Kaynakları', avatar: true },
        { key: 'sup', label: 'Onur Polat', title: 'Satın Alma', avatar: true },
        { key: 'log', label: 'Ece Aksoy', title: 'Lojistik', avatar: true },
      ],
    },
  ],
};

const FACULTY: HuOrgChartNode<number> = {
  key: 'dekan',
  label: 'Dekanlık',
  icon: 'building',
  data: 3,
  children: [
    {
      key: 'bil',
      label: 'Bilgisayar',
      icon: 'monitor',
      data: 42,
      children: [
        { key: 'bil-yz', label: 'Yapay Zekâ', icon: 'zap', data: 12 },
        { key: 'bil-ag', label: 'Ağlar', icon: 'git-branch', data: 9 },
      ],
    },
    { key: 'ele', label: 'Elektrik', icon: 'zap', data: 35, children: [{ key: 'ele-kt', label: 'Kontrol', icon: 'settings', data: 8 }] },
    { key: 'mak', label: 'Makine', icon: 'settings', data: 38 },
  ],
};

@Component({
  selector: 'app-org-chart-doc',
  imports: [DocPage, DocExample, HU_ORG_CHART_IMPORTS, HuBadge, HuButton, HuIcon],
  template: `
    <app-doc-page slug="org-chart">
      <app-doc-example
        title="Şirket şeması ve seçim"
        description="Kart altındaki düğme alt birimleri katlar / açar (kapalıyken alt öğe sayısını gösterir). selectionMode ile kartlar seçilebilir; geniş şemalar yatay kaydırılır."
        [code]="basicCode"
      >
        <div class="row">
          <button hu-button size="sm" variant="outline" (click)="chart.expandAll()">Tümünü aç</button>
          <button hu-button size="sm" variant="ghost" (click)="chart.collapseFrom(2)">Yalnız direktörler</button>
        </div>
        <hu-org-chart #chart [value]="company" selectionMode="single" [(selection)]="picked" />
        <p class="demo-label">Seçili: {{ picked().join(', ') || '—' }}</p>
      </app-doc-example>

      <app-doc-example
        title="Özel kart ve sıkı görünüm"
        description="huOrgChartNode şablonuyla kart içeriği tamamen sizin; compact daha dar kart ve aralık kullanır."
        [code]="templateCode"
      >
        <hu-org-chart [value]="faculty" compact>
          <ng-template huOrgChartNode let-node let-collapsed="collapsed">
            <hu-icon class="unit-icon" [name]="node.icon ?? 'folder'" [size]="18" />
            <strong class="unit-name">{{ node.label }}</strong>
            <hu-badge [variant]="collapsed ? 'warning' : 'neutral'">{{ node.data }} kişi</hu-badge>
          </ng-template>
        </hu-org-chart>
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `
    .unit-icon { color: var(--hu-primary); }
    .unit-name { font-size: var(--hu-text-sm); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrgChartDoc {
  protected readonly company = COMPANY;
  protected readonly faculty = FACULTY;
  protected readonly picked = signal<HuOrgChartKey[]>([]);

  protected readonly basicCode = `
company: HuOrgChartNode = {
  key: 'ceo', label: 'Elif Arslan', title: 'Genel Müdür', avatar: true, color: 'primary',
  children: [
    {
      key: 'cto', label: 'Burak Şahin', title: 'Teknoloji Direktörü', avatar: true, color: 'info',
      children: [
        { key: 'dev', label: 'Selin Koç', title: 'Yazılım Ekip Lideri', avatar: true },
        { key: 'ops', label: 'Can Öztürk', title: 'Altyapı Sorumlusu', avatar: true },
      ],
    },
    { key: 'cfo', label: 'Deniz Aydın', title: 'Finans Direktörü', avatar: true, color: 'success' },
  ],
};
picked = signal<HuOrgChartKey[]>([]);

<button hu-button size="sm" variant="outline" (click)="chart.expandAll()">Tümünü aç</button>
<button hu-button size="sm" variant="ghost" (click)="chart.collapseFrom(2)">Yalnız direktörler</button>
<hu-org-chart #chart [value]="company" selectionMode="single" [(selection)]="picked" />`;

  protected readonly templateCode = `
faculty: HuOrgChartNode<number> = {
  key: 'dekan', label: 'Dekanlık', icon: 'building', data: 3,
  children: [
    { key: 'bil', label: 'Bilgisayar', icon: 'monitor', data: 42 },
    { key: 'mak', label: 'Makine', icon: 'settings', data: 38 },
  ],
};

<hu-org-chart [value]="faculty" compact>
  <ng-template huOrgChartNode let-node let-collapsed="collapsed">
    <hu-icon [name]="node.icon ?? 'folder'" [size]="18" />
    <strong>{{ node.label }}</strong>
    <hu-badge [variant]="collapsed ? 'warning' : 'neutral'">{{ node.data }} kişi</hu-badge>
  </ng-template>
</hu-org-chart>`;
}
