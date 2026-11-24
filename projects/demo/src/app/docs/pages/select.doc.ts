import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HU_DIALOG_IMPORTS, HU_FORM_FIELD_IMPORTS, HuButton, HuSelect, HuSelectOption, HuToastService } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

@Component({
  selector: 'app-select-doc',
  imports: [JsonPipe, ReactiveFormsModule, DocPage, DocExample, HU_FORM_FIELD_IMPORTS, HU_DIALOG_IMPORTS, HuButton, HuSelect],
  template: `
    <app-doc-page slug="select">
      <app-doc-example
        title="Temel"
        description="Seçenek sayısı 7'yi aşınca panelde arama kutusu çıkar. Arama Türkçe karakterleri yok sayar: 'ogr' yazınca 'Öğrenci İşleri' bulunur."
        [code]="basicCode"
      >
        <hu-form-field label="Birim" class="narrow">
          <hu-select [options]="units" [(value)]="unit" placeholder="Birim seçin" />
        </hu-form-field>
        <p class="demo-label">Değer: {{ unit() | json }}</p>
      </app-doc-example>

      <app-doc-example
        title="Gruplar, açıklamalar ve temizleme"
        description="group alanı aynı olan seçenekler bir başlık altında listelenir; showClear ile kutuda ✕ çıkar."
        [code]="groupCode"
      >
        <hu-form-field label="Bölüm" class="narrow">
          <hu-select [options]="departments" [(value)]="department" showClear placeholder="Bölüm seçin" />
        </hu-form-field>
      </app-doc-example>

      <app-doc-example title="Form ile" description="Reactive form ve doğrulama; hata durumu hu-form-field ile gösterilir." [code]="formCode">
        <form class="stack narrow" [formGroup]="form" (ngSubmit)="submit()">
          <hu-form-field label="Fakülte" required>
            <hu-select formControlName="faculty" [options]="faculties" placeholder="Fakülte seçin" />
          </hu-form-field>
          <div class="row">
            <button hu-button type="submit">Kaydet</button>
            <button hu-button type="button" variant="ghost" (click)="form.reset()">Temizle</button>
          </div>
        </form>
      </app-doc-example>

      <app-doc-example title="Dialog içinde" description="Panel üst katmanda açılır; dialog'un kenarında kesilmez, Esc önce paneli kapatır." [code]="dialogCode">
        <button hu-button variant="outline" (click)="dialogOpen.set(true)">Dialogu aç</button>
      </app-doc-example>

      <app-doc-example title="Aramasız, boyutlar, devre dışı" [code]="sizesCode">
        <div class="hu-grid">
          <hu-select class="hu-col-12 hu-col-md-4" size="sm" [options]="days" placeholder="Gün (sm)" ariaLabel="Gün" />
          <hu-select class="hu-col-12 hu-col-md-4" [filter]="true" [options]="days" placeholder="Aramalı (filter)" ariaLabel="Aramalı gün" />
          <hu-select class="hu-col-12 hu-col-md-4" disabled [options]="units" value="ik" ariaLabel="Devre dışı" />
        </div>
      </app-doc-example>
    </app-doc-page>

    <hu-dialog [(open)]="dialogOpen" title="Görevlendirme" size="md">
      <div class="stack">
        <hu-form-field label="Birim"><hu-select [options]="units" placeholder="Birim seçin" /></hu-form-field>
        <hu-form-field label="Bölüm"><hu-select [options]="departments" placeholder="Bölüm seçin" /></hu-form-field>
      </div>
      <div huDialogFooter>
        <button hu-button variant="outline" (click)="dialogOpen.set(false)">Vazgeç</button>
        <button hu-button (click)="dialogOpen.set(false)">Kaydet</button>
      </div>
    </hu-dialog>
  `,
  styles: `
    .narrow { max-width: 24rem; }
    .demo-label { margin-top: var(--hu-space-3); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectDoc {
  private readonly toast = inject(HuToastService);

  protected readonly units: HuSelectOption[] = [
    { label: 'Öğrenci İşleri', value: 'oi', icon: 'graduation-cap' },
    { label: 'Bilgi İşlem', value: 'bi', icon: 'monitor' },
    { label: 'İnsan Kaynakları', value: 'ik', icon: 'users' },
    { label: 'Kütüphane', value: 'ktp', icon: 'book-open' },
    { label: 'Satın Alma', value: 'sa', icon: 'file-text' },
    { label: 'Strateji Geliştirme', value: 'sg', icon: 'bar-chart' },
    { label: 'Sağlık Kültür ve Spor', value: 'sks', icon: 'star' },
    { label: 'Yapı İşleri', value: 'yi', icon: 'building', disabled: true },
  ];
  protected readonly unit = signal<string | null>('bi');

  protected readonly departments: HuSelectOption[] = [
    { label: 'Bilgisayar Mühendisliği', value: 'bm', group: 'Mühendislik', description: 'Lisans · %30 İngilizce' },
    { label: 'Elektrik-Elektronik Mühendisliği', value: 'eem', group: 'Mühendislik', description: 'Lisans · %30 İngilizce' },
    { label: 'Endüstri Mühendisliği', value: 'end', group: 'Mühendislik', description: 'Lisans · %30 İngilizce' },
    { label: 'Matematik', value: 'mat', group: 'Fen', description: 'Lisans' },
    { label: 'Fizik', value: 'fiz', group: 'Fen', description: 'Lisans' },
    { label: 'Kimya', value: 'kim', group: 'Fen', description: 'Lisans' },
    { label: 'Tıp', value: 'tip', group: 'Sağlık', description: 'Lisans · 6 yıl' },
    { label: 'Hemşirelik', value: 'hem', group: 'Sağlık', description: 'Lisans · 4 yıl' },
  ];
  protected readonly department = signal<string | null>(null);

  protected readonly faculties: HuSelectOption[] = ['Mühendislik', 'Fen', 'Edebiyat', 'İktisadi ve İdari Bilimler', 'Tıp', 'Eczacılık'].map(
    (f) => ({ label: `${f} Fakültesi`, value: f }),
  );

  protected readonly days: HuSelectOption[] = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'].map((d) => ({ label: d, value: d }));

  protected readonly dialogOpen = signal(false);

  protected readonly form = inject(NonNullableFormBuilder).group({
    faculty: ['' as string, Validators.required],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.toast.success(`Seçilen: ${this.form.value.faculty}`);
  }

  protected readonly basicCode = `
units: HuSelectOption[] = [
  { label: 'Öğrenci İşleri', value: 'oi', icon: 'graduation-cap' },
  { label: 'Bilgi İşlem', value: 'bi', icon: 'monitor' },
  { label: 'Yapı İşleri', value: 'yi', disabled: true },
];
unit = signal<string | null>('bi');

<hu-form-field label="Birim">
  <hu-select [options]="units" [(value)]="unit" placeholder="Birim seçin" />
</hu-form-field>`;

  protected readonly groupCode = `
departments: HuSelectOption[] = [
  { label: 'Bilgisayar Mühendisliği', value: 'bm', group: 'Mühendislik', description: 'Lisans · %30 İngilizce' },
  { label: 'Matematik', value: 'mat', group: 'Fen' },
];

<hu-select [options]="departments" [(value)]="department" showClear />`;

  protected readonly formCode = `
form = this.fb.group({ faculty: ['', Validators.required] });

<hu-form-field label="Fakülte" required>
  <hu-select formControlName="faculty" [options]="faculties" placeholder="Fakülte seçin" />
</hu-form-field>`;

  protected readonly dialogCode = `
<hu-dialog [(open)]="open" title="Görevlendirme">
  <hu-form-field label="Birim">
    <hu-select [options]="units" placeholder="Birim seçin" />
  </hu-form-field>
</hu-dialog>`;

  protected readonly sizesCode = `
<hu-select size="sm" [options]="days" />          <!-- 7 ve altı seçenek: arama yok -->
<hu-select [filter]="true" [options]="days" />     <!-- aramayı zorla -->
<hu-select disabled [options]="units" value="ik" />`;
}
