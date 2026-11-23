import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, signal } from '@angular/core';

export type HuAvatarSize = 'sm' | 'md' | 'lg';

/**
 * Kullanıcı avatarı. Görsel yoksa veya yüklenemezse baş harfleri gösterir.
 * @example <hu-avatar name="Ayşe Yılmaz" />  <hu-avatar name="Ali Can" [src]="user.photo" size="lg" />
 */
@Component({
  selector: 'hu-avatar',
  template: `
    @if (src() && !failed()) {
      <img class="hu-avatar__img" [src]="src()" [alt]="name()" (error)="failed.set(true)" />
    } @else {
      <span aria-hidden="true">{{ initials() }}</span>
    }
  `,
  styles: `
    .hu-avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 2rem;
      height: 2rem;
      overflow: hidden;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--hu-primary-soft-fg);
      background: var(--hu-primary-soft);
      border-radius: 50%;
      user-select: none;
    }
    .hu-avatar[data-size='sm'] { width: 1.5rem; height: 1.5rem; font-size: 0.625rem; }
    .hu-avatar[data-size='lg'] { width: 2.75rem; height: 2.75rem; font-size: 0.9375rem; }
    .hu-avatar__img { width: 100%; height: 100%; object-fit: cover; }
  `,
  host: {
    class: 'hu-avatar',
    role: 'img',
    '[attr.aria-label]': 'name()',
    '[attr.data-size]': 'size()',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuAvatar {
  readonly name = input('');
  readonly src = input<string | null>();
  readonly size = input<HuAvatarSize>('md');

  protected readonly failed = signal(false);
  protected readonly initials = computed(() => {
    // Veri henüz yüklenmediyse (null/undefined) "?" göster
    const parts = (this.name() ?? '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    const first = parts[0][0];
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toLocaleUpperCase('tr-TR');
  });
}
