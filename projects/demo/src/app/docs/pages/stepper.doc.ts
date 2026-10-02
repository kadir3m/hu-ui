import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { map } from 'rxjs';
import { HU_FORM_FIELD_IMPORTS, HU_STEPPER_IMPORTS, HuButton, HuCheckbox, HuToastService } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

@Component({
  selector: 'app-stepper-doc',
  imports: [ReactiveFormsModule, DocPage, DocExample, HU_STEPPER_IMPORTS, HU_FORM_FIELD_IMPORTS, HuButton, HuCheckbox],
  template: `
    <app-doc-page slug="stepper">
      <app-doc-example
        title="Formlu sihirbaz (linear)"
        description="Her adımın completed değeri form grubunun geçerliliğine bağlı; geçerli olmadan ileri gidilemez (başlığa tıklayarak da)."
        [code]="linearCode"
      >
        <hu-stepper #stepper linear [(activeIndex)]="step" (blocked)="onBlocked()">
          <hu-step label="Kişisel bilgiler" description="Ad ve e-posta" [completed]="personalValid()">
            <form class="hu-grid" [formGroup]="personal">
              <hu-form-field class="hu-col-12 hu-col-md-6" label="Ad Soyad" required>
                <input huInput formControlName="name" />
              </hu-form-field>
              <hu-form-field class="hu-col-12 hu-col-md-6" label="E-posta" required>
                <input huInput type="email" formControlName="email" placeholder="ad@example.com" />
              </hu-form-field>
            </form>
            <div class="actions">
              <span></span>
              <button hu-button huStepperNext>İleri</button>
            </div>
          </hu-step>

          <hu-step label="Program" description="Bölüm seçimi" [completed]="programValid()">
            <form class="hu-grid" [formGroup]="program">
              <hu-form-field class="hu-col-12 hu-col-md-6" label="Bölüm" required>
                <select huInput formControlName="department">
                  <option value="">Seçin…</option>
                  <option>Bilgisayar Mühendisliği</option>
                  <option>Elektrik-Elektronik Mühendisliği</option>
                  <option>Matematik</option>
                </select>
              </hu-form-field>
              <hu-form-field class="hu-col-12 hu-col-md-6" label="Başlangıç dönemi">
                <select huInput formControlName="term">
                  <option>Güz 2026</option>
                  <option>Bahar 2027</option>
                </select>
              </hu-form-field>
            </form>
            <div class="actions">
              <button hu-button variant="ghost" huStepperPrevious>Geri</button>
              <button hu-button huStepperNext>İleri</button>
            </div>
          </hu-step>

          <hu-step label="Belgeler" optional>
            <p class="hu-text-muted">Bu adım isteğe bağlı; boş geçilebilir.</p>
            <div class="actions">
              <button hu-button variant="ghost" huStepperPrevious>Geri</button>
              <button hu-button huStepperNext>İleri</button>
            </div>
          </hu-step>

          <hu-step label="Onay">
            <dl class="summary">
              <dt>Ad Soyad</dt><dd>{{ personal.value.name }}</dd>
              <dt>E-posta</dt><dd>{{ personal.value.email }}</dd>
              <dt>Bölüm</dt><dd>{{ program.value.department }} · {{ program.value.term }}</dd>
            </dl>
            <div class="actions">
              <button hu-button variant="ghost" huStepperPrevious>Geri</button>
              <button hu-button (click)="submit(stepper)">Başvuruyu gönder</button>
            </div>
          </hu-step>
        </hu-stepper>
      </app-doc-example>

      <app-doc-example
        title="Dikey"
        description="Uzun formlarda veya dar alanlarda: içerik adımın altında açılır."
        [code]="verticalCode"
      >
        <hu-stepper orientation="vertical" [(activeIndex)]="vstep">
          <hu-step label="Hesap oluştur" description="Kullanıcı adı ve şifre">
            <p class="hu-text-muted">Hesap bilgilerinizi girin.</p>
            <button hu-button size="sm" huStepperNext>Devam</button>
          </hu-step>
          <hu-step label="Profil" description="Fotoğraf ve iletişim">
            <p class="hu-text-muted">Profilinizi tamamlayın.</p>
            <div class="row">
              <button hu-button size="sm" variant="ghost" huStepperPrevious>Geri</button>
              <button hu-button size="sm" huStepperNext>Devam</button>
            </div>
          </hu-step>
          <hu-step label="Bitti" icon="check-circle">
            <p class="hu-text-muted">Her şey hazır.</p>
            <button hu-button size="sm" variant="ghost" huStepperPrevious>Geri</button>
          </hu-step>
        </hu-stepper>
      </app-doc-example>

      <app-doc-example
        title="Durumlar"
        description="error ile hatalı adım, disabled ile tıklanamaz adım; tamamlananlar onay işaretiyle gösterilir."
        [code]="statesCode"
      >
        <div class="stack">
          <hu-checkbox [checked]="paymentError()" (checkedChange)="paymentError.set($event)">Ödeme adımında hata var</hu-checkbox>
          <hu-stepper [activeIndex]="2">
            <hu-step label="Sepet" />
            <hu-step label="Ödeme" [error]="paymentError()" [description]="paymentError() ? 'Kart reddedildi' : undefined" />
            <hu-step label="Teslimat" />
            <hu-step label="Fatura" disabled />
          </hu-stepper>
        </div>
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `
    .actions { display: flex; justify-content: space-between; gap: var(--hu-space-2); margin-top: var(--hu-space-5); }
    .summary { display: grid; grid-template-columns: max-content 1fr; gap: var(--hu-space-2) var(--hu-space-6); margin: 0; font-size: var(--hu-text-sm); }
    .summary dt { color: var(--hu-text-muted); }
    .summary dd { margin: 0; font-weight: 500; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepperDoc {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly toast = inject(HuToastService);

  protected readonly step = signal(0);
  protected readonly vstep = signal(1);
  protected readonly paymentError = signal(true);

  protected readonly personal = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });
  protected readonly program = this.fb.group({
    department: ['', Validators.required],
    term: ['Güz 2026'],
  });

  protected readonly personalValid = toSignal(this.personal.statusChanges.pipe(map((s) => s === 'VALID')), {
    initialValue: false,
  });
  protected readonly programValid = toSignal(this.program.statusChanges.pipe(map((s) => s === 'VALID')), {
    initialValue: false,
  });

  protected onBlocked(): void {
    // Hangi alanların eksik olduğunu göster
    const group = this.step() === 0 ? this.personal : this.program;
    group.markAllAsTouched();
  }

  protected submit(stepper: { reset(): void }): void {
    this.toast.success('Başvurunuz alındı.');
    this.personal.reset();
    this.program.reset();
    stepper.reset();
  }

  protected readonly linearCode = `
import { HU_STEPPER_IMPORTS } from '@ucme-ui/angular';

personalValid = toSignal(this.personal.statusChanges.pipe(map((s) => s === 'VALID')), { initialValue: false });

<hu-stepper #stepper linear [(activeIndex)]="step" (blocked)="personal.markAllAsTouched()">
  <hu-step label="Kişisel bilgiler" description="Ad ve e-posta" [completed]="personalValid()">
    <form [formGroup]="personal">…</form>
    <button hu-button huStepperNext>İleri</button>
  </hu-step>

  <hu-step label="Belgeler" optional>…</hu-step>

  <hu-step label="Onay">
    <button hu-button variant="ghost" huStepperPrevious>Geri</button>
    <button hu-button (click)="submit(); stepper.reset()">Gönder</button>
  </hu-step>
</hu-stepper>`;

  protected readonly verticalCode = `
<hu-stepper orientation="vertical">
  <hu-step label="Hesap oluştur" description="Kullanıcı adı ve şifre">
    …
    <button hu-button huStepperNext>Devam</button>
  </hu-step>
  <hu-step label="Profil">…</hu-step>
  <hu-step label="Bitti" icon="check-circle">…</hu-step>
</hu-stepper>`;

  protected readonly statesCode = `
<hu-stepper [activeIndex]="2">
  <hu-step label="Sepet" />
  <hu-step label="Ödeme" error description="Kart reddedildi" />
  <hu-step label="Teslimat" />
  <hu-step label="Fatura" disabled />
</hu-stepper>`;
}
