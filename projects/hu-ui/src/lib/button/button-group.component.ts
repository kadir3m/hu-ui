import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, input } from '@angular/core';

/**
 * Butonları birleşik bir grup olarak gösterir (araç çubuğu, görünüm seçici, sayfalama).
 * Aç/kapa davranışı için butonlara `[attr.aria-pressed]` verin.
 *
 * @example
 * <hu-button-group aria-label="Görünüm">
 *   <button hu-button variant="outline" [attr.aria-pressed]="view() === 'list'" (click)="view.set('list')">Liste</button>
 *   <button hu-button variant="outline" [attr.aria-pressed]="view() === 'grid'" (click)="view.set('grid')">Kart</button>
 * </hu-button-group>
 */
@Component({
  selector: 'hu-button-group',
  template: `<ng-content />`,
  styles: `
    .hu-button-group {
      display: inline-flex;
      isolation: isolate;
    }
    .hu-button-group--vertical { flex-direction: column; }

    /*
     * Bitişik: kenarlar üst üste biner, yalnızca dış köşeler yuvarlak.
     * Öğe doğrudan buton ya da tek butonlu bir sarmalayıcı (örn. hu-menu ile
     * bölünmüş buton) olabilir; ilk/son kontrolü sarmalayıcı üzerinden yapılır.
     */
    .hu-button-group > .hu-menu { display: inline-flex; }
    .hu-button-group:not(.hu-button-group--vertical) > .hu-button:not(:first-child),
    .hu-button-group:not(.hu-button-group--vertical) > :not(.hu-button):not(:first-child) > .hu-button {
      margin-left: -1px;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
    .hu-button-group:not(.hu-button-group--vertical) > .hu-button:not(:last-child),
    .hu-button-group:not(.hu-button-group--vertical) > :not(.hu-button):not(:last-child) > .hu-button {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
    .hu-button-group--vertical > .hu-button:not(:first-child) {
      margin-top: -1px;
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }
    .hu-button-group--vertical > .hu-button:not(:last-child) {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
    /* Dolgulu butonlar arasında ince ayraç */
    .hu-button-group > .hu-button[data-variant='solid']:not(:first-child),
    .hu-button-group > :not(.hu-button):not(:first-child) > .hu-button[data-variant='solid'] {
      margin-left: 0;
      border-left-color: color-mix(in srgb, var(--_on-solid) 25%, transparent);
    }
    /* Hover/odak halkası komşunun altında kalmasın */
    .hu-button-group > .hu-button:hover,
    .hu-button-group > .hu-button:focus-visible,
    .hu-button-group > .hu-button[aria-pressed='true'] {
      z-index: 1;
    }
    .hu-button-group--pill > .hu-button:first-child { border-top-left-radius: var(--hu-radius-full); border-bottom-left-radius: var(--hu-radius-full); }
    .hu-button-group--pill > .hu-button:last-child { border-top-right-radius: var(--hu-radius-full); border-bottom-right-radius: var(--hu-radius-full); }
  `,
  host: {
    class: 'hu-button-group',
    role: 'group',
    '[class.hu-button-group--vertical]': 'vertical()',
    '[class.hu-button-group--pill]': 'pill()',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuButtonGroup {
  readonly vertical = input(false, { transform: booleanAttribute });
  readonly pill = input(false, { transform: booleanAttribute });
}
