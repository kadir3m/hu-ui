import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HuEditor } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

@Component({
  selector: 'app-editor-doc',
  imports: [DocPage, DocExample, HuEditor],
  template: `
    <app-doc-page slug="editor">
      <app-doc-example
        title="Editör"
        description="Başlıklar, kalın/italik, yazı ve vurgu renkleri, listeler, alıntı, kod, link ve görsel. Görseller adresle, dosya seçerek, yapıştırarak veya sürükleyerek eklenir. Kısayollar: Ctrl+B/I/U, Ctrl+K (link), Ctrl+Z/Y."
        [code]="code"
      >
        <hu-editor [(value)]="html" ariaLabel="Duyuru metni" showCount />
        <details class="output">
          <summary>Üretilen HTML</summary>
          <pre>{{ html() || "''" }}</pre>
        </details>
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `
    .output { margin-top: var(--hu-space-3); }
    .output summary { cursor: pointer; font-size: var(--hu-text-xs); font-weight: 600; color: var(--hu-text-muted); }
    pre {
      margin: var(--hu-space-2) 0 0; padding: var(--hu-space-3);
      font-family: var(--hu-font-mono); font-size: var(--hu-text-xs); white-space: pre-wrap; word-break: break-all;
      background: var(--hu-surface-2); border: 1px solid var(--hu-border); border-radius: var(--hu-radius-md);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorDoc {
  protected readonly html = signal(
    '<h2>Bahar dönemi ders kayıtları</h2>' +
      '<p>Ders kayıtları <strong>3 Şubat</strong> tarihinde başlıyor. <span style="color: #dc2626">Son gün 10 Şubat</span>; ' +
      'belgeler <span style="background-color: rgba(250, 204, 21, 0.4)">eksiksiz</span> teslim edilmelidir.</p>' +
      '<ol><li>Danışmanınızla görüşün</li><li>Ders seçimlerinizi yapın</li></ol>' +
      '<blockquote>Kayıtlar 7 gün sürecektir.</blockquote>' +
      `<p><img src="${sampleImage()}" alt="Örnek görsel"></p>`,
  );

  protected readonly code = `
html = signal('<p>Merhaba</p>');

<hu-editor [(value)]="html" showCount />

<!-- Form ile -->
<hu-form-field label="Duyuru metni" required>
  <hu-editor formControlName="body" placeholder="Duyurunun ayrıntılarını yazın…" />
</hu-form-field>

<!-- Görselleri sunucuya yükleyin (verilmezse data URL olarak gömülür, en fazla 2 MB) -->
upload: HuEditorImageUpload = async (file) => {
  const body = new FormData();
  body.append('file', file);
  const res = await fetch('/api/uploads', { method: 'POST', body });
  return (await res.json()).url;
};

<hu-editor formControlName="body" [imageUpload]="upload" />`;
}

/** Örnek görsel: canvas ile çizilmiş PNG (SVG data URL'leri güvenlik nedeniyle kabul edilmez). */
function sampleImage(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 480;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  const gradient = ctx.createLinearGradient(0, 0, 480, 200);
  gradient.addColorStop(0, '#dc2626');
  gradient.addColorStop(1, '#7c3aed');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 480, 200);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = '600 28px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Örnek görsel', 240, 110);
  return canvas.toDataURL('image/png');
}
