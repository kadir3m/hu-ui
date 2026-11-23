import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HU_ACCORDION_IMPORTS, HU_FORM_FIELD_IMPORTS, HuBadge, HuButton, HuSwitch } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

@Component({
  selector: 'app-accordion-doc',
  imports: [DocPage, DocExample, HU_ACCORDION_IMPORTS, HU_FORM_FIELD_IMPORTS, HuBadge, HuButton, HuSwitch],
  template: `
    <app-doc-page slug="accordion">
      <app-doc-example
        title="Sık sorulan sorular"
        description="Varsayılan olarak tek panel açık kalır. Başlıklar arasında ↑/↓, Home/End ile gezilir."
        [code]="basicCode"
      >
        <hu-accordion [(value)]="faq">
          <hu-accordion-panel header="Ders kaydı ne zaman başlar?" value="kayit">
            Ders kayıtları akademik takvimde belirtilen tarihlerde, dönem başlamadan bir hafta önce açılır.
          </hu-accordion-panel>
          <hu-accordion-panel header="Danışman onayı zorunlu mu?" value="onay">
            Evet. Seçtiğiniz dersler danışmanınız onaylayana kadar kesinleşmez.
          </hu-accordion-panel>
          <hu-accordion-panel header="Ekle-bırak dönemi" value="ekle" subtitle="Kayıttan sonraki ilk hafta">
            Ekle-bırak döneminde en fazla iki ders değişikliği yapabilirsiniz.
          </hu-accordion-panel>
          <hu-accordion-panel header="Mezuniyet başvurusu" value="mezun" disabled>Bu dönem kapalı.</hu-accordion-panel>
        </hu-accordion>
        <p class="demo-label">Açık: {{ faq().join(', ') || '—' }}</p>
      </app-doc-example>

      <app-doc-example
        title="Çoklu, ikonlu ve aralıklı"
        description="multiple ile birden çok panel açık kalabilir; variant=&quot;separated&quot; panelleri kart gibi ayırır. huAccordionHeaderEnd ile başlığın sağına rozet koyabilirsiniz."
        [code]="multipleCode"
      >
        <div class="row">
          <button hu-button size="sm" variant="outline" (click)="settings.expandAll()">Tümünü aç</button>
          <button hu-button size="sm" variant="ghost" (click)="settings.collapseAll()">Tümünü kapat</button>
        </div>
        <hu-accordion #settings multiple variant="separated" [value]="['profil']">
          <hu-accordion-panel header="Profil" subtitle="Ad, e-posta ve fotoğraf" icon="user" value="profil">
            <div class="stack">
              <hu-form-field label="Ad Soyad"><input huInput value="Ayşe Yılmaz" /></hu-form-field>
              <hu-form-field label="E-posta"><input huInput type="email" value="ayse@example.com" /></hu-form-field>
            </div>
          </hu-accordion-panel>
          <hu-accordion-panel header="Bildirimler" subtitle="E-posta ve anlık bildirimler" icon="bell" value="bildirim">
            <span huAccordionHeaderEnd><hu-badge variant="primary">3 yeni</hu-badge></span>
            <div class="stack">
              <hu-switch [checked]="true">Duyurular</hu-switch>
              <hu-switch>Not girişleri</hu-switch>
            </div>
          </hu-accordion-panel>
          <hu-accordion-panel header="Güvenlik" subtitle="Şifre ve iki adımlı doğrulama" icon="lock" value="guvenlik">
            Son şifre değişikliği: 3 ay önce.
          </hu-accordion-panel>
        </hu-accordion>
      </app-doc-example>

      <app-doc-example title="Çerçevesiz" description="variant=&quot;flush&quot; kart veya yan panel içinde kullanmak için." [code]="flushCode">
        <hu-accordion variant="flush" [value]="[0]">
          <hu-accordion-panel header="Filtreler">Durum, tarih ve birim filtreleri.</hu-accordion-panel>
          <hu-accordion-panel header="Sütunlar">Görünen sütunları seçin.</hu-accordion-panel>
        </hu-accordion>
      </app-doc-example>
    </app-doc-page>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionDoc {
  protected readonly faq = signal<(string | number)[]>(['kayit']);

  protected readonly basicCode = `
faq = signal<(string | number)[]>(['kayit']);

<hu-accordion [(value)]="faq">
  <hu-accordion-panel header="Ders kaydı ne zaman başlar?" value="kayit">
    Ders kayıtları dönem başlamadan bir hafta önce açılır.
  </hu-accordion-panel>
  <hu-accordion-panel header="Ekle-bırak dönemi" value="ekle" subtitle="Kayıttan sonraki ilk hafta">
    En fazla iki ders değişikliği yapabilirsiniz.
  </hu-accordion-panel>
  <hu-accordion-panel header="Mezuniyet başvurusu" value="mezun" disabled>Bu dönem kapalı.</hu-accordion-panel>
</hu-accordion>`;

  protected readonly multipleCode = `
<button hu-button size="sm" variant="outline" (click)="settings.expandAll()">Tümünü aç</button>
<hu-accordion #settings multiple variant="separated" [value]="['profil']">
  <hu-accordion-panel header="Profil" subtitle="Ad, e-posta ve fotoğraf" icon="user" value="profil">
    …
  </hu-accordion-panel>
  <hu-accordion-panel header="Bildirimler" icon="bell" value="bildirim">
    <span huAccordionHeaderEnd><hu-badge variant="primary">3 yeni</hu-badge></span>
    …
  </hu-accordion-panel>
</hu-accordion>`;

  protected readonly flushCode = `
<!-- value verilmezse paneller sırasıyla 0, 1, 2… anahtarını alır -->
<hu-accordion variant="flush" [value]="[0]">
  <hu-accordion-panel header="Filtreler">…</hu-accordion-panel>
  <hu-accordion-panel header="Sütunlar">…</hu-accordion-panel>
</hu-accordion>`;
}
