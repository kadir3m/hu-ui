import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  contentChild,
  effect,
  inject,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HuButton, HuButtonColor, HuButtonSize, HuButtonVariant } from '../button/button.component';
import { HuIcon } from '../icon/icon.component';
import { huUniqueId } from '../core/unique-id';
import { HuDropdownEntry, HuDropdownOption, isDropdownDivider, isDropdownHeader } from './dropdown.types';

export type HuDropdownAlign = 'start' | 'end';

/**
 * Hazır tetikleyici yerine kendi elementinizi kullanmak için (avatar, ikon vb.).
 * @example <button huDropdownTrigger class="avatar-btn"><hu-avatar name="…" /></button>
 */
@Directive({
  selector: '[huDropdownTrigger]',
  host: {
    'aria-haspopup': 'menu',
    '[attr.aria-expanded]': 'dropdown.open()',
    '[attr.aria-controls]': 'dropdown.panelId',
    '(click)': 'dropdown.toggle()',
  },
})
export class HuDropdownTrigger {
  protected readonly dropdown = inject(HuDropdown);
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
}

/** Panelin en üstüne serbest içerik (başlık, rozet vb.). */
@Directive({ selector: '[huDropdownHeader]', host: { class: 'hu-dropdown__header' } })
export class HuDropdownHeaderSlot {}

/**
 * Açılır menü. Öğeleri `options` ile verin; seçim `(selected)` ile döner.
 *
 * @example
 * <hu-dropdown label="İşlemler" [options]="actions" (selected)="run($event.value)" />
 *
 * actions: HuDropdownEntry[] = [
 *   { label: 'Düzenle', value: 'edit', icon: 'edit' },
 *   { divider: true },
 *   { label: 'Sil', value: 'delete', icon: 'trash', danger: true },
 * ];
 *
 * <!-- Yalnızca ikon -->
 * <hu-dropdown icon="more-vertical" variant="ghost" ariaLabel="Satır işlemleri" [options]="actions" />
 */
