import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HU_DIALOG_IMPORTS, HuButton, HuConfirm, HuConfirmPopupService, HuIcon, HuToastService } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

@Component({
  selector: 'app-confirm-popup-doc',
  imports: [DocPage, DocExample, HU_DIALOG_IMPORTS, HuButton, HuConfirm, HuIcon],
  template: `
    <app-doc-page slug="confirm-popup">
      <app-doc-example
        title="Temel"
        description="İşlemi (click) yerine (confirmed) ile bağlayın. Esc, Hayır veya dışarı tıklama vazgeçer."
        [code]="basicCode"
      >
        <div class="row">
          <button hu-button variant="soft" huConfirm="Devam etmek istediğinize emin misiniz?" (confirmed)="toast.success('Kaydedildi.')">
            Kaydet
          </button>
          <button
            hu-button
            variant="outline"
            color="danger"
            huConfirm="Bu kayıt kalıcı olarak silinecek."
            header="Kayıt silinsin mi?"
            icon="trash"
            acceptLabel="Sil"
            rejectLabel="Vazgeç"
            acceptColor="danger"
            defaultFocus="reject"
            (confirmed)="toast.success('Kayıt silindi.')"
            (rejected)="toast.info('Silme iptal edildi.')"
          >
            Sil
          </button>
        </div>
      </app-doc-example>

      <app-doc-example
        title="Servis ile"
        description="Tablo satırı gibi döngüdeki işlemlerde HuConfirmPopupService.confirm() bir Promise döndürür."
        [code]="serviceCode"
      >
        <ul class="list">
          @for (u of users(); track u.id) {
            <li>
              <span>{{ u.name }}</span>
              <button
                hu-button
                size="sm"
                variant="ghost"
                color="danger"
                iconOnly
                [attr.aria-label]="u.name + ' sil'"
                (click)="remove($event, u)"
              >
                <hu-icon name="trash" [size]="16" />
              </button>
            </li>
          } @empty {
            <li class="hu-text-muted">Kullanıcı kalmadı. <button hu-button size="sm" variant="link" (click)="users.set(initialUsers)">Geri yükle</button></li>
          }
        </ul>
      </app-doc-example>

      <app-doc-example
        title="Dialog içinde"
        description="Modal dialog açıkken de çalışır; Esc yalnızca onay kutusunu kapatır."
        [code]="dialogCode"
      >
        <button hu-button variant="outline" (click)="dialog.set(true)">Dialog aç</button>
      </app-doc-example>
    </app-doc-page>

    <hu-dialog [(open)]="dialog" title="Değişiklikler" size="sm">
      <p>Kaydedilmemiş değişiklikleriniz var.</p>
      <div huDialogFooter>
        <button
          hu-button
          variant="ghost"
          color="danger"
          huConfirm="Değişiklikler kaybolacak."
          acceptLabel="Kapat"
          acceptColor="danger"
          (confirmed)="dialog.set(false)"
        >
          Kaydetmeden kapat
        </button>
        <button hu-button (click)="dialog.set(false); toast.success('Kaydedildi.')">Kaydet</button>
      </div>
    </hu-dialog>
  `,
  styles: `
    .list { display: flex; flex-direction: column; max-width: 22rem; margin: 0; padding: 0; list-style: none; }
    .list li {
      display: flex; align-items: center; justify-content: space-between; gap: var(--hu-space-3);
      padding: var(--hu-space-2) var(--hu-space-3); font-size: var(--hu-text-sm);
      border-bottom: 1px solid var(--hu-border);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmPopupDoc {
  protected readonly toast = inject(HuToastService);
  private readonly confirm = inject(HuConfirmPopupService);

  protected readonly initialUsers = [
    { id: 1, name: 'Ayşe Yılmaz' },
    { id: 2, name: 'Mehmet Demir' },
    { id: 3, name: 'Zeynep Kaya' },
  ];
  protected readonly users = signal(this.initialUsers);
  protected readonly dialog = signal(false);

  protected async remove(event: Event, user: { id: number; name: string }): Promise<void> {
    const ok = await this.confirm.confirm({
      target: event.currentTarget,
      message: `${user.name} silinsin mi?`,
      acceptLabel: 'Sil',
      acceptColor: 'danger',
    });
    if (!ok) return;
    this.users.update((list) => list.filter((u) => u.id !== user.id));
    this.toast.success(`${user.name} silindi.`);
  }

  protected readonly basicCode = `
import { HuConfirm } from '@ucme-ui/angular';

<button hu-button huConfirm="Devam etmek istediğinize emin misiniz?" (confirmed)="save()">
  Kaydet
</button>

<button hu-button color="danger"
        huConfirm="Bu kayıt kalıcı olarak silinecek."
        header="Kayıt silinsin mi?"
        icon="trash"
        acceptLabel="Sil" rejectLabel="Vazgeç" acceptColor="danger"
        defaultFocus="reject"
        (confirmed)="remove()" (rejected)="…">
  Sil
</button>`;

  protected readonly serviceCode = `
private readonly confirm = inject(HuConfirmPopupService);

async remove(event: Event, user: User) {
  const ok = await this.confirm.confirm({
    target: event.currentTarget,   // popup bu butonun yanında açılır
    message: \`\${user.name} silinsin mi?\`,
    acceptLabel: 'Sil',
    acceptColor: 'danger',
  });
  if (ok) this.users.delete(user.id);
}

<button hu-button iconOnly (click)="remove($event, user)">…</button>`;

  protected readonly dialogCode = `
<hu-dialog [(open)]="open" title="Değişiklikler">
  <div huDialogFooter>
    <button hu-button huConfirm="Değişiklikler kaybolacak." (confirmed)="open.set(false)">
      Kaydetmeden kapat
    </button>
  </div>
</hu-dialog>`;
}
