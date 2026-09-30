import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, input, isDevMode } from '@angular/core';
import { HU_BUILTIN_ICONS, HU_ICON_SETS } from './icons';

/**
 * SVG ikon.
 * @example <hu-icon name="users" />  <hu-icon name="bell" [size]="20" label="Bildirimler" />
 */
@Component({
  selector: 'hu-icon',
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth()"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path [attr.d]="path()" />
    </svg>
  `,
  styles: `
    .hu-icon {
      display: inline-flex;
      flex-shrink: 0;
      line-height: 0;
    }
  `,
  host: {
    class: 'hu-icon',
    '[attr.role]': 'label() ? "img" : null',
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-hidden]': 'label() ? null : "true"',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuIcon {
  private readonly customSets = inject(HU_ICON_SETS, { optional: true }) ?? [];

  readonly name = input.required<string>();
  readonly size = input<number>(18);
  readonly strokeWidth = input<number>(2);
  /** Ekran okuyucular için etiket. Verilmezse ikon dekoratif kabul edilir. */
  readonly label = input<string>();

  protected readonly path = computed(() => {
    const name = this.name();
    for (let i = this.customSets.length - 1; i >= 0; i--) {
      const path = this.customSets[i][name];
      if (path) return path;
    }
    const path = HU_BUILTIN_ICONS[name];
    if (!path && isDevMode()) console.warn(`[hu-icon] "${name}" adında ikon bulunamadı.`);
    return path ?? '';
  });
}
