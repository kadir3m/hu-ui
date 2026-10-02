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
import { HuButton } from '../button/button.component';
import { HuIcon } from '../icon/icon.component';
import { huFold } from '../core/text';
import { huUniqueId } from '../core/unique-id';

type Side = 'source' | 'target';

interface ItemCtx<T> {
  $implicit: T;
  side: Side;
  selected: boolean;
}

/** Öğe şablonu: `<ng-template huPickListItem let-item>` */
@Directive({ selector: 'ng-template[huPickListItem]' })
export class HuPickListItem<T = unknown> {
  readonly of = input<readonly T[]>(undefined, { alias: 'huPickListItemOf' });
  readonly template = inject<TemplateRef<ItemCtx<T>>>(TemplateRef);
  static ngTemplateContextGuard<T>(_d: HuPickListItem<T>, ctx: unknown): ctx is ItemCtx<T> {
    return true;
  }
}

export interface HuPickListMoveEvent<T> {
  items: T[];
  from: Side;
  to: Side;
}

/**
 * İki liste arasında öğe taşıma: ders seçimi, yetki atama, sütun seçimi. Ctrl/Shift ile çoklu
 * seçim, çift tıkla taşıma, liste başına arama ve (isteğe bağlı) sıralama düğmeleri.
 *
 * @example
 * <hu-picklist [(source)]="available" [(target)]="selected" optionLabel="name" filter />
 */
