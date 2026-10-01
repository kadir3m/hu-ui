import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocCode } from '../doc-code.component';

@Component({
  selector: 'app-configuration-page',
  imports: [RouterLink, DocCode],
  template: `
    <header class="guide-header">
      <p class="guide-eyebrow">Başlarken</p>
      <h1>Yapılandırma</h1>
      <p>Renkler, temalar, hata mesajları, ikonlar ve dil ayarları.</p>
    </header>

    <section>
      <h2>Marka rengi ve tasarım token'ları</h2>
      <p>
        Bütün renk, boşluk ve köşe değerleri <code>--hu-*</code> CSS değişkenleridir. Stil import'unun
        <strong>altında</strong> ezin; component'lerin hepsi kendiliğinden güncellenir.
      </p>
      <app-doc-code [code]="tokensCode" />
      <p>Bütün değişkenlerin listesi ve canlı örnekleri <a routerLink="/componentler/theme">Tema</a> sayfasında.</p>
    </section>

    <section>
      <h2>Açık / koyu tema</h2>
      <p>
        Tema <code>&lt;html data-theme="light|dark"&gt;</code> özniteliğiyle uygulanır. <code>HuThemeService</code> kullanıcının
        tercihini (<code>light</code>, <code>dark</code>, <code>system</code>) tarayıcıda saklar.
      </p>
      <app-doc-code [code]="themeCode" />
    </section>

    <section>
      <h2>Form hata mesajları</h2>
      <p>
        <code>hu-form-field</code>, validator hatalarını Türkçe mesaja çevirir. Varsayılanları değiştirmek veya kendi
        validator'larınıza mesaj eklemek için <code>provideHuErrorMessages</code> kullanın; verdikleriniz varsayılanlarla birleşir.
      </p>
      <app-doc-code [code]="errorsCode" />
    </section>

    <section>
      <h2>Kendi ikonlarınız</h2>
      <p>24×24 viewBox'lı SVG path verisiyle yeni ikon ekleyin; aynı adla vererek yerleşik bir ikonu da değiştirebilirsiniz.</p>
      <app-doc-code [code]="iconsCode" />
    </section>

    <section>
      <h2>Gruplu import'lar</h2>
      <p>
        Birlikte kullanılan parçalar için hazır diziler var. Bir directive'i import etmeyi unutmak Angular'da sessizce
        başarısız olduğu (öznitelik yok sayıldığı) için bunları tercih edin.
      </p>
      <app-doc-code [code]="groupedCode" />
    </section>

    <section>
      <h2>Türkçe tarih biçimleri</h2>
      <p>
        Takvim ve tarih seçici Türkçe çalışır. Uygulamadaki <code>DatePipe</code>'ın da Türkçe ay adları göstermesi için
        yerel ayarı kaydedin:
      </p>
      <app-doc-code [code]="localeCode" />
    </section>
  `,
  styleUrl: './guide.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigurationPage {
  protected readonly tokensCode = `
// src/styles.scss
@use '@ucme-ui/angular/styles';

:root {
  --hu-primary: #0b5cad;          // ana renk
  --hu-primary-hover: #094a8c;
  --hu-primary-active: #073a6e;
  --hu-primary-soft: #e8f1fb;     // açık zemin (soft buton, seçili menü)
  --hu-primary-soft-fg: #094a8c;
  --hu-radius-md: 8px;            // köşe yuvarlaklığı
  --hu-sidebar-width: 280px;
}

:root[data-theme='dark'] {
  --hu-primary: #4c9be8;
}`;

  protected readonly themeCode = `
private readonly theme = inject(HuThemeService);

this.theme.setMode('dark');   // 'light' | 'dark' | 'system'
this.theme.toggle();
this.theme.resolved();        // şu an uygulanan: 'light' | 'dark'`;

  protected readonly errorsCode = `
// app.config.ts
import { provideHuErrorMessages } from '@ucme-ui/angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHuErrorMessages({
      required: 'Zorunlu alan.',
      minlength: (e) => \`En az \${e.requiredLength} karakter girin.\`,
      tckn: 'Geçerli bir T.C. kimlik numarası giriniz.',   // kendi validator'ınız
    }),
  ],
};`;

  protected readonly iconsCode = `
// app.config.ts
import { provideHuIcons } from '@ucme-ui/angular';

providers: [
  provideHuIcons({
    rocket: 'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z',
  }),
]

// Kullanım
<hu-icon name="rocket" />`;

  protected readonly groupedCode = `
import { HU_FORM_FIELD_IMPORTS, HU_TABLE_IMPORTS, HU_DIALOG_IMPORTS } from '@ucme-ui/angular';

@Component({
  imports: [HU_FORM_FIELD_IMPORTS, HU_TABLE_IMPORTS, HU_DIALOG_IMPORTS],
})
// HU_FORM_FIELD_IMPORTS → HuFormField, HuInput, HuPrefix, HuSuffix
// HU_TABLE_IMPORTS      → HuTable, HuCellDef
// HU_DIALOG_IMPORTS     → HuDialog, HuDialogFooter
// Ayrıca: HU_DROPDOWN_IMPORTS, HU_TABS_IMPORTS, HU_CARD_IMPORTS, HU_SHELL_IMPORTS`;

  protected readonly localeCode = `
// app.config.ts
import { registerLocaleData } from '@angular/common';
import localeTr from '@angular/common/locales/tr';

registerLocaleData(localeTr);

export const appConfig: ApplicationConfig = {
  providers: [{ provide: LOCALE_ID, useValue: 'tr' }],
};`;
}
