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
        Bu demo uygulamanın iskeleti hu-shell ile yapıldı (<code>layout="header" sidebarVariant="card" collapseToggle="topbar"</code>).
        Sol üstteki menü ikonunu, pencereyi daraltınca açılan mobil menüyü ve sağ üstteki kullanıcı menüsünü deneyebilirsiniz.
      </hu-alert>

      <app-doc-example title="Layout component'i" description="Uygulamanın ana route'unda bir kez kullanılır." [code]="layoutCode">
        <app-doc-code [code]="routesCode" />
      </app-doc-example>

      <app-doc-example
        title="Yerleşimler"
        description="layout ve topbarTheme girdileri iskeletin görünümünü değiştirir; menü, slotlar ve davranış hepsinde aynıdır."
        [code]="layoutsCode"
      >
        <ul class="features">
          <li><strong>classic</strong> (varsayılan): logo ve proje adı sidebar'ın üstünde, üst çubuk içerik sütununda.</li>
          <li>
            <strong>topbarTheme="brand"</strong>: classic yerleşimde üst çubuk marka renginde (bordo→mor); logo ve proje adı
            sidebar'da kalır.
          </li>
          <li>
            <strong>header</strong>: tam genişlikte marka renginde üst bant; logo ve proje adı bandın solunda, sidebar bandın
            altında. <code>sidebarVariant="card"</code> ile sidebar bandın altında ayrık bir kart olur; bu demo bunu kullanır.
          </li>
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
    <hu-shell [nav]="nav" brand="Yönetim Paneli" brandSubtitle="Kurum adı"
              layout="header" sidebarVariant="card" collapseToggle="topbar">
      <hu-breadcrumb huTopbarStart [items]="crumbs()" />
      <div huTopbarEnd><hu-theme-toggle /></div>
      <router-outlet />
    </hu-shell>
  \`,
})
export class AdminLayout {}`;

  protected readonly layoutsCode = `
<!-- Varsayılan -->
<hu-shell [nav]="nav" brand="Yönetim Paneli" />

<!-- Marka renginde üst çubuk, sidebar ayrı -->
<hu-shell [nav]="nav" brand="Yönetim Paneli" brandSubtitle="Kurum adı" topbarTheme="brand" />

<!-- Tam genişlikte kurumsal üst bant -->
<hu-shell [nav]="nav" brand="Yönetim Paneli" brandSubtitle="Kurum adı" layout="header" />

<!-- Üst bant + altında kart sidebar + topbar'da menü ikonu (bu demo) -->
<hu-shell [nav]="nav" brand="Yönetim Paneli" brandSubtitle="Kurum adı"
          layout="header" sidebarVariant="card" collapseToggle="topbar" />

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
