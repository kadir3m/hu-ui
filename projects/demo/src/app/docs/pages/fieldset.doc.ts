import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HU_FORM_FIELD_IMPORTS, HuCheckbox, HuFieldset, HuSwitch } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

@Component({
  selector: 'app-fieldset-doc',
  imports: [DocPage, DocExample, HuFieldset, HU_FORM_FIELD_IMPORTS, HuCheckbox, HuSwitch],
  template: `
    <app-doc-page slug="fieldset">
      <app-doc-example title="Temel" description="Native fieldset/legend: ekran okuyucular alanları başlıkla birlikte okur." [code]="basicCode">
        <hu-fieldset legend="İletişim bilgileri" icon="mail">
          <div class="grid2">
            <hu-form-field label="E-posta"><input huInput type="email" placeholder="ad@example.com" /></hu-form-field>
            <hu-form-field label="Telefon"><input huInput type="tel" /></hu-form-field>
          </div>
        </hu-fieldset>
      </app-doc-example>

      <app-doc-example
        title="Açılır kapanır"
        description="toggleable ile başlık düğmeye dönüşür. Kapalıyken içerik DOM'da kalır; girilen değerler kaybolmaz."
        [code]="toggleCode"
      >
        <hu-fieldset legend="Gelişmiş ayarlar" icon="settings" toggleable [(collapsed)]="collapsed">
          <div class="stack">
            <hu-checkbox [checked]="true">Bildirimleri e-postayla gönder</hu-checkbox>
            <hu-checkbox>Haftalık özet</hu-checkbox>
          </div>
        </hu-fieldset>
        <p class="demo-label">collapsed: {{ collapsed() }}</p>
      </app-doc-example>

      <app-doc-example
        title="Devre dışı grup"
        description="disabled, içindeki tüm form kontrollerini tek seferde devre dışı bırakır (native davranış)."
        [code]="disabledCode"
      >
        <hu-switch [(checked)]="invoice">Fatura bilgisi farklı</hu-switch>
        <hu-fieldset legend="Fatura adresi" [disabled]="!invoice()" class="mt">
          <div class="grid2">
            <hu-form-field label="Şehir"><input huInput /></hu-form-field>
            <hu-form-field label="Posta kodu"><input huInput /></hu-form-field>
          </div>
        </hu-fieldset>
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `
    .grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); gap: var(--hu-space-4); }
    .mt { margin-top: var(--hu-space-3); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldsetDoc {
  protected readonly collapsed = signal(true);
  protected readonly invoice = signal(false);

  protected readonly basicCode = `
<hu-fieldset legend="İletişim bilgileri" icon="mail">
  <hu-form-field label="E-posta"><input huInput type="email" /></hu-form-field>
  <hu-form-field label="Telefon"><input huInput type="tel" /></hu-form-field>
</hu-fieldset>`;

  protected readonly toggleCode = `
collapsed = signal(true);

<hu-fieldset legend="Gelişmiş ayarlar" icon="settings" toggleable [(collapsed)]="collapsed">
  <hu-checkbox [checked]="true">Bildirimleri e-postayla gönder</hu-checkbox>
  <hu-checkbox>Haftalık özet</hu-checkbox>
</hu-fieldset>`;

  protected readonly disabledCode = `
invoice = signal(false);

<hu-switch [(checked)]="invoice">Fatura bilgisi farklı</hu-switch>
<hu-fieldset legend="Fatura adresi" [disabled]="!invoice()">
  <hu-form-field label="Şehir"><input huInput /></hu-form-field>
</hu-fieldset>`;
}
