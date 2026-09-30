import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChildren,
  inject,
  input,
  model,
  viewChild,
} from '@angular/core';
import { HuIcon } from '../icon/icon.component';
import { huUniqueId } from '../core/unique-id';

/** Tek bir sekme. İçeriği yalnızca aktifken render edilir. */
@Component({
  selector: 'hu-tab',
  template: `<ng-template><ng-content /></ng-template>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuTab {
  readonly label = input.required<string>();
  readonly icon = input<string>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly content = viewChild.required(TemplateRef);
}

export type HuTabsVariant = 'line' | 'pills';

/**
 * Sekmeler. Ok tuşları, Home/End ile klavye gezintisi destekler.
 * @example
 * <hu-tabs [(selectedIndex)]="tab">
 *   <hu-tab label="Profil" icon="user">...</hu-tab>
 *   <hu-tab label="Güvenlik" icon="lock">...</hu-tab>
 * </hu-tabs>
 */
@Component({
  selector: 'hu-tabs',
  imports: [NgTemplateOutlet, HuIcon],
  template: `
    <div class="hu-tabs__list" role="tablist" (keydown)="onKeydown($event)">
      @for (tab of tabs(); track tab; let i = $index) {
        <button
          type="button"
          role="tab"
          class="hu-tabs__tab"
          [id]="baseId + '-tab-' + i"
          [attr.aria-selected]="i === activeIndex()"
          [attr.aria-controls]="baseId + '-panel-' + i"
          [tabIndex]="i === activeIndex() ? 0 : -1"
          [disabled]="tab.disabled()"
          (click)="select(i)"
        >
          @if (tab.icon()) {
            <hu-icon [name]="tab.icon()!" [size]="16" />
          }
          {{ tab.label() }}
        </button>
      }
    </div>
    @if (activeTab(); as tab) {
      <div
        class="hu-tabs__panel"
        role="tabpanel"
        tabindex="0"
        [id]="baseId + '-panel-' + activeIndex()"
        [attr.aria-labelledby]="baseId + '-tab-' + activeIndex()"
      >
        <ng-container [ngTemplateOutlet]="tab.content()" />
      </div>
    }
  `,
  styles: `
    .hu-tabs { display: block; }
    .hu-tabs__list {
      display: flex;
      gap: var(--hu-space-1);
      overflow-x: auto;
      scrollbar-width: none;
    }
    .hu-tabs[data-variant='line'] .hu-tabs__list { gap: var(--hu-space-5); border-bottom: 1px solid var(--hu-border); }
    .hu-tabs__tab {
      display: inline-flex;
      align-items: center;
      gap: var(--hu-space-2);
      flex-shrink: 0;
      font: inherit;
      font-weight: 500;
      color: var(--hu-text-muted);
      white-space: nowrap;
      background: none;
      border: 0;
      cursor: pointer;
      transition: color var(--hu-transition), background-color var(--hu-transition), border-color var(--hu-transition);
    }
    .hu-tabs__tab:hover:not(:disabled) { color: var(--hu-text); }
    .hu-tabs__tab:disabled { opacity: 0.45; cursor: not-allowed; }
    .hu-tabs__tab:focus-visible { outline: none; box-shadow: var(--hu-ring); border-radius: var(--hu-radius-sm); }
    .hu-tabs[data-variant='line'] .hu-tabs__tab {
      margin-bottom: -1px;
      padding: var(--hu-space-3) 0;
      border-bottom: 2px solid transparent;
    }
    .hu-tabs[data-variant='line'] .hu-tabs__tab[aria-selected='true'] {
      color: var(--hu-primary);
      border-bottom-color: var(--hu-primary);
    }
    .hu-tabs[data-variant='pills'] .hu-tabs__list {
      display: inline-flex;
      padding: 3px;
      background: var(--hu-surface-3);
      border-radius: var(--hu-radius-md);
    }
    .hu-tabs[data-variant='pills'] .hu-tabs__tab {
      height: 2rem;
      padding: 0 var(--hu-space-3);
      border-radius: var(--hu-radius-sm);
    }
    .hu-tabs[data-variant='pills'] .hu-tabs__tab[aria-selected='true'] {
      color: var(--hu-text);
      background: var(--hu-surface);
      box-shadow: var(--hu-shadow-sm);
    }
    .hu-tabs__panel { padding-top: var(--hu-space-5); }
    .hu-tabs__panel:focus-visible { outline: none; }
  `,
  host: { class: 'hu-tabs', '[attr.data-variant]': 'variant()' },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuTabs {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly selectedIndex = model(0);
  readonly variant = input<HuTabsVariant>('line');

  protected readonly tabs = contentChildren(HuTab);
  protected readonly baseId = huUniqueId('hu-tabs');
  protected readonly activeIndex = computed(() => Math.min(this.selectedIndex(), this.tabs().length - 1));
  protected readonly activeTab = computed(() => this.tabs()[this.activeIndex()]);

  select(index: number): void {
    if (!this.tabs()[index]?.disabled()) this.selectedIndex.set(index);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const tabs = this.tabs();
    const enabled = tabs.map((t, i) => (t.disabled() ? -1 : i)).filter((i) => i >= 0);
    const pos = enabled.indexOf(this.activeIndex());
    let next: number | undefined;

    switch (event.key) {
      case 'ArrowRight':
        next = enabled[(pos + 1) % enabled.length];
        break;
      case 'ArrowLeft':
        next = enabled[(pos - 1 + enabled.length) % enabled.length];
        break;
      case 'Home':
        next = enabled[0];
        break;
      case 'End':
        next = enabled[enabled.length - 1];
        break;
      default:
        return;
    }
    event.preventDefault();
    if (next === undefined) return;
    this.select(next);
    this.host.nativeElement.querySelectorAll<HTMLElement>('.hu-tabs__tab')[next]?.focus();
  }
}
