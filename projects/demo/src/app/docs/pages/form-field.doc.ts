import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HU_FORM_FIELD_IMPORTS, HuButton, HuIcon } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

@Component({
  selector: 'app-form-field-doc',
  imports: [ReactiveFormsModule, DocPage, DocExample, HU_FORM_FIELD_IMPORTS, HuButton, HuIcon],
  template: `
    <app-doc-page slug="form-field">
      <app-doc-example title="Label, yardım metni, zorunlu" [code]="basicCode">
        <div class="field">
          <hu-form-field label="Ad Soyad" hint="Nüfus cüzdanındaki gibi yazın." required>
            <input huInput placeholder="Örn. Ayşe Yılmaz" />
          </hu-form-field>
        </div>
      </app-doc-example>

      <app-doc-example title="Prefix ve suffix" [code]="affixCode">
        <div class="stack field">
          <hu-form-field label="Arama">
            <hu-icon huPrefix name="search" [size]="16" />
            <input huInput type="search" placeholder="Ders ara…" />
          </hu-form-field>
          <hu-form-field label="Şifre">
            <hu-icon huPrefix name="lock" [size]="16" />
            <input huInput [type]="show() ? 'text' : 'password'" value="gizli-sifre" />
            <button huSuffix hu-button variant="ghost" size="sm" iconOnly type="button"
                    [attr.aria-label]="show() ? 'Şifreyi gizle' : 'Şifreyi göster'" (click)="show.set(!show())">
              <hu-icon name="eye" [size]="16" />
            </button>
          </hu-form-field>
        </div>
      </app-doc-example>

      <app-doc-example
        title="Otomatik hata mesajları"
        description="Alana dokunup çıkın veya Gönder'e basın: validator hataları Türkçe mesaja çevrilir."
        [code]="formCode"
      >
        <form class="stack field" [formGroup]="form" (ngSubmit)="form.markAllAsTouched()">
          <hu-form-field label="E-posta" required>
            <hu-icon huPrefix name="mail" [size]="16" />
            <input huInput type="email" formControlName="email" />
          </hu-form-field>
          <hu-form-field label="Öğrenci numarası" hint="9 haneli" required>
            <input huInput formControlName="studentNo" inputmode="numeric" />
          </hu-form-field>
          <div><button hu-button type="submit">Gönder</button></div>
        </form>
      </app-doc-example>

      <app-doc-example title="Sabit hata" description="error input'u verilirse her zaman gösterilir." [code]="errorCode">
        <div class="field">
          <hu-form-field label="Kullanıcı adı" error="Bu kullanıcı adı alınmış.">
            <input huInput value="admin" />
          </hu-form-field>
        </div>
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `.field { max-width: 24rem; }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldDoc {
  protected readonly show = signal(false);
  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    studentNo: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
  });

  protected readonly basicCode = `
<hu-form-field label="Ad Soyad" hint="Nüfus cüzdanındaki gibi yazın." required>
  <input huInput placeholder="Örn. Ayşe Yılmaz" />
</hu-form-field>`;

  protected readonly affixCode = `
<hu-form-field label="Arama">
  <hu-icon huPrefix name="search" [size]="16" />
  <input huInput type="search" />
</hu-form-field>

<hu-form-field label="Şifre">
  <input huInput [type]="show() ? 'text' : 'password'" />
  <button huSuffix hu-button variant="ghost" size="sm" iconOnly aria-label="Göster" (click)="show.set(!show())">
    <hu-icon name="eye" [size]="16" />
  </button>
</hu-form-field>`;

  protected readonly formCode = `
form = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  studentNo: ['', [Validators.required, Validators.pattern(/^\\d{9}$/)]],
});

<hu-form-field label="E-posta" required>
  <input huInput type="email" formControlName="email" />
</hu-form-field>

// Mesajları değiştirmek için:
providers: [provideHuErrorMessages({ pattern: 'Geçersiz biçim.' })]`;

  protected readonly errorCode = `
<hu-form-field label="Kullanıcı adı" error="Bu kullanıcı adı alınmış.">
  <input huInput />
</hu-form-field>`;
}
