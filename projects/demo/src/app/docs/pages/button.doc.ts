import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HuButton, HuButtonColor, HuButtonSize, HuButtonVariant, HuIcon } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

@Component({
  selector: 'app-button-doc',
  imports: [RouterLink, DocPage, DocExample, HuButton, HuIcon],
  template: `
    <app-doc-page slug="button">
      <app-doc-example title="Temel" description="Varsayılan görünüm solid + primary." [code]="basicCode">
        <div class="row">
          <button hu-button>Kaydet</button>
          <button hu-button variant="outline">Vazgeç</button>
          <button hu-button variant="ghost">Daha sonra</button>
        </div>
      </app-doc-example>

      <app-doc-example title="Görünüm × renk" description="5 görünüm ve 6 renk serbestçe birleştirilir." [code]="matrixCode">
        <div class="matrix">
          <span></span>
          @for (v of variants; track v) {
            <code>{{ v }}</code>
          }
          @for (c of colors; track c) {
            <code>{{ c }}</code>
            @for (v of variants; track v) {
              <span><button hu-button [variant]="v" [color]="c">Buton</button></span>
            }
          }
        </div>
      </app-doc-example>

      <app-doc-example title="Boyutlar" [code]="sizesCode">
        <div class="row">
          @for (s of sizes; track s) {
            <button hu-button [size]="s">{{ s }}</button>
          }
        </div>
      </app-doc-example>

      <app-doc-example title="İkonlu" description="İkon metnin önüne konur; yalnızca ikon için iconOnly ve aria-label verin." [code]="iconCode">
        <div class="row">
          <button hu-button><hu-icon name="plus" [size]="16" /> Yeni kayıt</button>
          <button hu-button variant="soft" color="info"><hu-icon name="download" [size]="16" /> İndir</button>
          <button hu-button iconOnly aria-label="Ekle"><hu-icon name="plus" [size]="16" /></button>
          <button hu-button variant="outline" iconOnly aria-label="Düzenle"><hu-icon name="edit" [size]="16" /></button>
          <button hu-button variant="ghost" color="danger" iconOnly aria-label="Sil"><hu-icon name="trash" [size]="16" /></button>
          <button hu-button pill iconOnly color="neutral" aria-label="Bildirimler"><hu-icon name="bell" [size]="16" /></button>
        </div>
      </app-doc-example>

      <app-doc-example title="Durumlar" description="loading tıklamayı engeller ve spinner gösterir." [code]="statesCode">
        <div class="row">
          <button hu-button [loading]="saving()" (click)="save()">{{ saving() ? 'Kaydediliyor…' : 'Kaydet' }}</button>
          <button hu-button disabled>Devre dışı</button>
          <button hu-button variant="outline" disabled>Devre dışı</button>
          <button hu-button pill>Pill</button>
        </div>
      </app-doc-example>

      <app-doc-example title="Link olarak" description="<a hu-button> routerLink ile çalışır." [code]="linkCode">
        <div class="row">
          <a hu-button variant="outline" routerLink="/kullanicilar">Kullanıcılar</a>
          <a hu-button variant="link" routerLink="/componentler">Tüm componentler <hu-icon name="chevron-right" [size]="14" /></a>
        </div>
      </app-doc-example>

      <app-doc-example title="Tam genişlik" [code]="blockCode">
        <div class="narrow"><button hu-button block size="lg">Giriş yap</button></div>
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `
    .matrix {
      display: grid;
      grid-template-columns: 5rem repeat(5, minmax(6.5rem, 1fr));
      gap: var(--hu-space-2);
      align-items: center;
      overflow-x: auto;
    }
    .matrix code { font-family: var(--hu-font-mono); font-size: var(--hu-text-xs); color: var(--hu-text-muted); }
    .narrow { max-width: 22rem; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonDoc {
  protected readonly variants: HuButtonVariant[] = ['solid', 'soft', 'outline', 'ghost', 'link'];
  protected readonly colors: HuButtonColor[] = ['primary', 'neutral', 'success', 'warning', 'danger', 'info'];
  protected readonly sizes: HuButtonSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
  protected readonly saving = signal(false);

  protected save(): void {
    this.saving.set(true);
    setTimeout(() => this.saving.set(false), 1500);
  }

  protected readonly basicCode = `
<button hu-button>Kaydet</button>
<button hu-button variant="outline">Vazgeç</button>
<button hu-button variant="ghost">Daha sonra</button>`;

  protected readonly matrixCode = `
<button hu-button variant="soft" color="success">Onayla</button>
<button hu-button variant="outline" color="danger">Sil</button>
<button hu-button variant="ghost" color="info">Detay</button>
<button hu-button color="neutral">Rapor</button>`;

  protected readonly sizesCode = `
<button hu-button size="xs">xs</button>
<button hu-button size="sm">sm</button>
<button hu-button>md</button>
<button hu-button size="lg">lg</button>
<button hu-button size="xl">xl</button>`;

  protected readonly iconCode = `
<button hu-button><hu-icon name="plus" [size]="16" /> Yeni kayıt</button>
<button hu-button variant="outline" iconOnly aria-label="Düzenle">
  <hu-icon name="edit" [size]="16" />
</button>`;

  protected readonly statesCode = `
<button hu-button [loading]="saving()" (click)="save()">Kaydet</button>
<button hu-button disabled>Devre dışı</button>
<button hu-button pill>Pill</button>`;

  protected readonly linkCode = `
<a hu-button variant="outline" routerLink="/kullanicilar">Kullanıcılar</a>
<a hu-button variant="link" routerLink="/componentler">Tüm componentler</a>`;

  protected readonly blockCode = `<button hu-button block size="lg">Giriş yap</button>`;
}
