import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  HuAlert,
  HuAvatar,
  HuButton,
  HuCard,
  HuCardFooter,
  HU_FORM_FIELD_IMPORTS,
  HuIcon,
  HuSwitch,
  HuTab,
  HuTabs,
  HuThemeMode,
  HuThemeService,
  HuToastService,
} from '@hu/ui';

@Component({
  selector: 'app-settings',
  imports: [
    ReactiveFormsModule,
    HuAlert,
    HuAvatar,
    HuButton,
    HuCard,
    HuCardFooter,
    HU_FORM_FIELD_IMPORTS,
    HuIcon,
    HuSwitch,
    HuTab,
    HuTabs,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly toast = inject(HuToastService);
  protected readonly theme = inject(HuThemeService);

  protected readonly tab = signal(0);

  protected readonly profile = this.fb.group({
    name: ['Kadir Üçme', Validators.required],
    title: ['Sistem Yöneticisi'],
    email: [{ value: 'kadir.ucme@example.com', disabled: true }],
    phone: ['0555 000 00 00'],
    bio: ['', Validators.maxLength(200)],
  });

  protected readonly notifications = this.fb.group({
    email: [true],
    sms: [false],
    weeklyReport: [true],
    securityAlerts: [{ value: true, disabled: true }],
  });

  protected readonly password = this.fb.group({
    current: ['', Validators.required],
    next: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected readonly themeOptions: { mode: HuThemeMode; label: string; icon: string }[] = [
    { mode: 'light', label: 'Açık', icon: 'sun' },
    { mode: 'dark', label: 'Koyu', icon: 'moon' },
    { mode: 'system', label: 'Sistem', icon: 'monitor' },
  ];

  protected saveProfile(): void {
    if (this.profile.invalid) {
      this.profile.markAllAsTouched();
      return;
    }
    this.profile.markAsPristine();
    this.toast.success('Profil bilgileriniz güncellendi.');
  }

  protected saveNotifications(): void {
    this.toast.success('Bildirim tercihleri kaydedildi.');
  }

  protected changePassword(): void {
    if (this.password.invalid) {
      this.password.markAllAsTouched();
      return;
    }
    this.password.reset();
    this.toast.success('Şifreniz değiştirildi.', 'Güvenlik');
  }
}
