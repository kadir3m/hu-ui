import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HuButton, HuButtonGroup, HuIcon, HuThemeMode, HuThemeService, HuThemeToggle } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

@Component({
  selector: 'app-theme-doc',
  imports: [DocPage, DocExample, HuButton, HuButtonGroup, HuIcon, HuThemeToggle],
  template: `
    <app-doc-page slug="theme">
      <app-doc-example title="Tema seçimi" description="Tercih tarayıcıda saklanır; 'Sistem' işletim sisteminin ayarını izler." [code]="modeCode">
        <div class="row">
          <hu-button-group aria-label="Tema">
            @for (m of modes; track m.value) {
              <button hu-button variant="outline" [attr.aria-pressed]="theme.mode() === m.value" (click)="theme.setMode(m.value)">
                <hu-icon [name]="m.icon" [size]="16" /> {{ m.label }}
              </button>
            }
          </hu-button-group>
          <hu-theme-toggle />
          <span class="demo-label">mode: {{ theme.mode() }} · resolved: {{ theme.resolved() }}</span>
        </div>
      </app-doc-example>

      <app-doc-example title="Renk token'ları" description="Component'ler yalnızca bu değişkenleri kullanır." [code]="tokensCode">
        <div class="swatches">
          @for (t of tokens; track t) {
            <div class="swatch">
              <span class="swatch__color" [style.background]="'var(' + t + ')'"></span>
              <code>{{ t }}</code>
            </div>
          }
        </div>
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `
    .swatches { display: grid; grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr)); gap: var(--hu-space-3); }
    .swatch { display: flex; align-items: center; gap: var(--hu-space-3); }
    .swatch__color { width: 2rem; height: 2rem; flex-shrink: 0; border: 1px solid var(--hu-border); border-radius: var(--hu-radius-md); }
    .swatch code { font-family: var(--hu-font-mono); font-size: var(--hu-text-xs); color: var(--hu-text-muted); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeDoc {
  protected readonly theme = inject(HuThemeService);
  protected readonly modes: { value: HuThemeMode; label: string; icon: string }[] = [
    { value: 'light', label: 'Açık', icon: 'sun' },
    { value: 'dark', label: 'Koyu', icon: 'moon' },
    { value: 'system', label: 'Sistem', icon: 'monitor' },
  ];
  protected readonly tokens = [
    '--hu-primary',
    '--hu-primary-soft',
    '--hu-success',
    '--hu-warning',
    '--hu-danger',
    '--hu-info',
    '--hu-bg',
    '--hu-surface',
    '--hu-surface-3',
    '--hu-border',
    '--hu-text',
    '--hu-text-muted',
  ];

  protected readonly modeCode = `
private readonly theme = inject(HuThemeService);

this.theme.setMode('dark');   // 'light' | 'dark' | 'system'
this.theme.toggle();
this.theme.resolved();        // şu an uygulanan: 'light' | 'dark'

<hu-theme-toggle />`;

  protected readonly tokensCode = `
// styles.scss — stil import'unun ALTINDA
@use '@ucme-ui/angular/styles';

:root {
  --hu-primary: #0b5cad;
  --hu-primary-hover: #094a8c;
  --hu-primary-soft: #e8f1fb;
  --hu-radius-md: 8px;
}

:root[data-theme='dark'] {
  --hu-primary: #4c9be8;
}`;
}
