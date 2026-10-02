import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChildren,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { HuIcon } from '../icon/icon.component';
import { HuSpinner } from '../spinner/spinner.component';
import { HuColumn, HuSort } from './table.types';

export interface HuCellContext<T = any> {
  $implicit: T;
  index: number;
}

/**
 * Bir sütun için özel hücre şablonu. `huCellOf` ile tabloya verilen veriyi
 * bağlarsanız `let-row` değişkeni tip güvenli olur.
 * @example <ng-template huCell="status" [huCellOf]="users()" let-row><hu-badge>{{ row.status }}</hu-badge></ng-template>
 */
@Directive({ selector: 'ng-template[huCell]' })
export class HuCellDef<T = any> {
  readonly key = input.required<string>({ alias: 'huCell' });
  /** Yalnızca tip çıkarımı içindir; çalışma zamanında kullanılmaz. */
  readonly of = input<readonly T[]>(undefined, { alias: 'huCellOf' });
  readonly template = inject<TemplateRef<HuCellContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T>(_dir: HuCellDef<T>, ctx: unknown): ctx is HuCellContext<T> {
    return true;
  }
}

const collator = new Intl.Collator('tr-TR', { numeric: true, sensitivity: 'base' });

function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  return collator.compare(String(a), String(b));
}

/**
 * Veri tablosu: sıralama, özel hücre şablonları, yükleniyor ve boş durumları.
 * Sayfalama için `hu-paginator` ile birlikte kullanın.
 *
 * @example
 * <hu-table [data]="users()" [columns]="columns" [(sort)]="sort">
 *   <ng-template huCell="status" let-user>
 *     <hu-badge [variant]="user.active ? 'success' : 'neutral'">{{ user.active ? 'Aktif' : 'Pasif' }}</hu-badge>
 *   </ng-template>
 * </hu-table>
 */
@Component({
  selector: 'hu-table',
  imports: [NgTemplateOutlet, HuIcon, HuSpinner],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  host: {
    class: 'hu-table',
    '[class.hu-table--striped]': 'striped()',
    '[class.hu-table--dense]': 'dense()',
    '[class.hu-table--sticky]': 'stickyHeader()',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuTable<T = any> {
  readonly data = input<readonly T[]>([]);
  readonly columns = input.required<HuColumn<T>[]>();
  readonly loading = input(false, { transform: booleanAttribute });
  readonly emptyText = input('Kayıt bulunamadı.');
  /** `client`: tablo kendisi sıralar. `server`: yalnızca `sort` değişir, veriyi siz getirirsiniz. */
  readonly sortMode = input<'client' | 'server'>('client');
  readonly sort = model<HuSort>({ key: '', direction: '' });
  /** null/undefined verilirse sıralama yok sayılır. */
  protected readonly currentSort = computed<HuSort>(() => this.sort() ?? { key: '', direction: '' });
  readonly trackBy = input<(row: T) => unknown>((row: T) => row);
  readonly striped = input(false, { transform: booleanAttribute });
  readonly dense = input(false, { transform: booleanAttribute });
  readonly stickyHeader = input(false, { transform: booleanAttribute });
  readonly clickableRows = input(false, { transform: booleanAttribute });
  readonly rowClick = output<T>();

  private readonly cellDefs = contentChildren(HuCellDef);
  protected readonly templates = computed(() => new Map(this.cellDefs().map((d) => [d.key(), d.template])));

  protected readonly rows = computed(() => {
    const data = this.data();
    const { key, direction } = this.currentSort();
    if (this.sortMode() === 'server' || !key || !direction) return data;
    const column = this.columns().find((c) => c.key === key);
    if (!column) return data;
    const factor = direction === 'asc' ? 1 : -1;
    return [...data].sort((a, b) => compareValues(this.cellValue(a, column), this.cellValue(b, column)) * factor);
  });

  protected cellValue(row: T, column: HuColumn<T>): unknown {
    return column.value ? column.value(row) : (row as Record<string, unknown>)[column.key];
  }

  protected toggleSort(column: HuColumn<T>): void {
    const current = this.currentSort();
    if (current.key !== column.key || !current.direction) {
      this.sort.set({ key: column.key, direction: 'asc' });
    } else if (current.direction === 'asc') {
      this.sort.set({ key: column.key, direction: 'desc' });
    } else {
      this.sort.set({ key: '', direction: '' });
    }
  }

  protected sortIcon(column: HuColumn<T>): string {
    const { key, direction } = this.currentSort();
    if (key !== column.key || !direction) return 'chevrons-up-down';
    return direction === 'asc' ? 'arrow-up' : 'arrow-down';
  }

  protected ariaSort(column: HuColumn<T>): string | null {
    if (!column.sortable) return null;
    const { key, direction } = this.currentSort();
    if (key !== column.key || !direction) return 'none';
    return direction === 'asc' ? 'ascending' : 'descending';
  }

  protected onRowClick(row: T): void {
    if (this.clickableRows()) this.rowClick.emit(row);
  }
}
