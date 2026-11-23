import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HU_TREE_IMPORTS, HuBadge, HuButton, HuTreeKey, HuTreeNode } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

const FILES: HuTreeNode[] = [
  {
    key: 'belgeler',
    label: 'Belgeler',
    icon: 'folder',
    expandedIcon: 'folder-open',
    children: [
      {
        key: 'ders',
        label: 'Ders notları',
        icon: 'folder',
        expandedIcon: 'folder-open',
        children: [
          { key: 'bil101', label: 'BİL 101 — Hafta 1.pdf', icon: 'file-text' },
          { key: 'bil102', label: 'BİL 101 — Hafta 2.pdf', icon: 'file-text' },
          { key: 'mat', label: 'Analiz özet.docx', icon: 'file-text' },
        ],
      },
      { key: 'cv', label: 'Özgeçmiş.pdf', icon: 'file-text' },
      { key: 'arsiv', label: 'Arşiv.zip', icon: 'file-archive' },
    ],
  },
  {
    key: 'resimler',
    label: 'Resimler',
    icon: 'folder',
    expandedIcon: 'folder-open',
    children: [
      { key: 'r1', label: 'Mezuniyet.jpg', icon: 'file-image' },
      { key: 'r2', label: 'Ekip.png', icon: 'file-image' },
    ],
  },
  { key: 'notlar', label: 'Notlar.txt', icon: 'file' },
];

const PERMISSIONS: HuTreeNode[] = [
  {
    key: 'ogrenci',
    label: 'Öğrenci işlemleri',
    children: [
      { key: 'ogrenci.liste', label: 'Listeleme' },
      { key: 'ogrenci.ekle', label: 'Kayıt ekleme' },
      { key: 'ogrenci.sil', label: 'Kayıt silme', disabled: true },
    ],
  },
  {
    key: 'ders',
    label: 'Ders işlemleri',
    children: [
      { key: 'ders.liste', label: 'Listeleme' },
      {
        key: 'ders.not',
        label: 'Not girişi',
        children: [
          { key: 'ders.not.vize', label: 'Vize' },
          { key: 'ders.not.final', label: 'Final' },
        ],
      },
    ],
  },
  { key: 'rapor', label: 'Raporlar' },
];

