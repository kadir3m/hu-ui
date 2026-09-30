import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, model } from '@angular/core';
import { HuButton } from '../button/button.component';
import { HuIcon } from '../icon/icon.component';
import { HuInput } from '../form-field/input.directive';

type PageItem = number | 'gap-start' | 'gap-end';

/**
 * Sayfalama.
 * @example <hu-paginator [length]="total()" [(pageIndex)]="page" [(pageSize)]="size" />
 */
@Component({
  selector: 'hu-paginator',
  imports: [HuButton, HuIcon, HuInput],
  template: `
    <div class="hu-paginator__info">
      @if (pageSizeOptions().length > 1) {
        <label class="hu-paginator__size">
          <span>Sayfa başına</span>
          <select huInput size="sm" [value]="pageSize()" (change)="changePageSize($event)">
            @for (option of pageSizeOptions(); track option) {
              <option [value]="option" [selected]="option === pageSize()">{{ option }}</option>
            }
          </select>
        </label>
      }
      <span class="hu-paginator__range">{{ rangeLabel() }}</span>
    </div>

    <nav class="hu-paginator__pages" aria-label="Sayfalama">
      <button hu-button variant="ghost" size="sm" iconOnly aria-label="Önceki sayfa" [disabled]="pageIndex() === 0" (click)="goTo(pageIndex() - 1)">
        <hu-icon name="chevron-left" [size]="16" />
      </button>
      @for (item of pages(); track item) {
        @if (item === 'gap-start' || item === 'gap-end') {
          <span class="hu-paginator__gap" aria-hidden="true">…</span>
        } @else {
          <button
            type="button"
            class="hu-paginator__page"
            [class.hu-paginator__page--active]="item === pageIndex()"
            [attr.aria-current]="item === pageIndex() ? 'page' : null"
            [attr.aria-label]="'Sayfa ' + (item + 1)"
            (click)="goTo(item)"
          >
            {{ item + 1 }}
          </button>
        }
      }
      <button hu-button variant="ghost" size="sm" iconOnly aria-label="Sonraki sayfa" [disabled]="pageIndex() >= pageCount() - 1" (click)="goTo(pageIndex() + 1)">
        <hu-icon name="chevron-right" [size]="16" />
      </button>
    </nav>
  `,
  styles: `
    .hu-paginator {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--hu-space-3);
      padding: var(--hu-space-3) var(--hu-space-4);
      font-size: var(--hu-text-sm);
      color: var(--hu-text-muted);
    }
    .hu-paginator__info { display: flex; align-items: center; gap: var(--hu-space-4); }
    .hu-paginator__size { display: inline-flex; align-items: center; gap: var(--hu-space-2); white-space: nowrap; }
    .hu-paginator__size .hu-input { width: auto; }
    .hu-paginator__pages { display: flex; align-items: center; gap: 2px; }
    .hu-paginator__page {
      min-width: var(--hu-control-sm);
      height: var(--hu-control-sm);
      padding: 0 var(--hu-space-2);
      font: inherit;
      font-variant-numeric: tabular-nums;
      color: var(--hu-text-muted);
      background: none;
      border: 1px solid transparent;
      border-radius: var(--hu-radius-md);
      cursor: pointer;
    }
    .hu-paginator__page:hover { color: var(--hu-text); background: var(--hu-surface-3); }
    .hu-paginator__page--active,
    .hu-paginator__page--active:hover {
      font-weight: 600;
      color: var(--hu-primary-soft-fg);
      background: var(--hu-primary-soft);
    }
    .hu-paginator__gap { padding: 0 var(--hu-space-1); }
    @media (max-width: 639.98px) {
      .hu-paginator__size { display: none; }
    }
  `,
  host: { class: 'hu-paginator' },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuPaginator {
  readonly length = input.required<number>();
  readonly pageIndex = model(0);
  readonly pageSize = model(10);
  readonly pageSizeOptions = input<number[]>([10, 25, 50]);

  protected readonly pageCount = computed(() => Math.max(1, Math.ceil(this.length() / this.pageSize())));

  protected readonly rangeLabel = computed(() => {
    const total = this.length();
    if (!total) return '0 kayıt';
    const start = this.pageIndex() * this.pageSize() + 1;
    const end = Math.min(total, start + this.pageSize() - 1);
    return `${start}–${end} / ${total} kayıt`;
  });

  /** Mevcut sayfanın etrafında en fazla 7 öğe (ilk, son, komşular ve boşluklar). */
  protected readonly pages = computed<PageItem[]>(() => {
    const count = this.pageCount();
    const current = Math.min(this.pageIndex(), count - 1);
    if (count <= 7) return Array.from({ length: count }, (_, i) => i);

    const start = Math.max(1, Math.min(current - 1, count - 5));
    const end = Math.min(count - 2, Math.max(current + 1, 4));
    const items: PageItem[] = [0];
    if (start > 1) items.push('gap-start');
    for (let i = start; i <= end; i++) items.push(i);
    if (end < count - 2) items.push('gap-end');
    items.push(count - 1);
    return items;
  });

  protected goTo(index: number): void {
    const clamped = Math.max(0, Math.min(index, this.pageCount() - 1));
    if (clamped !== this.pageIndex()) this.pageIndex.set(clamped);
  }

  protected changePageSize(event: Event): void {
    this.pageSize.set(Number((event.target as HTMLSelectElement).value));
    this.pageIndex.set(0);
  }
}
