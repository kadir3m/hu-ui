import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  Injector,
  TemplateRef,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { HuIcon } from '../icon/icon.component';
import { huFold } from '../core/text';
import { huUniqueId } from '../core/unique-id';

export type HuTreeKey = string | number;

export interface HuTreeNode<T = unknown> {
  key: HuTreeKey;
  label: string;
  icon?: string;
  /** Açıkken ikon (örn. klasör açık). */
  expandedIcon?: string;
  children?: HuTreeNode<T>[];
  /** `false` ve `children` yoksa: açılınca `loadChildren` ile yüklenir. */
  leaf?: boolean;
  disabled?: boolean;
  /** Seçilemez (yalnızca açılır / kapanır). */
  selectable?: boolean;
  data?: T;
}

export type HuTreeSelectionMode = 'none' | 'single' | 'multiple' | 'checkbox';

interface Row<T> {
  node: HuTreeNode<T>;
  level: number;
  parent: HuTreeNode<T> | null;
  posinset: number;
  setsize: number;
  hasChildren: boolean;
}

interface NodeCtx<T> {
  $implicit: HuTreeNode<T>;
  level: number;
  expanded: boolean;
}

/** Düğüm içeriği şablonu: `<ng-template huTreeNode let-node>` */
@Directive({ selector: 'ng-template[huTreeNode]' })
export class HuTreeNodeDef<T = unknown> {
  readonly of = input<readonly HuTreeNode<T>[]>(undefined, { alias: 'huTreeNodeOf' });
  readonly template = inject<TemplateRef<NodeCtx<T>>>(TemplateRef);
  static ngTemplateContextGuard<T>(_d: HuTreeNodeDef<T>, ctx: unknown): ctx is NodeCtx<T> {
    return true;
  }
}

/**
 * Ağaç: klasörler, birim hiyerarşisi, menü yetkileri. Tekli / çoklu / onay kutulu seçim
 * (kısmi seçim üst düğümlere yayılır), arama (eşleşenlerin üstleri açılır), tembel yükleme,
 * tam klavye desteği (↑/↓/←/→, Home/End, Enter/Boşluk, harfle atlama).
 *
 * @example
 * <hu-tree [nodes]="units" selectionMode="checkbox" [(selection)]="selectedKeys" filter />
 */
