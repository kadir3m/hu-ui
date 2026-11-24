import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  Directive,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { HuButton } from '../button/button.component';
import { HuIcon } from '../icon/icon.component';
import { huMediaQuery } from '../core/media';
import { HuSidebarNav } from './sidebar-nav.component';
import { HuNavGroup } from './nav.types';

/** Topbar'ın sol tarafı (breadcrumb, arama vb.). */
@Directive({ selector: '[huTopbarStart]', host: { class: 'hu-shell__topbar-start' } })
export class HuTopbarStart {}

/** Topbar'ın sağ tarafı (tema, bildirim, kullanıcı menüsü). */
@Directive({ selector: '[huTopbarEnd]', host: { class: 'hu-shell__topbar-end' } })
export class HuTopbarEnd {}

/** Sidebar'ın alt kısmı. */
@Directive({ selector: '[huSidebarFooter]', host: { class: 'hu-shell__sidebar-footer' } })
export class HuSidebarFooter {}

/** Marka alanında varsayılan logonun yerine geçer. */
@Directive({ selector: '[huShellLogo]', host: { class: 'hu-shell__logo' } })
export class HuShellLogo {}

const COLLAPSED_KEY = 'hu-shell-collapsed';

/**
 * Admin uygulama iskeleti: daraltılabilir sidebar, mobilde çekmece menü, topbar.
 *
 * @example
 * <hu-shell [nav]="nav" brand="Yönetim Paneli" brandSubtitle="Kurum adı">
 *   <hu-breadcrumb huTopbarStart [items]="crumbs()" />
 *   <div huTopbarEnd><hu-theme-toggle /></div>
 *   <router-outlet />
 * </hu-shell>
 */
@Component({
  selector: 'hu-shell',
  imports: [NgTemplateOutlet, RouterLink, HuButton, HuIcon, HuSidebarNav],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  host: {
    class: 'hu-shell',
    '[class.hu-shell--collapsed]': 'isCollapsed()',
    '[class.hu-shell--mobile]': 'isMobile()',
    '[class.hu-shell--floating]': "layout() === 'floating'",
    '[class.hu-shell--header]': "layout() === 'header'",
    '[class.hu-shell--sidebar-card]': "sidebarVariant() === 'card'",
    '[class.hu-shell--drawer-open]': 'isMobile() && mobileOpen()',
    '(document:keydown.escape)': 'mobileOpen.set(false)',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuShell {
  private readonly storage = inject(DOCUMENT).defaultView?.localStorage;

  readonly nav = input<HuNavGroup[]>([]);
  readonly brand = input('');
  readonly brandSubtitle = input<string>();
  readonly brandLink = input<string>('/');
  /** Sidebar rengi. `dark`: açık temada da koyu (antrasit) sidebar. */
  readonly sidebarTheme = input<'default' | 'dark'>('default');
  /**
   * Topbar rengi (`classic` / `floating` yerleşimde). `brand`: marka renginde (bordo→mor) bant,
   * içindeki breadcrumb ve ikon butonları beyaz. Renk `--hu-header-bg` ile değişir.
   */
  readonly topbarTheme = input<'default' | 'brand'>('default');
  /** Sidebar biçimi. `card`: kenarlardan ayrık, yuvarlak köşeli kart (`header` yerleşimde bandın altında). */
  readonly sidebarVariant = input<'flush' | 'card'>('card');
  /**
   * Masaüstünde sidebar'ı daraltan buton nerede: `sidebar` (altta "Daralt") veya `topbar`
   * (logonun solunda menü ikonu). Mobilde menü ikonu her zaman topbar'dadır.
   */
  readonly collapseToggle = input<'sidebar' | 'topbar'>('topbar');
  /**
   * Yerleşim.
   * - `classic`: marka sidebar'ın üstünde, topbar içerik sütununda.
   * - `header`: tam genişlikte marka renginde üst bant; logo ve proje adı bandın solunda,
   *   sidebar bandın altında (kurumsal görünüm).
   * - `floating`: sidebar ve topbar kenarlardan ayrık, yuvarlak köşeli kartlar (masaüstü).
   */
  readonly layout = input<'classic' | 'header' | 'floating'>('header');
  /** Masaüstünde sidebar daraltılmış mı? Tercih localStorage'da saklanır. */
  readonly collapsed = model(this.readCollapsed());

  protected readonly isMobile = huMediaQuery('(max-width: 1023.98px)');
  protected readonly mobileOpen = signal(false);
  protected readonly isCollapsed = computed(() => !this.isMobile() && this.collapsed());

  constructor() {
    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.mobileOpen.set(false));

    effect(() => {
      try {
        this.storage?.setItem(COLLAPSED_KEY, String(this.collapsed()));
      } catch {
        // yok say
      }
    });
  }

  toggleSidebar(): void {
    if (this.isMobile()) this.mobileOpen.update((v) => !v);
    else this.collapsed.update((v) => !v);
  }

  private readCollapsed(): boolean {
    try {
      return this.storage?.getItem(COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  }
}