@Component({
  selector: 'hu-dropdown',
  imports: [NgTemplateOutlet, RouterLink, HuButton, HuIcon],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss',
  host: {
    class: 'hu-dropdown',
    '[class.hu-dropdown--open]': 'open()',
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'close(true)',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuDropdown<T = string> {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  // --- İçerik -----------------------------------------------------------------------
  readonly options = input<readonly HuDropdownEntry<T>[]>([]);

  // --- Hazır tetikleyici ------------------------------------------------------------
  /** Tetikleyici butonun metni. */
  readonly label = input<string>();
  /** Tetikleyici butonun ikonu. Yalnızca ikon verilirse kare buton olur. */
  readonly icon = input<string>();
  readonly variant = input<HuButtonVariant>('outline');
  readonly color = input<HuButtonColor>();
  readonly size = input<HuButtonSize>('md');
  /** Etiketin yanında aşağı ok gösterilsin mi? */
  readonly caret = input(true, { transform: booleanAttribute });
  /** Yalnızca ikonlu tetikleyicide ekran okuyucu etiketi (zorunlu gibi düşünün). */
  readonly ariaLabel = input<string>();
  readonly disabled = input(false, { transform: booleanAttribute });

  // --- Davranış ---------------------------------------------------------------------
  readonly align = input<HuDropdownAlign>('start');
  /** Açık mı? `[(open)]` ile iki yönlü bağlanabilir. */
  readonly open = model(false);

  /** Bir öğe seçildiğinde. */
  readonly selected = output<HuDropdownOption<T>>();

  readonly panelId = huUniqueId('hu-dropdown');
  protected readonly customTrigger = contentChild(HuDropdownTrigger);
  protected readonly isDivider = isDropdownDivider;
  protected readonly isHeader = isDropdownHeader;

  /**
   * Panel Popover API ile sayfanın üst katmanında (top layer) açılır: "appendTo body"
   * gibi davranır, kart/tablo/dialog'un overflow'u tarafından kesilmez. DOM'da yerinde
   * kaldığı için odak ve dışarı tıklama mantığı aynen çalışır.
   */
  protected readonly supportsPopover = typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype;
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');
  private focusOnOpen = false;

  private typeahead = '';
  private typeaheadTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    // open dışarıdan ([(open)]) da değişebilir: paneli her durumda eşitle.
    effect(() => {
      const open = this.open();
      afterNextRender(() => this.syncPanel(open), { injector: this.injector });
    });

    const win = this.host.nativeElement.ownerDocument.defaultView;
    const reposition = () => this.open() && this.positionPanel();
    win?.addEventListener('resize', reposition);
    win?.addEventListener('scroll', reposition, true);
    inject(DestroyRef).onDestroy(() => {
      win?.removeEventListener('resize', reposition);
      win?.removeEventListener('scroll', reposition, true);
    });
  }

  toggle(): void {
    if (this.open()) this.close();
    else this.show();
  }

  show(): void {
    if (this.disabled()) return;
    this.focusOnOpen = true;
    this.open.set(true);
  }

  close(restoreFocus = false): void {
    if (!this.open()) return;
    this.open.set(false);
    if (restoreFocus) this.triggerElement()?.focus();
  }

  protected choose(option: HuDropdownOption<T>): void {
    if (option.disabled) return;
    this.selected.emit({ ...option, value: (option.value ?? option.label) as T });
    this.close(true);
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) this.close();
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.show();
    }
  }

  protected onPanelKeydown(event: KeyboardEvent): void {
    const items = this.items();
    if (!items.length) return;
    const current = items.indexOf(this.host.nativeElement.ownerDocument.activeElement as HTMLElement);
    let next = -1;

    if (event.key === 'ArrowDown') next = (current + 1) % items.length;
    else if (event.key === 'ArrowUp') next = (current - 1 + items.length) % items.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = items.length - 1;
    else if (event.key === 'Tab') this.close();
    else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      next = this.findByTypeahead(items, event.key, current);
    }

    if (next >= 0) {
      event.preventDefault();
      items[next]?.focus();
    }
  }

  /** Harfe basınca o harfle başlayan öğeye git (ör. "S" → "Sil"). */
  private findByTypeahead(items: HTMLElement[], key: string, current: number): number {
    clearTimeout(this.typeaheadTimer);
    this.typeahead += key.toLocaleLowerCase('tr-TR');
    this.typeaheadTimer = setTimeout(() => (this.typeahead = ''), 500);
    for (let i = 1; i <= items.length; i++) {
      const index = (current + i) % items.length;
      const text = items[index].textContent?.trim().toLocaleLowerCase('tr-TR') ?? '';
      if (text.startsWith(this.typeahead)) return index;
    }
    return -1;
  }

  private syncPanel(open: boolean): void {
    const panel = this.panel().nativeElement;
    if (this.supportsPopover) {
      const isOpen = panel.matches(':popover-open');
      if (open && !isOpen) panel.showPopover();
      else if (!open && isOpen) panel.hidePopover();
    }
    if (!open) return;
    this.positionPanel();
    if (this.focusOnOpen) {
      this.focusOnOpen = false;
      this.items()[0]?.focus({ preventScroll: true });
    }
  }

  /** Tetikleyicinin altına (yer yoksa üstüne) yerleştirir; ekran kenarından taşırmaz. */
  private positionPanel(): void {
    if (!this.supportsPopover) return;
    const panel = this.panel().nativeElement;
    const trigger = this.triggerElement() ?? this.host.nativeElement;
    const win = this.host.nativeElement.ownerDocument.defaultView;
    if (!win) return;

    const anchor = trigger.getBoundingClientRect();
    const { offsetWidth: width, offsetHeight: height } = panel;
    const gap = 6;
    const edge = 8;

    let left = this.align() === 'end' ? anchor.right - width : anchor.left;
    left = Math.max(edge, Math.min(left, win.innerWidth - width - edge));

    const below = anchor.bottom + gap;
    const above = anchor.top - gap - height;
    const fitsBelow = below + height <= win.innerHeight - edge;
    const top = fitsBelow || above < edge ? below : above;

    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
    panel.dataset['placement'] = top === below ? 'bottom' : 'top';
  }

  private items(): HTMLElement[] {
    return Array.from(
      this.host.nativeElement.querySelectorAll<HTMLElement>('.hu-dropdown__panel .hu-dropdown-item:not(:disabled)'),
    );
  }

  private triggerElement(): HTMLElement | null {
    return (
      this.customTrigger()?.element.nativeElement ??
      this.host.nativeElement.querySelector<HTMLElement>('.hu-dropdown__trigger')
    );
  }
}
