import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { HuButton, HuCheckbox } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

@Component({
  selector: 'app-checkbox-doc',
  imports: [ReactiveFormsModule, DocPage, DocExample, HuButton, HuCheckbox],
  template: `
    <app-doc-page slug="checkbox">
      <app-doc-example title="Temel" [code]="basicCode">
        <div class="stack">
          <hu-checkbox [(checked)]="accepted">KVKK aydınlatma metnini okudum</hu-checkbox>
          <p class="demo-label">checked: {{ accepted() }}</p>
        </div>
      </app-doc-example>

      <app-doc-example title="Form kontrolü" description="Validators.requiredTrue ile zorunlu onay." [code]="formCode">
        <div class="stack">
          <hu-checkbox [formControl]="terms">Kullanım koşullarını kabul ediyorum</hu-checkbox>
          <div class="row">
            <button hu-button size="sm" (click)="terms.markAsTouched()">Gönder</button>
            <span class="demo-label">geçerli: {{ terms.valid ? 'evet' : 'hayır' }}</span>
          </div>
        </div>
      </app-doc-example>

      <app-doc-example
        title="Kısmen seçili (Tümünü seç)"
        description="indeterminate değerini alt seçimlerden hesaplayın; tıklanınca tarayıcı standardı gereği kalkar."
        [code]="triCode"
      >
        <div class="group">
          <hu-checkbox [checked]="all()" [indeterminate]="some()" (checkedChange)="setAll($event)">
            <strong>Tüm yetkiler</strong> <span class="hu-text-muted">({{ selected().size }}/{{ permissions.length }})</span>
          </hu-checkbox>
          <div class="group__children">
            @for (p of permissions; track p.key) {
              <hu-checkbox [checked]="selected().has(p.key)" (checkedChange)="toggle(p.key, $event)">{{ p.label }}</hu-checkbox>
            }
          </div>
        </div>
      </app-doc-example>

      <app-doc-example title="Devre dışı" [code]="disabledCode">
        <div class="row">
          <hu-checkbox disabled>Devre dışı</hu-checkbox>
          <hu-checkbox disabled [checked]="true">Devre dışı ve seçili</hu-checkbox>
        </div>
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `
    .group { padding: var(--hu-space-3); border: 1px solid var(--hu-border); border-radius: var(--hu-radius-md); max-width: 22rem; }
    .group__children { display: flex; flex-direction: column; gap: var(--hu-space-2); margin: var(--hu-space-2) 0 0 0.375rem; padding-left: var(--hu-space-4); border-left: 1px solid var(--hu-border); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxDoc {
  protected readonly accepted = signal(true);
  protected readonly terms = new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue });

  protected readonly permissions = [
    { key: 'read', label: 'Kayıtları görüntüleme' },
    { key: 'create', label: 'Kayıt oluşturma' },
    { key: 'update', label: 'Kayıt düzenleme' },
    { key: 'delete', label: 'Kayıt silme' },
  ];
  protected readonly selected = signal<ReadonlySet<string>>(new Set(['read', 'update']));
  protected readonly all = computed(() => this.selected().size === this.permissions.length);
  protected readonly some = computed(() => this.selected().size > 0 && !this.all());

  protected setAll(checked: boolean): void {
    this.selected.set(new Set(checked ? this.permissions.map((p) => p.key) : []));
  }

  protected toggle(key: string, checked: boolean): void {
    this.selected.update((set) => {
      const next = new Set(set);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  protected readonly basicCode = `
<hu-checkbox [(checked)]="accepted">KVKK aydınlatma metnini okudum</hu-checkbox>`;

  protected readonly formCode = `
terms = new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue });

<hu-checkbox [formControl]="terms">Kullanım koşullarını kabul ediyorum</hu-checkbox>`;

  protected readonly triCode = `
all  = computed(() => this.selected().size === this.permissions.length);
some = computed(() => this.selected().size > 0 && !this.all());

<hu-checkbox [checked]="all()" [indeterminate]="some()" (checkedChange)="setAll($event)">
  Tüm yetkiler
</hu-checkbox>
@for (p of permissions; track p.key) {
  <hu-checkbox [checked]="selected().has(p.key)" (checkedChange)="toggle(p.key, $event)">
    {{ p.label }}
  </hu-checkbox>
}`;

  protected readonly disabledCode = `<hu-checkbox disabled>Devre dışı</hu-checkbox>`;
}
