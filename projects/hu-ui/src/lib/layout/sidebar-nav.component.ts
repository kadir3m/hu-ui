import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';
import { HuIcon } from '../icon/icon.component';
import { HuNavGroup, HuNavItem } from './nav.types';

/** Yan menü navigasyonu. Genellikle `hu-shell` içinde otomatik kullanılır. */
@Component({
  selector: 'hu-sidebar-nav',
  imports: [NgTemplateOutlet, RouterLink, RouterLinkActive, HuIcon],
  templateUrl: './sidebar-nav.component.html',
  host: { class: 'hu-nav', '[class.hu-nav--collapsed]': 'collapsed()' },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuSidebarNav {
  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  readonly groups = input<HuNavGroup[]>([]);
  readonly collapsed = input(false, { transform: booleanAttribute });
  /** Bir linke tıklandı (mobilde menüyü kapatmak için). */
  readonly navigate = output<void>();
  /** Daraltılmış moddayken alt menülü öğeye tıklandı. */
  readonly expandRequest = output<void>();

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
  protected readonly openItems = signal<ReadonlySet<HuNavItem>>(new Set());

  constructor() {
    // Aktif alt sayfanın grubu otomatik açılsın.
    effect(() => {
      const url = this.url();
      const parents = this.groups()
        .flatMap((g) => g.items)
        .filter((item) => this.isParentActive(item, url));
      if (parents.length) {
        untracked(() => this.openItems.update((set) => new Set([...set, ...parents])));
      }
    });

    // Uzun menülerde aktif link görünür alanda kalsın. routerLinkActive sınıfını
    // bir microtask sonra eklediği için render'dan sonraki turu bekle.
    effect(() => {
      this.url();
      afterNextRender(
        () =>
          setTimeout(() =>
            this.host.nativeElement
              .querySelector<HTMLElement>('.hu-nav__link--active')
              ?.scrollIntoView({ block: 'nearest' }),
          ),
        { injector: this.injector },
      );
    });
  }

  /** Öğenin herhangi bir alt (veya kategori altı) linki aktif mi? */
  protected isParentActive(item: HuNavItem, url = this.url()): boolean {
    const path = url.split(/[?#]/)[0];
    const matches = (c: HuNavItem): boolean =>
      (!!c.link && (path === c.link || path.startsWith(c.link + '/'))) || !!c.children?.some(matches);
    return !!item.children?.some(matches);
  }

  /** `'Yeni'` gibi metin rozetleri sayılardan farklı görünür. */
  protected isTextBadge(badge: string | number): boolean {
    return typeof badge === 'string' && Number.isNaN(Number(badge));
  }

  protected toggle(item: HuNavItem): void {
    if (this.collapsed()) {
      this.expandRequest.emit();
      this.openItems.update((set) => new Set([...set, item]));
      return;
    }
    this.openItems.update((set) => {
      const next = new Set(set);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  }
}
