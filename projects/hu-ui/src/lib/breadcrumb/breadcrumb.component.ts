import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HuIcon } from '../icon/icon.component';

export interface HuBreadcrumbItem {
  label: string;
  link?: string | unknown[];
  icon?: string;
}

/** @example <hu-breadcrumb [items]="[{ label: 'Ana Sayfa', link: '/' }, { label: 'Kullanıcılar' }]" /> */
@Component({
  selector: 'hu-breadcrumb',
  imports: [RouterLink, HuIcon],
  template: `
    <nav aria-label="Konum">
      <ol class="hu-breadcrumb__list">
        @for (item of items(); track $index; let last = $last) {
          <li class="hu-breadcrumb__item">
            @if (item.link && !last) {
              <a class="hu-breadcrumb__link" [routerLink]="item.link">
                @if (item.icon) {
                  <hu-icon [name]="item.icon" [size]="14" />
                }
                {{ item.label }}
              </a>
              <hu-icon class="hu-breadcrumb__sep" name="chevron-right" [size]="14" />
            } @else {
              <span class="hu-breadcrumb__current" [attr.aria-current]="last ? 'page' : null">{{ item.label }}</span>
              @if (!last) {
                <hu-icon class="hu-breadcrumb__sep" name="chevron-right" [size]="14" />
              }
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styles: `
    .hu-breadcrumb { display: block; min-width: 0; }
    .hu-breadcrumb__list {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--hu-space-1);
      margin: 0;
      padding: 0;
      font-size: var(--hu-text-sm);
      list-style: none;
    }
    .hu-breadcrumb__item { display: inline-flex; align-items: center; gap: var(--hu-space-1); min-width: 0; }
    .hu-breadcrumb__link {
      display: inline-flex;
      align-items: center;
      gap: var(--hu-space-1);
      color: var(--hu-text-muted);
      text-decoration: none;
      border-radius: var(--hu-radius-sm);
    }
    .hu-breadcrumb__link:hover { color: var(--hu-text); }
    .hu-breadcrumb__current { font-weight: 500; color: var(--hu-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .hu-breadcrumb__sep { color: var(--hu-text-subtle); }
  `,
  host: { class: 'hu-breadcrumb' },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuBreadcrumb {
  readonly items = input<HuBreadcrumbItem[]>([]);
}
