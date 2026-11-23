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
        Bu demo uygulamanın iskeleti hu-shell ile, <code>layout="header"</code> yerleşimiyle yapıldı. Sol alttaki
        "Daralt" butonunu, pencereyi daraltınca açılan mobil menüyü ve sağ üstteki tema butonunu deneyebilirsiniz.
      </hu-alert>

      <app-doc-example title="Layout component'i" description="Uygulamanın ana route'unda bir kez kullanılır." [code]="layoutCode">
        <app-doc-code [code]="routesCode" />
      </app-doc-example>

      <app-doc-example
        title="Yerleşimler"
        description="layout girdisi iskeletin görünümünü değiştirir; menü, slotlar ve davranış hepsinde aynıdır."
        [code]="layoutsCode"
      >
        <ul class="features">
          <li><strong>classic</strong> (varsayılan): logo ve proje adı sidebar'ın üstünde, üst çubuk içerik sütununda.</li>
          <li>
            <strong>header</strong>: tam genişlikte marka renginde üst bant; logo ve proje adı bandın solunda (sidebar ile aynı
            genişlikte), sidebar bandın altında. Bant rengi <code>--hu-header-bg</code> ile değişir. Bu demo bunu kullanır.
          </li>
          <li><strong>floating</strong>: sidebar ve üst çubuk kenarlardan ayrık, yuvarlak köşeli kartlar.</li>
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
    <hu-shell [nav]="nav" brand="Yönetim Paneli" brandSubtitle="Kurum adı" layout="header">
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

<!-- Kurumsal üst bant -->
<hu-shell [nav]="nav" brand="Yönetim Paneli" brandSubtitle="Kurum adı" layout="header" />

<!-- Yüzen kartlar -->
<hu-shell [nav]="nav" brand="Yönetim Paneli" layout="floating" />

/* Üst bant rengini değiştirme (global stil) */
.hu-shell--header {
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
