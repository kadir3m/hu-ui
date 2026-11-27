import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  DoCheck,
  DOCUMENT,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  linkedSignal,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl, ValidationErrors } from '@angular/forms';
import { HuIcon } from '../icon/icon.component';
import { huUniqueId } from '../core/unique-id';
import { HU_FORM_FIELD, HuFormFieldControl } from '../form-field/form-field.tokens';
import { HuInputSize } from '../form-field/input.directive';
import { HuTree, HuTreeKey, HuTreeNode } from './tree.component';

export type HuTreeSelectMode = 'single' | 'multiple' | 'checkbox';
/** Tek seçimde anahtar (veya null), çoklu / onay kutulu seçimde anahtar dizisi. */
export type HuTreeSelectValue = HuTreeKey | HuTreeKey[] | null;

/**
 * Ağaçtan seçim kutusu: birim, kategori, klasör seçimi. Açılan panelde `hu-tree` kullanılır
 * (arama, tembel yükleme, klavye). Tekli seçimde değer anahtar, çoklu ve onay kutulu seçimde
 * anahtar dizisidir. Onay kutulu modda tamamı seçili dallar tek çiple gösterilir.
 *
 * @example
 * <hu-form-field label="Birim">
 *   <hu-tree-select formControlName="unit" [nodes]="units" placeholder="Birim seçin" filter />
 * </hu-form-field>
 */
