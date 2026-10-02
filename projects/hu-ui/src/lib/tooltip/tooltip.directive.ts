import { DOCUMENT, DestroyRef, Directive, ElementRef, booleanAttribute, effect, inject, input, numberAttribute } from '@angular/core';
import { huUniqueId } from '../core/unique-id';

export type HuTooltipPosition = 'top' | 'bottom' | 'left' | 'right';

/** Aynı anda tek ipucu açık olur. */
let active: HuTooltip | null = null;
/** Son ipucunun kapandığı an: araç çubuğunda gezinirken sonrakiler beklemeden açılır. */
let lastHidden = 0;

/**
 * Kısa açıklama balonu. Üzerine gelince veya klavyeyle odaklanınca açılır, Esc ile
 * kapanır; sığmazsa ters tarafa geçer. Üst katmanda açıldığı için kart / tablo
 * içinde kesilmez. İçerik ekran okuyuculara `aria-describedby` ile okunur.
 *
 * Yalnızca ikonlu butonlarda ipucu, `aria-label`'ın yerine geçmez; ikisini birlikte verin.
 *
 * @example
 * <button hu-button iconOnly aria-label="Sil" huTooltip="Kaydı kalıcı olarak siler"><hu-icon name="trash" /></button>
 * <span huTooltip="Son 30 gün" huTooltipPosition="right">Aktif kullanıcı</span>
 */
@Directive({
  selector: '[huTooltip]',
  host: {
    '(mouseenter)': 'scheduleShow()',
    '(mouseleave)': 'hide()',
    '(focusin)': 'onFocus($event)',
    '(focusout)': 'hide()',
    '(keydown.escape)': 'hide()',
  },
})
export class HuTooltip {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly doc = inject(DOCUMENT);

  readonly text = input<string | null | undefined>('', { alias: 'huTooltip' });
  readonly position = input<HuTooltipPosition>('top', { alias: 'huTooltipPosition' });
  /** Açılma gecikmesi (ms). */
  readonly delay = input(350, { alias: 'huTooltipDelay', transform: numberAttribute });
  readonly disabled = input(false, { alias: 'huTooltipDisabled', transform: booleanAttribute });

  private readonly tipId = huUniqueId('hu-tooltip');
  private el: HTMLElement | null = null;
  private timer?: ReturnType<typeof setTimeout>;
  private readonly supportsPopover = typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype;

  private readonly onWindowChange = () => this.hide();
  private readonly onDocKey = (e: KeyboardEvent) => e.key === 'Escape' && this.hide();

  constructor() {
    // Metin değişirse açık balonu güncelle; boşalırsa kapat
    effect(() => {
      const text = this.text();
      if (!this.el) return;
      if (!text || this.disabled()) this.hide();
      else {
        this.el.querySelector('.hu-tooltip__text')!.textContent = text;
        this.place();
      }
    });
    inject(DestroyRef).onDestroy(() => this.hide());
  }

  protected scheduleShow(delay = this.delay()): void {
    if (this.disabled() || !this.text()) return;
    clearTimeout(this.timer);
    // Başka bir ipucu açıksa (ör. araç çubuğunda gezinirken) beklemeden geç
    const wait = (active && active !== this) || Date.now() - lastHidden < 400 ? 0 : delay;
    this.timer = setTimeout(() => this.show(), wait);
  }

  protected onFocus(event: FocusEvent): void {
    // Fareyle tıklanan butonda değil, klavyeyle odaklanınca göster
    const target = event.target as HTMLElement;
    if (target.matches?.(':focus-visible')) this.scheduleShow(0);
  }

  /** İpucunu hemen göster. */
  show(): void {
    if (this.disabled() || !this.text() || this.el) return;
    active?.hide();
    active = this;
    const el = this.doc.createElement('div');
    el.className = 'hu-tooltip';
    el.id = this.tipId;
    el.setAttribute('role', 'tooltip');
    if (this.supportsPopover) el.setAttribute('popover', 'manual');
    const text = this.doc.createElement('span');
    text.className = 'hu-tooltip__text';
    text.textContent = this.text() ?? '';
    const arrow = this.doc.createElement('span');
    arrow.className = 'hu-tooltip__arrow';
    el.append(text, arrow);
    // Modal dialog içindeyse oraya koy (dışı tıklanamaz / görünmez olur)
    (this.host.closest('dialog[open]') ?? this.doc.body).appendChild(el);
    if (this.supportsPopover) el.showPopover();
    this.el = el;
    this.place();
    this.addDescribedBy();
    const win = this.doc.defaultView;
    win?.addEventListener('scroll', this.onWindowChange, true);
    win?.addEventListener('resize', this.onWindowChange);
    this.doc.addEventListener('keydown', this.onDocKey);
  }

  /** İpucunu kapatır. */
  hide(): void {
    clearTimeout(this.timer);
    if (!this.el) return;
    this.el.remove();
    this.el = null;
    lastHidden = Date.now();
    if (active === this) active = null;
    this.removeDescribedBy();
    const win = this.doc.defaultView;
    win?.removeEventListener('scroll', this.onWindowChange, true);
    win?.removeEventListener('resize', this.onWindowChange);
    this.doc.removeEventListener('keydown', this.onDocKey);
  }

  /** Tercih edilen tarafa yerleştir; sığmazsa ters tarafa çevir, ekrandan taşırma. */
  private place(): void {
    const el = this.el;
    const win = this.doc.defaultView;
    if (!el || !win) return;
    const r = this.host.getBoundingClientRect();
    const { offsetWidth: w, offsetHeight: h } = el;
    const gap = 8;
    const edge = 6;
    const opposite: Record<HuTooltipPosition, HuTooltipPosition> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
    const fits = (p: HuTooltipPosition) =>
      p === 'top' ? r.top - gap - h >= edge
      : p === 'bottom' ? r.bottom + gap + h <= win.innerHeight - edge
      : p === 'left' ? r.left - gap - w >= edge
      : r.right + gap + w <= win.innerWidth - edge;
    let side = this.position();
    if (!fits(side) && fits(opposite[side])) side = opposite[side];

    let left: number;
    let top: number;
    if (side === 'top' || side === 'bottom') {
      left = r.left + r.width / 2 - w / 2;
      top = side === 'top' ? r.top - gap - h : r.bottom + gap;
    } else {
      top = r.top + r.height / 2 - h / 2;
      left = side === 'left' ? r.left - gap - w : r.right + gap;
    }
    const clampedLeft = Math.max(edge, Math.min(left, win.innerWidth - w - edge));
    const clampedTop = Math.max(edge, Math.min(top, win.innerHeight - h - edge));
    el.style.left = `${clampedLeft}px`;
    el.style.top = `${clampedTop}px`;
    el.dataset['side'] = side;
    // Ok, kaydırma olsa da tetikleyicinin ortasını göstersin
    if (side === 'top' || side === 'bottom') el.style.setProperty('--hu-tooltip-arrow', `${r.left + r.width / 2 - clampedLeft}px`);
    else el.style.setProperty('--hu-tooltip-arrow', `${r.top + r.height / 2 - clampedTop}px`);
  }

  private addDescribedBy(): void {
    const ids = (this.host.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
    if (!ids.includes(this.tipId)) this.host.setAttribute('aria-describedby', [...ids, this.tipId].join(' '));
  }

  private removeDescribedBy(): void {
    const ids = (this.host.getAttribute('aria-describedby') ?? '').split(/\s+/).filter((id) => id && id !== this.tipId);
    if (ids.length) this.host.setAttribute('aria-describedby', ids.join(' '));
    else this.host.removeAttribute('aria-describedby');
  }
}
