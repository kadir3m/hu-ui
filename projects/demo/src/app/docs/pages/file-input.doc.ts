import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  HU_FORM_FIELD_IMPORTS,
  HuButton,
  HuFileInput,
  HuFileInputValue,
  HuFileUploader,
  HuStoredFile,
  HuToastService,
} from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

const MB = 1024 * 1024;

@Component({
  selector: 'app-file-input-doc',
  imports: [ReactiveFormsModule, DocPage, DocExample, HU_FORM_FIELD_IMPORTS, HuButton, HuFileInput],
  template: `
    <app-doc-page slug="file-input">
      <app-doc-example
        title="Belge listesi"
        description="Her satır bir belge. Dosya seçmek için düğmeye, satırın boş yerine tıklayın veya dosyayı satırın üzerine sürükleyin. Sunucuda kayıtlı dosya (HuStoredFile) bağlantı olarak görünür."
        [code]="listCode"
      >
        <form class="docs" [formGroup]="form" (ngSubmit)="submit()">
          <hu-file-input
            label="Yapılan değişikliklerin gösterildiği özet tablo"
            required
            accept=".pdf,.docx"
            [maxFileSize]="5 * MB"
            formControlName="summary"
          />
          <hu-file-input label="Şerh kararı" accept=".pdf" [maxFileSize]="5 * MB" formControlName="annotation" />
          <hu-file-input
            label="Türkçe ve İngilizce öğretim programı tablosu"
            required
            accept=".pdf,.docx,.xlsx"
            [maxFileSize]="10 * MB"
            formControlName="curriculum"
          />
          <div class="row">
            <button hu-button type="submit">Gönder</button>
            <button hu-button type="button" variant="ghost" (click)="form.reset()">Sıfırla</button>
          </div>
        </form>
      </app-doc-example>

      <app-doc-example
        title="Sunucuya yükleme"
        description="uploader verilince dosya seçilir seçilmez yüklenir; satırın altında ilerleme çubuğu, hata olursa tekrar dene düğmesi çıkar. Bu örnekte yükleme taklit ediliyor; adında 'hata' geçen dosyalar başarısız olur."
        [code]="uploadCode"
      >
        <div class="docs">
          <hu-file-input
            label="Diploma"
            hint="PDF · en fazla 5 MB · seçince hemen yüklenir"
            accept=".pdf,image/*"
            [uploader]="fakeUpload"
            (uploaded)="toast.success($event.file.name + ' yüklendi.')"
          />
        </div>
      </app-doc-example>

      <app-doc-example
        title="Form alanı içinde"
        description="label verilmezse satır, huInput yüksekliğinde sade bir alana dönüşür; etiket ve hata mesajını hu-form-field gösterir."
        [code]="fieldCode"
      >
        <div class="hu-grid">
          <hu-form-field class="hu-col-12 hu-col-md-6" label="Özgeçmiş" hint="Güncel özgeçmişinizi ekleyin.">
            <hu-file-input accept=".pdf" [maxFileSize]="2 * MB" [(value)]="cv" />
          </hu-form-field>
          <hu-form-field class="hu-col-12 hu-col-md-6" label="Vesikalık fotoğraf">
            <hu-file-input accept="image/*" [(value)]="photo" placeholder="Görsel seçin" />
          </hu-form-field>
        </div>
      </app-doc-example>

      <app-doc-example title="Devre dışı" [code]="disabledCode">
        <div class="docs">
          <hu-file-input label="Onaylı belge (değiştirilemez)" disabled [value]="stored" />
          <hu-file-input label="Ek belge" disabled />
        </div>
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `
    .docs { display: flex; flex-direction: column; gap: var(--hu-space-3); }
    .docs .row { margin-top: var(--hu-space-2); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileInputDoc {
  protected readonly toast = inject(HuToastService);
  protected readonly MB = MB;

  protected readonly stored: HuStoredFile = { name: 'anaokulu.docx', size: 48_640, url: 'data:text/plain,ornek' };

  protected readonly form = inject(NonNullableFormBuilder).group({
    summary: [this.stored as HuFileInputValue, Validators.required],
    annotation: [null as HuFileInputValue],
    curriculum: [null as HuFileInputValue, Validators.required],
  });

  protected readonly cv = signal<HuFileInputValue>(null);
  protected readonly photo = signal<HuFileInputValue>(null);

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning('Zorunlu belgeleri ekleyin.');
      return;
    }
    this.toast.success('Belgeler gönderildi.');
  }

  /** Gerçek uygulamada HttpClient ile reportProgress kullanın (FileUpload sayfasına bakın). */
  protected readonly fakeUpload: HuFileUploader = (file, progress) =>
    new Promise((resolve, reject) => {
      let p = 0;
      const timer = setInterval(() => {
        p += 8 + Math.random() * 18;
        progress(p);
        if (p >= 60 && /hata/i.test(file.name)) {
          clearInterval(timer);
          reject(new Error('Sunucu hatası'));
        } else if (p >= 100) {
          clearInterval(timer);
          resolve({ url: `/uploads/${file.name}` });
        }
      }, 200);
    });

  protected readonly listCode = `
form = this.fb.group({
  // Düzenleme ekranında sunucudaki dosya: { name, size?, url? }
  summary: [{ name: 'anaokulu.docx', size: 48640, url: '/files/12' } as HuFileInputValue, Validators.required],
  annotation: [null as HuFileInputValue],
  curriculum: [null as HuFileInputValue, Validators.required],
});

<hu-file-input label="Yapılan değişikliklerin gösterildiği özet tablo" required
               accept=".pdf,.docx" [maxFileSize]="5 * 1024 * 1024" formControlName="summary" />
<hu-file-input label="Şerh kararı" accept=".pdf" formControlName="annotation" />
<hu-file-input label="Türkçe ve İngilizce öğretim programı tablosu" required
               accept=".pdf,.docx,.xlsx" formControlName="curriculum" />

// Gönderirken: File ise yeni yüklendi, değilse sunucudaki dosya aynen kaldı
const { summary } = this.form.getRawValue();
if (summary instanceof File) body.append('summary', summary);`;

  protected readonly uploadCode = `
<hu-file-input
  label="Diploma"
  accept=".pdf,image/*"
  [uploader]="upload"
  (uploaded)="onUploaded($event.result)"
/>`;

  protected readonly fieldCode = `
<hu-form-field label="Özgeçmiş" hint="Güncel özgeçmişinizi ekleyin.">
  <hu-file-input accept=".pdf" [maxFileSize]="2 * 1024 * 1024" [(value)]="cv" />
</hu-form-field>`;

  protected readonly disabledCode = `
<hu-file-input label="Onaylı belge (değiştirilemez)" disabled [value]="stored" />
<!-- Formda: this.form.controls.summary.disable() -->`;
}