@Component({
  selector: 'hu-tree-select',
  imports: [HuIcon, HuTree],
  templateUrl: './tree-select.component.html',
  styleUrl: './tree-select.component.scss',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HuTreeSelect), multi: true },
    { provide: HuFormFieldControl, useExisting: forwardRef(() => HuTreeSelect) },
  ],
  host: {
    class: 'hu-tree-select',
    '[class.hu-tree-select--open]': 'open()',
    '[class.hu-tree-select--disabled]': 'isDisabled()',
    '[attr.data-size]': 'size()',
    '(focusout)': 'onFocusOut($event)',
    '(document:mousedown)': 'onDocumentPointer($event)',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuTreeSelect<T = unknown> implements ControlValueAccessor, HuFormFieldControl, DoCheck {
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly win = inject(DOCUMENT).defaultView;
  protected readonly field = inject(HU_FORM_FIELD, { optional: true, host: true });

  readonly nodes = input<readonly HuTreeNode<T>[]>([]);
  readonly selectionMode = input<HuTreeSelectMode>('single');
  readonly valueInput = input<HuTreeSelectValue>(null, { alias: 'value' });
  /** Yalnızca kullanıcı değiştirince yayılır; form (writeValue) güncellemeleri yaymaz. */
  readonly valueChange = output<HuTreeSelectValue>();
  /** Geçerli değer: bağlamadan, formdan veya kullanıcıdan gelir. */
  readonly value = linkedSignal(() => this.valueInput());
  readonly placeholder = input('Seçin');
  /** Panelde arama kutusu. */
  readonly filter = input(false, { transform: booleanAttribute });
  readonly filterPlaceholder = input('Ara…');
  /** Onay kutulu modda seçim alt / üst düğümlere yayılır. */
  readonly propagate = input(true, { transform: booleanAttribute });
  /** Tembel yükleme: `leaf: false` olan düğüm açılınca çağrılır. */
  readonly loadChildren = input<((node: HuTreeNode<T>) => Promise<HuTreeNode<T>[]>) | null>(null);
  /** Seçilenler çip olarak mı, virgüllü metin olarak mı. */
  readonly display = input<'chips' | 'text'>('chips');
  /** Bundan fazla seçimde "5 seçildi" yazılır. */
  readonly maxSelectedLabels = input(3, { transform: numberAttribute });
  /** Tek seçimde etiketin önüne üst düğümleri ekler: "Mühendislik / Bilgisayar". */
  readonly showPath = input(false, { transform: booleanAttribute });
  readonly showClear = input(true, { transform: booleanAttribute });
  readonly emptyMessage = input('Sonuç bulunamadı');
  /** Panelin en büyük yüksekliği (CSS). */
  readonly panelHeight = input('18rem');
  readonly size = input<HuInputSize>('md');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string>();
  readonly id = input(huUniqueId('hu-tree-select'));

  readonly nodeSelect = output<HuTreeNode<T>>();
  readonly nodeUnselect = output<HuTreeNode<T>>();
  /** Panel kapandığında. */
  readonly closed = output<void>();

  protected readonly open = signal(false);
  /** Açık dallar: panel kapanıp açılınca korunur. */
  protected readonly expanded = signal<HuTreeKey[]>([]);
  protected readonly panelId = huUniqueId('hu-tree-select-panel');
  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  private readonly tree = viewChild(HuTree);
  private readonly trigger = viewChild.required<ElementRef<HTMLElement>>('trigger');
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');
  protected readonly supportsPopover = typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype;
  private pointerInside = false;
  private onChange: (value: HuTreeSelectValue) => void = () => {};
  private onTouched: () => void = () => {};

  /** Değer her zaman dizi olarak (ağaca verilen seçim). */
  protected readonly keys = computed<HuTreeKey[]>(() => {
    const v = this.value();
    return v == null ? [] : Array.isArray(v) ? v : [v];
  });

  /** Tembel yüklenen düğümler için etiket önbelleği. */
  private readonly seen = signal<ReadonlyMap<HuTreeKey, HuTreeNode<T>>>(new Map());

  /** Düğüm, üstü ve sırası (etiket ve yol için). */
  private readonly index = computed(() => {
    this.seen();
    const map = new Map<HuTreeKey, { node: HuTreeNode<T>; parent: HuTreeKey | null }>();
    const tree = this.tree();
    const walk = (list: readonly HuTreeNode<T>[], parent: HuTreeKey | null) =>
      list.forEach((node) => {
        map.set(node.key, { node, parent });
        walk((tree ? tree.childrenOf(node) : node.children) ?? [], node.key);
      });
    walk(this.nodes(), null);
    for (const [key, node] of this.seen()) if (!map.has(key)) map.set(key, { node, parent: null });
    return map;
  });

  /**
   * Tetikleyicide gösterilen düğümler. Onay kutulu modda (yayılımlı) seçili bir dalın
   * altındakiler gösterilmez: "Mühendislik" yeterli, dört bölümü ayrıca yazmaya gerek yok.
   */
  protected readonly selectedNodes = computed(() => {
    const idx = this.index();
    const keys = this.keys();
    const set = new Set(keys);
    const collapse = this.selectionMode() === 'checkbox' && this.propagate();
    return keys
      .filter((k) => idx.has(k))
      .filter((k) => !collapse || !this.hasSelectedAncestor(k, set))
      .map((k) => idx.get(k)!.node);
  });

  protected readonly summary = computed(() => {
    const nodes = this.selectedNodes();
    if (this.selectionMode() === 'single') return nodes[0] ? this.labelOf(nodes[0]) : '';
    if (nodes.length > this.maxSelectedLabels()) return `${nodes.length} seçildi`;
    return nodes.map((n) => n.label).join(', ');
  });

  protected readonly showChips = computed(
    () => this.selectionMode() !== 'single' && this.display() === 'chips' && this.selectedNodes().length <= this.maxSelectedLabels(),
  );

  // --- HuFormFieldControl -----------------------------------------------------------
  private ngControl: NgControl | null | undefined;
  get hasControl(): boolean {
    return !!this.resolveControl();
  }
  readonly controlErrorVisible = signal(false);
  readonly errors = signal<ValidationErrors | null>(null);
  protected readonly isInvalid = computed(() => this.controlErrorVisible() || (this.field?.showError() ?? false));

  constructor() {
    const reposition = () => this.open() && this.positionPanel();
    this.win?.addEventListener('resize', reposition);
    this.win?.addEventListener('scroll', reposition, true);
    inject(DestroyRef).onDestroy(() => {
      this.win?.removeEventListener('resize', reposition);
      this.win?.removeEventListener('scroll', reposition, true);
    });
  }

  ngDoCheck(): void {
    const c = this.resolveControl();
    if (!c) return;
    this.controlErrorVisible.set(!!c.invalid && !!(c.touched || c.dirty));
    this.errors.set(c.errors);
  }

  // --- Açma / kapama ----------------------------------------------------------------
  toggle(): void {
    if (this.open()) this.close(true);
    else this.show();
  }

  show(): void {
    if (this.isDisabled() || this.open()) return;
    // Seçili düğümler görünsün: üstlerini aç
    const idx = this.index();
    const open = new Set(this.expanded());
    for (const k of this.keys()) {
      let p = idx.get(k)?.parent ?? null;
      while (p !== null) {
        open.add(p);
        p = idx.get(p)?.parent ?? null;
      }
    }
    this.expanded.set([...open]);
    this.open.set(true);
    afterNextRender(
      () => {
        if (!this.open()) return;
        if (this.supportsPopover) this.panel().nativeElement.showPopover();
        this.positionPanel();
        const search = this.panel().nativeElement.querySelector<HTMLInputElement>('.hu-tree__search input');
        if (search) search.focus({ preventScroll: true });
        else this.tree()?.focus();
        this.panel().nativeElement.querySelector('[role=treeitem][tabindex="0"]')?.scrollIntoView({ block: 'nearest' });
      },
      { injector: this.injector },
    );
  }

  close(restoreFocus = false): void {
    if (!this.open()) return;
    this.open.set(false);
    const panel = this.panel().nativeElement;
    if (this.supportsPopover && panel.matches(':popover-open')) panel.hidePopover();
    if (restoreFocus) this.trigger().nativeElement.focus();
    this.closed.emit();
  }

  // --- Seçim -------------------------------------------------------------------------
  protected onTreeSelection(keys: HuTreeKey[]): void {
    if (this.selectionMode() === 'single') {
      // Seçili düğüme tekrar tıklamak seçimi kaldırmaz, yalnızca kapatır
      if (keys.length) this.commit(keys[keys.length - 1]);
      else this.tree()?.selection.set(this.keys());
      this.close(true);
      return;
    }
    this.commit(keys);
  }

  protected onNodeSelect(node: HuTreeNode<T>): void {
    this.remember(node);
    this.nodeSelect.emit(node);
  }

  protected onNodeUnselect(node: HuTreeNode<T>): void {
    if (this.selectionMode() !== 'single') this.nodeUnselect.emit(node);
  }

  protected remove(node: HuTreeNode<T>, event: Event): void {
    event.stopPropagation();
    if (this.isDisabled()) return;
    // Dal kaldırılınca altındakiler de gider (onay kutulu yayılımlı modda)
    const drop = new Set<HuTreeKey>([node.key]);
    if (this.selectionMode() === 'checkbox' && this.propagate()) {
      const tree = this.tree();
      const walk = (n: HuTreeNode<T>) =>
        ((tree ? tree.childrenOf(n) : n.children) ?? []).forEach((c) => {
          drop.add(c.key);
          walk(c);
        });
      walk(node);
    }
    this.commit(this.keys().filter((k) => !drop.has(k)));
    this.nodeUnselect.emit(node);
  }

  protected clearAll(event: Event): void {
    event.stopPropagation();
    if (this.isDisabled()) return;
    this.commit(this.selectionMode() === 'single' ? null : []);
    this.trigger().nativeElement.focus();
  }

  // --- Klavye / odak -------------------------------------------------------------------
  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      this.show();
    } else if ((event.key === 'Backspace' || event.key === 'Delete') && !this.open() && this.keys().length && this.showClear()) {
      event.preventDefault();
      this.commit(this.selectionMode() === 'single' ? null : []);
    }
  }

  protected onPanelKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.close(true);
    } else if (event.key === 'Tab') {
      this.close();
    } else if (event.key === 'ArrowDown' && (event.target as HTMLElement).matches('.hu-tree__search input')) {
      // Arama kutusundan ağaca in
      event.preventDefault();
      this.tree()?.focus();
    }
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && this.host.nativeElement.contains(next)) return;
    if (!next && this.pointerInside && this.open()) return;
    this.close();
    this.onTouched();
  }

  protected onDocumentPointer(event: MouseEvent): void {
    this.pointerInside = this.host.nativeElement.contains(event.target as Node);
    if (this.open() && !this.pointerInside) this.close();
  }

  // --- ControlValueAccessor ------------------------------------------------------------
  writeValue(value: unknown): void {
    this.value.set((value ?? (this.selectionMode() === 'single' ? null : [])) as HuTreeSelectValue);
  }
  registerOnChange(fn: (value: HuTreeSelectValue) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
    if (disabled) this.close();
  }

  // --- Yardımcılar ---------------------------------------------------------------------
  protected labelOf(node: HuTreeNode<T>): string {
    if (!this.showPath()) return node.label;
    const idx = this.index();
    const parts = [node.label];
    let p = idx.get(node.key)?.parent ?? null;
    while (p !== null) {
      const e = idx.get(p);
      if (!e) break;
      parts.unshift(e.node.label);
      p = e.parent;
    }
    return parts.join(' / ');
  }

  private hasSelectedAncestor(key: HuTreeKey, set: ReadonlySet<HuTreeKey>): boolean {
    const idx = this.index();
    let p = idx.get(key)?.parent ?? null;
    while (p !== null) {
      if (set.has(p)) return true;
      p = idx.get(p)?.parent ?? null;
    }
    return false;
  }

  private remember(node: HuTreeNode<T>): void {
    if (!this.index().has(node.key)) this.seen.update((m) => new Map(m).set(node.key, node));
  }

  private commit(value: HuTreeSelectValue): void {
    if (!Object.is(this.value(), value)) this.valueChange.emit(value);
    this.value.set(value);
    this.onChange(value);
    if (this.open()) afterNextRender(() => this.positionPanel(), { injector: this.injector });
  }

  private positionPanel(): void {
    const panel = this.panel().nativeElement;
    if (!this.supportsPopover || !this.win) return;
    const anchor = this.trigger().nativeElement.getBoundingClientRect();
    panel.style.minWidth = `${anchor.width}px`;
    const { offsetWidth: width, offsetHeight: height } = panel;
    const gap = 4;
    const spaceBelow = this.win.innerHeight - anchor.bottom;
    const top = spaceBelow < height + gap && anchor.top > height + gap ? anchor.top - height - gap : anchor.bottom + gap;
    const left = Math.max(8, Math.min(anchor.left, this.win.innerWidth - width - 8));
    panel.style.top = `${top}px`;
    panel.style.left = `${left}px`;
  }

  private resolveControl(): NgControl | null {
    if (this.ngControl === undefined) {
      this.ngControl = this.injector.get(NgControl, null, { self: true, optional: true });
    }
    return this.ngControl;
  }
}
