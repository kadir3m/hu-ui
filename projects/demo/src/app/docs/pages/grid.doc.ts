import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HU_CARD_IMPORTS, HU_FORM_FIELD_IMPORTS, HuButton } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

@Component({
  selector: 'app-grid-doc',
  imports: [DocPage, DocExample, HU_CARD_IMPORTS, HU_FORM_FIELD_IMPORTS, HuButton],
  template: `
    <app-doc-page slug="grid">
      <app-doc-example
        title="Temel"
        description="Satır 12 kolondur. hu-col-N öğenin kaç kolon kaplayacağını belirler; kolon sınıfı olmayan öğe tam satır kaplar."
        [code]="basicCode"
      >
        <div class="hu-grid demo-grid">
          <div class="hu-col-12">12</div>
          <div class="hu-col-6">6</div>
          <div class="hu-col-6">6</div>
          <div class="hu-col-4">4</div>
          <div class="hu-col-4">4</div>
          <div class="hu-col-4">4</div>
          <div class="hu-col-3">3</div>
          <div class="hu-col-3">3</div>
          <div class="hu-col-3">3</div>
          <div class="hu-col-3">3</div>
          <div class="hu-col-8">8</div>
          <div class="hu-col-4">4</div>
        </div>
      </app-doc-example>

      <app-doc-example
        title="Responsive"
        description="Küçükten büyüğe yazılır: hu-col-12 hu-col-md-6 hu-col-lg-3 → dar alanda tam, 720px üstünde yarım, 960px üstünde çeyrek. Kutunun sağ alt köşesinden sürükleyerek genişliği değiştirin."
        [code]="responsiveCode"
      >
        <div class="resizer">
          <div class="hu-grid demo-grid">
            @for (i of [1, 2, 3, 4]; track i) {
              <div class="hu-col-12 hu-col-md-6 hu-col-lg-3">12 · md 6 · lg 3</div>
            }
            <div class="hu-col-12 hu-col-lg-8">12 · lg 8</div>
            <div class="hu-col-12 hu-col-lg-4">12 · lg 4</div>
          </div>
        </div>
      </app-doc-example>

      <app-doc-example
        title="Sayfa düzeni"
        description="Admin sayfaları için tipik yerleşim: üstte özet kartları, altta ana içerik ve yan panel."
        [code]="dashboardCode"
      >
        <div class="hu-grid">
          @for (s of stats; track s.label) {
            <hu-card class="hu-col-12 hu-col-sm-6 hu-col-lg-3">
              <p class="stat__label">{{ s.label }}</p>
              <p class="stat__value">{{ s.value }}</p>
            </hu-card>
          }
          <hu-card class="hu-col-12 hu-col-lg-8" title="Son başvurular">
            <p class="hu-text-muted">Tablo, grafik vb. ana içerik.</p>
          </hu-card>
          <hu-card class="hu-col-12 hu-col-lg-4" title="Duyurular">
            <p class="hu-text-muted">Yan panel.</p>
          </hu-card>
        </div>
      </app-doc-example>

      <app-doc-example
        title="Form düzeni"
        description="Alanları iki kolona dizin; uzun alanlar tam satır kaplasın. Dar ekranda hepsi alt alta geçer."
        [code]="formCode"
      >
        <form class="hu-grid" (submit)="$event.preventDefault()">
          <hu-form-field class="hu-col-12 hu-col-md-6" label="Ad">
            <input huInput />
          </hu-form-field>
          <hu-form-field class="hu-col-12 hu-col-md-6" label="Soyad">
            <input huInput />
          </hu-form-field>
          <hu-form-field class="hu-col-12 hu-col-md-8" label="E-posta">
            <input huInput type="email" placeholder="ad@example.com" />
          </hu-form-field>
          <hu-form-field class="hu-col-12 hu-col-md-4" label="Telefon">
            <input huInput type="tel" />
          </hu-form-field>
          <hu-form-field class="hu-col-12" label="Adres">
            <textarea huInput rows="3"></textarea>
          </hu-form-field>
          <div class="hu-col-12 actions">
            <button hu-button type="button" variant="ghost">Vazgeç</button>
            <button hu-button type="submit">Kaydet</button>
          </div>
        </form>
      </app-doc-example>

      <app-doc-example
        title="Otomatik kolonlar"
        description="hu-grid--auto: kolon sayısını genişlik belirler. Her öğe en az --hu-grid-min (varsayılan 16rem) genişliğindedir; kart listeleri için idealdir."
        [code]="autoCode"
      >
        <div class="hu-grid hu-grid--auto demo-grid" style="--hu-grid-min: 12rem">
          @for (i of [1, 2, 3, 4, 5, 6, 7]; track i) {
            <div>Öğe {{ i }}</div>
          }
        </div>
      </app-doc-example>

      <app-doc-example
        title="Başlangıç kolonu, gizleme ve aralık"
        description="hu-col-start-N öğeyi N. kolondan başlatır (ortalama, boşluk bırakma). hu-col-md-visible öğeyi yalnızca md ve üstünde, hu-col-md-hidden yalnızca md altında gösterir. Aralığı hu-grid--gap-* veya --hu-grid-gap ile değiştirin."
        [code]="startCode"
      >
        <div class="hu-grid hu-grid--gap-sm demo-grid">
          <div class="hu-col-6 hu-col-start-4">6 · start 4 (ortada)</div>
          <div class="hu-col-4 hu-col-start-9">4 · start 9 (sağda)</div>
          <div class="hu-col-12 hu-col-md-6">Her zaman görünür</div>
          <div class="hu-col-12 hu-col-md-6 hu-col-md-visible">Yalnızca md ve üstünde</div>
        </div>
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `
    .demo-grid > * {
      display: flex; align-items: center; justify-content: center;
      min-height: 2.75rem; padding: var(--hu-space-2);
      font-size: var(--hu-text-sm); font-weight: 600; text-align: center;
      color: var(--hu-primary-soft-fg); background: var(--hu-primary-soft);
      border: 1px dashed var(--hu-primary); border-radius: var(--hu-radius-md);
    }
    .resizer {
      resize: horizontal; overflow: hidden;
      min-width: 16rem; max-width: 100%; width: 100%;
      padding: var(--hu-space-2);
      border: 1px solid var(--hu-border); border-radius: var(--hu-radius-md);
      background: var(--hu-surface-2);
    }
    .stat__label { margin: 0; font-size: var(--hu-text-xs); color: var(--hu-text-muted); }
    .stat__value { margin: var(--hu-space-1) 0 0; font-size: var(--hu-text-2xl); font-weight: 700; }
    .actions { display: flex; justify-content: flex-end; gap: var(--hu-space-2); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridDoc {
  protected readonly stats = [
    { label: 'Öğrenci', value: '12.480' },
    { label: 'Ders', value: '642' },
    { label: 'Bekleyen başvuru', value: '37' },
    { label: 'Duyuru', value: '9' },
  ];

  protected readonly basicCode = `
<div class="hu-grid">
  <div class="hu-col-12">12</div>
  <div class="hu-col-6">6</div>
  <div class="hu-col-6">6</div>
  <div class="hu-col-8">8</div>
  <div class="hu-col-4">4</div>
</div>`;

  protected readonly responsiveCode = `
<!-- Kırılımlar: sm 480px · md 720px · lg 960px · xl 1200px
     Ekranın değil grid'in genişliğine göre çalışır (kart/dialog içinde de doğru). -->
<div class="hu-grid">
  <div class="hu-col-12 hu-col-md-6 hu-col-lg-3">…</div>
  <div class="hu-col-12 hu-col-md-6 hu-col-lg-3">…</div>
  <div class="hu-col-12 hu-col-md-6 hu-col-lg-3">…</div>
  <div class="hu-col-12 hu-col-md-6 hu-col-lg-3">…</div>
</div>`;

  protected readonly dashboardCode = `
<div class="hu-grid">
  @for (s of stats; track s.label) {
    <hu-card class="hu-col-12 hu-col-sm-6 hu-col-lg-3">…</hu-card>
  }
  <hu-card class="hu-col-12 hu-col-lg-8" title="Son başvurular">…</hu-card>
  <hu-card class="hu-col-12 hu-col-lg-4" title="Duyurular">…</hu-card>
</div>`;

  protected readonly formCode = `
<form class="hu-grid" [formGroup]="form">
  <hu-form-field class="hu-col-12 hu-col-md-6" label="Ad">
    <input huInput formControlName="firstName" />
  </hu-form-field>
  <hu-form-field class="hu-col-12 hu-col-md-6" label="Soyad">
    <input huInput formControlName="lastName" />
  </hu-form-field>
  <hu-form-field class="hu-col-12" label="Adres">
    <textarea huInput formControlName="address"></textarea>
  </hu-form-field>
</form>`;

  protected readonly autoCode = `
<div class="hu-grid hu-grid--auto" style="--hu-grid-min: 12rem">
  @for (item of items; track item.id) {
    <hu-card>…</hu-card>
  }
</div>`;

  protected readonly startCode = `
<div class="hu-grid hu-grid--gap-sm">
  <div class="hu-col-6 hu-col-start-4">Ortada</div>
  <div class="hu-col-12 hu-col-md-6">Her zaman görünür</div>
  <div class="hu-col-12 hu-col-md-6 hu-col-md-visible">Yalnızca md ve üstünde</div>
</div>

<!-- Aralık: hu-grid--gap-none | sm | lg | xl  ya da  style="--hu-grid-gap: 2rem" -->`;
}
