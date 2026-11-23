import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  TemplateRef,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChild,
  contentChildren,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { HuButton } from '../button/button.component';
import { HuContextMenu } from '../context-menu/context-menu.service';
import { HuDropdownEntry, HuDropdownOption } from '../dropdown/dropdown.types';
import { HuCheckbox } from '../checkbox/checkbox.component';
import { HuIcon } from '../icon/icon.component';
import { HuPaginator } from '../paginator/paginator.component';
import { HuSpinner } from '../spinner/spinner.component';
import { huFold } from '../core/text';
import { huUniqueId } from '../core/unique-id';
import { HuColumn, HuSort, HuTableContextEvent, HuTableSelectionMode, HuTableSize, HuTableVariant } from './table.types';

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

/**
 * Açılır satır detayı. Verilince her satırın başında aç/kapa oku çıkar.
 * @example <ng-template huRowDetail [huRowDetailOf]="orders()" let-order>…</ng-template>
 */
@Directive({ selector: 'ng-template[huRowDetail]' })
export class HuRowDetail<T = any> {
  readonly of = input<readonly T[]>(undefined, { alias: 'huRowDetailOf' });
  readonly template = inject<TemplateRef<HuCellContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T>(_dir: HuRowDetail<T>, ctx: unknown): ctx is HuCellContext<T> {
    return true;
  }
}

/** Araç çubuğunun sağına kendi butonlarınız (Yeni ekle, filtre vb.). */
@Directive({ selector: '[huTableToolbar]', host: { class: 'hu-table__toolbar-slot' } })
export class HuTableToolbar {}

/** Satır seçiliyken araç çubuğunda görünen toplu işlem butonları. */
@Directive({ selector: '[huTableBulkActions]', host: { class: 'hu-table__bulk-slot' } })
export class HuTableBulkActions {}

const collator = new Intl.Collator('tr-TR', { numeric: true, sensitivity: 'base' });

function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  return collator.compare(String(a), String(b));
}

interface SavedState {
  hidden?: string[];
  order?: string[];
  pageSize?: number;
}

/**
 * Veri tablosu: sıralama, arama, sütun seçici, satır seçimi, açılır detay, sayfalama,
 * CSV dışa aktarma; dört görünüm (`default`, `bordered`, `card`, `minimal`).
 *
 * @example
 * <hu-table [data]="users()" [columns]="columns" variant="card" title="Kullanıcılar"
 *           searchable columnToggle exportable paginator selectionMode="multiple" [(selection)]="selected">
 *   <button huTableToolbar hu-button size="sm"><hu-icon name="plus" /> Yeni</button>
 *   <button huTableBulkActions hu-button size="sm" color="danger" (click)="remove(selected())">Sil</button>
 *   <ng-template huCell="status" let-user>…</ng-template>
 * </hu-table>
 */