@Component({
  selector: 'hu-picklist',
  imports: [NgTemplateOutlet, HuButton, HuIcon],
  templateUrl: './picklist.component.html',
  styleUrl: './picklist.component.scss',
  host: { class: 'hu-picklist', '[attr.data-disabled]': 'disabled() || null' },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuPickList<T = unknown> {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  readonly source = model<T[]>([]);
  readonly target = model<T[]>([]);
  readonly sourceHeader = input('Seçilebilir');
  readonly targetHeader = input('Seçilen');
  /** Öğe etiketi alanı (nesnelerde) veya fonksiyon. Verilmezse `String(item)`. */
  readonly optionLabel = input<string | ((item: T) => string) | null>(null);
  /** Takip anahtarı alanı (verilmezse nesnenin kendisi). */
  readonly dataKey = input<string | null>(null);
  readonly filter = input(false, { transform: booleanAttribute });
  readonly filterPlaceholder = input('Ara…');
  /** Hedef listede yukarı / aşağı sıralama düğmeleri. */
  readonly reorder = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Liste yüksekliği (CSS). */
  readonly listHeight = input('16rem');
  readonly emptyMessage = input('Öğe yok');

  readonly moved = output<HuPickListMoveEvent<T>>();

  protected readonly template = contentChild(HuPickListItem);
  protected readonly id = huUniqueId('hu-picklist');
  protected readonly sides: readonly Side[] = ['source', 'target'];
  protected readonly query = signal<Record<Side, string>>({ source: '', target: '' });
  protected readonly selected = signal<Record<Side, ReadonlySet<unknown>>>({ source: new Set(), target: new Set() });
  protected readonly active = signal<Record<Side, unknown>>({ source: null, target: null });
  private anchor: Record<Side, unknown> = { source: null, target: null };

  protected readonly visible = computed<Record<Side, T[]>>(() => ({
    source: this.filtered('source'),
    target: this.filtered('target'),
  }));

  protected listOf(side: Side): T[] {
    return (side === 'source' ? this.source() : this.target()) ?? [];
  }

  private filtered(side: Side): T[] {
    const q = huFold(this.query()[side].trim());
    const list = this.listOf(side);
    return q ? list.filter((item) => huFold(this.labelOf(item)).includes(q)) : list;
  }

  protected labelOf(item: T): string {
    const l = this.optionLabel();
    if (typeof l === 'function') return l(item);
    if (l && item && typeof item === 'object') return String((item as Record<string, unknown>)[l] ?? '');
    return String(item ?? '');
  }

  protected keyOf(item: T): unknown {
    const k = this.dataKey();
    return k && item && typeof item === 'object' ? (item as Record<string, unknown>)[k] : item;
  }

  protected isSelected(side: Side, item: T): boolean {
    return this.selected()[side].has(this.keyOf(item));
  }

  protected selectedCount(side: Side): number {
    return this.selected()[side].size;
  }

  protected optionId(side: Side, index: number): string {
    return `${this.id}-${side}-${index}`;
  }

  /** Klavye odağındaki öğenin görünür listedeki sırası. */
  protected activeIndex(side: Side): number {
    const a = this.active()[side];
    const list = this.visible()[side];
    const i = list.findIndex((item) => this.keyOf(item) === a);
    return i >= 0 ? i : list.length ? 0 : -1;
  }

  // --- Seçim -----------------------------------------------------------------------------
  protected onItemClick(side: Side, item: T, event: MouseEvent): void {
    if (this.disabled()) return;
    const key = this.keyOf(item);
    const set = new Set(this.selected()[side]);
    if (event.shiftKey && this.anchor[side] !== null) {
      const list = this.visible()[side];
      const a = list.findIndex((i) => this.keyOf(i) === this.anchor[side]);
      const b = list.findIndex((i) => this.keyOf(i) === key);
      if (!event.ctrlKey && !event.metaKey) set.clear();
      list.slice(Math.min(a, b), Math.max(a, b) + 1).forEach((i) => set.add(this.keyOf(i)));
    } else if (event.ctrlKey || event.metaKey) {
      if (set.has(key)) set.delete(key);
      else set.add(key);
      this.anchor[side] = key;
    } else {
      // Tek tıkla seçimi aç / kapat (dokunmatikte de çoklu seçim mümkün olsun)
      if (set.has(key)) set.delete(key);
      else set.add(key);
      this.anchor[side] = key;
    }
    this.setSelected(side, set);
    this.active.update((a) => ({ ...a, [side]: key }));
  }

  protected onItemDblClick(side: Side, item: T): void {
    if (this.disabled()) return;
    this.transfer(side, [item]);
  }

  protected onListKeydown(side: Side, event: KeyboardEvent): void {
    if (this.disabled()) return;
    const list = this.visible()[side];
    if (!list.length) return;
    let i = this.activeIndex(side);
    switch (event.key) {
      case 'ArrowDown':
        i = Math.min(list.length - 1, i + 1);
        break;
      case 'ArrowUp':
        i = Math.max(0, i - 1);
        break;
      case 'Home':
        i = 0;
        break;
      case 'End':
        i = list.length - 1;
        break;
      case ' ': {
        const key = this.keyOf(list[i]);
        const set = new Set(this.selected()[side]);
        if (set.has(key)) set.delete(key);
        else set.add(key);
        this.anchor[side] = key;
        this.setSelected(side, set);
        event.preventDefault();
        return;
      }
      case 'Enter':
        event.preventDefault();
        if (this.selectedCount(side)) this.moveSelected(side);
        else this.transfer(side, [list[i]]);
        return;
      case 'a':
        if (event.ctrlKey || event.metaKey) {
          this.setSelected(side, new Set(list.map((x) => this.keyOf(x))));
          event.preventDefault();
        }
        return;
      default:
        return;
    }
    event.preventDefault();
    const key = this.keyOf(list[i]);
    this.active.update((a) => ({ ...a, [side]: key }));
    if (event.shiftKey) {
      const set = new Set(this.selected()[side]);
      set.add(key);
      this.setSelected(side, set);
    }
    this.scrollActive(side);
  }

  protected onQuery(side: Side, value: string): void {
    this.query.update((q) => ({ ...q, [side]: value }));
  }

  private setSelected(side: Side, set: ReadonlySet<unknown>): void {
    this.selected.update((s) => ({ ...s, [side]: set }));
  }

  // --- Taşıma ----------------------------------------------------------------------------
  /** Seçili öğeleri karşı listeye taşır. */
  moveSelected(from: Side): void {
    const set = this.selected()[from];
    this.transfer(
      from,
      this.listOf(from).filter((i) => set.has(this.keyOf(i))),
    );
  }

  /** Görünen (aramaya uyan) tüm öğeleri karşı listeye taşır. */
  moveAll(from: Side): void {
    this.transfer(from, this.visible()[from]);
  }

  private transfer(from: Side, items: T[]): void {
    if (!items.length || this.disabled()) return;
    const to: Side = from === 'source' ? 'target' : 'source';
    const keys = new Set(items.map((i) => this.keyOf(i)));
    const rest = this.listOf(from).filter((i) => !keys.has(this.keyOf(i)));
    const dest = [...this.listOf(to), ...items];
    (from === 'source' ? this.source : this.target).set(rest);
    (to === 'source' ? this.source : this.target).set(dest);
    // Taşınan öğeler karşı tarafta seçili kalsın (geri almak kolay olsun)
    this.selected.set(from === 'source' ? { source: new Set(), target: keys } : { source: keys, target: new Set() });
    this.moved.emit({ items, from, to });
  }

  /** Hedef listede seçili öğeleri yukarı / aşağı kaydırır. */
  protected move(direction: 'top' | 'up' | 'down' | 'bottom'): void {
    const set = this.selected().target;
    const list = [...this.listOf('target')];
    if (!set.size) return;
    const picked = list.filter((i) => set.has(this.keyOf(i)));
    const others = list.filter((i) => !set.has(this.keyOf(i)));
    let next: T[];
    if (direction === 'top') next = [...picked, ...others];
    else if (direction === 'bottom') next = [...others, ...picked];
    else {
      next = list;
      const step = direction === 'up' ? -1 : 1;
      const order = direction === 'up' ? next.map((_, i) => i) : next.map((_, i) => next.length - 1 - i);
      for (const i of order) {
        const j = i + step;
        if (j < 0 || j >= next.length) continue;
        if (set.has(this.keyOf(next[i])) && !set.has(this.keyOf(next[j]))) [next[i], next[j]] = [next[j], next[i]];
      }
    }
    this.target.set(next);
    this.scrollActive('target');
  }

  protected canReorder(direction: 'up' | 'down'): boolean {
    const set = this.selected().target;
    const list = this.listOf('target');
    if (!set.size) return false;
    const idx = list.map((i, n) => (set.has(this.keyOf(i)) ? n : -1)).filter((n) => n >= 0);
    // Seçililer zaten en üstte / en altta toplu duruyorsa devre dışı
    return direction === 'up' ? idx.some((n, k) => n !== k) : idx.some((n, k) => n !== list.length - idx.length + k);
  }

  private scrollActive(side: Side): void {
    afterNextRender(
      () => {
        const el = this.host.nativeElement.querySelector<HTMLElement>(`#${CSS.escape(this.optionId(side, this.activeIndex(side)))}`);
        el?.scrollIntoView({ block: 'nearest' });
      },
      { injector: this.injector },
    );
  }
}
