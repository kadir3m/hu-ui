import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { HuButton } from '../button/button.component';
import { HuIcon } from '../icon/icon.component';
import { HuThemeService } from '../core/theme.service';

/** Açık / koyu tema arasında geçiş yapan buton. */
@Component({
  selector: 'hu-theme-toggle',
  imports: [HuButton, HuIcon],
  template: `
    <button hu-button variant="ghost" iconOnly [attr.aria-label]="label()" [attr.title]="label()" (click)="theme.toggle()">
      <hu-icon [name]="theme.resolved() === 'dark' ? 'sun' : 'moon'" [size]="18" />
    </button>
  `,
  host: { style: 'display: inline-flex' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuThemeToggle {
  protected readonly theme = inject(HuThemeService);
  protected readonly label = computed(() =>
    this.theme.resolved() === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç',
  );
}
