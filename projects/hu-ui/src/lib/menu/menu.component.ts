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

export type HuMenuAlign = 'start' | 'end';

/**
 * Açılır menü (dropdown). Tetikleyiciye `huMenuTrigger`, öğelere `huMenuItem` verin.
 *
 * @example
 * <hu-menu align="end">
 *   <button huMenuTrigger hu-button variant="ghost" iconOnly aria-label="İşlemler"><hu-icon name="more-vertical" /></button>
 *   <button huMenuItem (click)="edit()"><hu-icon name="edit" /> Düzenle</button>
 *   <hr class="hu-menu-divider" />
 *   <button huMenuItem class="hu-menu-item--danger" (click)="remove()"><hu-icon name="trash" /> Sil</button>
 * </hu-menu>
 */
@Component({
  selector: 'hu-menu',
  template: `
    <ng-content select="[huMenuTrigger]" />
    <div
      class="hu-menu__panel"
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
    .hu-menu { position: relative; display: inline-flex; }
    .hu-menu__panel {
      position: absolute;
      top: calc(100% + 6px);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      min-width: var(--hu-menu-min-width, 12rem);
      padding: var(--hu-space-1);
      background: var(--hu-surface);
      border: 1px solid var(--hu-border);
      border-radius: var(--hu-radius-lg);
      box-shadow: var(--hu-shadow-lg);
      animation: hu-menu-in 120ms ease-out;
    }
    .hu-menu__panel[hidden] { display: none; }
    .hu-menu__panel[data-align='start'] { left: 0; }
    .hu-menu__panel[data-align='end'] { right: 0; }
    @keyframes hu-menu-in { from { opacity: 0; transform: translateY(-4px); } }
  `,
  host: {
    class: 'hu-menu',
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'close(true)',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuMenu {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  readonly align = input<HuMenuAlign>('start');
  readonly isOpen = signal(false);
  readonly panelId = huUniqueId('hu-menu');

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
    if (restoreFocus) this.host.nativeElement.querySelector<HTMLElement>('[huMenuTrigger]')?.focus();
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
      this.host.nativeElement.querySelectorAll<HTMLElement>('.hu-menu__panel .hu-menu-item:not(:disabled)'),
    );
  }
}

@Directive({
  selector: '[huMenuTrigger]',
  host: {
    'aria-haspopup': 'menu',
    '[attr.aria-expanded]': 'menu.isOpen()',
    '[attr.aria-controls]': 'menu.panelId',
    '(click)': 'menu.toggle()',
  },
})
export class HuMenuTrigger {
  protected readonly menu = inject(HuMenu);
}

@Directive({
  selector: '[huMenuItem]',
  host: {
    class: 'hu-menu-item',
    role: 'menuitem',
    tabindex: '-1',
    '(click)': 'menu.close()',
  },
})
export class HuMenuItem {
  protected readonly menu = inject(HuMenu);
}
