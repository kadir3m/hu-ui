import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HU_FORM_FIELD_IMPORTS, HuButton, HuInputNumber, HuToastService } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

@Component({
  selector: 'app-input-number-doc',
  imports: [ReactiveFormsModule, DocPage, DocExample, HU_FORM_FIELD_IMPORTS, HuButton, HuInputNumber],
  template: `
    <app-doc-page slug="input-number">
      <app-doc-example
        title="Temel"
        description="Yazarken binlik ayracı eklenir. ↑/↓ ile artırıp azaltın (Shift ile 10'ar). Nokta tuşu da ondalık virgülü yazar."
        [code]="basicCode"
      >
        <div class="hu-grid">
          <hu-form-field class="hu-col-12 hu-col-md-4" label="Tam sayı">
            <hu-input-number [(value)]="integer" placeholder="0" />
          </hu-form-field>
          <hu-form-field class="hu-col-12 hu-col-md-4" label="İki ondalık">
            <hu-input-number [(value)]="decimal" [maxFractionDigits]="2" />
          </hu-form-field>
          <hu-form-field class="hu-col-12 hu-col-md-4" label="Gruplamasız (öğrenci no)">
            <hu-input-number [(value)]="plain" [useGrouping]="false" />
          </hu-form-field>
        </div>
        <p class="demo-label">Değerler: {{ integer() }} · {{ decimal() }} · {{ plain() }}</p>
      </app-doc-example>

      <app-doc-example title="Para birimi, ön ek ve son ek" [code]="currencyCode">
        <div class="hu-grid">
          <hu-form-field class="hu-col-12 hu-col-md-3" label="Harç ücreti">
            <hu-input-number [(value)]="fee" mode="currency" currency="TRY" />
          </hu-form-field>
          <hu-form-field class="hu-col-12 hu-col-md-3" label="Burs (USD)">
            <hu-input-number [value]="1500" mode="currency" currency="USD" />
          </hu-form-field>
          <hu-form-field class="hu-col-12 hu-col-md-3" label="İndirim">
            <hu-input-number [value]="15" suffix="%" [min]="0" [max]="100" />
          </hu-form-field>
          <hu-form-field class="hu-col-12 hu-col-md-3" label="Ağırlık">
            <hu-input-number [value]="72.5" suffix="kg" [maxFractionDigits]="1" />
          </hu-form-field>
        </div>
      </app-doc-example>

      <app-doc-example
        title="Butonlar"
        description="Butonu basılı tutunca değer hızlanarak değişir. Sınıra gelince ilgili buton pasifleşir."
        [code]="buttonsCode"
      >
        <div class="hu-grid">
          <hu-form-field class="hu-col-12 hu-col-md-4" label="Kontenjan (horizontal)">
            <hu-input-number [(value)]="quota" buttons="horizontal" [min]="0" [max]="200" [step]="5" />
          </hu-form-field>
          <hu-form-field class="hu-col-12 hu-col-md-4" label="Kredi (stacked)">
            <hu-input-number [value]="6" buttons="stacked" [min]="1" [max]="10" suffix="AKTS" />
          </hu-form-field>
          <hu-form-field class="hu-col-12 hu-col-md-4" label="Not ortalaması">
            <hu-input-number [value]="3.25" buttons="stacked" [min]="0" [max]="4" [step]="0.05" [minFractionDigits]="2" [maxFractionDigits]="2" />
          </hu-form-field>
        </div>
      </app-doc-example>

      <app-doc-example
        title="Form ile"
        description="min/max dışındaki değer odaktan çıkınca sınıra çekilir; Validators.required boş alanda çalışır."
        [code]="formCode"
      >
        <form class="hu-grid" [formGroup]="form" (ngSubmit)="submit()">
          <hu-form-field class="hu-col-12 hu-col-md-6" label="Öğrenci sayısı" hint="1 ile 500 arası" required>
            <hu-input-number formControlName="students" [min]="1" [max]="500" buttons="horizontal" />
          </hu-form-field>
          <hu-form-field class="hu-col-12 hu-col-md-6" label="Bütçe" required>
            <hu-input-number formControlName="budget" mode="currency" />
          </hu-form-field>
          <div class="hu-col-12 row">
            <button hu-button type="submit">Kaydet</button>
            <button hu-button type="button" variant="ghost" (click)="form.reset()">Temizle</button>
          </div>
        </form>
      </app-doc-example>

      <app-doc-example title="Boyutlar ve durumlar" [code]="statesCode">
        <div class="hu-grid">
          <hu-input-number class="hu-col-12 hu-col-md-4" size="sm" [value]="12" buttons="horizontal" ariaLabel="Küçük" />
          <hu-input-number class="hu-col-12 hu-col-md-4" [value]="1250" disabled ariaLabel="Devre dışı" />
          <hu-input-number class="hu-col-12 hu-col-md-4" size="lg" [value]="99" readonly ariaLabel="Salt okunur" />
        </div>
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `.demo-label { margin-top: var(--hu-space-3); font-variant-numeric: tabular-nums; }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputNumberDoc {
  private readonly toast = inject(HuToastService);

  protected readonly integer = signal<number | null>(1250000);
  protected readonly decimal = signal<number | null>(1234.5);
  protected readonly plain = signal<number | null>(21945678);
  protected readonly fee = signal<number | null>(2450.75);
  protected readonly quota = signal<number | null>(40);

  protected readonly form = inject(NonNullableFormBuilder).group({
    students: [null as number | null, Validators.required],
    budget: [null as number | null, Validators.required],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.toast.success(`${this.form.value.students} öğrenci, ${this.form.value.budget} ₺ kaydedildi.`);
  }

  protected readonly basicCode = `
<hu-input-number [(value)]="count" />
<hu-input-number [(value)]="amount" [maxFractionDigits]="2" />
<hu-input-number [(value)]="studentNo" [useGrouping]="false" />`;

  protected readonly currencyCode = `
<hu-input-number [(value)]="fee" mode="currency" currency="TRY" />   <!-- ₺ 2.450,75 -->
<hu-input-number [(value)]="grant" mode="currency" currency="USD" />
<hu-input-number [(value)]="discount" suffix="%" [min]="0" [max]="100" />
<hu-input-number [(value)]="weight" suffix="kg" [maxFractionDigits]="1" />`;

  protected readonly buttonsCode = `
<hu-input-number [(value)]="quota" buttons="horizontal" [min]="0" [max]="200" [step]="5" />
<hu-input-number [(value)]="credit" buttons="stacked" [min]="1" [max]="10" suffix="AKTS" />
<hu-input-number [(value)]="gpa" buttons="stacked" [min]="0" [max]="4" [step]="0.05"
                 [minFractionDigits]="2" [maxFractionDigits]="2" />`;

  protected readonly formCode = `
form = this.fb.group({
  students: [null as number | null, Validators.required],
  budget: [null as number | null, Validators.required],
});

<hu-form-field label="Öğrenci sayısı" hint="1 ile 500 arası" required>
  <hu-input-number formControlName="students" [min]="1" [max]="500" buttons="horizontal" />
</hu-form-field>
<hu-form-field label="Bütçe" required>
  <hu-input-number formControlName="budget" mode="currency" />
</hu-form-field>`;

  protected readonly statesCode = `
<hu-input-number size="sm" buttons="horizontal" />
<hu-input-number disabled />
<hu-input-number size="lg" readonly />`;
}
