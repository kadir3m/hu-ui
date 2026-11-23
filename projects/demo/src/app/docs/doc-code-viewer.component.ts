import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, signal } from '@angular/core';
import { HuIcon } from '@ucme-ui/angular';
import { buildComponent, highlight, openInStackBlitz, runnableHtml, splitSnippet } from './code-tools';

type Tab = 'html' | 'ts';

/**
 * Örnek kodu görüntüleyici: HTML / TS sekmeleri, tam kod, StackBlitz ve kopyala.
 * `code` karışık örnek metnidir; HTML ve TS kendiliğinden ayrılır.
 * İstenirse `html` ve `ts` ayrı ayrı da verilebilir.
 */
@Component({
  selector: 'app-doc-code-viewer',
  imports: [HuIcon],
  template: `
    <div class="viewer">
      <div class="viewer__bar">
        <div class="viewer__tabs" role="tablist" aria-label="Kod dili">
          @if (parts().html) {
            <button type="button" role="tab" class="viewer__tab" [attr.aria-selected]="tab() === 'html'" (click)="tab.set('html')">
              HTML
            </button>
          }
          <button type="button" role="tab" class="viewer__tab" [attr.aria-selected]="tab() === 'ts'" (click)="tab.set('ts')">TS</button>
        </div>
        <div class="viewer__actions">
          <button
            type="button"
            class="viewer__btn"
            [attr.aria-pressed]="full()"
            [attr.aria-label]="full() ? 'Kısa kodu göster' : 'Tam kodu göster'"
            [title]="full() ? 'Kısa kodu göster' : 'Tam kodu göster'"
            (click)="full.set(!full())"
          >
            <hu-icon name="code" [size]="16" />
          </button>
          @if (parts().html) {
            <button type="button" class="viewer__btn" aria-label="StackBlitz'te aç" title="StackBlitz'te aç" (click)="openStackBlitz()">
              <hu-icon name="zap" [size]="16" />
            </button>
          }
          <button
            type="button"
            class="viewer__btn"
            [attr.aria-label]="copied() ? 'Kopyalandı' : 'Kodu kopyala'"
            [title]="copied() ? 'Kopyalandı' : 'Kodu kopyala'"
            (click)="copy()"
          >
            <hu-icon [name]="copied() ? 'check' : 'copy'" [size]="16" />
          </button>
        </div>
      </div>
      @if (full() && tab() === 'ts') {
        <div class="viewer__file">example.component.ts</div>
      } @else if (full()) {
        <div class="viewer__file">example.component.html</div>
      }
      <pre class="viewer__code" [attr.data-lang]="activeTab()"><code [innerHTML]="highlighted()"></code></pre>
      <span class="hu-sr-only" aria-live="polite">{{ copied() ? 'Kod panoya kopyalandı' : '' }}</span>
    </div>
  `,
  styleUrl: './doc-code.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocCodeViewer {
  /** Karışık örnek metni (TS ve HTML boş satırla ayrılmış bloklar). */
  readonly code = input<string>('');
  /** Ayrı verilirse otomatik ayırmanın yerine kullanılır. */
  readonly html = input<string>();
  readonly ts = input<string>();
  /** StackBlitz proje başlığı. */
  readonly title = input('Örnek');

  protected readonly tab = signal<Tab>('html');
  protected readonly full = signal(false);
  protected readonly copied = signal(false);

  protected readonly parts = computed(() => {
    const split = splitSnippet(this.code());
    return { html: (this.html() ?? split.html).trim(), ts: (this.ts() ?? split.ts).trim() };
  });
  /** HTML yoksa (yalnızca servis kodu gibi) TS sekmesi açık gelir. */
  protected readonly activeTab = computed<Tab>(() => (this.parts().html ? this.tab() : 'ts'));
  private readonly component = computed(() => buildComponent(this.parts().html, this.parts().ts));

  protected readonly text = computed(() => {
    const { html, ts } = this.parts();
    if (this.activeTab() === 'html') return html;
    // Kısa görünümde örneğin kendi TS'i; TS yoksa ya da yalnızca import satırıysa tam component
    const onlyImports = !ts.replace(/^\s*import\s[^\n]*$/gm, '').trim();
    return this.full() || onlyImports ? this.component() : ts;
  });
  protected readonly highlighted = computed(() => highlight(this.text(), this.activeTab()));

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.text());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1500);
    } catch {
      // Pano izni yoksa sessizce geç
    }
  }

  protected openStackBlitz(): void {
    openInStackBlitz(this.title(), runnableHtml(this.parts().html), this.component());
  }
}
