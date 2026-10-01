import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HuInput } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

@Component({
  selector: 'app-input-doc',
  imports: [DocPage, DocExample, HuInput],
  template: `
    <app-doc-page slug="input">
      <app-doc-example title="Metin" description="Label ve hata mesajı için hu-form-field içine koyun." [code]="basicCode">
        <div class="field"><input huInput placeholder="Bir şey yazın…" aria-label="Örnek metin" /></div>
      </app-doc-example>

      <app-doc-example title="Boyutlar" [code]="sizesCode">
        <div class="stack field">
          <input huInput size="sm" placeholder="sm" aria-label="Küçük" />
          <input huInput placeholder="md" aria-label="Orta" />
          <input huInput size="lg" placeholder="lg" aria-label="Büyük" />
        </div>
      </app-doc-example>

      <app-doc-example title="Textarea ve select" [code]="otherCode">
        <div class="stack field">
          <textarea huInput placeholder="Açıklama…" aria-label="Açıklama"></textarea>
          <select huInput aria-label="Fakülte">
            <option>Mühendislik Fakültesi</option>
            <option>Tıp Fakültesi</option>
            <option>Hukuk Fakültesi</option>
          </select>
        </div>
      </app-doc-example>

      <app-doc-example title="Durumlar" [code]="statesCode">
        <div class="stack field">
          <input huInput disabled value="Devre dışı" aria-label="Devre dışı" />
          <input huInput readonly value="Salt okunur" aria-label="Salt okunur" />
          <input huInput invalid value="Hatalı" aria-label="Hatalı" />
        </div>
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `.field { max-width: 22rem; }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputDoc {
  protected readonly basicCode = `<input huInput formControlName="name" placeholder="Bir şey yazın…" />`;
  protected readonly sizesCode = `
<input huInput size="sm" />
<input huInput />
<input huInput size="lg" />`;
  protected readonly otherCode = `
<textarea huInput formControlName="bio"></textarea>
<select huInput formControlName="faculty">
  <option value="muh">Mühendislik Fakültesi</option>
</select>`;
  protected readonly statesCode = `
<input huInput disabled />
<input huInput readonly />
<input huInput invalid />  <!-- form kontrolü olmadan hatalı görünüm -->`;
}
