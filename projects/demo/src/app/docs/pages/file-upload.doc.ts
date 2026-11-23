import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  HU_FORM_FIELD_IMPORTS,
  HuButton,
  HuFileRejection,
  HuFileUpload,
  HuFileUploader,
  HuToastService,
} from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

const MB = 1024 * 1024;

@Component({
  selector: 'app-file-upload-doc',
  imports: [ReactiveFormsModule, DocPage, DocExample, HU_FORM_FIELD_IMPORTS, HuButton, HuFileUpload],
  template: `
    <app-doc-page slug="file-upload">
      <app-doc-example
        title="Temel"
        description="Tıklayarak seçin veya dosyaları alana sürükleyin. Değer File[] olarak [(files)] ile gelir."
        [code]="basicCode"
      >
        <hu-file-upload multiple [(files)]="files" />
        <p class="demo-label">Seçilen: {{ files().length }} dosya</p>
      </app-doc-example>

      <app-doc-example
        title="Form ile ve kurallar"
        description="Tür, boyut ve adet sınırı. Kurala uymayan dosyalar eklenmez, nedeni altta yazılır ve (rejected) ile bildirilir."
        [code]="formCode"
      >
        <form class="stack" [formGroup]="form" (ngSubmit)="submit()">
          <hu-form-field label="Başvuru belgeleri" required>
            <hu-file-upload
              formControlName="documents"
              accept=".pdf,.docx"
              multiple
              [maxFiles]="3"
              [maxFileSize]="2 * MB"
              (rejected)="onRejected($event)"
            />
          </hu-form-field>
          <div class="row">
            <button hu-button type="submit">Gönder</button>
            <button hu-button type="button" variant="ghost" (click)="form.reset()">Temizle</button>
          </div>
        </form>
      </app-doc-example>

      <app-doc-example
        title="Görsel (tek dosya)"
        description="multiple olmadan yeni seçim eskisinin yerine geçer; görseller önizlenir."
        [code]="imageCode"
      >
        <hu-file-upload accept="image/*" [maxFileSize]="5 * MB" label="Profil fotoğrafını sürükleyin veya" class="narrow" />
      </app-doc-example>

      <app-doc-example
        title="Sunucuya yükleme"
        description="uploader verilince dosyalar eklenir eklenmez yüklenir; satırda ilerleme ve hata olursa tekrar dene butonu çıkar. Bu örnekte yükleme taklit ediliyor ve adında 'hata' geçen dosyalar başarısız oluyor."
        [code]="uploadCode"
      >
        <hu-file-upload multiple [uploader]="fakeUpload" (uploaded)="toast.success($event.file.name + ' yüklendi.')" />
      </app-doc-example>

      <app-doc-example title="Devre dışı" [code]="disabledCode">
        <hu-file-upload disabled />
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `
    .demo-label { margin-top: var(--hu-space-2); }
    .narrow { max-width: 26rem; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadDoc {
  protected readonly toast = inject(HuToastService);
  protected readonly MB = MB;
  protected readonly files = signal<File[]>([]);

  protected readonly form = inject(NonNullableFormBuilder).group({
    documents: [[] as File[], Validators.required],
  });

  protected onRejected(rejections: HuFileRejection[]): void {
    console.info('Reddedilen dosyalar', rejections);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.toast.success(`${this.form.value.documents?.length} belge gönderildi.`);
    this.form.reset();
  }

  /** Gerçek uygulamada HttpClient ile reportProgress kullanın (koda bakın). */
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

  protected readonly basicCode = `
files = signal<File[]>([]);

<hu-file-upload multiple [(files)]="files" />`;

  protected readonly formCode = `
form = this.fb.group({
  documents: [[] as File[], Validators.required],
});

<hu-form-field label="Başvuru belgeleri" required>
  <hu-file-upload
    formControlName="documents"
    accept=".pdf,.docx"
    multiple
    [maxFiles]="3"
    [maxFileSize]="2 * 1024 * 1024"
    (rejected)="onRejected($event)"
  />
</hu-form-field>`;

  protected readonly imageCode = `
<hu-file-upload accept="image/*" [maxFileSize]="5 * 1024 * 1024" label="Profil fotoğrafını sürükleyin veya" />`;

  protected readonly uploadCode = `
import { HttpClient, HttpEventType } from '@angular/common/http';
import { HuFileUploader } from '@ucme-ui/angular';

private readonly http = inject(HttpClient);

upload: HuFileUploader = (file, progress) =>
  new Promise((resolve, reject) => {
    const body = new FormData();
    body.append('file', file);
    this.http.post('/api/uploads', body, { reportProgress: true, observe: 'events' }).subscribe({
      next: (e) => {
        if (e.type === HttpEventType.UploadProgress && e.total) progress((e.loaded / e.total) * 100);
        if (e.type === HttpEventType.Response) resolve(e.body);
      },
      error: reject,
    });
  });

<hu-file-upload multiple [uploader]="upload" (uploaded)="onUploaded($event.result)" />`;

  protected readonly disabledCode = `
<hu-file-upload disabled />
<!-- Formda: this.form.controls.documents.disable() -->`;
}
