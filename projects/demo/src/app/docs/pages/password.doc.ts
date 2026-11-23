import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { HU_FORM_FIELD_IMPORTS, HuButton, HuPassword, HuToastService } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

/** Kardeş alanla aynı mı? (tekrar alanının doğrulayıcısı) */
function sameAs(other: string) {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.parent?.get(other)?.value;
    return control.value && value !== control.value ? { mismatch: true } : null;
  };
}

@Component({
  selector: 'app-password-doc',
  imports: [ReactiveFormsModule, DocPage, DocExample, HU_FORM_FIELD_IMPORTS, HuButton, HuPassword],
  template: `
    <app-doc-page slug="password">
      <app-doc-example
        title="Temel"
        description="Göz ikonuyla göster/gizle. Caps Lock açıkken uyarı çıkar (Caps Lock'u açıp yazmayı deneyin)."
        [code]="basicCode"
      >
        <hu-form-field label="Şifre" class="narrow">
          <hu-password [(value)]="login" placeholder="Şifrenizi girin" />
        </hu-form-field>
      </app-doc-example>

      <app-doc-example
        title="Güç göstergesi ve kurallar"
        description="feedback: 4 seviyeli güç çubuğu. showRules: hangi kuralların sağlandığı canlı gösterilir. Tekrar eden ve sıralı karakterler (1234, aaaa) puanı düşürür."
        [code]="feedbackCode"
      >
        <hu-form-field label="Yeni şifre" class="narrow">
          <hu-password feedback showRules rulesAlways autocomplete="new-password" />
        </hu-form-field>
      </app-doc-example>

      <app-doc-example
        title="Şifre değiştirme formu"
        description="minStrength ile en az 'İyi' (3) güç istenir; yetersizse huPasswordWeak hatası. Tekrar alanı grup doğrulayıcısıyla karşılaştırılır."
        [code]="formCode"
      >
        <form class="stack narrow" [formGroup]="form" (ngSubmit)="submit()">
          <hu-form-field label="Mevcut şifre" required>
            <hu-password formControlName="current" />
          </hu-form-field>
          <hu-form-field label="Yeni şifre" required>
            <hu-password formControlName="next" feedback showRules [minStrength]="3" autocomplete="new-password" />
          </hu-form-field>
          <hu-form-field label="Yeni şifre (tekrar)" required [error]="form.controls.repeat.hasError('mismatch') ? 'Şifreler eşleşmiyor.' : null">
            <hu-password formControlName="repeat" autocomplete="new-password" />
          </hu-form-field>
          <div class="row">
            <button hu-button type="submit">Şifreyi değiştir</button>
          </div>
        </form>
      </app-doc-example>

      <app-doc-example title="Boyutlar ve devre dışı" [code]="statesCode">
        <div class="stack narrow">
          <hu-password size="sm" ariaLabel="Küçük" [value]="'gizli123'" />
          <hu-password size="lg" ariaLabel="Büyük" />
          <hu-password disabled ariaLabel="Devre dışı" [value]="'gizli123'" />
        </div>
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `.narrow { max-width: 24rem; }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordDoc {
  private readonly toast = inject(HuToastService);
  protected readonly login = signal('');

  protected readonly form = inject(NonNullableFormBuilder).group({
    current: ['', Validators.required],
    next: ['', Validators.required],
    repeat: ['', [Validators.required, sameAs('next')]],
  });

  constructor() {
    // Yeni şifre değişince tekrar alanı yeniden doğrulansın
    this.form.controls.next.valueChanges.subscribe(() => this.form.controls.repeat.updateValueAndValidity({ emitEvent: false }));
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.toast.success('Şifreniz değiştirildi.');
    this.form.reset();
  }

  protected readonly basicCode = `
password = signal('');

<hu-form-field label="Şifre">
  <hu-password [(value)]="password" placeholder="Şifrenizi girin" />
</hu-form-field>`;

  protected readonly feedbackCode = `
<hu-password feedback showRules autocomplete="new-password" />

<!-- Kendi kurallarınız -->
rules: HuPasswordRule[] = [
  { label: 'En az 10 karakter', test: (v) => v.length >= 10 },
  { label: 'Rakam', test: (v) => /\\d/.test(v) },
];
<hu-password showRules [rules]="rules" />`;

  protected readonly formCode = `
// Tekrar alanı: kardeş alanla aynı mı?
sameAs = (other: string) => (control: AbstractControl): ValidationErrors | null =>
  control.value && control.parent?.get(other)?.value !== control.value ? { mismatch: true } : null;

form = this.fb.group({
  current: ['', Validators.required],
  next: ['', Validators.required],
  repeat: ['', [Validators.required, this.sameAs('next')]],
});

<hu-form-field label="Yeni şifre" required>
  <hu-password formControlName="next" feedback showRules [minStrength]="3" autocomplete="new-password" />
</hu-form-field>
<!-- minStrength (0–4): 1 Zayıf · 2 Orta · 3 İyi · 4 Güçlü. Yetersizse huPasswordWeak hatası -->`;

  protected readonly statesCode = `
<hu-password size="sm" />
<hu-password size="lg" />
<hu-password disabled />`;
}
