import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HuAlert } from '@ucme-ui/angular';
import { DocCode } from '../doc-code.component';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

@Component({
  selector: 'app-shell-doc',
  imports: [DocPage, DocExample, DocCode, HuAlert],
  template: `
    <app-doc-page slug="shell">
      <hu-alert title="Canlı örnek: bu sayfanın kendisi">
        Bu demo uygulamanın iskeleti varsayılan ayarlarıyla hu-shell'dir; ek bir girdi ya da CSS gerekmez. Sol üstteki menü
        ikonunu, pencereyi daraltınca açılan mobil menüyü ve sağ üstteki kullanıcı menüsünü deneyebilirsiniz.
      </hu-alert>

      <app-doc-example title="Layout component'i" description="Uygulamanın ana route'unda bir kez kullanılır." [code]="layoutCode">
        <app-doc-code [code]="routesCode" />
      </app-doc-example>

      <app-doc-example
        title="Topbar araçları"
        description="Arama kutusu ve kullanıcı alanı için hazır sınıflar; marka bandında otomatik olarak beyaz görünür."
        [code]="toolsCode"
      >
        <ul class="features">
          <li><strong>hu-topbar-search:</strong> ikonlu, yuvarlak arama kutusu (dar ekranda gizlenir)</li>
          <li><strong>hu-topbar-user:</strong> avatar, ad, rol ve ok; dar ekranda yalnızca avatar kalır</li>
        </ul>
      </app-doc-example>

      <app-doc-example
        title="Yerleşimler"
        description="layout, sidebarVariant, collapseToggle ve topbarTheme girdileri iskeletin görünümünü değiştirir; menü, slotlar ve davranış hepsinde aynıdır."
        [code]="layoutsCode"
      >
        <ul class="features">
          <li>
            <strong>Varsayılan</strong> (<code>layout="header"</code>, <code>sidebarVariant="card"</code>,
            <code>collapseToggle="topbar"</code>): tam genişlikte marka bandı, logo ve proje adı bandın solunda; sidebar bandın
            altında ayrık bir kart; daraltma ikonu bantta. Bu demo bunu kullanır.
          </li>
          <li><strong>classic</strong>: logo ve proje adı sidebar'ın üstünde, üst çubuk içerik sütununda (0.6.0 öncesi görünüm).</li>
          <li><strong>topbarTheme="brand"</strong>: classic/floating yerleşimde üst çubuk marka renginde.</li>
          <li><strong>floating</strong>: sidebar ve üst çubuk kenarlardan ayrık, yuvarlak köşeli kartlar.</li>
          <li>Bant / üst çubuk rengi <code>--hu-header-bg</code> ile değişir.</li>
        </ul>
      </app-doc-example>

      <app-doc-example title="Menü tanımı" description="Grup başlıkları, rozetler, alt menüler ve kategori başlıklı iki seviyeli menü." [code]="navCode">
        <ul class="features">
          <li><strong>Gruplar:</strong> <code>{{ '{' }} title: 'Yönetim', items: [...] {{ '}' }}</code></li>
          <li><strong>Rozet:</strong> sayı (<code>12</code>) dolu, metin (<code>'Yeni'</code>) açık renkli görünür</li>
          <li><strong>Alt menü:</strong> <code>children</code>; aktif sayfanın grubu otomatik açılır</li>
          <li><strong>Kategori başlığı:</strong> alt öğenin de <code>children</code>'ı varsa başlık olur (bu menüdeki "Form", "Veri" gibi)</li>
        </ul>
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `
    hu-alert { display: flex; }
    .features { margin: 0; padding-left: var(--hu-space-5); display: flex; flex-direction: column; gap: var(--hu-space-2); }
    .features code { font-family: var(--hu-font-mono); font-size: var(--hu-text-xs); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellDoc {
  protected readonly layoutCode = `
@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, HU_SHELL_IMPORTS, HuBreadcrumb, HuThemeToggle],
  template: \`
    <hu-shell [nav]="nav" brand="Yönetim Paneli" brandSubtitle="Kurum adı">
      <div huTopbarEnd><hu-theme-toggle /></div>
      <router-outlet />
    </hu-shell>
  \`,
})
export class AdminLayout {}`;

  protected readonly toolsCode = `
<hu-shell [nav]="nav" brand="Yönetim Paneli" brandSubtitle="Kurum adı">
  <div huTopbarEnd>
    <div class="hu-topbar-search">
      <hu-icon name="search" [size]="16" />
      <input huInput size="sm" type="search" placeholder="Ara…" aria-label="Ara" />
      <kbd>Ctrl K</kbd>
    </div>

    <hu-dropdown align="end" ariaLabel="Kullanıcı menüsü" [options]="userMenu">
      <button huDropdownTrigger type="button" class="hu-topbar-user" aria-label="Kullanıcı menüsü">
        <hu-avatar [name]="user.name" size="sm" />
        <span class="hu-topbar-user__text">
          <span class="hu-topbar-user__name">{{ user.name }}</span>
          <span class="hu-topbar-user__role">{{ user.role }}</span>
        </span>
        <hu-icon name="chevron-down" [size]="16" />
      </button>
    </hu-dropdown>
  </div>
  <router-outlet />
</hu-shell>`;

  protected readonly layoutsCode = `
<!-- Varsayılan: üst bant + kart sidebar + bantta menü ikonu (bu demo) -->
<hu-shell [nav]="nav" brand="Yönetim Paneli" brandSubtitle="Kurum adı" />

<!-- 0.6.0 öncesi klasik görünüm -->
<hu-shell [nav]="nav" brand="Yönetim Paneli" layout="classic" sidebarVariant="flush" collapseToggle="sidebar" />

<!-- Klasik + marka renginde üst çubuk -->
<hu-shell [nav]="nav" brand="Yönetim Paneli" layout="classic" sidebarVariant="flush" topbarTheme="brand" />

<!-- Yüzen kartlar -->
<hu-shell [nav]="nav" brand="Yönetim Paneli" layout="floating" />

/* Bant / üst çubuk rengini değiştirme (global stil) */
.hu-shell {
  --hu-header-bg: linear-gradient(90deg, #6e0f22, #4c1745);
}`;

  protected readonly routesCode = `
export const routes: Routes = [
  { path: 'giris', loadComponent: () => import('./login') },
  {
    path: '',
    component: AdminLayout,        // hu-shell burada
    children: [
      { path: '', loadComponent: () => import('./dashboard') },
      { path: 'kullanicilar', loadComponent: () => import('./users') },
    ],
  },
];`;

  protected readonly navCode = `
nav: HuNavGroup[] = [
  { items: [{ label: 'Genel Bakış', icon: 'home', link: '/', exact: true }] },
  {
    title: 'Yönetim',
    items: [
      { label: 'Kullanıcılar', icon: 'users', link: '/kullanicilar', badge: 12 },
      {
        label: 'Componentler',
        icon: 'layers',
        children: [
          { label: 'Form', children: [
            { label: 'Button', link: '/componentler/button' },
            { label: 'Dropdown', link: '/componentler/dropdown', badge: 'Yeni' },
          ]},
        ],
      },
    ],
  },
];`;
}
