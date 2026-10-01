import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HuButton, HuToastService } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

@Component({
  selector: 'app-toast-doc',
  imports: [DocPage, DocExample, HuButton],
  template: `
    <app-doc-page slug="toast">
      <app-doc-example title="Türler" description="Sağ üstte görünür; 5 sn sonra kendiliğinden kapanır (hata: 8 sn)." [code]="typesCode">
        <div class="row">
          <button hu-button variant="soft" color="success" (click)="toast.success('Değişiklikler kaydedildi.', 'Başarılı')">Başarılı</button>
          <button hu-button variant="soft" color="info" (click)="toast.info('Yeni bir mesajınız var.')">Bilgi</button>
          <button hu-button variant="soft" color="warning" (click)="toast.warning('Disk alanı azalıyor.', 'Uyarı')">Uyarı</button>
          <button hu-button variant="soft" color="danger" (click)="toast.error('İşlem tamamlanamadı.', 'Hata')">Hata</button>
        </div>
      </app-doc-example>

      <app-doc-example title="Kalıcı bildirim" description="duration: 0 → kullanıcı kapatana kadar kalır." [code]="stickyCode">
        <div class="row">
          <button hu-button variant="outline" (click)="sticky()">Kalıcı bildirim göster</button>
          <button hu-button variant="ghost" (click)="toast.clear()">Hepsini kapat</button>
        </div>
      </app-doc-example>

      <app-doc-example title="Kurulum" description="Kök component'e bir kez ekleyin." [code]="setupCode">
        <p class="hu-text-muted">Bu uygulamada <code>app.component.ts</code> içinde zaten var.</p>
      </app-doc-example>
    </app-doc-page>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastDoc {
  protected readonly toast = inject(HuToastService);

  protected sticky(): void {
    this.toast.show({ message: 'Yedekleme tamamlanana kadar sayfayı kapatmayın.', title: 'Yedekleniyor', variant: 'warning', duration: 0 });
  }

  protected readonly typesCode = `
private readonly toast = inject(HuToastService);

this.toast.success('Değişiklikler kaydedildi.', 'Başarılı');
this.toast.info('Yeni bir mesajınız var.');
this.toast.warning('Disk alanı azalıyor.', 'Uyarı');
this.toast.error('İşlem tamamlanamadı.', 'Hata');`;

  protected readonly stickyCode = `
const id = this.toast.show({ message: '…', title: 'Yedekleniyor', variant: 'warning', duration: 0 });
this.toast.dismiss(id);`;

  protected readonly setupCode = `
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HuToaster],
  template: \`<router-outlet /> <hu-toaster position="top-right" />\`,
})
export class AppComponent {}`;
}
