import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';
import { HuIcon } from '../icon/icon.component';
import { HuNavGroup, HuNavItem } from './nav.types';

/** Yan menü navigasyonu. Genellikle `hu-shell` içinde otomatik kullanılır. */
@Component({
  selector: 'hu-sidebar-nav',
  imports: [RouterLink, RouterLinkActive, HuIcon],
  templateUrl: './sidebar-nav.component.html',
  host: { class: 'hu-nav', '[class.hu-nav--collapsed]': 'collapsed()' },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuSidebarNav {
  private readonly router = inject(Router);

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
  }

  protected isParentActive(item: HuNavItem, url = this.url()): boolean {
    const path = url.split(/[?#]/)[0];
    return !!item.children?.some((c) => c.link && (path === c.link || path.startsWith(c.link + '/')));
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
