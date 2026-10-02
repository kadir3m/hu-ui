import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  inject,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HuIcon } from '../icon/icon.component';
import { HuDropdownEntry, HuDropdownOption, isDropdownDivider, isDropdownHeader } from '../dropdown/dropdown.types';

export interface HuContextMenuState {
  entries: readonly HuDropdownEntry<any>[];
  /** Ekran koordinatı (clientX / clientY). */
  x: number;
  y: number;
  ariaLabel?: string;
}

/**
 * Sağ tık menüsü paneli. Doğrudan kullanılmaz: `huContextMenu` direktifi,
 * `hu-table [contextMenu]` veya `HuContextMenuService` açar.
 */
@Component({
  selector: 'hu-context-menu',
  imports: [NgTemplateOutlet, RouterLink, HuIcon],
  template: `
    @for (entry of state().entries; track $index) {
      @if (isDivider(entry)) {
        <div class="hu-context-menu__divider" role="separator"></div>
      } @else if (isHeader(entry)) {
        <div class="hu-context-menu__header" role="presentation">{{ entry.header }}</div>
      } @else if (entry.link && !entry.disabled) {
        <a
          class="hu-context-menu__item"
          role="menuitem"
          tabindex="-1"
          [class.hu-context-menu__item--danger]="entry.danger"
          [routerLink]="entry.link"
          (click)="choose(entry)"
        >
          <ng-container *ngTemplateOutlet="content; context: { $implicit: entry }" />
        </a>
      } @else {
        <button
          type="button"
          class="hu-context-menu__item"
          role="menuitem"
          tabindex="-1"
          [class.hu-context-menu__item--danger]="entry.danger"
          [disabled]="entry.disabled"
          [attr.aria-disabled]="entry.disabled || null"
          (click)="choose(entry)"
        >
          <ng-container *ngTemplateOutlet="content; context: { $implicit: entry }" />
        </button>
      }
    }

    <ng-template #content let-entry>
      <span class="hu-context-menu__icon" aria-hidden="true">
        @if (entry.icon) {
          <hu-icon [name]="entry.icon" [size]="16" />
        }
      </span>
      <span class="hu-context-menu__text">
        <span>{{ entry.label }}</span>
        @if (entry.description) {
          <span class="hu-context-menu__description">{{ entry.description }}</span>
        }
      </span>
      @if (entry.shortcut) {
        <kbd class="hu-context-menu__shortcut">{{ entry.shortcut }}</kbd>
      }
    </ng-template>
  `,
  styleUrl: './context-menu.component.scss',
  host: {
    class: 'hu-context-menu',
    role: 'menu',
    '[attr.popover]': "supportsPopover ? 'manual' : null",
    '[attr.aria-label]': "state().ariaLabel ?? 'İşlemler'",
    '(keydown)': 'onKeydown($event)',
    '(contextmenu)': '$event.preventDefault()',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuContextMenuPanel {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly state = signal<HuContextMenuState>({ entries: [], x: 0, y: 0 });
  /** Seçilen öğe; menü seçim yapılmadan kapandıysa `null`. */
  readonly closed = output<HuDropdownOption<any> | null>();

  protected readonly isDivider = isDropdownDivider;
  protected readonly isHeader = isDropdownHeader;
  protected readonly supportsPopover = typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype;
  private done = false;
  private typeahead = '';
  private typeaheadTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    const el = this.host.nativeElement;
    const doc = el.ownerDocument;
    const win = doc.defaultView;
    const dismiss = () => this.close(null);
    const outside = (e: Event) => {
      if (!el.contains(e.target as Node)) this.close(null);
    };
    const scroll = (e: Event) => {
      if (!el.contains(e.target as Node)) this.close(null);
    };

    afterNextRender(() => {
      if (this.supportsPopover) el.showPopover();
      this.position();
      this.items()[0]?.focus({ preventScroll: true });
      // Menüyü açan tıklama "dışarı tıklama" sayılmasın
      setTimeout(() => {
        doc.addEventListener('pointerdown', outside, true);
        doc.addEventListener('contextmenu', outside, true);
      });
      win?.addEventListener('resize', dismiss);
      win?.addEventListener('blur', dismiss);
      win?.addEventListener('scroll', scroll, true);
    });

    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.typeaheadTimer);
      doc.removeEventListener('pointerdown', outside, true);
      doc.removeEventListener('contextmenu', outside, true);
      win?.removeEventListener('resize', dismiss);
      win?.removeEventListener('blur', dismiss);
      win?.removeEventListener('scroll', scroll, true);
    });
  }

  /** @internal */
  close(option: HuDropdownOption<any> | null): void {
    if (this.done) return;
    this.done = true;
    this.closed.emit(option);
  }

  protected choose(entry: HuDropdownOption<any>): void {
    if (entry.disabled) return;
    this.close({ ...entry, value: entry.value ?? entry.label });
  }

  protected onKeydown(event: KeyboardEvent): void {
    const items = this.items();
    const current = items.indexOf(this.host.nativeElement.ownerDocument.activeElement as HTMLElement);
    let next = -1;
    switch (event.key) {
      case 'ArrowDown':
        next = (current + 1) % items.length;
        break;
      case 'ArrowUp':
        next = (current - 1 + items.length) % items.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = items.length - 1;
        break;
      case 'Escape':
        event.preventDefault();
        event.stopPropagation(); // dialog içindeyse dialog kapanmasın
        this.close(null);
        return;
      case 'Tab':
        event.preventDefault();
        this.close(null);
        return;
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          next = this.findByTypeahead(items, event.key, current);
        }
    }
    if (next >= 0 && items.length) {
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

  private items(): HTMLElement[] {
    return Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>('.hu-context-menu__item:not(:disabled)'));
  }

  /** İmlecin sağ altında açılır; sığmazsa sola / yukarı döner, ekran kenarından taşmaz. */
  private position(): void {
    const el = this.host.nativeElement;
    const win = el.ownerDocument.defaultView;
    if (!win) return;
    const { x, y } = this.state();
    const { offsetWidth: w, offsetHeight: h } = el;
    const edge = 8;
    let left = x + w > win.innerWidth - edge ? x - w : x;
    let top = y + h > win.innerHeight - edge ? y - h : y;
    left = Math.max(edge, Math.min(left, win.innerWidth - w - edge));
    top = Math.max(edge, Math.min(top, win.innerHeight - h - edge));
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  }
}
