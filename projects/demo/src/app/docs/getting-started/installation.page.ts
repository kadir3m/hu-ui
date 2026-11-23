import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HuAlert, HuButton, HuIcon } from '@ucme-ui/angular';
import { DocCode } from '../doc-code.component';

@Component({
  selector: 'app-installation-page',
  imports: [RouterLink, DocCode, HuAlert, HuButton, HuIcon],
  template: `
    <header class="guide-header">
      <p class="guide-eyebrow">Başlarken</p>
      <h1>Kurulum</h1>
      <p>&#64;ucme-ui/angular'ı bir Angular projesine birkaç adımda ekleyin.</p>
    </header>

    <section>
      <h2>Gereksinimler</h2>
      <div class="guide-table">
        <table>
          <thead><tr><th scope="col">Bağımlılık</th><th scope="col">Sürüm</th></tr></thead>
          <tbody>
            <tr><td>Angular</td><td><code>20</code>, <code>21</code> veya <code>22</code> (zone.js'li ve zoneless)</td></tr>
            <tr><td>Node.js</td><td>Angular sürümünün istediği (Angular 22 için 22.22+ veya 24+)</td></tr>
            <tr><td>Tarayıcı</td><td>Chrome/Edge 114+, Firefox 125+, Safari 17+</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section>
      <h2><span class="step">1</span> Paketi kurun</h2>
      <app-doc-code [code]="installCode" />
      <p>Angular dışında hiçbir bağımlılık getirmez.</p>
    </section>

    <section>
      <h2><span class="step">2</span> Stilleri ekleyin</h2>
      <p>Proje SCSS kullanıyorsa <code>src/styles.scss</code> dosyasının en üstüne:</p>
      <app-doc-code [code]="scssCode" />
      <p>Proje düz CSS kullanıyorsa <code>angular.json</code>'daki <code>styles</code> listesine, kendi stil dosyanızdan önce:</p>
      <app-doc-code [code]="cssCode" />
    </section>

    <section>
      <h2><span class="step">3</span> Fontu ekleyin <small class="hu-text-muted">(isteğe bağlı)</small></h2>
      <p>Tasarım Inter fontuyla yapıldı. <code>src/index.html</code> içinde <code>&lt;head&gt;</code>'e ekleyin; eklemezseniz sistem fontu kullanılır.</p>
      <app-doc-code [code]="fontCode" />
    </section>

    <section>
      <h2><span class="step">4</span> İlk component</h2>
      <p>Componentler standalone'dur; kullanacağınız component'in <code>imports</code> dizisine ekleyin.</p>
      <app-doc-code [code]="firstCode" />
      <p>Bildirimler (toast) için kök component'e bir kez <code>&lt;hu-toaster /&gt;</code> koyun:</p>
      <app-doc-code [code]="toasterCode" />
    </section>

    <section>
      <h2><span class="step">5</span> Koyu tema <small class="hu-text-muted">(isteğe bağlı)</small></h2>
      <p>
        Koyu tema hazır gelir; <code>&lt;hu-theme-toggle /&gt;</code> butonunu koymanız yeterli. Koyu temayı seçmiş
        kullanıcılarda sayfa açılırken bir anlık beyaz görünmemesi için <code>index.html</code>'e şu betiği ekleyin:
      </p>
      <app-doc-code [code]="themeCode" />
    </section>

    <hu-alert variant="success" title="Kontrol">
      Sayfaya <code>&lt;button hu-button&gt;Deneme&lt;/button&gt;</code> koyun. Buton kırmızı ve köşeleri yuvarlaksa stiller
      yüklenmiştir; düz gri bir tarayıcı butonu görüyorsanız 2. adımı kontrol edin.
    </hu-alert>

    <section class="next-section">
      <h2>Sonraki adımlar</h2>
      <div class="next">
        <a hu-button routerLink="/baslarken/yapilandirma">Yapılandırma <hu-icon name="chevron-right" [size]="16" /></a>
        <a hu-button variant="outline" routerLink="/baslarken/playground"><hu-icon name="grid" [size]="16" /> Playground</a>
        <a hu-button variant="ghost" routerLink="/componentler">Tüm componentler</a>
      </div>
    </section>
  `,
  styleUrl: './guide.scss',
  styles: `hu-alert { display: flex; margin-bottom: var(--hu-space-10); } .next-section { margin-bottom: 0; }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstallationPage {
  protected readonly installCode = `npm install @ucme-ui/angular`;

  protected readonly scssCode = `@use '@ucme-ui/angular/styles';`;

  protected readonly cssCode = `
"styles": [
  "node_modules/@ucme-ui/angular/styles/hu-ui.scss",
  "src/styles.css"
]`;

  protected readonly fontCode = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">`;

  protected readonly firstCode = `
import { Component } from '@angular/core';
import { HuButton, HU_FORM_FIELD_IMPORTS } from '@ucme-ui/angular';

@Component({
  selector: 'app-example',
  imports: [HuButton, HU_FORM_FIELD_IMPORTS],
  template: \`
    <hu-form-field label="E-posta" required>
      <input huInput type="email" />
    </hu-form-field>
    <button hu-button>Kaydet</button>
  \`,
})
export class Example {}`;

  protected readonly toasterCode = `
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HuToaster],
  template: \`<router-outlet /> <hu-toaster />\`,
})
export class App {}`;

  protected readonly themeCode = `
<script>
  (function () {
    try {
      var mode = localStorage.getItem('hu-theme') || 'system';
      var dark = mode === 'dark' || (mode === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    } catch (e) {}
  })();
</script>`;
}
