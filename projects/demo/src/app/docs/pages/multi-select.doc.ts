import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HU_FORM_FIELD_IMPORTS, HuButton, HuMultiSelect, HuSelectOption, HuToastService } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

interface Course {
  code: string;
  name: string;
}

@Component({
  selector: 'app-multi-select-doc',
  imports: [JsonPipe, ReactiveFormsModule, DocPage, DocExample, HU_FORM_FIELD_IMPORTS, HuButton, HuMultiSelect],
  template: `
    <app-doc-page slug="multi-select">
      <app-doc-example
        title="Temel"
        description="Arama Türkçe karakterleri yok sayar: 'ogr' yazınca 'Öğrenci İşleri' bulunur. Klavye: ↑/↓, Enter/Boşluk ile seç, Esc ile kapat; kapalıyken Backspace son seçimi kaldırır."
        [code]="basicCode"
      >
        <hu-form-field label="Birimler" class="narrow">
          <hu-multi-select [options]="units" [(value)]="selectedUnits" placeholder="Birim seçin" />
        </hu-form-field>
        <p class="demo-label">Değer: {{ selectedUnits() | json }}</p>
      </app-doc-example>

      <app-doc-example
        title="Gruplar ve açıklamalar"
        description="group alanı aynı olan seçenekler bir başlık altında listelenir. Üçten fazla seçimde '5 seçildi' yazar (maxSelectedLabels)."
        [code]="groupCode"
      >
        <hu-form-field label="Bölümler" class="narrow">
          <hu-multi-select [options]="departments" [(value)]="selectedDepartments" placeholder="Bölüm seçin" />
        </hu-form-field>
      </app-doc-example>

      <app-doc-example
        title="Form ile ve seçim sınırı"
        description="selectionLimit ile en fazla seçim sayısı sınırlanır; sınıra gelince diğer seçenekler pasifleşir."
        [code]="formCode"
      >
        <form class="stack narrow" [formGroup]="form" (ngSubmit)="submit()">
          <hu-form-field label="Seçmeli dersler" hint="En fazla 3 ders" required>
            <hu-multi-select
              formControlName="courses"
              [options]="courseOptions"
              [selectionLimit]="3"
              [compareWith]="sameCourse"
              placeholder="Ders seçin"
            />
          </hu-form-field>
          <div class="row">
            <button hu-button type="submit">Kaydet</button>
            <button hu-button type="button" variant="ghost" (click)="form.reset()">Temizle</button>
          </div>
        </form>
      </app-doc-example>

      <app-doc-example title="Metin gösterimi, aramasız, boyutlar" [code]="displayCode">
        <div class="hu-grid">
          <hu-multi-select class="hu-col-12 hu-col-md-4" display="text" [options]="units" [value]="['oi', 'bi']" ariaLabel="Metin gösterimi" />
          <hu-multi-select class="hu-col-12 hu-col-md-4" [filter]="false" size="sm" [options]="days" placeholder="Günler" ariaLabel="Günler" />
          <hu-multi-select class="hu-col-12 hu-col-md-4" disabled [options]="units" [value]="['ik']" ariaLabel="Devre dışı" />
        </div>
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `
    .narrow { max-width: 28rem; }
    .demo-label { margin-top: var(--hu-space-3); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiSelectDoc {
  private readonly toast = inject(HuToastService);

  protected readonly units: HuSelectOption[] = [
    { label: 'Öğrenci İşleri', value: 'oi', icon: 'graduation-cap' },
    { label: 'Bilgi İşlem', value: 'bi', icon: 'monitor' },
    { label: 'İnsan Kaynakları', value: 'ik', icon: 'users' },
    { label: 'Kütüphane', value: 'ktp', icon: 'book-open' },
    { label: 'Satın Alma', value: 'sa', icon: 'file-text' },
    { label: 'Yapı İşleri', value: 'yi', icon: 'building', disabled: true },
  ];
  protected readonly selectedUnits = signal<string[]>(['oi', 'bi']);

  protected readonly departments: HuSelectOption[] = [
    { label: 'Bilgisayar Mühendisliği', value: 'bm', group: 'Mühendislik', description: 'Lisans · %30 İngilizce' },
    { label: 'Elektrik-Elektronik Mühendisliği', value: 'eem', group: 'Mühendislik', description: 'Lisans · %30 İngilizce' },
    { label: 'Endüstri Mühendisliği', value: 'end', group: 'Mühendislik', description: 'Lisans · %30 İngilizce' },
    { label: 'Matematik', value: 'mat', group: 'Fen', description: 'Lisans' },
    { label: 'Fizik', value: 'fiz', group: 'Fen', description: 'Lisans' },
    { label: 'Kimya', value: 'kim', group: 'Fen', description: 'Lisans' },
    { label: 'Tıp', value: 'tip', group: 'Sağlık', description: 'Lisans · 6 yıl' },
    { label: 'Hemşirelik', value: 'hem', group: 'Sağlık', description: 'Lisans · 6 yıl' },
  ];
  protected readonly selectedDepartments = signal<string[]>(['bm', 'mat', 'fiz', 'tip', 'hem']);

  /** Nesne değerler: compareWith ile karşılaştırılır. */
  protected readonly courseOptions: HuSelectOption<Course>[] = [
    { code: 'BİL 401', name: 'Yapay Zekâ' },
    { code: 'BİL 405', name: 'Bilgisayar Grafiği' },
    { code: 'BİL 409', name: 'Makine Öğrenmesi' },
    { code: 'BİL 413', name: 'Görüntü İşleme' },
    { code: 'BİL 418', name: 'Doğal Dil İşleme' },
  ].map((c) => ({ label: c.name, value: c, description: c.code }));
  protected readonly sameCourse = (a: Course, b: Course) => a.code === b.code;

  protected readonly days: HuSelectOption[] = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'].map((d) => ({ label: d, value: d }));

  protected readonly form = inject(NonNullableFormBuilder).group({
    courses: [[] as Course[], Validators.required],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.toast.success(`Seçilen: ${this.form.value.courses?.map((c) => c.code).join(', ')}`);
  }

  protected readonly basicCode = `
units: HuSelectOption[] = [
  { label: 'Öğrenci İşleri', value: 'oi', icon: 'graduation-cap' },
  { label: 'Bilgi İşlem', value: 'bi', icon: 'monitor' },
  { label: 'Yapı İşleri', value: 'yi', disabled: true },
];
selected = signal<string[]>(['oi']);

<hu-multi-select [options]="units" [(value)]="selected" placeholder="Birim seçin" />`;

  protected readonly groupCode = `
departments: HuSelectOption[] = [
  { label: 'Bilgisayar Mühendisliği', value: 'bm', group: 'Mühendislik', description: 'Lisans · %30 İngilizce' },
  { label: 'Matematik', value: 'mat', group: 'Fen' },
  { label: 'Tıp', value: 'tip', group: 'Sağlık' },
];

<hu-multi-select [options]="departments" [(value)]="selected" [maxSelectedLabels]="3" />`;

  protected readonly formCode = `
courses: Course[] = [
  { code: 'BİL 401', name: 'Yapay Zekâ' },
  { code: 'BİL 409', name: 'Makine Öğrenmesi' },
];
// Nesne değerler için compareWith verin
courseOptions: HuSelectOption<Course>[] = this.courses.map((c) => ({ label: c.name, value: c, description: c.code }));
sameCourse = (a: Course, b: Course) => a.code === b.code;

form = this.fb.group({ courses: [[] as Course[], Validators.required] });

<hu-form-field label="Seçmeli dersler" hint="En fazla 3 ders" required>
  <hu-multi-select formControlName="courses" [options]="courseOptions"
                   [selectionLimit]="3" [compareWith]="sameCourse" />
</hu-form-field>`;

  protected readonly displayCode = `
<hu-multi-select display="text" [options]="units" />
<hu-multi-select [filter]="false" size="sm" [options]="days" />
<hu-multi-select disabled [options]="units" />`;
}
