import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HuSwitch } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

@Component({
  selector: 'app-switch-doc',
  imports: [DocPage, DocExample, HuSwitch],
  template: `
    <app-doc-page slug="switch">
      <app-doc-example title="Temel" [code]="basicCode">
        <div class="stack">
          <hu-switch [(checked)]="notify">E-posta bildirimleri {{ notify() ? 'açık' : 'kapalı' }}</hu-switch>
          <hu-switch disabled>Devre dışı</hu-switch>
          <hu-switch disabled [checked]="true">Devre dışı ve açık</hu-switch>
        </div>
      </app-doc-example>

      <app-doc-example title="Ayarlar listesi" description="Görünür etiket yoksa aria-label verin." [code]="listCode">
        <ul class="settings">
          @for (s of settings; track s.key) {
            <li>
              <div>
                <p class="settings__title">{{ s.title }}</p>
                <p class="settings__desc">{{ s.desc }}</p>
              </div>
              <hu-switch [checked]="s.on" [aria-label]="s.title" />
            </li>
          }
        </ul>
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `
    .settings { max-width: 32rem; margin: 0; padding: 0; list-style: none; }
    .settings li { display: flex; align-items: center; justify-content: space-between; gap: var(--hu-space-4); padding: var(--hu-space-3) 0; border-bottom: 1px solid var(--hu-border); }
    .settings li:last-child { border-bottom: 0; }
    .settings__title { font-weight: 500; }
    .settings__desc { font-size: var(--hu-text-xs); color: var(--hu-text-muted); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitchDoc {
  protected readonly notify = signal(true);
  protected readonly settings = [
    { key: 'mail', title: 'E-posta bildirimleri', desc: 'Onay bekleyen işlemler için e-posta alın.', on: true },
    { key: 'sms', title: 'SMS bildirimleri', desc: 'Acil durumlarda kısa mesaj gönderilir.', on: false },
    { key: 'weekly', title: 'Haftalık özet', desc: 'Her pazartesi sistem özeti.', on: true },
  ];

  protected readonly basicCode = `
<hu-switch [(checked)]="notify">E-posta bildirimleri</hu-switch>
<hu-switch formControlName="sms">SMS bildirimleri</hu-switch>`;

  protected readonly listCode = `<hu-switch formControlName="weekly" aria-label="Haftalık özet" />`;
}
