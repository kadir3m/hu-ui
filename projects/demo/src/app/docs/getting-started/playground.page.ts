import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  HU_FORM_FIELD_IMPORTS,
  HuAlert,
  HuAvatar,
  HuAvatarSize,
  HuBadge,
  HuBadgeVariant,
  HuButton,
  HuButtonColor,
  HuButtonGroup,
  HuButtonSize,
  HuButtonVariant,
  HuDropdown,
  HuDropdownAlign,
  HuDropdownEntry,
  HuIcon,
  HuStatusVariant,
  HuSwitch,
} from '@ucme-ui/angular';
import { DocCode } from '../doc-code.component';

type Target = 'button' | 'badge' | 'alert' | 'avatar' | 'dropdown';

/** Bir component'in ayarlarını canlı değiştirip oluşan kodu kopyalama alanı. */
@Component({
  selector: 'app-playground-page',
  imports: [DocCode, HU_FORM_FIELD_IMPORTS, HuAlert, HuAvatar, HuBadge, HuButton, HuButtonGroup, HuDropdown, HuIcon, HuSwitch],
  templateUrl: './playground.page.html',
  styleUrl: './playground.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaygroundPage {
  protected readonly targets: { value: Target; label: string; icon: string }[] = [
    { value: 'button', label: 'Button', icon: 'plus' },
    { value: 'badge', label: 'Badge', icon: 'check-circle' },
    { value: 'alert', label: 'Alert', icon: 'info' },
    { value: 'avatar', label: 'Avatar', icon: 'user' },
    { value: 'dropdown', label: 'Dropdown', icon: 'chevron-down' },
  ];
  protected readonly target = signal<Target>('button');

  // Seçenek listeleri
  protected readonly buttonVariants: HuButtonVariant[] = ['solid', 'soft', 'outline', 'ghost', 'link'];
  protected readonly buttonColors: (HuButtonColor | '')[] = ['', 'primary', 'neutral', 'success', 'warning', 'danger', 'info'];
  protected readonly buttonSizes: HuButtonSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
  protected readonly badgeVariants: HuBadgeVariant[] = ['neutral', 'primary', 'info', 'success', 'warning', 'danger'];
  protected readonly statusVariants: HuStatusVariant[] = ['info', 'success', 'warning', 'danger'];
  protected readonly avatarSizes: HuAvatarSize[] = ['sm', 'md', 'lg'];
  protected readonly iconChoices = ['', 'plus', 'check', 'download', 'edit', 'trash', 'search', 'settings', 'bell', 'more-vertical'];

  // --- Button ---------------------------------------------------------------------
  protected readonly btnLabel = signal('Kaydet');
  protected readonly btnVariant = signal<HuButtonVariant>('solid');
  protected readonly btnColor = signal<HuButtonColor | ''>('');
  protected readonly btnSize = signal<HuButtonSize>('md');
  protected readonly btnIcon = signal('');
  protected readonly btnIconOnly = signal(false);
  protected readonly btnPill = signal(false);
  protected readonly btnLoading = signal(false);
  protected readonly btnDisabled = signal(false);
  protected readonly btnBlock = signal(false);

  // --- Badge ----------------------------------------------------------------------
  protected readonly badgeText = signal('Aktif');
  protected readonly badgeVariant = signal<HuBadgeVariant>('success');
  protected readonly badgeDot = signal(true);

  // --- Alert ----------------------------------------------------------------------
  protected readonly alertVariant = signal<HuStatusVariant>('warning');
  protected readonly alertTitle = signal('Dikkat');
  protected readonly alertText = signal('Oturumunuz 5 dakika içinde sona erecek.');
  protected readonly alertDismissible = signal(true);
  /** Kapatılan alert'i yeniden göstermek için anahtar. */
  protected readonly alertKey = signal(0);

  // --- Avatar ---------------------------------------------------------------------
  protected readonly avatarName = signal('Kadir Üçme');
  protected readonly avatarSize = signal<HuAvatarSize>('lg');

  // --- Dropdown -------------------------------------------------------------------
  protected readonly ddLabel = signal('İşlemler');
  protected readonly ddIcon = signal('');
  protected readonly ddVariant = signal<HuButtonVariant>('outline');
  protected readonly ddAlign = signal<HuDropdownAlign>('start');
  protected readonly ddOptions: HuDropdownEntry[] = [
    { label: 'Düzenle', value: 'edit', icon: 'edit' },
    { label: 'Kopyala', value: 'copy', icon: 'layers' },
    { divider: true },
    { label: 'Sil', value: 'delete', icon: 'trash', danger: true },
  ];
  protected readonly ddLast = signal('');

  // --- Oluşan kod -----------------------------------------------------------------
  protected readonly code = computed(() => {
    switch (this.target()) {
      case 'button':
        return this.buttonCode();
      case 'badge':
        return tag('hu-badge', [attr('variant', this.badgeVariant(), 'neutral'), flag('dot', this.badgeDot())], this.badgeText());
      case 'alert':
        return tag(
          'hu-alert',
          [attr('variant', this.alertVariant(), 'info'), attr('title', this.alertTitle(), ''), flag('dismissible', this.alertDismissible())],
          this.alertText(),
        );
      case 'avatar':
        return tag('hu-avatar', [attr('name', this.avatarName(), null), attr('size', this.avatarSize(), 'md')]);
      case 'dropdown':
        return [
          'actions: HuDropdownEntry[] = [',
          "  { label: 'Düzenle', value: 'edit', icon: 'edit' },",
          "  { label: 'Kopyala', value: 'copy', icon: 'layers' },",
          '  { divider: true },',
          "  { label: 'Sil', value: 'delete', icon: 'trash', danger: true },",
          '];',
          '',
          tag('hu-dropdown', [
            attr('label', this.ddLabel(), ''),
            attr('icon', this.ddIcon(), ''),
            attr('variant', this.ddVariant(), 'outline'),
            attr('align', this.ddAlign(), 'start'),
            this.ddIcon() && !this.ddLabel() ? 'ariaLabel="İşlemler"' : '',
            '[options]="actions"',
            '(selected)="run($event.value)"',
          ]),
        ].join('\n');
    }
  });

  private buttonCode(): string {
    const iconOnly = this.btnIconOnly() && !!this.btnIcon();
    const icon = this.btnIcon() ? `<hu-icon name="${this.btnIcon()}" [size]="16" />` : '';
    const content = iconOnly ? icon : [icon, this.btnLabel()].filter(Boolean).join(' ');
    return `<button ${[
      'hu-button',
      attr('variant', this.btnVariant(), 'solid'),
      attr('color', this.btnColor(), ''),
      attr('size', this.btnSize(), 'md'),
      flag('iconOnly', iconOnly),
      iconOnly ? `aria-label="${this.btnLabel()}"` : '',
      flag('pill', this.btnPill()),
      flag('loading', this.btnLoading()),
      flag('disabled', this.btnDisabled()),
      flag('block', this.btnBlock()),
    ]
      .filter(Boolean)
      .join(' ')}>${content}</button>`;
  }

  // --- Yardımcılar ----------------------------------------------------------------
  protected text(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }

  protected resetAlert(): void {
    this.alertKey.update((k) => k + 1);
  }
}

/** Varsayılan değerdeyse özniteliği yazma. */
function attr(name: string, value: string, defaultValue: string | null): string {
  return value && value !== defaultValue ? `${name}="${value}"` : '';
}

function flag(name: string, on: boolean): string {
  return on ? name : '';
}

/** Üçten fazla öznitelik varsa her birini ayrı satıra yazar. */
function tag(name: string, attrs: string[], content?: string): string {
  const a = attrs.filter(Boolean);
  const multiline = a.length > 2;
  const open = multiline ? `<${name}\n  ${a.join('\n  ')}\n` : `<${[name, ...a].join(' ')}`;
  if (content === undefined) return multiline ? `${open}/>` : `${open} />`;
  return `${open}>${content}</${name}>`;
}
