import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
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
} from '@angular/core';
import { HuAvatar } from '../avatar/avatar.component';
import { HuIcon } from '../icon/icon.component';

export type HuOrgChartKey = string | number;

export interface HuOrgChartNode<T = unknown> {
  key: HuOrgChartKey;
  /** Kişi / birim adı. */
  label: string;
  /** Unvan, görev veya alt bilgi. */
  title?: string;
  /** Fotoğraf. Yoksa `avatar: true` ile baş harfler gösterilir. */
  image?: string;
  avatar?: boolean;
  icon?: string;
  /** Kartın üst şeridi. */
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  children?: HuOrgChartNode<T>[];
  /** Seçilemez. */
  selectable?: boolean;
  data?: T;
}

interface NodeCtx<T> {
  $implicit: HuOrgChartNode<T>;
  selected: boolean;
  collapsed: boolean;
  level: number;
}

/** Düğüm kartı şablonu: `<ng-template huOrgChartNode let-node>` */
@Directive({ selector: 'ng-template[huOrgChartNode]' })
export class HuOrgChartNodeDef<T = unknown> {
  readonly of = input<HuOrgChartNode<T> | readonly HuOrgChartNode<T>[]>(undefined, { alias: 'huOrgChartNodeOf' });
  readonly template = inject<TemplateRef<NodeCtx<T>>>(TemplateRef);
  static ngTemplateContextGuard<T>(_d: HuOrgChartNodeDef<T>, ctx: unknown): ctx is NodeCtx<T> {
    return true;
  }
}

/**
 * Organizasyon şeması: hiyerarşik kart ağacı ve bağlantı çizgileri. Alt dallar katlanabilir,
 * düğümler (isteğe bağlı) seçilebilir; geniş şemalar yatay kaydırılır.
 *
 * @example
 * <hu-org-chart [value]="root" selectionMode="single" [(selection)]="picked" />
 */
