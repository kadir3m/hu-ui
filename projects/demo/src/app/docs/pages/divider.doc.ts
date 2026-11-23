import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HuButton, HuDivider, HuIcon } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

@Component({
  selector: 'app-divider-doc',
  imports: [DocPage, DocExample, HuDivider, HuButton, HuIcon],
  template: `
    <app-doc-page slug="divider">
      <app-doc-example title="Yatay" description="İçerik bölümlerini ayırır; ekran okuyucular için role=&quot;separator&quot;." [code]="basicCode">
        <p>Birinci bölüm: genel bilgiler.</p>
        <hu-divider />
        <p>İkinci bölüm: ayrıntılar.</p>
      </app-doc-example>

      <app-doc-example title="Metinli ve hizalı" description="İçerik verildiğinde çizginin ortasına (veya başına / sonuna) yerleşir." [code]="textCode">
        <div class="login">
          <button hu-button block>E-posta ile giriş</button>
          <hu-divider>veya</hu-divider>
          <button hu-button block variant="outline"><hu-icon name="lock" /> Tek oturum ile giriş</button>
        </div>
        <hu-divider align="start"><strong>Kişisel bilgiler</strong></hu-divider>
        <hu-divider align="end" type="dashed"><span class="hu-text-muted">Son güncelleme: dün</span></hu-divider>
      </app-doc-example>

      <app-doc-example title="Dikey ve çizgi türleri" description="layout=&quot;vertical&quot; satır içi öğeleri ayırır; type: solid, dashed, dotted." [code]="verticalCode">
        <div class="row inline">
          <a href="#" (click)="$event.preventDefault()">Profil</a>
          <hu-divider layout="vertical" />
          <a href="#" (click)="$event.preventDefault()">Ayarlar</a>
          <hu-divider layout="vertical" type="dashed" />
          <a href="#" (click)="$event.preventDefault()">Çıkış</a>
        </div>
        <hu-divider type="dashed" />
        <hu-divider type="dotted" />
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `
    .login { display: flex; flex-direction: column; max-width: 20rem; margin-bottom: var(--hu-space-4); }
    .inline { align-items: center; height: 1.5rem; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DividerDoc {
  protected readonly basicCode = `
<p>Birinci bölüm</p>
<hu-divider />
<p>İkinci bölüm</p>`;

  protected readonly textCode = `
<button hu-button block>E-posta ile giriş</button>
<hu-divider>veya</hu-divider>
<button hu-button block variant="outline">Tek oturum ile giriş</button>

<hu-divider align="start"><strong>Kişisel bilgiler</strong></hu-divider>
<hu-divider align="end" type="dashed">Son güncelleme: dün</hu-divider>`;

  protected readonly verticalCode = `
<a href="/profil">Profil</a>
<hu-divider layout="vertical" />
<a href="/ayarlar">Ayarlar</a>

<hu-divider type="dashed" />
<hu-divider type="dotted" />`;
}
