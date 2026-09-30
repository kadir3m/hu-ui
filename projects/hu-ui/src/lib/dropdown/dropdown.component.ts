import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  inject,
  input,
  signal,
  Injector,
} from '@angular/core';
import { huUniqueId } from '../core/unique-id';

export type HuDropdownAlign = 'start' | 'end';

/**
 * Açılır menü (dropdown). Tetikleyiciye `huDropdownTrigger`, öğelere `huDropdownItem` verin.
 *
 * @example
 * <hu-dropdown align="end">
 *   <button huDropdownTrigger hu-button variant="ghost" iconOnly aria-label="İşlemler"><hu-icon name="more-vertical" /></button>
 *   <button huDropdownItem (click)="edit()"><hu-icon name="edit" /> Düzenle</button>
 *   <hr class="hu-dropdown-divider" />
 *   <button huDropdownItem class="hu-dropdown-item--danger" (click)="remove()"><hu-icon name="trash" /> Sil</button>
 * </hu-dropdown>
 */
@Component({
  selector: 'hu-dropdown',
  template: `
    <ng-content select="[huDropdownTrigger]" />
    <div
      class="hu-dropdown__panel"
      role="menu"
      [id]="panelId"
      [attr.data-align]="align()"
      [hidden]="!isOpen()"
      (keydown)="onPanelKeydown($event)"
    >
      <ng-content />
    </div>
  `,
  styles: `
    .hu-dropdown { position: relative; display: inline-flex; }
    .hu-dropdown__panel {
      position: absolute;
      top: calc(100% + 6px);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      min-width: var(--hu-dropdown-min-width, 12rem);
      padding: var(--hu-space-1);
      background: var(--hu-surface);
      border: 1px solid var(--hu-border);
      border-radius: var(--hu-radius-lg);
      box-shadow: var(--hu-shadow-lg);
      animation: hu-dropdown-in 120ms ease-out;
    }
    .hu-dropdown__panel[hidden] { display: none; }
    .hu-dropdown__panel[data-align='start'] { left: 0; }
    .hu-dropdown__panel[data-align='end'] { right: 0; }
    @keyframes hu-dropdown-in { from { opacity: 0; transform: translateY(-4px); } }
  `,
  host: {
    class: 'hu-dropdown',
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'close(true)',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuDropdown {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  readonly align = input<HuDropdownAlign>('start');
  readonly isOpen = signal(false);
  readonly panelId = huUniqueId('hu-dropdown');

  toggle(): void {
    if (this.isOpen()) this.close();
    else this.openMenu();
  }

  openMenu(): void {
    this.isOpen.set(true);
    afterNextRender(() => this.items()[0]?.focus(), { injector: this.injector });
  }

  close(restoreFocus = false): void {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    if (restoreFocus) this.host.nativeElement.querySelector<HTMLElement>('[huDropdownTrigger]')?.focus();
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) this.close();
  }

  protected onPanelKeydown(event: KeyboardEvent): void {
    const items = this.items();
    const current = items.indexOf(this.host.nativeElement.ownerDocument.activeElement as HTMLElement);
    let next = -1;
    if (event.key === 'ArrowDown') next = (current + 1) % items.length;
    else if (event.key === 'ArrowUp') next = (current - 1 + items.length) % items.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = items.length - 1;
    else if (event.key === 'Tab') this.close();
    if (next >= 0) {
      event.preventDefault();
      items[next]?.focus();
    }
  }

  private items(): HTMLElement[] {
    return Array.from(
      this.host.nativeElement.querySelectorAll<HTMLElement>('.hu-dropdown__panel .hu-dropdown-item:not(:disabled)'),
    );
  }
}

@Directive({
  selector: '[huDropdownTrigger]',
  host: {
    'aria-haspopup': 'menu',
    '[attr.aria-expanded]': 'menu.isOpen()',
    '[attr.aria-controls]': 'menu.panelId',
    '(click)': 'menu.toggle()',
  },
})
export class HuDropdownTrigger {
  protected readonly menu = inject(HuDropdown);
}

@Directive({
  selector: '[huDropdownItem]',
  host: {
    class: 'hu-dropdown-item',
    role: 'menuitem',
    tabindex: '-1',
    '(click)': 'menu.close()',
  },
})
export class HuDropdownItem {
  protected readonly menu = inject(HuDropdown);
}