@Component({
  selector: 'app-tree-doc',
  imports: [DocPage, DocExample, HU_TREE_IMPORTS, HuBadge, HuButton],
  template: `
    <app-doc-page slug="tree">
      <app-doc-example
        title="Dosya ağacı, tekli seçim"
        description="Klavye: ↑/↓ gezin, → aç / alt öğeye in, ← kapat / üst öğeye çık, Enter seç, harf yazarak atla."
        [code]="basicCode"
      >
        <div class="row">
          <button hu-button size="sm" variant="outline" (click)="files.expandAll()">Tümünü aç</button>
          <button hu-button size="sm" variant="ghost" (click)="files.collapseAll()">Tümünü kapat</button>
        </div>
        <hu-tree #files class="box" [nodes]="fileNodes" selectionMode="single" [(selection)]="picked" [(expanded)]="open" ariaLabel="Dosyalar" />
        <p class="demo-label">Seçili: {{ picked().join(', ') || '—' }}</p>
      </app-doc-example>

      <app-doc-example
        title="Onay kutulu (yetki ataması) ve arama"
        description="Üst düğüm işaretlenince tüm alt düğümler seçilir; bir kısmı seçiliyse üst düğüm kısmi görünür. Arama, eşleşen düğümlerin üstlerini otomatik açar."
        [code]="checkboxCode"
      >
        <hu-tree class="box" [nodes]="permissions" selectionMode="checkbox" [(selection)]="granted" [expanded]="['ogrenci', 'ders']" filter filterPlaceholder="Yetki ara…" ariaLabel="Yetkiler" />
        <p class="demo-label">Yetkiler: {{ granted().join(', ') || '—' }}</p>
      </app-doc-example>

      <app-doc-example
        title="Tembel yükleme ve özel düğüm"
        description="leaf: false olan düğüm açıldığında loadChildren çağrılır; yüklenirken dönen bir gösterge çıkar. huTreeNode şablonuyla düğüm içeriği özelleştirilir."
        [code]="lazyCode"
      >
        <hu-tree class="box" [nodes]="units" [loadChildren]="loadUnits" selectionMode="multiple" ariaLabel="Birimler">
          <ng-template huTreeNode let-node>
            <span class="unit">{{ node.label }}</span>
            @if (node.data) {
              <hu-badge variant="neutral">{{ node.data }} kişi</hu-badge>
            }
          </ng-template>
        </hu-tree>
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `
    .box { max-width: 26rem; padding: var(--hu-space-2); border: 1px solid var(--hu-border); border-radius: var(--hu-radius-lg); }
    .unit { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeDoc {
  protected readonly fileNodes = FILES;
  protected readonly permissions = PERMISSIONS;
  protected readonly picked = signal<HuTreeKey[]>(['cv']);
  protected readonly open = signal<HuTreeKey[]>(['belgeler']);
  protected readonly granted = signal<HuTreeKey[]>(['ogrenci.liste', 'ders.not.vize']);

  protected readonly units: HuTreeNode<number>[] = [
    { key: 'muh', label: 'Mühendislik Fakültesi', icon: 'building', leaf: false, data: 1240 },
    { key: 'fen', label: 'Fen Fakültesi', icon: 'building', leaf: false, data: 860 },
  ];

  protected readonly loadUnits = (node: HuTreeNode<number>): Promise<HuTreeNode<number>[]> =>
    new Promise((resolve) =>
      setTimeout(
        () =>
          resolve(
            ['Bilgisayar', 'Elektrik', 'Makine'].map((d, i) => ({
              key: `${node.key}-${i}`,
              label: `${d} Bölümü`,
              icon: 'users',
              data: 120 + i * 45,
            })),
          ),
        800,
      ),
    );

  protected readonly basicCode = `
nodes: HuTreeNode[] = [
  {
    key: 'belgeler', label: 'Belgeler', icon: 'folder', expandedIcon: 'folder-open',
    children: [
      { key: 'cv', label: 'Özgeçmiş.pdf', icon: 'file-text' },
      { key: 'arsiv', label: 'Arşiv.zip', icon: 'file-archive' },
    ],
  },
  { key: 'notlar', label: 'Notlar.txt', icon: 'file' },
];
picked = signal<HuTreeKey[]>(['cv']);
open = signal<HuTreeKey[]>(['belgeler']);

<button hu-button size="sm" variant="outline" (click)="files.expandAll()">Tümünü aç</button>
<hu-tree #files [nodes]="nodes" selectionMode="single" [(selection)]="picked" [(expanded)]="open" />`;

  protected readonly checkboxCode = `
permissions: HuTreeNode[] = [
  {
    key: 'ogrenci', label: 'Öğrenci işlemleri',
    children: [
      { key: 'ogrenci.liste', label: 'Listeleme' },
      { key: 'ogrenci.ekle', label: 'Kayıt ekleme' },
      { key: 'ogrenci.sil', label: 'Kayıt silme', disabled: true },
    ],
  },
  { key: 'rapor', label: 'Raporlar' },
];
granted = signal<HuTreeKey[]>(['ogrenci.liste']);

<hu-tree [nodes]="permissions" selectionMode="checkbox" [(selection)]="granted" filter filterPlaceholder="Yetki ara…" />`;

  protected readonly lazyCode = `
units: HuTreeNode<number>[] = [
  { key: 'muh', label: 'Mühendislik Fakültesi', icon: 'building', leaf: false, data: 1240 },
];
loadUnits = async (node: HuTreeNode<number>): Promise<HuTreeNode<number>[]> => {
  const res = await fetch('/api/birimler/' + node.key);
  return res.json();
};

<hu-tree [nodes]="units" [loadChildren]="loadUnits" selectionMode="multiple">
  <ng-template huTreeNode let-node>
    {{ node.label }}
    <hu-badge variant="neutral">{{ node.data }} kişi</hu-badge>
  </ng-template>
</hu-tree>`;
}
