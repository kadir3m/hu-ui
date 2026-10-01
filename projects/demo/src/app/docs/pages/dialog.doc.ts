import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HU_DIALOG_IMPORTS, HU_FORM_FIELD_IMPORTS, HuButton, HuDialogSize, HuIcon, HuToastService } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

@Component({
  selector: 'app-dialog-doc',
  imports: [DocPage, DocExample, HU_DIALOG_IMPORTS, HU_FORM_FIELD_IMPORTS, HuButton, HuIcon],
  template: `
    <app-doc-page slug="dialog">
      <app-doc-example title="Temel" description="Esc, dışarı tıklama veya ✕ ile kapanır." [code]="basicCode">
        <button hu-button (click)="basic.set(true)">Dialog aç</button>
      </app-doc-example>

      <app-doc-example title="Onay penceresi" [code]="confirmCode">
        <button hu-button color="danger" variant="soft" (click)="confirm.set(true)"><hu-icon name="trash" [size]="16" /> Kaydı sil</button>
      </app-doc-example>

      <app-doc-example title="Boyutlar" [code]="sizesCode">
        <div class="row">
          @for (s of sizes; track s) {
            <button hu-button variant="outline" (click)="size.set(s); sized.set(true)">{{ s }}</button>
          }
        </div>
      </app-doc-example>

      <app-doc-example title="Form içeren" description="Gönder butonu form özniteliğiyle dialog dışındaki forma bağlanır." [code]="formCode">
        <button hu-button variant="outline" (click)="formOpen.set(true)">Yeni ders</button>
      </app-doc-example>
    </app-doc-page>

    <hu-dialog [(open)]="basic" title="Ders kaydını onayla" description="BBM 203 — Veri Yapıları">
      <p>Bu derse kaydolmak istediğinize emin misiniz?</p>
      <div huDialogFooter>
        <button hu-button variant="outline" (click)="basic.set(false)">Vazgeç</button>
        <button hu-button (click)="basic.set(false); toast.success('Kayıt oluşturuldu.')">Onayla</button>
      </div>
    </hu-dialog>

    <hu-dialog [(open)]="confirm" title="Kayıt silinsin mi?" size="sm">
      <p class="hu-text-muted">Bu işlem geri alınamaz.</p>
      <div huDialogFooter>
        <button hu-button variant="outline" (click)="confirm.set(false)">Vazgeç</button>
        <button hu-button color="danger" (click)="confirm.set(false); toast.info('Silindi.')">Sil</button>
      </div>
    </hu-dialog>

    <hu-dialog [(open)]="sized" [size]="size()" [title]="'size=&quot;' + size() + '&quot;'">
      <p>Bu pencere <code>{{ size() }}</code> genişliğinde.</p>
    </hu-dialog>

    <hu-dialog [(open)]="formOpen" title="Yeni ders" size="lg">
      <form id="course-form" class="form-grid" (submit)="$event.preventDefault(); formOpen.set(false); toast.success('Ders eklendi.')">
        <hu-form-field label="Ders kodu" required><input huInput placeholder="BBM 203" /></hu-form-field>
        <hu-form-field label="Ders adı" required><input huInput placeholder="Veri Yapıları" /></hu-form-field>
      </form>
      <div huDialogFooter>
        <button hu-button variant="outline" type="button" (click)="formOpen.set(false)">Vazgeç</button>
        <button hu-button type="submit" form="course-form">Ekle</button>
      </div>
    </hu-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogDoc {
  protected readonly toast = inject(HuToastService);
  protected readonly basic = signal(false);
  protected readonly confirm = signal(false);
  protected readonly sized = signal(false);
  protected readonly formOpen = signal(false);
  protected readonly sizes: HuDialogSize[] = ['sm', 'md', 'lg', 'xl'];
  protected readonly size = signal<HuDialogSize>('md');

  protected readonly basicCode = `
<button hu-button (click)="open.set(true)">Dialog aç</button>

<hu-dialog [(open)]="open" title="Ders kaydını onayla" description="BBM 203 — Veri Yapıları">
  <p>Bu derse kaydolmak istediğinize emin misiniz?</p>
  <div huDialogFooter>
    <button hu-button variant="outline" (click)="open.set(false)">Vazgeç</button>
    <button hu-button (click)="save()">Onayla</button>
  </div>
</hu-dialog>`;

  protected readonly confirmCode = `
<hu-dialog [(open)]="confirm" title="Kayıt silinsin mi?" size="sm">
  <p>Bu işlem geri alınamaz.</p>
  <div huDialogFooter>
    <button hu-button variant="outline" (click)="confirm.set(false)">Vazgeç</button>
    <button hu-button color="danger" (click)="remove()">Sil</button>
  </div>
</hu-dialog>`;

  protected readonly sizesCode = `<hu-dialog size="sm | md | lg | xl" …>`;

  protected readonly formCode = `
<hu-dialog [(open)]="open" title="Yeni ders" size="lg">
  <form id="course-form" [formGroup]="form" (ngSubmit)="save()">…</form>
  <div huDialogFooter>
    <button hu-button type="submit" form="course-form">Ekle</button>
  </div>
</hu-dialog>`;
}
