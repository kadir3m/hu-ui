import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { HuButton, HuIcon } from '@ucme-ui/angular';

/** Kopyalanabilir kod bloğu. */
@Component({
  selector: 'app-doc-code',
  imports: [HuButton, HuIcon],
  template: `
    <div class="code">
      <pre><code>{{ code().trim() }}</code></pre>
      <button
        hu-button
        variant="ghost"
        size="xs"
        class="code__copy"
        [attr.aria-label]="copied() ? 'Kopyalandı' : 'Kodu kopyala'"
        (click)="copy()"
      >
        <hu-icon [name]="copied() ? 'check' : 'file-text'" [size]="12" />
        {{ copied() ? 'Kopyalandı' : 'Kopyala' }}
      </button>
    </div>
  `,
  styles: `
    .code {
      position: relative;
      background: var(--hu-gray-900);
      border-radius: var(--hu-radius-lg);
    }
    pre {
      margin: 0;
      padding: var(--hu-space-4) var(--hu-space-5);
      overflow-x: auto;
      font-family: var(--hu-font-mono);
      font-size: 0.8125rem;
      line-height: 1.6;
      color: #e4e4e7;
    }
    .code .code__copy {
      position: absolute;
      top: var(--hu-space-2);
      right: var(--hu-space-2);
      --_fg: #a1a1aa;
      --_fg-hover: #fff;
      --_bg-hover: rgb(255 255 255 / 0.08);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocCode {
  readonly code = input.required<string>();
  protected readonly copied = signal(false);

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.code().trim());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1500);
    } catch {
      // Pano izni yoksa sessizce geç
    }
  }
}
