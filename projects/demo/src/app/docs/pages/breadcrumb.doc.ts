import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HuBreadcrumb, HuBreadcrumbItem } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

@Component({
  selector: 'app-breadcrumb-doc',
  imports: [DocPage, DocExample, HuBreadcrumb],
  template: `
    <app-doc-page slug="breadcrumb">
      <app-doc-example title="Temel" description="Son öğe geçerli sayfadır ve link olmaz." [code]="basicCode">
        <hu-breadcrumb [items]="items" />
      </app-doc-example>
      <app-doc-example title="Uzun yol" [code]="longCode">
        <hu-breadcrumb [items]="long" />
      </app-doc-example>
    </app-doc-page>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbDoc {
  protected readonly items: HuBreadcrumbItem[] = [
    { label: 'Ana Sayfa', link: '/', icon: 'home' },
    { label: 'Kullanıcılar', link: '/kullanicilar' },
    { label: 'Ayşe Yılmaz' },
  ];
  protected readonly long: HuBreadcrumbItem[] = [
    { label: 'Ana Sayfa', link: '/', icon: 'home' },
    { label: 'Akademik', link: '/akademik/bolumler' },
    { label: 'Bölümler', link: '/akademik/bolumler' },
    { label: 'Bilgisayar Mühendisliği', link: '/akademik/bolumler' },
    { label: 'BBM 203 — Veri Yapıları' },
  ];

  protected readonly basicCode = `
items: HuBreadcrumbItem[] = [
  { label: 'Ana Sayfa', link: '/', icon: 'home' },
  { label: 'Kullanıcılar', link: '/kullanicilar' },
  { label: 'Ayşe Yılmaz' },
];

<hu-breadcrumb [items]="items" />`;

  protected readonly longCode = `<hu-breadcrumb [items]="items" />`;
}
