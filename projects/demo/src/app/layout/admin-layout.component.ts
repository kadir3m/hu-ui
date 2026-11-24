import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import {
  HuAvatar,
  HuBreadcrumbItem,
  HuIcon,
  HuInput,
  HU_DROPDOWN_IMPORTS,
  HuDropdownEntry,
  HuDropdownOption,
  HuNavGroup,
  HuShell,
  HuThemeService,
  HuTopbarEnd,
} from '@ucme-ui/angular';
import { docsNavGroups } from '../docs/doc-registry';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, HuShell, HuTopbarEnd, HuIcon, HuInput, HU_DROPDOWN_IMPORTS, HuAvatar],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly theme = inject(HuThemeService);

  protected readonly user = { name: 'Kadir Üçme', role: 'Sistem Yöneticisi', email: 'kadir.ucme@example.com' };

  /** Dokümantasyon menüsü: başlıklı düz gruplar, ikonlu linkler (kayıt dosyasından üretilir). */
  protected readonly nav: HuNavGroup[] = docsNavGroups();

  /** Kullanıcı menüsü; üst bantta ikon olmadığı için tema geçişi de burada. */
  protected readonly userMenu = computed<HuDropdownEntry[]>(() => {
    const dark = this.theme.resolved() === 'dark';
    return [
      { header: this.user.email },
      { label: 'Profilim', icon: 'user', link: '/ayarlar' },
      { label: 'Ayarlar', icon: 'settings', link: '/ayarlar' },
      { label: dark ? 'Açık tema' : 'Koyu tema', value: 'theme', icon: dark ? 'sun' : 'moon' },
      { divider: true },
      { label: 'Çıkış yap', value: 'logout', icon: 'log-out', danger: true },
    ];
  });

  protected onUserMenu(option: HuDropdownOption): void {
    if (option.value === 'theme') this.theme.toggle();
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
    const items: HuBreadcrumbItem[] = [{ label: 'Ana Sayfa', link: '/' }];
    if (route.data['section']) items.push({ label: route.data['section'], link: route.data['sectionLink'] });
    if (route.data['breadcrumb']) items.push({ label: route.data['breadcrumb'] });
    return items;
  }
}
