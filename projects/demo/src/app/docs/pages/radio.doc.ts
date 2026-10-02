import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HU_FORM_FIELD_IMPORTS, HU_RADIO_IMPORTS, HuButton, HuRadioOption, HuToastService } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

@Component({
  selector: 'app-radio-doc',
  imports: [ReactiveFormsModule, DocPage, DocExample, HU_FORM_FIELD_IMPORTS, HU_RADIO_IMPORTS, HuButton],
  template: `
    <app-doc-page slug="radio">
      <app-doc-example
        title="Temel"
        description="Seçenekleri içeride hu-radio olarak yazın. Klavye: Tab ile gruba girin, ok tuşlarıyla seçin."
        [code]="basicCode"
      >
        <hu-radio-group [(value)]="size" aria-label="Beden">
          <hu-radio value="s">Küçük</hu-radio>
          <hu-radio value="m">Orta</hu-radio>
          <hu-radio value="l">Büyük</hu-radio>
          <hu-radio value="xl" disabled>Çok büyük (tükendi)</hu-radio>
        </hu-radio-group>
        <p class="demo-label">Seçilen: {{ size() }}</p>
      </app-doc-example>

      <app-doc-example title="Yatay ve options ile" [code]="horizontalCode">
        <hu-form-field label="Öğrenim türü">
          <hu-radio-group orientation="horizontal" [options]="types" [(value)]="type" />
        </hu-form-field>
      </app-doc-example>

      <app-doc-example
        title="Kart görünümü"
        description="variant=&quot;card&quot;: açıklamalı, tıklama alanı geniş seçenekler (plan, ödeme yöntemi, teslimat)."
        [code]="cardCode"
      >
        <form [formGroup]="form" (ngSubmit)="submit()" class="stack">
          <hu-form-field label="Ödeme yöntemi" required>
            <hu-radio-group variant="card" orientation="horizontal" formControlName="payment" [options]="payments" />
          </hu-form-field>
          <div class="row"><button hu-button type="submit">Devam</button></div>
        </form>
      </app-doc-example>
    </app-doc-page>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioDoc {
  private readonly toast = inject(HuToastService);
  protected readonly size = signal('m');
  protected readonly type = signal('normal');
  protected readonly types: HuRadioOption[] = [
    { label: 'Normal öğretim', value: 'normal' },
    { label: 'İkinci öğretim', value: 'evening' },
    { label: 'Uzaktan', value: 'remote' },
  ];
  protected readonly payments: HuRadioOption[] = [
    { label: 'Kredi kartı', value: 'card', description: 'Tek çekim veya taksit' },
    { label: 'Havale / EFT', value: 'transfer', description: '1 iş günü içinde onaylanır' },
    { label: 'Kapıda ödeme', value: 'cod', description: 'Bu üründe kullanılamaz', disabled: true },
  ];
  protected readonly form = inject(NonNullableFormBuilder).group({ payment: ['', Validators.required] });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.toast.success(`Ödeme: ${this.form.value.payment}`);
  }

  protected readonly basicCode = `
size = signal('m');

<hu-radio-group [(value)]="size" aria-label="Beden">
  <hu-radio value="s">Küçük</hu-radio>
  <hu-radio value="m">Orta</hu-radio>
  <hu-radio value="xl" disabled>Çok büyük</hu-radio>
</hu-radio-group>`;

  protected readonly horizontalCode = `
types: HuRadioOption[] = [
  { label: 'Normal öğretim', value: 'normal' },
  { label: 'İkinci öğretim', value: 'evening' },
];

<hu-form-field label="Öğrenim türü">
  <hu-radio-group orientation="horizontal" [options]="types" [(value)]="type" />
</hu-form-field>`;

  protected readonly cardCode = `
payments: HuRadioOption[] = [
  { label: 'Kredi kartı', value: 'card', description: 'Tek çekim veya taksit' },
  { label: 'Havale / EFT', value: 'transfer', description: '1 iş günü içinde onaylanır' },
  { label: 'Kapıda ödeme', value: 'cod', disabled: true },
];

<hu-form-field label="Ödeme yöntemi" required>
  <hu-radio-group variant="card" orientation="horizontal" formControlName="payment" [options]="payments" />
</hu-form-field>`;
}
