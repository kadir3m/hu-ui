import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HU_FORM_FIELD_IMPORTS, HuButton, HuRating, HuToastService } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

@Component({
  selector: 'app-rating-doc',
  imports: [ReactiveFormsModule, DocPage, DocExample, HU_FORM_FIELD_IMPORTS, HuButton, HuRating],
  template: `
    <app-doc-page slug="rating">
      <app-doc-example
        title="Temel"
        description="Üzerine gelince önizleme; seçili yıldıza tekrar tıklamak puanı temizler. Klavye: Tab ile gelin, ok tuşlarıyla puan verin."
        [code]="basicCode"
      >
        <div class="row">
          <hu-rating [(value)]="score" showLabel ariaLabel="Ders memnuniyeti" />
        </div>
        <p class="demo-label">Değer: {{ score() }}</p>
      </app-doc-example>

      <app-doc-example
        title="Salt okunur ve ortalama"
        description="readonly ile ondalık değerler kısmi dolu yıldızla gösterilir."
        [code]="readonlyCode"
      >
        <div class="reviews">
          @for (r of reviews; track r.name) {
            <div class="review">
              <strong>{{ r.name }}</strong>
              <hu-rating [value]="r.avg" readonly size="sm" />
              <span class="hu-text-muted">{{ r.avg.toLocaleString('tr-TR') }} · {{ r.count }} değerlendirme</span>
            </div>
          }
        </div>
      </app-doc-example>

      <app-doc-example
        title="Form ile, boyutlar ve 10 üzerinden"
        description="Validators.min(1) ile puan zorunlu tutulabilir."
        [code]="formCode"
      >
        <form class="stack" [formGroup]="form" (ngSubmit)="submit()">
          <hu-form-field label="Hizmeti değerlendirin" required [error]="form.controls.service.touched && form.controls.service.invalid ? 'Lütfen puan verin.' : null">
            <hu-rating formControlName="service" size="lg" showLabel />
          </hu-form-field>
          <hu-form-field label="Tavsiye etme olasılığınız (0–10)">
            <hu-rating formControlName="nps" [max]="10" size="sm" [labels]="[]" showLabel />
          </hu-form-field>
          <div class="row">
            <button hu-button type="submit">Gönder</button>
            <hu-rating [value]="3" disabled ariaLabel="Devre dışı" />
          </div>
        </form>
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `
    .reviews { display: flex; flex-direction: column; gap: var(--hu-space-3); }
    .review { display: grid; grid-template-columns: 10rem auto 1fr; align-items: center; gap: var(--hu-space-3); font-size: var(--hu-text-sm); }
    @media (max-width: 599.98px) { .review { grid-template-columns: 1fr; gap: var(--hu-space-1); } }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingDoc {
  private readonly toast = inject(HuToastService);
  protected readonly score = signal(3);
  protected readonly reviews = [
    { name: 'Veri Yapıları', avg: 4.6, count: 128 },
    { name: 'Analiz I', avg: 3.4, count: 96 },
    { name: 'Fizik I', avg: 2.8, count: 71 },
  ];
  protected readonly form = inject(NonNullableFormBuilder).group({
    service: [0, Validators.min(1)],
    nps: [0],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.toast.success(`Teşekkürler! Puan: ${this.form.value.service}/5`);
  }

  protected readonly basicCode = `
score = signal(3);

<hu-rating [(value)]="score" showLabel ariaLabel="Ders memnuniyeti" />`;

  protected readonly readonlyCode = `
<hu-rating [value]="4.6" readonly size="sm" />`;

  protected readonly formCode = `
form = this.fb.group({
  service: [0, Validators.min(1)],
  nps: [0],
});

<hu-form-field label="Hizmeti değerlendirin" required>
  <hu-rating formControlName="service" size="lg" showLabel />
</hu-form-field>
<hu-rating formControlName="nps" [max]="10" size="sm" [labels]="[]" showLabel />`;
}
