import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HU_DROPDOWN_IMPORTS, HuAvatar, HuDropdownEntry, HuDropdownOption, HuIcon } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

@Component({
  selector: 'app-dropdown-doc',
  imports: [DocPage, DocExample, HU_DROPDOWN_IMPORTS, HuAvatar, HuIcon],
  template: `
    <app-doc-page slug="dropdown">
      <app-doc-example
        title="Temel"
        description="Klavye: ↓ açar, ↑/↓ gezinir, harfe basınca o harfe atlar, Enter seçer, Esc kapatır."
        [code]="basicCode"
      >
        <div class="row">
          <hu-dropdown label="İşlemler" [options]="actions" (selected)="last.set($event)" />
        </div>
        <p class="demo-label">Seçilen: {{ last() ? last()!.label + ' (value: ' + last()!.value + ')' : '—' }}</p>
      </app-doc-example>

      <app-doc-example title="Yalnızca ikon" description="ariaLabel vermeyi unutmayın." [code]="iconCode">
        <div class="row">
          <hu-dropdown icon="more-vertical" variant="ghost" ariaLabel="Satır işlemleri" [options]="actions" (selected)="last.set($event)" />
          <hu-dropdown icon="settings" variant="outline" ariaLabel="Ayarlar" [options]="actions" (selected)="last.set($event)" />
        </div>
      </app-doc-example>

      <app-doc-example title="Açıklamalı seçenekler" [code]="descCode">
        <hu-dropdown label="Dışa aktar" icon="download" variant="soft" [options]="exportOptions" (selected)="last.set($event)" />
      </app-doc-example>

      <app-doc-example title="Linkler" description="link verilen seçenek router linki olur." [code]="linkCode">
        <hu-dropdown label="Sayfalar" variant="ghost" [options]="links" />
      </app-doc-example>

      <app-doc-example title="Özel tetikleyici ve başlık" description="huDropdownTrigger ve huDropdownHeader slotları." [code]="customCode">
        <hu-dropdown [options]="profile" (selected)="last.set($event)">
          <button huDropdownTrigger type="button" class="avatar-trigger" aria-label="Profil menüsü">
            <hu-avatar name="Kadir Üçme" size="sm" /> Kadir Üçme <hu-icon name="chevron-down" [size]="14" />
          </button>
          <div huDropdownHeader><strong>Profil</strong></div>
        </hu-dropdown>
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `
    .demo-label { margin-top: var(--hu-space-3); }
    .avatar-trigger {
      display: inline-flex; align-items: center; gap: var(--hu-space-2);
      padding: var(--hu-space-1) var(--hu-space-2); font: inherit; color: var(--hu-text);
      background: none; border: 1px solid var(--hu-border); border-radius: var(--hu-radius-full); cursor: pointer;
    }
    .avatar-trigger:hover { background: var(--hu-surface-3); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownDoc {
  protected readonly last = signal<HuDropdownOption | null>(null);

  protected readonly actions: HuDropdownEntry[] = [
    { header: 'Kayıt' },
    { label: 'Düzenle', value: 'edit', icon: 'edit' },
    { label: 'Kopyala', value: 'copy', icon: 'layers' },
    { label: 'Arşivle', value: 'archive', icon: 'folder', disabled: true },
    { divider: true },
    { label: 'Sil', value: 'delete', icon: 'trash', danger: true },
  ];
  protected readonly exportOptions: HuDropdownEntry[] = [
    { label: 'Excel', value: 'xlsx', icon: 'file-text', description: 'Tüm sütunlar, .xlsx' },
    { label: 'CSV', value: 'csv', icon: 'file-text', description: 'Virgülle ayrılmış' },
    { label: 'PDF', value: 'pdf', icon: 'download', description: 'Yazdırmaya hazır' },
  ];
  protected readonly links: HuDropdownEntry[] = [
    { label: 'Genel Bakış', icon: 'home', link: '/' },
    { label: 'Kullanıcılar', icon: 'users', link: '/kullanicilar' },
    { label: 'Akademik Takvim', icon: 'calendar', link: '/akademik/takvim' },
  ];
  protected readonly profile: HuDropdownEntry[] = [
    { label: 'Profilim', value: 'profile', icon: 'user' },
    { label: 'Ayarlar', value: 'settings', icon: 'settings' },
    { divider: true },
    { label: 'Çıkış yap', value: 'logout', icon: 'log-out', danger: true },
  ];

  protected readonly basicCode = `
actions: HuDropdownEntry[] = [
  { header: 'Kayıt' },
  { label: 'Düzenle', value: 'edit', icon: 'edit' },
  { label: 'Arşivle', value: 'archive', icon: 'folder', disabled: true },
  { divider: true },
  { label: 'Sil', value: 'delete', icon: 'trash', danger: true },
];

<hu-dropdown label="İşlemler" [options]="actions" (selected)="run($event.value)" />`;

  protected readonly iconCode = `<hu-dropdown icon="more-vertical" variant="ghost" ariaLabel="Satır işlemleri" [options]="actions" />`;

  protected readonly descCode = `
{ label: 'Excel', value: 'xlsx', icon: 'file-text', description: 'Tüm sütunlar, .xlsx' }

<hu-dropdown label="Dışa aktar" icon="download" variant="soft" [options]="exportOptions" />`;

  protected readonly linkCode = `
{ label: 'Kullanıcılar', icon: 'users', link: '/kullanicilar' }

<hu-dropdown label="Sayfalar" variant="ghost" [options]="links" />`;

  protected readonly customCode = `
<hu-dropdown [options]="profile" (selected)="onProfile($event)">
  <button huDropdownTrigger type="button" aria-label="Profil menüsü">
    <hu-avatar name="Kadir Üçme" size="sm" /> Kadir Üçme
  </button>
  <div huDropdownHeader><strong>Profil</strong></div>
</hu-dropdown>`;
}
