import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import {
  HuAvatar,
  HuBadge,
  HuBreadcrumb,
  HuBreadcrumbItem,
  HuButton,
  HuIcon,
  HuInput,
  HU_DROPDOWN_IMPORTS,
  HuDropdownEntry,
  HuDropdownOption,
  HuNavGroup,
  HuShell,
  HuThemeToggle,
  HuTopbarEnd,
  HuTopbarStart,
} from '@ucme-ui/angular';

@Component({
  selector: 'app-admin-layout',
  imports: [
    RouterOutlet,
    HuShell,
    HuTopbarStart,
    HuTopbarEnd,
    HuBreadcrumb,
    HuThemeToggle,
    HuButton,
    HuIcon,
    HuInput,
    HU_DROPDOWN_IMPORTS,
    HuAvatar,
    HuBadge,
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly user = { name: 'Kadir Üçme', role: 'Sistem Yöneticisi', email: 'kadir.ucme@example.com' };

  protected readonly nav: HuNavGroup[] = [
    {
      items: [
        { label: 'Genel Bakış', icon: 'home', link: '/', exact: true },
        { label: 'Raporlar', icon: 'bar-chart', link: '/raporlar' },
      ],
    },
    {
      title: 'Yönetim',
      items: [
        { label: 'Kullanıcılar', icon: 'users', link: '/kullanicilar', badge: 12 },
        {
          label: 'Akademik',
          icon: 'graduation-cap',
          children: [
            { label: 'Bölümler', link: '/akademik/bolumler' },
            { label: 'Dersler', link: '/akademik/dersler' },
            { label: 'Akademik Takvim', link: '/akademik/takvim' },
          ],
        },
      ],
    },
    {
      title: 'Sistem',
      items: [
        { label: 'Component Kataloğu', icon: 'layers', link: '/componentler' },
        { label: 'Ayarlar', icon: 'settings', link: '/ayarlar' },
      ],
    },
  ];

  protected readonly notifications: HuDropdownOption[] = [
    { value: 'approvals', icon: 'users', label: '3 yeni kullanıcı kaydı onay bekliyor', description: '5 dk önce', link: '/kullanicilar' },
    { value: 'calendar', icon: 'calendar', label: 'Bahar dönemi ders kayıtları 3 gün sonra başlıyor', description: '1 saat önce', link: '/akademik/takvim' },
    { value: 'backup', icon: 'alert-triangle', label: 'Yedekleme işlemi uyarı ile tamamlandı', description: 'Dün' },
  ];

  protected readonly userMenu: HuDropdownEntry[] = [
    { header: this.user.email },
    { label: 'Profilim', icon: 'user', link: '/ayarlar' },
    { label: 'Ayarlar', icon: 'settings', link: '/ayarlar' },
    { divider: true },
    { label: 'Çıkış yap', value: 'logout', icon: 'log-out', danger: true },
  ];

  protected onUserMenu(option: HuDropdownOption): void {
    if (option.value === 'logout') this.router.navigate(['/giris']);
  }

  protected readonly breadcrumb = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      startWith(null),
      map(() => this.buildBreadcrumb()),
    ),
    { requireSync: true },
  );

  private buildBreadcrumb(): HuBreadcrumbItem[] {
    let route = this.route.snapshot;
    while (route.firstChild) route = route.firstChild;
    const items: HuBreadcrumbItem[] = [{ label: 'Ana Sayfa', link: '/', icon: 'home' }];
    if (route.data['section']) items.push({ label: route.data['section'] });
    if (route.data['breadcrumb']) items.push({ label: route.data['breadcrumb'] });
    return items;
  }
}
