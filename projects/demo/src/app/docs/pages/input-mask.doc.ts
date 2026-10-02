import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HU_FORM_FIELD_IMPORTS, HU_MASKS, HuButton, HuInputMask, HuToastService } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

@Component({
  selector: 'app-input-mask-doc',
  imports: [JsonPipe, ReactiveFormsModule, DocPage, DocExample, HU_FORM_FIELD_IMPORTS, HuButton, HuInputMask],
  template: `
    <app-doc-page slug="input-mask">
      <app-doc-example
        title="Hazır maskeler"
        description="Yazarken biçimlenir; harf veya fazla karakter yazılamaz. Yapıştırılan '5551234567' veya '+90 (555) 123-45-67' de düzeltilir. Parantez ve boşlukların üzerinden Backspace ile silebilirsiniz."
        [code]="presetsCode"
      >
        <div class="hu-grid">
          <hu-form-field class="hu-col-12 hu-col-md-6" label="Telefon">
            <input huInput [huMask]="masks.phone" />
          </hu-form-field>
          <hu-form-field class="hu-col-12 hu-col-md-6" label="Doğum tarihi">
            <input huInput [huMask]="masks.date" />
          </hu-form-field>
          <hu-form-field class="hu-col-12 hu-col-md-6" label="T.C. kimlik no">
            <input huInput [huMask]="masks.tckn" />
          </hu-form-field>
          <hu-form-field class="hu-col-12 hu-col-md-6" label="Saat">
            <input huInput [huMask]="masks.time" />
          </hu-form-field>
          <hu-form-field class="hu-col-12" label="IBAN">
            <input huInput [huMask]="masks.iban" />
          </hu-form-field>
          <hu-form-field class="hu-col-12 hu-col-md-6" label="Kart numarası">
            <input huInput [huMask]="masks.card" />
          </hu-form-field>
        </div>
      </app-doc-example>

      <app-doc-example
        title="Kendi maskeniz"
        description="9 rakam, a harf (Türkçe harfler dahil), * harf veya rakam; diğer karakterler sabittir. Harfler varsayılan olarak büyük yazılır."
        [code]="customCode"
      >
        <div class="hu-grid">
          <hu-form-field class="hu-col-12 hu-col-md-6" label="Öğrenci no (2 harf + 7 rakam)">
            <input huInput huMask="aa-9999999" />
          </hu-form-field>
          <hu-form-field class="hu-col-12 hu-col-md-6" label="Lisans anahtarı">
            <input huInput huMask="*****-*****-*****" />
          </hu-form-field>
        </div>
      </app-doc-example>

      <app-doc-example
        title="Form ile"
        description="Eksik girişte huMask hatası (Eksik veya hatalı giriş.). unmask ile forma yalnızca rakamlar gider."
        [code]="formCode"
      >
        <form class="hu-grid" [formGroup]="form" (ngSubmit)="submit()">
          <hu-form-field class="hu-col-12 hu-col-md-6" label="Cep telefonu" required>
            <input huInput [huMask]="masks.mobile" unmask formControlName="phone" />
          </hu-form-field>
          <hu-form-field class="hu-col-12 hu-col-md-6" label="IBAN" required>
            <input huInput [huMask]="masks.iban" formControlName="iban" />
          </hu-form-field>
          <div class="hu-col-12 row">
            <button hu-button type="submit">Kaydet</button>
            <button hu-button type="button" variant="ghost" (click)="form.reset()">Temizle</button>
          </div>
          <pre class="hu-col-12 value">{{ form.getRawValue() | json }}</pre>
        </form>
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `
    .value {
      margin: 0; padding: var(--hu-space-3); font-family: var(--hu-font-mono); font-size: var(--hu-text-xs);
      background: var(--hu-surface-2); border-radius: var(--hu-radius-md);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputMaskDoc {
  private readonly toast = inject(HuToastService);
  protected readonly masks = HU_MASKS;
  protected readonly form = inject(NonNullableFormBuilder).group({
    phone: ['', Validators.required],
    iban: ['', Validators.required],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.toast.success('Bilgiler kaydedildi.');
  }

  protected readonly presetsCode = `
import { HU_MASKS, HuInputMask } from '@ucme-ui/angular';
masks = HU_MASKS;

<input huInput [huMask]="masks.phone" />   <!-- (999) 999 99 99 -->
<input huInput [huMask]="masks.date" />    <!-- 99.99.9999 -->
<input huInput [huMask]="masks.tckn" />
<input huInput [huMask]="masks.iban" />    <!-- TR99 9999 … -->
<input huInput [huMask]="masks.card" />`;

  protected readonly customCode = `
<!-- 9 rakam · a harf · * harf veya rakam · diğerleri sabit (\\\\9 ile kaçış) -->
<input huInput huMask="aa-9999999" />
<input huInput huMask="*****-*****-*****" [uppercase]="false" />`;

  protected readonly formCode = `
masks = HU_MASKS;

form = this.fb.group({
  phone: ['', Validators.required],   // unmask: '5551234567'
  iban: ['', Validators.required],    // maskeli: 'TR12 3456 …'
});

<hu-form-field label="Cep telefonu" required>
  <input huInput [huMask]="masks.mobile" unmask formControlName="phone" />
</hu-form-field>
<hu-form-field label="IBAN" required>
  <input huInput [huMask]="masks.iban" formControlName="iban" />
</hu-form-field>`;
}
