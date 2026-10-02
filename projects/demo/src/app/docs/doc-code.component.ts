import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, signal } from '@angular/core';
import { HuIcon } from '@ucme-ui/angular';
import { CodeLang, guessLang, highlight } from './code-tools';

/** Renklendirilmiş, kopyalanabilir kod bloğu (kurulum sayfaları, import satırı). */
@Component({
  selector: 'app-doc-code',
  imports: [HuIcon],
  template: `
    <div class="code">
      <pre><code [innerHTML]="highlighted()"></code></pre>
      <button
        type="button"
        class="code__copy"
        [attr.aria-label]="copied() ? 'Kopyalandı' : 'Kodu kopyala'"
        [title]="copied() ? 'Kopyalandı' : 'Kodu kopyala'"
        (click)="copy()"
      >
        <hu-icon [name]="copied() ? 'check' : 'copy'" [size]="16" />
      </button>
      <span class="hu-sr-only" aria-live="polite">{{ copied() ? 'Kod panoya kopyalandı' : '' }}</span>
    </div>
  `,
  styleUrl: './doc-code.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocCode {
  readonly code = input.required<string>();
  /** Verilmezse koddan tahmin edilir. */
  readonly lang = input<CodeLang>();
  protected readonly copied = signal(false);

  private readonly text = computed(() => this.code().trim());
  protected readonly highlighted = computed(() => highlight(this.text(), this.lang() ?? guessLang(this.text())));

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.text());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1500);
    } catch {
      // Pano izni yoksa sessizce geç
    }
  }
}
