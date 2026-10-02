import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HuButton, HuIcon, HuTooltip, HuTooltipPosition } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

@Component({
  selector: 'app-tooltip-doc',
  imports: [DocPage, DocExample, HuButton, HuIcon, HuTooltip],
  template: `
    <app-doc-page slug="tooltip">
      <app-doc-example
        title="Temel"
        description="Üzerine gelin veya Tab ile odaklanın. Esc kapatır. Yalnızca ikonlu butonlarda aria-label da verin."
        [code]="basicCode"
      >
        <div class="row">
          <button hu-button variant="outline" iconOnly aria-label="Düzenle" huTooltip="Düzenle"><hu-icon name="edit" [size]="16" /></button>
          <button hu-button variant="outline" iconOnly aria-label="İndir" huTooltip="PDF olarak indir"><hu-icon name="download" [size]="16" /></button>
          <button hu-button variant="outline" color="danger" iconOnly aria-label="Sil" huTooltip="Kaydı kalıcı olarak siler"><hu-icon name="trash" [size]="16" /></button>
          <span class="term" tabindex="0" huTooltip="Avrupa Kredi Transfer Sistemi: 1 AKTS ≈ 25–30 saat iş yükü">AKTS</span>
        </div>
      </app-doc-example>

      <app-doc-example
        title="Konumlar"
        description="top, bottom, left, right. Sığmazsa ters tarafa geçer."
        [code]="positionsCode"
      >
        <div class="row positions">
          @for (p of positions; track p) {
            <button hu-button variant="soft" [huTooltip]="p + ' tarafında'" [huTooltipPosition]="p">{{ p }}</button>
          }
        </div>
      </app-doc-example>

      <app-doc-example
        title="Dinamik metin, gecikme ve devre dışı"
        description="Metin değişince açık balon güncellenir. huTooltipDelay ile bekleme (ms), huTooltipDisabled ile kapatma."
        [code]="dynamicCode"
      >
        <div class="row">
          <button hu-button variant="outline" [huTooltip]="copied() ? 'Kopyalandı!' : 'Bağlantıyı kopyala'" (click)="copy()">
            <hu-icon [name]="copied() ? 'check' : 'link'" [size]="16" /> Paylaş
          </button>
          <button hu-button variant="outline" huTooltip="Hemen açılır" [huTooltipDelay]="0">Gecikmesiz</button>
          <button hu-button variant="outline" huTooltip="Görünmez" huTooltipDisabled>Devre dışı ipucu</button>
        </div>
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `
    .term { text-decoration: underline dotted; text-underline-offset: 3px; cursor: help; font-weight: 500; }
    .term:focus-visible { outline: none; box-shadow: var(--hu-ring); border-radius: var(--hu-radius-sm); }
    .positions { justify-content: center; padding: var(--hu-space-6) 0; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipDoc {
  protected readonly positions: HuTooltipPosition[] = ['top', 'bottom', 'left', 'right'];
  protected readonly copied = signal(false);

  protected copy(): void {
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1500);
  }

  protected readonly basicCode = `
import { HuTooltip } from '@ucme-ui/angular';

<button hu-button iconOnly aria-label="Sil" huTooltip="Kaydı kalıcı olarak siler">
  <hu-icon name="trash" />
</button>
<span tabindex="0" huTooltip="Avrupa Kredi Transfer Sistemi">AKTS</span>`;

  protected readonly positionsCode = `
<button hu-button huTooltip="Altta" huTooltipPosition="bottom">bottom</button>
<button hu-button huTooltip="Sağda" huTooltipPosition="right">right</button>`;

  protected readonly dynamicCode = `
<button hu-button [huTooltip]="copied() ? 'Kopyalandı!' : 'Bağlantıyı kopyala'" (click)="copy()">Paylaş</button>
<button hu-button huTooltip="Hemen açılır" [huTooltipDelay]="0">Gecikmesiz</button>
<button hu-button huTooltip="Kaydet (Ctrl+S)" [huTooltipDisabled]="!showHints">Kaydet</button>`;
}
