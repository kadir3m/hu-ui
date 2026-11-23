import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HU_FORM_FIELD_IMPORTS, HuButton, HuToastService, HuTreeKey, HuTreeNode, HuTreeSelect, HuTreeSelectValue } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

const UNITS: HuTreeNode[] = [
  {
    key: 'muh',
    label: 'Mühendislik Fakültesi',
    icon: 'building',
    children: [
      { key: 'bil', label: 'Bilgisayar Mühendisliği', icon: 'monitor' },
      { key: 'ele', label: 'Elektrik-Elektronik Mühendisliği', icon: 'zap' },
      { key: 'mak', label: 'Makine Mühendisliği', icon: 'settings' },
    ],
  },
  {
    key: 'fen',
    label: 'Fen Fakültesi',
    icon: 'building',
    children: [
      { key: 'mat', label: 'Matematik', icon: 'grid' },
      { key: 'fiz', label: 'Fizik', icon: 'zap' },
      {
        key: 'kim',
        label: 'Kimya',
        icon: 'layers',
        children: [
          { key: 'kim-an', label: 'Analitik Kimya' },
          { key: 'kim-or', label: 'Organik Kimya' },
        ],
      },
    ],
  },
  { key: 'rek', label: 'Rektörlük', icon: 'home', selectable: false, children: [{ key: 'oid', label: 'Öğrenci İşleri', icon: 'users' }] },
];

@Component({
  selector: 'app-tree-select-doc',
  imports: [ReactiveFormsModule, DocPage, DocExample, HU_FORM_FIELD_IMPORTS, HuTreeSelect, HuButton],
  template: `
    <app-doc-page slug="tree-select">
      <app-doc-example
        title="Tekli seçim"
        description="Değer seçilen düğümün anahtarıdır. Klavye: Enter/↓ ile açın, ağaçta ok tuşlarıyla gezin, Enter ile seçin, Esc ile kapatın. showPath seçimi üst birimleriyle gösterir."
        [code]="basicCode"
      >
        <div class="box">
          <hu-form-field label="Birim">
            <hu-tree-select [nodes]="units" [(value)]="unit" placeholder="Birim seçin" showPath />
          </hu-form-field>
        </div>
        <p class="demo-label">Değer: {{ unit() ?? '—' }}</p>
      </app-doc-example>

      <app-doc-example
        title="Onay kutulu ve arama"
        description="Bir fakülte işaretlenince tüm bölümleri seçilir; tamamı seçili dallar tetikleyicide tek çip olarak görünür (değer yine tüm anahtarlardır)."
        [code]="checkboxCode"
      >
        <div class="box">
          <hu-form-field label="Yetkili birimler">
            <hu-tree-select [nodes]="units" selectionMode="checkbox" [(value)]="scope" filter placeholder="Birim seçin" />
          </hu-form-field>
        </div>
        <p class="demo-label">Değer: {{ asList(scope()).join(', ') || '—' }}</p>
      </app-doc-example>

      <app-doc-example title="Form ile" description="Reactive Forms ile çalışır; zorunlu alan, devre dışı ve hata durumu form-field'dan gelir." [code]="formCode">
        <form class="box stack" [formGroup]="form" (ngSubmit)="submit()">
          <hu-form-field label="Bölüm" required [error]="form.controls.dept.touched && form.controls.dept.invalid ? 'Bölüm seçin.' : null">
            <hu-tree-select formControlName="dept" [nodes]="units" filter placeholder="Bölüm seçin" />
          </hu-form-field>
          <hu-form-field label="Ek birimler" hint="En fazla 2 çip; fazlası “N seçildi” olarak yazılır">
            <hu-tree-select formControlName="extra" [nodes]="units" selectionMode="multiple" [maxSelectedLabels]="2" />
          </hu-form-field>
          <div class="row">
            <button hu-button type="submit">Kaydet</button>
            <button hu-button type="button" variant="ghost" (click)="form.reset()">Sıfırla</button>
          </div>
        </form>
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `.box { max-width: 26rem; }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeSelectDoc {
  private readonly toast = inject(HuToastService);
  protected readonly units = UNITS;
  protected readonly unit = signal<HuTreeSelectValue>('bil');
  protected readonly scope = signal<HuTreeSelectValue>(['fen', 'mat', 'fiz', 'kim', 'kim-an', 'kim-or']);
  protected readonly form = inject(NonNullableFormBuilder).group({
    dept: [null as HuTreeKey | null, Validators.required],
    extra: [[] as HuTreeKey[]],
  });

  protected asList(v: HuTreeSelectValue): HuTreeKey[] {
    return Array.isArray(v) ? v : v == null ? [] : [v];
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.toast.success(`Kaydedildi: ${this.form.value.dept}`);
  }

  protected readonly basicCode = `
units: HuTreeNode[] = [
  {
    key: 'muh', label: 'Mühendislik Fakültesi', icon: 'building',
    children: [
      { key: 'bil', label: 'Bilgisayar Mühendisliği', icon: 'monitor' },
      { key: 'mak', label: 'Makine Mühendisliği', icon: 'settings' },
    ],
  },
  { key: 'fen', label: 'Fen Fakültesi', icon: 'building', children: [{ key: 'mat', label: 'Matematik' }] },
];
unit = signal<HuTreeSelectValue>('bil');

<hu-form-field label="Birim">
  <hu-tree-select [nodes]="units" [(value)]="unit" placeholder="Birim seçin" showPath />
</hu-form-field>`;

  protected readonly checkboxCode = `
scope = signal<HuTreeSelectValue>(['fen', 'mat']);

<hu-tree-select [nodes]="units" selectionMode="checkbox" [(value)]="scope" filter placeholder="Birim seçin" />`;

  protected readonly formCode = `
form = this.fb.group({
  dept: [null as HuTreeKey | null, Validators.required],
  extra: [[] as HuTreeKey[]],
});

<form [formGroup]="form">
  <hu-form-field label="Bölüm" required>
    <hu-tree-select formControlName="dept" [nodes]="units" filter placeholder="Bölüm seçin" />
  </hu-form-field>
  <hu-form-field label="Ek birimler">
    <hu-tree-select formControlName="extra" [nodes]="units" selectionMode="multiple" [maxSelectedLabels]="2" />
  </hu-form-field>
</form>`;
}
