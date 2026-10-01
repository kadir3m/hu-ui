import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HU_BUILTIN_ICONS, HU_FORM_FIELD_IMPORTS, HuIcon, HuToastService } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

@Component({
  selector: 'app-icon-doc',
  imports: [DocPage, DocExample, HU_FORM_FIELD_IMPORTS, HuIcon],
  template: `
    <app-doc-page slug="icon">
      <app-doc-example title="Boyut ve renk" description="Rengi üst elementin color değerinden alır." [code]="basicCode">
        <div class="row">
          <hu-icon name="bell" [size]="16" />
          <hu-icon name="bell" />
          <hu-icon name="bell" [size]="24" />
          <hu-icon name="bell" [size]="32" [strokeWidth]="1.5" />
          <span class="primary"><hu-icon name="check-circle" [size]="24" /></span>
          <span class="danger"><hu-icon name="alert-triangle" [size]="24" label="Uyarı" /></span>
        </div>
      </app-doc-example>

      <app-doc-example [title]="'Yerleşik ikonlar (' + names.length + ')'" description="Tıklayınca kullanım kodu panoya kopyalanır.">
        <hu-form-field class="search">
          <hu-icon huPrefix name="search" [size]="16" />
          <input huInput type="search" placeholder="İkon ara…" aria-label="İkon ara" [value]="query()" (input)="onSearch($event)" />
        </hu-form-field>
        <div class="icons">
          @for (name of filtered(); track name) {
            <button type="button" class="icon-cell" [attr.aria-label]="name + ' kodunu kopyala'" (click)="copy(name)">
              <hu-icon [name]="name" [size]="22" />
              <span>{{ name }}</span>
            </button>
          } @empty {
            <p class="hu-text-muted">Sonuç yok.</p>
          }
        </div>
      </app-doc-example>

      <app-doc-example title="Kendi ikonlarınız" description="24×24 viewBox'lı SVG path verisi verin." [code]="customCode">
        <p class="hu-text-muted">Uygulama config'ine ekleyince <code>&lt;hu-icon name="rocket" /&gt;</code> olarak kullanılır.</p>
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `
    .primary { color: var(--hu-primary); }
    .danger { color: var(--hu-danger); }
    .search { max-width: 20rem; margin-bottom: var(--hu-space-4); }
    .icons { display: grid; grid-template-columns: repeat(auto-fill, minmax(7.5rem, 1fr)); gap: var(--hu-space-2); }
    .icon-cell {
      display: flex; flex-direction: column; align-items: center; gap: var(--hu-space-2);
      padding: var(--hu-space-4) var(--hu-space-2);
      font: inherit; font-size: var(--hu-text-xs); color: var(--hu-text-muted);
      background: var(--hu-surface-2); border: 1px solid transparent; border-radius: var(--hu-radius-md); cursor: pointer;
    }
    .icon-cell hu-icon { color: var(--hu-text); }
    .icon-cell:hover { border-color: var(--hu-primary); color: var(--hu-text); }
    .icon-cell:focus-visible { outline: none; box-shadow: var(--hu-ring); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconDoc {
  private readonly toast = inject(HuToastService);
  protected readonly names = Object.keys(HU_BUILTIN_ICONS).sort();
  protected readonly query = signal('');
  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    return q ? this.names.filter((n) => n.includes(q)) : this.names;
  });

  protected onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected async copy(name: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(`<hu-icon name="${name}" />`);
      this.toast.success(`<hu-icon name="${name}" /> kopyalandı.`);
    } catch {
      this.toast.info(`<hu-icon name="${name}" />`);
    }
  }

  protected readonly basicCode = `
<hu-icon name="bell" />
<hu-icon name="bell" [size]="24" />
<hu-icon name="bell" [size]="32" [strokeWidth]="1.5" />
<hu-icon name="alert-triangle" label="Uyarı" />  <!-- ekran okuyucu okur -->`;

  protected readonly customCode = `
// app.config.ts
providers: [
  provideHuIcons({
    rocket: 'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z',
  }),
]`;
}