@Component({
  selector: 'hu-tree',
  imports: [NgTemplateOutlet, HuIcon],
  templateUrl: './tree.component.html',
  styleUrl: './tree.component.scss',
  host: { class: 'hu-tree', '[attr.data-selection]': 'selectionMode()' },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuTree<T = unknown> {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  readonly nodes = input<readonly HuTreeNode<T>[]>([]);
  readonly selectionMode = input<HuTreeSelectionMode>('none');
  /** Seçili düğüm anahtarları. Onay kutulu modda üst düğümler de (tamamı seçiliyse) eklenir. */
  readonly selection = model<HuTreeKey[]>([]);
  /** Açık düğüm anahtarları. */
  readonly expanded = model<HuTreeKey[]>([]);
  /** Arama kutusu. */
  readonly filter = input(false, { transform: booleanAttribute });
  readonly filterPlaceholder = input('Ara…');
  /** Onay kutulu modda seçim alt / üst düğümlere yayılsın. */
  readonly propagate = input(true, { transform: booleanAttribute });
  /** Tembel yükleme: `leaf: false` olan düğüm açılınca çağrılır. */
  readonly loadChildren = input<((node: HuTreeNode<T>) => Promise<HuTreeNode<T>[]>) | null>(null);
  readonly ariaLabel = input('Ağaç');
  readonly emptyMessage = input('Sonuç bulunamadı');

  readonly nodeSelect = output<HuTreeNode<T>>();
  readonly nodeUnselect = output<HuTreeNode<T>>();
  readonly nodeExpand = output<HuTreeNode<T>>();
  readonly nodeCollapse = output<HuTreeNode<T>>();

  protected readonly template = contentChild(HuTreeNodeDef);
  protected readonly query = signal('');
  protected readonly focusedKey = signal<HuTreeKey | null>(null);
  protected readonly loading = signal<ReadonlySet<HuTreeKey>>(new Set());
  /** Tembel yüklenen alt düğümler. */
  private readonly loaded = signal<ReadonlyMap<HuTreeKey, HuTreeNode<T>[]>>(new Map());
  protected readonly id = huUniqueId('hu-tree');
  private typeahead = '';
  private typeaheadTimer?: ReturnType<typeof setTimeout>;

  private readonly selectedSet = computed(() => new Set(this.selection() ?? []));
  private readonly expandedSet = computed(() => new Set(this.expanded() ?? []));

  protected childrenOf(node: HuTreeNode<T>): HuTreeNode<T>[] | undefined {
    return node.children ?? this.loaded().get(node.key);
  }

  protected hasChildren(node: HuTreeNode<T>): boolean {
    const children = this.childrenOf(node);
    return children ? children.length > 0 : node.leaf === false;
  }

  /** Aramada: eşleşen düğümler ve onlara giden yol. */
  private readonly matches = computed(() => {
    const q = huFold(this.query().trim());
    if (!q) return null;
    const keep = new Set<HuTreeKey>();
    const open = new Set<HuTreeKey>();
    const visit = (node: HuTreeNode<T>): boolean => {
      const self = huFold(node.label).includes(q);
      let child = false;
      for (const c of this.childrenOf(node) ?? []) if (visit(c)) child = true;
      if (self || child) keep.add(node.key);
      if (child) open.add(node.key);
      return self || child;
    };
    this.nodes().forEach(visit);
    return { keep, open };
  });

  /** Görünen satırlar (açık düğümler ve arama dikkate alınır). */
  protected readonly rows = computed<Row<T>[]>(() => {
    const out: Row<T>[] = [];
    const m = this.matches();
    const expanded = this.expandedSet();
    const walk = (list: readonly HuTreeNode<T>[], level: number, parent: HuTreeNode<T> | null) => {
      const shown = m ? list.filter((n) => m.keep.has(n.key)) : list;
      shown.forEach((node, i) => {
        const hasChildren = this.hasChildren(node);
        out.push({ node, level, parent, posinset: i + 1, setsize: shown.length, hasChildren });
        const open = m ? m.open.has(node.key) || (expanded.has(node.key) && hasChildren) : expanded.has(node.key);
        if (open) walk(this.childrenOf(node) ?? [], level + 1, node);
      });
    };
    walk(this.nodes(), 1, null);
    return out;
  });

  /** Klavye odağı: seçili / önceki odak yoksa ilk satır. */
  protected readonly tabStop = computed(() => {
    const rows = this.rows();
    const f = this.focusedKey();
    if (f !== null && rows.some((r) => r.node.key === f)) return f;
    const sel = rows.find((r) => this.selectedSet().has(r.node.key));
    return (sel ?? rows[0])?.node.key ?? null;
  });

  // --- Durum --------------------------------------------------------------------------
  protected isExpanded(row: Row<T>): boolean {
    const m = this.matches();
    return row.hasChildren && (m ? m.open.has(row.node.key) || this.expandedSet().has(row.node.key) : this.expandedSet().has(row.node.key));
  }

  protected isSelected(node: HuTreeNode<T>): boolean {
    return this.selectedSet().has(node.key);
  }

  /** Onay kutusunda kısmi: bazı alt düğümler seçili. */
  protected isPartial(node: HuTreeNode<T>): boolean {
    if (this.selectionMode() !== 'checkbox' || !this.propagate() || this.isSelected(node)) return false;
    const sel = this.selectedSet();
    const any = (n: HuTreeNode<T>): boolean => (this.childrenOf(n) ?? []).some((c) => sel.has(c.key) || any(c));
    return any(node);
  }

  protected canSelect(node: HuTreeNode<T>): boolean {
    return this.selectionMode() !== 'none' && !node.disabled && node.selectable !== false;
  }

  // --- Açma / kapama ----------------------------------------------------------------------
  async toggle(node: HuTreeNode<T>): Promise<void> {
    if (this.expandedSet().has(node.key)) this.collapse(node);
    else await this.expand(node);
  }

  async expand(node: HuTreeNode<T>): Promise<void> {
    if (!this.hasChildren(node) || this.expandedSet().has(node.key)) return;
    this.expanded.set([...(this.expanded() ?? []), node.key]);
    this.nodeExpand.emit(node);
    const load = this.loadChildren();
    if (!this.childrenOf(node) && load && !this.loading().has(node.key)) {
      this.loading.update((s) => new Set(s).add(node.key));
      try {
        const children = await load(node);
        this.loaded.update((m) => new Map(m).set(node.key, children));
      } finally {
        this.loading.update((s) => {
          const n = new Set(s);
          n.delete(node.key);
          return n;
        });
      }
    }
  }

  collapse(node: HuTreeNode<T>): void {
    if (!this.expandedSet().has(node.key)) return;
    this.expanded.set((this.expanded() ?? []).filter((k) => k !== node.key));
    this.nodeCollapse.emit(node);
  }

  /** Tüm (yüklenmiş) dalları açar. */
  expandAll(): void {
    const keys: HuTreeKey[] = [];
    const walk = (list: readonly HuTreeNode<T>[]) =>
      list.forEach((n) => {
        if (this.childrenOf(n)?.length) {
          keys.push(n.key);
          walk(this.childrenOf(n)!);
        }
      });
    walk(this.nodes());
    this.expanded.set(keys);
  }

  collapseAll(): void {
    this.expanded.set([]);
  }

  // --- Seçim ------------------------------------------------------------------------------
  protected select(node: HuTreeNode<T>): void {
    if (!this.canSelect(node)) return;
    const mode = this.selectionMode();
    const was = this.isSelected(node);
    if (mode === 'single') {
      this.selection.set(was ? [] : [node.key]);
    } else if (mode === 'multiple') {
      this.selection.set(was ? (this.selection() ?? []).filter((k) => k !== node.key) : [...(this.selection() ?? []), node.key]);
    } else if (mode === 'checkbox') {
      this.selection.set(this.propagate() ? this.propagateCheck(node, !was) : was ? (this.selection() ?? []).filter((k) => k !== node.key) : [...(this.selection() ?? []), node.key]);
    }
    if (was) this.nodeUnselect.emit(node);
    else this.nodeSelect.emit(node);
  }

  /** Düğümü ve alt ağacını işaretle; üst düğümleri "hepsi seçili mi" kuralına göre güncelle. */
  private propagateCheck(node: HuTreeNode<T>, checked: boolean): HuTreeKey[] {
    const sel = new Set(this.selection() ?? []);
    const down = (n: HuTreeNode<T>) => {
      if (!n.disabled) {
        if (checked) sel.add(n.key);
        else sel.delete(n.key);
      }
      (this.childrenOf(n) ?? []).forEach(down);
    };
    down(node);
    // Üst düğümleri kökten aşağı değil, yoldan yukarı güncelle
    const path = this.pathTo(node.key);
    for (let i = path.length - 2; i >= 0; i--) {
      const parent = path[i];
      const children = (this.childrenOf(parent) ?? []).filter((c) => !c.disabled);
      if (children.length && children.every((c) => sel.has(c.key))) sel.add(parent.key);
      else sel.delete(parent.key);
    }
    return [...sel];
  }

  private pathTo(key: HuTreeKey): HuTreeNode<T>[] {
    const find = (list: readonly HuTreeNode<T>[], trail: HuTreeNode<T>[]): HuTreeNode<T>[] | null => {
      for (const n of list) {
        const next = [...trail, n];
        if (n.key === key) return next;
        const found = find(this.childrenOf(n) ?? [], next);
        if (found) return found;
      }
      return null;
    };
    return find(this.nodes(), []) ?? [];
  }

  // --- Olaylar -------------------------------------------------------------------------------
  protected onRowClick(row: Row<T>, event: MouseEvent): void {
    this.focusedKey.set(row.node.key);
    if ((event.target as HTMLElement).closest('.hu-tree__toggle')) {
      void this.toggle(row.node);
      return;
    }
    if (this.canSelect(row.node)) this.select(row.node);
    else if (row.hasChildren) void this.toggle(row.node);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const rows = this.rows();
    const i = rows.findIndex((r) => r.node.key === this.tabStop());
    if (i < 0) return;
    const row = rows[i];
    let target = -1;
    switch (event.key) {
      case 'ArrowDown':
        target = Math.min(rows.length - 1, i + 1);
        break;
      case 'ArrowUp':
        target = Math.max(0, i - 1);
        break;
      case 'Home':
        target = 0;
        break;
      case 'End':
        target = rows.length - 1;
        break;
      case 'ArrowRight':
        if (row.hasChildren && !this.isExpanded(row)) void this.expand(row.node);
        else if (row.hasChildren) target = i + 1;
        break;
      case 'ArrowLeft':
        if (this.isExpanded(row)) this.collapse(row.node);
        else if (row.parent) target = rows.findIndex((r) => r.node.key === row.parent!.key);
        break;
      case 'Enter':
      case ' ':
        if (this.canSelect(row.node)) this.select(row.node);
        else if (row.hasChildren) void this.toggle(row.node);
        break;
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          target = this.findByTypeahead(rows, event.key, i);
          if (target < 0) return;
        } else return;
    }
    event.preventDefault();
    if (target >= 0) this.focusRow(rows[target].node.key);
  }

  protected onQuery(value: string): void {
    this.query.set(value);
  }

  /** Arama eşleşmesini vurgulamak için etiketi parçalara böler. */
  protected parts(label: string): { text: string; hit: boolean }[] {
    const q = huFold(this.query().trim());
    if (!q) return [{ text: label, hit: false }];
    const folded = huFold(label);
    const at = folded.indexOf(q);
    // Türkçe karakterlerde uzunluk korunur (huFold harf başına bir harf üretir)
    if (at < 0 || folded.length !== label.length) return [{ text: label, hit: false }];
    return [
      { text: label.slice(0, at), hit: false },
      { text: label.slice(at, at + q.length), hit: true },
      { text: label.slice(at + q.length), hit: false },
    ].filter((p) => p.text);
  }

  protected rowId(key: HuTreeKey): string {
    return `${this.id}-${String(key).replace(/[^\w-]/g, '_')}`;
  }

  private focusRow(key: HuTreeKey): void {
    this.focusedKey.set(key);
    afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>(`#${CSS.escape(this.rowId(key))}`)?.focus(), {
      injector: this.injector,
    });
  }

  private findByTypeahead(rows: Row<T>[], key: string, from: number): number {
    clearTimeout(this.typeaheadTimer);
    this.typeahead += key.toLocaleLowerCase('tr-TR');
    this.typeaheadTimer = setTimeout(() => (this.typeahead = ''), 500);
    for (let k = 1; k <= rows.length; k++) {
      const idx = (from + k) % rows.length;
      if (rows[idx].node.label.toLocaleLowerCase('tr-TR').startsWith(this.typeahead)) return idx;
    }
    return -1;
  }
}
