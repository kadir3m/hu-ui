import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { HuButton, HuIcon } from '@ucme-ui/angular';
import { DocCodeViewer } from './doc-code-viewer.component';

/**
 * Canlı örnek + açılır kod (HTML / TS sekmeleri, tam kod, StackBlitz).
 * `code` içindeki TS ve HTML blokları kendiliğinden ayrılır; istenirse `html` / `ts` ayrı verilir.
 * @example <app-doc-example title="Boyutlar" [code]="sizesCode"> …canlı örnek… </app-doc-example>
 */
@Component({
  selector: 'app-doc-example',
  imports: [HuButton, HuIcon, DocCodeViewer],
  template: `
    <section class="example" [attr.aria-label]="title()">
      <header class="example__head">
        <div>
          <h3 class="example__title">{{ title() }}</h3>
          @if (description()) {
            <p class="example__desc">{{ description() }}</p>
          }
        </div>
        @if (hasCode()) {
          <button
            hu-button
            variant="ghost"
            size="sm"
            [attr.aria-expanded]="showCode()"
            (click)="showCode.set(!showCode())"
          >
            <hu-icon name="code" [size]="14" />
            {{ showCode() ? 'Kodu gizle' : 'Kodu göster' }}
          </button>
        }
      </header>
      <div class="example__preview"><ng-content /></div>
      @if (showCode() && hasCode()) {
        <app-doc-code-viewer class="example__code" [code]="code() ?? ''" [html]="html()" [ts]="ts()" [title]="title()" />
      }
    </section>
  `,
  styles: `
    .example {
      overflow: hidden;
      background: var(--hu-surface);
      border: 1px solid var(--hu-border);
      border-radius: var(--hu-radius-lg);
    }
    .example__head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--hu-space-3);
      padding: var(--hu-space-4) var(--hu-space-5) 0;
    }
    .example__title { font-size: var(--hu-text-md); font-weight: 600; margin: 0; }
    .example__desc { margin-top: 2px; font-size: var(--hu-text-sm); color: var(--hu-text-muted); }
    .example__preview { padding: var(--hu-space-5); }
    .example__code { display: block; margin: 0 var(--hu-space-3) var(--hu-space-3); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocExample {
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly code = input<string>();
  readonly html = input<string>();
  readonly ts = input<string>();
  protected readonly showCode = signal(false);

  protected hasCode(): boolean {
    return !!(this.code() || this.html() || this.ts());
  }
}
