import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HuButton, HuButtonGroup, HuDropdown, HuDropdownEntry, HuIcon, HuToastService } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

@Component({
  selector: 'app-button-group-doc',
  imports: [DocPage, DocExample, HuButton, HuButtonGroup, HuDropdown, HuIcon],
  template: `
    <app-doc-page slug="button-group">
      <app-doc-example title="Tek seçim" description="Seçili butona [attr.aria-pressed] verin." [code]="singleCode">
        <hu-button-group aria-label="Görünüm">
          @for (o of views; track o.value) {
            <button hu-button variant="outline" [attr.aria-pressed]="view() === o.value" (click)="view.set(o.value)">
              <hu-icon [name]="o.icon" [size]="16" /> {{ o.label }}
            </button>
          }
        </hu-button-group>
        <p class="demo-label result">Seçili: {{ view() }}</p>
      </app-doc-example>

      <app-doc-example title="Çoklu seçim" [code]="multiCode">
        <hu-button-group aria-label="Metin biçimi">
          @for (f of formats; track f.value) {
            <button hu-button variant="outline" iconOnly [attr.aria-label]="f.label" [attr.aria-pressed]="active().has(f.value)" (click)="toggle(f.value)">
              <strong [style.font-style]="f.value === 'italic' ? 'italic' : null" [style.text-decoration]="f.value === 'underline' ? 'underline' : null">{{ f.short }}</strong>
            </button>
          }
        </hu-button-group>
        <p class="demo-label result">Seçili: {{ activeList() }}</p>
      </app-doc-example>

      <app-doc-example title="Bölünmüş buton" description="Grubun içine hu-dropdown koyun." [code]="splitCode">
        <hu-button-group>
          <button hu-button (click)="toast.success('Kaydedildi')"><hu-icon name="check" [size]="16" /> Kaydet</button>
          <hu-dropdown align="end" icon="chevron-down" variant="solid" ariaLabel="Diğer seçenekler" [options]="saveOptions" (selected)="toast.success($event.label)" />
        </hu-button-group>
      </app-doc-example>

      <app-doc-example title="Pill ve dikey" [code]="pillCode">
        <div class="row">
          <hu-button-group pill>
            <button hu-button variant="soft" color="neutral" iconOnly aria-label="Önceki"><hu-icon name="chevron-left" [size]="16" /></button>
            <button hu-button variant="soft" color="neutral">Bugün</button>
            <button hu-button variant="soft" color="neutral" iconOnly aria-label="Sonraki"><hu-icon name="chevron-right" [size]="16" /></button>
          </hu-button-group>
          <hu-button-group vertical>
            <button hu-button variant="outline">Üst</button>
            <button hu-button variant="outline">Orta</button>
            <button hu-button variant="outline">Alt</button>
          </hu-button-group>
        </div>
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `.result { margin-top: var(--hu-space-3); }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonGroupDoc {
  protected readonly toast = inject(HuToastService);
  protected readonly views = [
    { value: 'list', label: 'Liste', icon: 'menu' },
    { value: 'grid', label: 'Kart', icon: 'grid' },
    { value: 'calendar', label: 'Takvim', icon: 'calendar' },
  ];
  protected readonly view = signal('list');
  protected readonly formats = [
    { value: 'bold', label: 'Kalın', short: 'K' },
    { value: 'italic', label: 'İtalik', short: 'İ' },
    { value: 'underline', label: 'Altı çizili', short: 'A' },
  ];
  protected readonly active = signal<ReadonlySet<string>>(new Set(['bold']));
  protected readonly activeList = computed(() => [...this.active()].join(', ') || '—');
  protected readonly saveOptions: HuDropdownEntry[] = [
    { label: 'Kaydet ve yeni ekle', value: 'save-new' },
    { label: 'Taslak olarak kaydet', value: 'draft' },
  ];

  protected toggle(value: string): void {
    this.active.update((set) => {
      const next = new Set(set);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  protected readonly singleCode = `
<hu-button-group aria-label="Görünüm">
  <button hu-button variant="outline" [attr.aria-pressed]="view() === 'list'" (click)="view.set('list')">Liste</button>
  <button hu-button variant="outline" [attr.aria-pressed]="view() === 'grid'" (click)="view.set('grid')">Kart</button>
</hu-button-group>`;

  protected readonly multiCode = `
<hu-button-group aria-label="Metin biçimi">
  <button hu-button variant="outline" iconOnly aria-label="Kalın"
          [attr.aria-pressed]="bold()" (click)="bold.set(!bold())"><strong>K</strong></button>
  …
</hu-button-group>`;

  protected readonly splitCode = `
<hu-button-group>
  <button hu-button (click)="save()">Kaydet</button>
  <hu-dropdown align="end" icon="chevron-down" variant="solid"
               ariaLabel="Diğer seçenekler" [options]="saveOptions" (selected)="run($event)" />
</hu-button-group>`;

  protected readonly pillCode = `
<hu-button-group pill>…</hu-button-group>
<hu-button-group vertical>…</hu-button-group>`;
}