@Component({
  selector: 'hu-table',
  imports: [NgTemplateOutlet, HuButton, HuCheckbox, HuContextMenu, HuIcon, HuPaginator, HuSpinner],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  host: {
    class: 'hu-table',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'effectiveSize()',
    '[attr.data-responsive]': 'responsive()',
    '[class.hu-table--striped]': 'striped()',
    '[class.hu-table--dense]': "effectiveSize() === 'sm'",
    '[class.hu-table--sticky]': 'stickyHeader()',
    '[class.hu-table--hoverable]': 'hoverable()',
    '[class.hu-table--nowrap]': 'nowrap()',
    '[style.--hu-table-leads]': 'leadColumns()',
    '(document:mousedown)': 'onDocumentPointer($event)',
    '(document:keydown.escape)': 'columnsOpen() && closeColumnsPanel(true)',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuTable<T = any> {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly doc = inject(DOCUMENT);

  // --- Veri -------------------------------------------------------------------------
  readonly data = input<readonly T[] | null | undefined>([]);
  readonly columns = input.required<HuColumn<T>[]>();
  readonly loading = input(false, { transform: booleanAttribute });
  readonly emptyText = input('Kayıt bulunamadı.');
  /** Satırın kimliği (seçim, açılır detay, yeniden çizim için). Örn. `(u) => u.id`. */
  readonly trackBy = input<(row: T) => unknown>((row: T) => row);
  /**
   * Veri sunucudan geliyorsa `true`: sıralama, arama ve sayfalama tabloda yapılmaz;
   * yalnızca `sort`, `search`, `pageIndex`, `pageSize` değişir. Toplam için `totalRecords` verin.
   */
  readonly lazy = input(false, { transform: booleanAttribute });
  readonly totalRecords = input<number | null>(null);
  /** @deprecated `lazy` kullanın. `server`: yalnızca `sort` değişir. */
  readonly sortMode = input<'client' | 'server'>('client');

  // --- Görünüm ----------------------------------------------------------------------
  /** `default` çizgili, `bordered` ızgara, `card` çerçeveli kutu, `minimal` sade. */
  readonly variant = input<HuTableVariant>('default');
  readonly size = input<HuTableSize>('md');
  readonly striped = input(false, { transform: booleanAttribute });
  /** @deprecated `size="sm"` kullanın. */
  readonly dense = input(false, { transform: booleanAttribute });
  readonly hoverable = input(true, { transform: booleanAttribute });
  /** Hücreler satır kırmasın: tablo genişler ve yatay kayar (geniş tablolar, sabit sütunlar). */
  readonly nowrap = input(false, { transform: booleanAttribute });
  readonly stickyHeader = input(false, { transform: booleanAttribute });
  /** Dar alanda (< 640px): `scroll` yatay kaydırır, `stack` her satırı kart olarak gösterir. */
  readonly responsive = input<'scroll' | 'stack'>('scroll');
  readonly clickableRows = input(false, { transform: booleanAttribute });

  // --- Araç çubuğu ------------------------------------------------------------------
  /** Araç çubuğunun solunda başlık. */
  readonly title = input<string>();
  readonly searchable = input(false, { transform: booleanAttribute });
  readonly searchPlaceholder = input('Tabloda ara…');
  /** Sütunları göster/gizle ve sırala. */
  readonly columnToggle = input(false, { transform: booleanAttribute });
  /** CSV indirme butonu (filtrelenmiş tüm satırlar, görünen sütunlar). */
  readonly exportable = input(false, { transform: booleanAttribute });
  readonly exportFileName = input('tablo');
  /** Verilirse gizlenen sütunlar, sütun sırası ve sayfa boyutu tarayıcıda saklanır. */
  readonly stateKey = input<string>();

  // --- Seçim, detay, sayfalama ------------------------------------------------------
  readonly selectionMode = input<HuTableSelectionMode>('none');
  readonly selection = model<T[]>([]);
  /** Açılır detayda aynı anda birden çok satır açık olabilir mi? */
  readonly multiExpand = input(true, { transform: booleanAttribute });
  readonly paginator = input(false, { transform: booleanAttribute });
  readonly pageIndex = model(0);
  readonly pageSize = model(10);
  readonly pageSizeOptions = input<number[]>([10, 25, 50]);

  // --- Modeller ----------------------------------------------------------------------
  readonly sort = model<HuSort>({ key: '', direction: '' });
  readonly search = model('');
  /** Gizli sütun anahtarları. Verilmezse `column.hidden` kullanılır. */
  readonly hiddenColumns = model<string[] | null>(null);
  /** Sütun sırası (anahtarlar). Verilmezse `columns` sırası. */
  readonly columnOrder = model<string[] | null>(null);

  readonly rowClick = output<T>();

  // --- Sağ tık menüsü ---------------------------------------------------------------
  /**
   * Satıra sağ tıklayınca (klavyede menü tuşu / Shift+F10, dokunmatikte uzun basma) açılan menü.
   * Sabit liste veya satıra göre liste döndüren fonksiyon. `null` → tarayıcının menüsü.
   */
  readonly contextMenu = input<readonly HuDropdownEntry<any>[] | ((row: T, rows: readonly T[]) => readonly HuDropdownEntry<any>[]) | null>(null);
  /** Menüden seçim: `rows`, seçili satırlardan birine tıklandıysa tüm seçim, değilse yalnızca `row`. */
  readonly contextMenuSelect = output<HuTableContextEvent<T>>();
  /** Menü açıkken vurgulanan satırın kimliği. */
  protected readonly contextKey = signal<unknown>(undefined);

  // --- İçerik --------------------------------------------------------------------------
  private readonly cellDefs = contentChildren(HuCellDef);
  protected readonly detail = contentChild(HuRowDetail);
  protected readonly toolbarSlot = contentChild(HuTableToolbar);
  protected readonly bulkSlot = contentChild(HuTableBulkActions);
  protected readonly templates = computed(() => new Map(this.cellDefs().map((d) => [d.key(), d.template])));

  protected readonly ids = { panel: huUniqueId('hu-table-cols'), search: huUniqueId('hu-table-search') };
  protected readonly columnsOpen = signal(false);
  private readonly expanded = signal<ReadonlySet<unknown>>(new Set());
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  // hu-button bir component olduğu için ElementRef açıkça istenir
  private readonly columnsButton = viewChild('columnsButton', { read: ElementRef<HTMLElement> });
  protected readonly supportsPopover = typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype;

  protected readonly effectiveSize = computed<HuTableSize>(() => (this.dense() ? 'sm' : this.size()));
  protected readonly isLazy = computed(() => this.lazy());
  protected readonly currentSort = computed<HuSort>(() => this.sort() ?? { key: '', direction: '' });
  protected readonly rowsData = computed(() => this.data() ?? []);

  /** Sütun seçicideki sıra (tüm sütunlar, gizliler dahil). */
  protected readonly orderedColumns = computed(() => {
    const columns = this.columns();
    const order = this.columnOrder();
    if (!order?.length) return columns;
    const byKey = new Map(columns.map((c) => [c.key, c]));
    const ordered = order.map((k) => byKey.get(k)).filter((c): c is HuColumn<T> => !!c);
    return [...ordered, ...columns.filter((c) => !order.includes(c.key))];
  });
  private readonly hiddenSet = computed(
    () => new Set(this.hiddenColumns() ?? this.columns().filter((c) => c.hidden).map((c) => c.key)),
  );
  /** Görünen sütunlar: sabit başlangıç sütunu öne, sabit bitiş sütunu sona. */
  protected readonly visibleColumns = computed(() => {
    const visible = this.orderedColumns().filter((c) => !this.hiddenSet().has(c.key));
    const start = visible.filter((c) => c.sticky === 'start');
    const end = visible.filter((c) => c.sticky === 'end');
    return [...start, ...visible.filter((c) => !c.sticky), ...end];
  });

  protected readonly hasSelection = computed(() => this.selectionMode() === 'multiple');
  protected readonly leadColumns = computed(() => (this.detail() ? 1 : 0) + (this.hasSelection() ? 1 : 0));
  protected readonly leadCells = computed(() => Array.from({ length: this.leadColumns() }));
  protected readonly colspan = computed(() => this.visibleColumns().length + this.leadColumns());
  protected readonly hasFooter = computed(() => this.visibleColumns().some((c) => c.footer != null));
  protected readonly showToolbar = computed(
    () =>
      !!this.title() ||
      this.searchable() ||
      this.columnToggle() ||
      this.exportable() ||
      !!this.toolbarSlot() ||
      (!!this.bulkSlot() && this.selected().length > 0),
  );

  /** Aranmış ve sıralanmış satırlar (sayfalamadan önce). */
  protected readonly filtered = computed(() => {
    let rows = this.rowsData();
    if (this.isLazy()) return rows;
    const q = huFold((this.search() ?? '').trim());
    if (q) {
      const cols = this.columns().filter((c) => c.searchable !== false);
      rows = rows.filter((row) => cols.some((c) => huFold(String(this.cellValue(row, c) ?? '')).includes(q)));
    }
    const { key, direction } = this.currentSort();
    if (this.sortMode() === 'server' || !key || !direction) return rows;
    const column = this.columns().find((c) => c.key === key);
    if (!column) return rows;
    const factor = direction === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => compareValues(this.cellValue(a, column), this.cellValue(b, column)) * factor);
  });
  protected readonly total = computed(() => (this.isLazy() ? (this.totalRecords() ?? this.rowsData().length) : this.filtered().length));
  /** Ekrandaki satırlar. */
  protected readonly rows = computed(() => {
    const rows = this.filtered();
    if (!this.paginator() || this.isLazy()) return rows;
    const start = this.pageIndex() * this.pageSize();
    return rows.slice(start, start + this.pageSize());
  });

  // --- Seçim -----------------------------------------------------------------------
  protected readonly selected = computed(() => this.selection() ?? []);
  private readonly selectedKeys = computed(() => new Set(this.selected().map((r) => this.trackBy()(r))));
  protected readonly pageAllSelected = computed(() => {
    const rows = this.rows();
    return rows.length > 0 && rows.every((r) => this.selectedKeys().has(this.trackBy()(r)));
  });
  protected readonly pageSomeSelected = computed(
    () => !this.pageAllSelected() && this.rows().some((r) => this.selectedKeys().has(this.trackBy()(r))),
  );

  constructor() {
    // Arama veya sayfa boyutu değişince ilk sayfaya dön (ilk açılışta verilen sayfaya dokunma);
    // sayfa sayısı küçüldüyse son sayfaya çek.
    let previous: [string, number] | null = null;
    effect(() => {
      const current: [string, number] = [this.search() ?? '', this.pageSize()];
      untracked(() => {
        const changed = previous && (previous[0] !== current[0] || previous[1] !== current[1]);
        previous = current;
        if (changed && this.pageIndex() !== 0) this.pageIndex.set(0);
      });
    });
    effect(() => {
      const total = this.total();
      untracked(() => {
        const last = Math.max(0, Math.ceil(total / this.pageSize()) - 1);
        if (this.pageIndex() > last) this.pageIndex.set(last);
      });
    });
    // Saklanmış durumu yükle / kaydet
    effect(() => {
      const key = this.stateKey();
      if (!key) return;
      untracked(() => this.restoreState(key));
    });
    effect(() => {
      const key = this.stateKey();
      const state: SavedState = { hidden: this.hiddenColumns() ?? undefined, order: this.columnOrder() ?? undefined, pageSize: this.pageSize() };
      if (key) untracked(() => this.saveState(key, state));
    });

    const reposition = () => this.columnsOpen() && this.positionPanel();
    const win = this.doc.defaultView;
    win?.addEventListener('resize', reposition);
    win?.addEventListener('scroll', reposition, true);
    inject(DestroyRef).onDestroy(() => {
      win?.removeEventListener('resize', reposition);
      win?.removeEventListener('scroll', reposition, true);
    });
  }

  // --- Hücreler --------------------------------------------------------------------
  protected cellValue(row: T, column: HuColumn<T>): unknown {
    return column.value ? column.value(row) : (row as Record<string, unknown>)?.[column.key];
  }

  protected footerValue(column: HuColumn<T>): unknown {
    const footer = column.footer;
    return typeof footer === 'function' ? footer(this.filtered()) : footer;
  }

  protected isSticky(column: HuColumn<T>, side: 'start' | 'end'): boolean {
    return column.sticky === side;
  }

  // --- Sıralama ----------------------------------------------------------------------
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

  // --- Satırlar ---------------------------------------------------------------------
  protected onRowClick(row: T, event: MouseEvent): void {
    // Satır içindeki buton, link, input tıklamaları satır olayı sayılmasın
    if ((event.target as HTMLElement).closest('button, a, input, select, textarea, label, [huRowStop]')) return;
    if (this.selectionMode() === 'single') {
      const key = this.trackBy()(row);
      this.selection.set(this.selectedKeys().has(key) ? [] : [row]);
    }
    if (this.clickableRows()) this.rowClick.emit(row);
  }

  protected isSelected(row: T): boolean {
    return this.selectedKeys().has(this.trackBy()(row));
  }

  protected toggleRow(row: T, checked: boolean): void {
    const key = this.trackBy()(row);
    const rest = this.selected().filter((r) => this.trackBy()(r) !== key);
    this.selection.set(checked ? [...rest, row] : rest);
  }

  protected togglePage(checked: boolean): void {
    const pageKeys = new Set(this.rows().map((r) => this.trackBy()(r)));
    const rest = this.selected().filter((r) => !pageKeys.has(this.trackBy()(r)));
    this.selection.set(checked ? [...rest, ...this.rows()] : rest);
  }

  /** Seçimi temizler. */
  clearSelection(): void {
    this.selection.set([]);
  }

  protected isExpanded(row: T): boolean {
    return this.expanded().has(this.trackBy()(row));
  }

  protected toggleExpand(row: T): void {
    const key = this.trackBy()(row);
    this.expanded.update((set) => {
      const next = new Set(this.multiExpand() ? set : []);
      if (set.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // --- Sağ tık menüsü -----------------------------------------------------------
  /** İşlemin uygulanacağı satırlar: seçili bir satırsa tüm seçim. */
  protected contextRows(row: T): readonly T[] {
    const selected = this.selected();
    return this.selectionMode() === 'multiple' && selected.length > 1 && this.isSelected(row) ? selected : [row];
  }

  protected rowMenu(row: T): readonly HuDropdownEntry<any>[] | null {
    const menu = this.contextMenu();
    return typeof menu === 'function' ? menu(row, this.contextRows(row)) : menu;
  }

  protected onContextSelect(option: HuDropdownOption<any>, row: T): void {
    this.contextMenuSelect.emit({ option, row, rows: this.contextRows(row) });
  }

  // --- Arama -------------------------------------------------------------------------
  protected onSearch(value: string): void {
    this.search.set(value);
  }

  // --- Sütun seçici -------------------------------------------------------------------
  protected isHidden(column: HuColumn<T>): boolean {
    return this.hiddenSet().has(column.key);
  }

  protected toggleColumn(column: HuColumn<T>, visible: boolean): void {
    if (column.hideable === false) return;
    const hidden = new Set(this.hiddenSet());
    if (visible) hidden.delete(column.key);
    else hidden.add(column.key);
    // En az bir sütun görünür kalsın
    if (hidden.size >= this.columns().length) return;
    this.hiddenColumns.set([...hidden]);
  }

  protected moveColumn(column: HuColumn<T>, direction: -1 | 1): void {
    const keys = this.orderedColumns().map((c) => c.key);
    const i = keys.indexOf(column.key);
    const j = i + direction;
    if (j < 0 || j >= keys.length) return;
    [keys[i], keys[j]] = [keys[j], keys[i]];
    this.columnOrder.set(keys);
    // Odak taşınan sütunda kalsın; en başa/sona geldiyse (buton pasif) diğer oka geç
    afterNextRender(
      () => {
        const row = this.panel()?.nativeElement.querySelector(`[data-col="${column.key}"]`);
        const same = row?.querySelector<HTMLButtonElement>(`[data-move="${direction}"]`);
        const other = row?.querySelector<HTMLButtonElement>(`[data-move="${-direction}"]`);
        (same && !same.disabled ? same : other)?.focus();
      },
      { injector: this.injector },
    );
  }

  /** Sütun görünürlüğünü ve sırasını varsayılana döndürür. */
  resetColumns(): void {
    this.hiddenColumns.set(null);
    this.columnOrder.set(null);
  }

  protected toggleColumnsPanel(): void {
    if (this.columnsOpen()) return this.closeColumnsPanel(true);
    this.columnsOpen.set(true);
    afterNextRender(
      () => {
        const panel = this.panel()?.nativeElement;
        if (!panel) return;
        if (this.supportsPopover) panel.showPopover();
        this.positionPanel();
        panel.querySelector<HTMLElement>('input, button')?.focus({ preventScroll: true });
      },
      { injector: this.injector },
    );
  }

  protected closeColumnsPanel(restoreFocus = false): void {
    if (!this.columnsOpen()) return;
    const panel = this.panel()?.nativeElement;
    if (panel && this.supportsPopover && panel.matches(':popover-open')) panel.hidePopover();
    this.columnsOpen.set(false);
    if (restoreFocus) this.columnsButton()?.nativeElement.focus();
  }

  protected onDocumentPointer(event: MouseEvent): void {
    if (!this.columnsOpen()) return;
    const target = event.target as Node;
    if (this.panel()?.nativeElement.contains(target) || this.columnsButton()?.nativeElement.contains(target)) return;
    this.closeColumnsPanel();
  }

  private positionPanel(): void {
    const panel = this.panel()?.nativeElement;
    const button = this.columnsButton()?.nativeElement;
    const win = this.doc.defaultView;
    if (!panel || !button || !win || !this.supportsPopover) return;
    const anchor = button.getBoundingClientRect();
    const { offsetWidth: width, offsetHeight: height } = panel;
    const below = anchor.bottom + 6;
    const top = below + height > win.innerHeight - 8 && anchor.top > height + 14 ? anchor.top - height - 6 : below;
    const left = Math.max(8, Math.min(anchor.right - width, win.innerWidth - width - 8));
    panel.style.top = `${top}px`;
    panel.style.left = `${left}px`;
  }

  // --- Dışa aktarma ---------------------------------------------------------------------
  /**
   * Filtrelenmiş tüm satırları (sayfalamadan bağımsız) görünen sütunlarla CSV olarak indirir.
   * Excel'in Türkçe ayarlarıyla açılsın diye `;` ayırıcı ve UTF-8 BOM kullanılır.
   */
  exportCsv(): void {
    const columns = this.visibleColumns().filter((c) => c.exportable !== false);
    const escape = (v: unknown) => {
      const s = v instanceof Date ? v.toLocaleDateString('tr-TR') : String(v ?? '');
      return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [
      columns.map((c) => escape(c.header)).join(';'),
      ...this.filtered().map((row) => columns.map((c) => escape(this.cellValue(row, c))).join(';')),
    ];
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = this.doc.createElement('a');
    a.href = url;
    a.download = `${this.exportFileName()}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url));
  }

  // --- Durum saklama -----------------------------------------------------------------
  private restoreState(key: string): void {
    try {
      const raw = this.doc.defaultView?.localStorage.getItem(`hu-table:${key}`);
      if (!raw) return;
      const state = JSON.parse(raw) as SavedState;
      if (Array.isArray(state.hidden)) this.hiddenColumns.set(state.hidden);
      if (Array.isArray(state.order)) this.columnOrder.set(state.order);
      if (typeof state.pageSize === 'number') this.pageSize.set(state.pageSize);
    } catch {
      // Bozuk veya erişilemeyen depolama: varsayılanlarla devam et
    }
  }

  private saveState(key: string, state: SavedState): void {
    try {
      this.doc.defaultView?.localStorage.setItem(`hu-table:${key}`, JSON.stringify(state));
    } catch {
      // Gizli pencere vb.: saklamadan devam et
    }
  }
}