@Component({
  selector: 'hu-org-chart',
  imports: [NgTemplateOutlet, HuAvatar, HuIcon],
  template: `
    <ng-template #branch let-nodes let-level="level">
      <ul class="hu-org-chart__level" [attr.aria-label]="level === 1 ? ariaLabel() : null">
        @for (node of nodes; track node.key) {
          @let open = !isCollapsed(node);
          @let selected = isSelected(node);
          @let kids = node.children?.length ?? 0;
          <li class="hu-org-chart__item">
            <div class="hu-org-chart__node-wrap">
              <div
                class="hu-org-chart__node"
                [class.hu-org-chart__node--selectable]="canSelect(node)"
                [class.hu-org-chart__node--selected]="selected"
                [attr.data-color]="node.color ?? null"
                [attr.tabindex]="canSelect(node) ? 0 : null"
                [attr.role]="canSelect(node) ? 'button' : null"
                [attr.aria-pressed]="canSelect(node) ? selected : null"
                (click)="select(node)"
                (keydown.enter)="select(node)"
                (keydown.space)="$event.preventDefault(); select(node)"
              >
                @if (template(); as tpl) {
                  <ng-container *ngTemplateOutlet="tpl.template; context: { $implicit: node, selected, collapsed: !open, level }" />
                } @else {
                  @if (node.image || node.avatar) {
                    <hu-avatar [name]="node.label" [src]="node.image" size="lg" />
                  } @else if (node.icon) {
                    <span class="hu-org-chart__icon"><hu-icon [name]="node.icon" [size]="18" /></span>
                  }
                  <span class="hu-org-chart__label">{{ node.label }}</span>
                  @if (node.title) {
                    <span class="hu-org-chart__title">{{ node.title }}</span>
                  }
                }
              </div>
              @if (kids && collapsible()) {
                <button
                  type="button"
                  class="hu-org-chart__toggle"
                  [attr.aria-label]="(open ? 'Alt birimleri gizle: ' : 'Alt birimleri göster: ') + node.label"
                  [attr.aria-expanded]="open"
                  (click)="toggle(node)"
                >
                  @if (open) {
                    <hu-icon name="minus" [size]="12" [strokeWidth]="3" />
                  } @else {
                    {{ kids }}
                  }
                </button>
              }
            </div>
            @if (kids && open) {
              <ng-container *ngTemplateOutlet="branch; context: { $implicit: node.children, level: level + 1 }" />
            }
          </li>
        }
      </ul>
    </ng-template>
    <div class="hu-org-chart__canvas">
      <ng-container *ngTemplateOutlet="branch; context: { $implicit: roots(), level: 1 }" />
    </div>
  `,
  styleUrl: './org-chart.component.scss',
  host: { class: 'hu-org-chart', '[attr.data-compact]': 'compact() || null' },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuOrgChart<T = unknown> {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    // Şema alandan genişse kök ortada görünsün (kaydırma ortadan başlar)
    afterNextRender(() => {
      const el = this.host.nativeElement;
      if (el.scrollWidth > el.clientWidth) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    });
  }

  /** Kök düğüm veya birden çok kök. */
  readonly value = input<HuOrgChartNode<T> | readonly HuOrgChartNode<T>[] | null>(null);
  readonly selectionMode = input<'none' | 'single' | 'multiple'>('none');
  readonly selection = model<HuOrgChartKey[]>([]);
  /** Katlanmış düğüm anahtarları. */
  readonly collapsed = model<HuOrgChartKey[]>([]);
  /** Alt dalları katlama düğmesi. */
  readonly collapsible = input(true, { transform: booleanAttribute });
  /** Daha dar kartlar ve aralıklar. */
  readonly compact = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input('Organizasyon şeması');

  readonly nodeSelect = output<HuOrgChartNode<T>>();
  readonly nodeUnselect = output<HuOrgChartNode<T>>();

  protected readonly template = contentChild(HuOrgChartNodeDef);
  protected readonly roots = computed<readonly HuOrgChartNode<T>[]>(() => {
    const v = this.value();
    return v ? (Array.isArray(v) ? v : [v as HuOrgChartNode<T>]) : [];
  });
  private readonly collapsedSet = computed(() => new Set(this.collapsed() ?? []));
  private readonly selectedSet = computed(() => new Set(this.selection() ?? []));

  protected isCollapsed(node: HuOrgChartNode<T>): boolean {
    return this.collapsedSet().has(node.key);
  }

  protected isSelected(node: HuOrgChartNode<T>): boolean {
    return this.selectedSet().has(node.key);
  }

  protected canSelect(node: HuOrgChartNode<T>): boolean {
    return this.selectionMode() !== 'none' && node.selectable !== false;
  }

  toggle(node: HuOrgChartNode<T>): void {
    const list = this.collapsed() ?? [];
    this.collapsed.set(this.isCollapsed(node) ? list.filter((k) => k !== node.key) : [...list, node.key]);
  }

  expandAll(): void {
    this.collapsed.set([]);
  }

  /** Belirtilen seviyeden (1 = kök) sonrasını katlar. */
  collapseFrom(level = 2): void {
    const keys: HuOrgChartKey[] = [];
    const walk = (nodes: readonly HuOrgChartNode<T>[], l: number) =>
      nodes.forEach((n) => {
        if (n.children?.length) {
          if (l >= level) keys.push(n.key);
          walk(n.children, l + 1);
        }
      });
    walk(this.roots(), 1);
    this.collapsed.set(keys);
  }

  protected select(node: HuOrgChartNode<T>): void {
    if (!this.canSelect(node)) return;
    const was = this.isSelected(node);
    if (this.selectionMode() === 'single') this.selection.set(was ? [] : [node.key]);
    else {
      const list = this.selection() ?? [];
      this.selection.set(was ? list.filter((k) => k !== node.key) : [...list, node.key]);
    }
    if (was) this.nodeUnselect.emit(node);
    else this.nodeSelect.emit(node);
  }
}
