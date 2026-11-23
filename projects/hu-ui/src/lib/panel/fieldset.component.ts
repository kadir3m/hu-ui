import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, input, model } from '@angular/core';
import { HuIcon } from '../icon/icon.component';
import { huUniqueId } from '../core/unique-id';

/**
 * Başlıklı alan grubu (native `<fieldset>`). `toggleable` ile başlığa tıklayınca
 * açılıp kapanır; kapalıyken içerik DOM'da kalır (form değerleri korunur) ama gizlenir.
 *
 * @example
 * <hu-fieldset legend="İletişim bilgileri" toggleable>…form alanları…</hu-fieldset>
 */
@Component({
  selector: 'hu-fieldset',
  imports: [HuIcon],
  template: `
    <fieldset class="hu-fieldset__box" [disabled]="disabled()">
      <legend class="hu-fieldset__legend">
        @if (toggleable()) {
          <button type="button" class="hu-fieldset__toggle" [attr.aria-expanded]="!collapsed()" [attr.aria-controls]="contentId" (click)="collapsed.set(!collapsed())">
            <hu-icon name="chevron-down" [size]="16" class="hu-fieldset__chevron" />
            @if (icon()) {
              <hu-icon [name]="icon()!" [size]="16" />
            }
            {{ legend() }}
          </button>
        } @else {
          @if (icon()) {
            <hu-icon [name]="icon()!" [size]="16" />
          }
          {{ legend() }}
        }
      </legend>
      <div class="hu-fieldset__region" [id]="contentId" [attr.inert]="collapsed() || null">
        <div class="hu-fieldset__inner">
          <div class="hu-fieldset__content"><ng-content /></div>
        </div>
      </div>
    </fieldset>
  `,
  styles: `
    .hu-fieldset { display: block; }
    .hu-fieldset__box {
      min-width: 0;
      margin: 0;
      padding: var(--hu-space-2) var(--hu-space-5) var(--hu-space-5);
      border: 1px solid var(--hu-border);
      border-radius: var(--hu-radius-lg);
    }
    .hu-fieldset__legend {
      display: inline-flex;
      align-items: center;
      gap: var(--hu-space-2);
      padding: 0 var(--hu-space-2);
      font-size: var(--hu-text-sm);
      font-weight: 600;
      color: var(--hu-text);
    }
    .hu-fieldset__toggle {
      display: inline-flex;
      align-items: center;
      gap: var(--hu-space-2);
      margin: 0 calc(var(--hu-space-2) * -1);
      padding: var(--hu-space-1) var(--hu-space-2);
      font: inherit;
      color: inherit;
      background: none;
      border: 0;
      border-radius: var(--hu-radius-md);
      cursor: pointer;
    }
    .hu-fieldset__toggle:hover { background: var(--hu-surface-2); }
    .hu-fieldset__toggle:focus-visible { outline: none; box-shadow: var(--hu-ring); }
    .hu-fieldset__chevron { color: var(--hu-text-subtle); transition: transform var(--hu-transition); }
    .hu-fieldset__toggle[aria-expanded='false'] .hu-fieldset__chevron { transform: rotate(-90deg); }
    /* Yükseklik animasyonu: 0fr → 1fr */
    .hu-fieldset__region {
      display: grid;
      grid-template-rows: 1fr;
      transition: grid-template-rows 220ms ease-out, opacity 220ms ease-out;
    }
    .hu-fieldset__region[inert] { grid-template-rows: 0fr; opacity: 0; }
    .hu-fieldset__inner { min-height: 0; overflow: hidden; }
    .hu-fieldset__content { padding-top: var(--hu-space-3); }
    .hu-fieldset:has(.hu-fieldset__region[inert]) .hu-fieldset__box { padding-bottom: var(--hu-space-2); }
    @media (prefers-reduced-motion: reduce) { .hu-fieldset__region { transition: none; } }
  `,
  host: { class: 'hu-fieldset', '[class.hu-fieldset--collapsed]': 'collapsed()' },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuFieldset {
  readonly legend = input.required<string>();
  readonly icon = input<string>();
  /** Başlığa tıklayınca açılıp kapanır. */
  readonly toggleable = input(false, { transform: booleanAttribute });
  readonly collapsed = model(false);
  /** İçindeki tüm form kontrollerini devre dışı bırakır (native fieldset). */
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly contentId = huUniqueId('hu-fieldset');
}
