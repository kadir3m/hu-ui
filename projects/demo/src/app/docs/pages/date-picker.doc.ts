import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  HU_FORM_FIELD_IMPORTS,
  HuButton,
  HuDatePicker,
  HuDatePickerValue,
  HuDateRange,
  addDays,
  formatDate,
  formatRange,
  startOfDay,
} from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

@Component({
  selector: 'app-date-picker-doc',
  imports: [ReactiveFormsModule, DocPage, DocExample, HU_FORM_FIELD_IMPORTS, HuButton, HuDatePicker],
  template: `
    <app-doc-page slug="date-picker">
      <app-doc-example title="Temel" description="Elle yazın (5/11/2026, 05112026 …) veya takvim ikonuna tıklayın." [code]="basicCode">
        <div class="field">
          <hu-date-picker [(value)]="date" />
          <p class="demo-label">value: {{ show(date()) }}</p>
        </div>
      </app-doc-example>

      <app-doc-example title="Aralık" description="mode=&quot;range&quot; ile değer { start, end } olur." [code]="rangeCode">
        <div class="field">
          <hu-date-picker mode="range" [(value)]="period" />
          <p class="demo-label">value: {{ show(period()) }}</p>
        </div>
      </app-doc-example>

      <app-doc-example title="Form ve doğrulama" description="min/max, dateFilter ve hatalı metin Türkçe hata mesajına dönüşür." [code]="formCode">
        <form class="stack field" [formGroup]="form">
          <hu-form-field label="Başvuru tarihi" hint="Bugünden itibaren 90 gün içinde" required>
            <hu-date-picker formControlName="apply" [min]="today" [max]="maxDate" />
          </hu-form-field>
          <hu-form-field label="İzin aralığı" hint="Hafta sonları seçilemez">
            <hu-date-picker mode="range" formControlName="leave" [dateFilter]="weekdays" />
          </hu-form-field>
          <hu-form-field label="Devre dışı">
            <hu-date-picker formControlName="locked" />
          </hu-form-field>
          <div class="row">
            <button hu-button type="button" (click)="form.markAllAsTouched()">Doğrula</button>
            <button hu-button variant="ghost" type="button" (click)="form.reset()">Sıfırla</button>
          </div>
          <pre class="form-value">{{ formValue() }}</pre>
        </form>
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `
    .field { max-width: 22rem; }
    .field > .demo-label { margin-top: var(--hu-space-2); }
    .form-value {
      margin: 0; padding: var(--hu-space-3);
      font-family: var(--hu-font-mono); font-size: var(--hu-text-xs); white-space: pre-wrap;
      background: var(--hu-surface-2); border: 1px solid var(--hu-border); border-radius: var(--hu-radius-md);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerDoc {
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly today = startOfDay(new Date());
  protected readonly maxDate = addDays(this.today, 90);
  protected readonly weekdays = (d: Date) => d.getDay() !== 0 && d.getDay() !== 6;

  protected readonly date = signal<HuDatePickerValue>(null);
  protected readonly period = signal<HuDatePickerValue>(null);

  protected readonly form = this.fb.group({
    apply: this.fb.control<Date | null>(null, Validators.required),
    leave: this.fb.control<HuDateRange | null>(null),
    locked: this.fb.control<Date | null>({ value: this.today, disabled: true }),
  });
  private readonly value = toSignal(this.form.valueChanges, { initialValue: this.form.value });
  protected readonly formValue = computed(() => {
    const v = this.value();
    return `apply: ${v.apply ? formatDate(v.apply) : 'null'}\nleave: ${v.leave ? formatRange(v.leave) : 'null'}`;
  });

  protected show(v: HuDatePickerValue): string {
    if (!v) return 'null';
    return v instanceof Date ? formatDate(v) : formatRange(v);
  }

  protected readonly basicCode = `<hu-date-picker [(value)]="date" />`;

  protected readonly rangeCode = `
<hu-date-picker mode="range" [(value)]="period" />
// period(): { start: Date | null, end: Date | null }`;

  protected readonly formCode = `
form = this.fb.group({
  apply: this.fb.control<Date | null>(null, Validators.required),
  leave: this.fb.control<HuDateRange | null>(null),
});

<hu-form-field label="Başvuru tarihi" required>
  <hu-date-picker formControlName="apply" [min]="today" [max]="maxDate" />
</hu-form-field>
<hu-form-field label="İzin aralığı">
  <hu-date-picker mode="range" formControlName="leave" [dateFilter]="weekdays" />
</hu-form-field>`;
}
