import {
  ApplicationRef,
  ComponentRef,
  DOCUMENT,
  DestroyRef,
  Directive,
  ElementRef,
  EnvironmentInjector,
  Injectable,
  booleanAttribute,
  createComponent,
  inject,
  input,
  output,
} from '@angular/core';
import { HuDropdownEntry, HuDropdownOption } from '../dropdown/dropdown.types';
import { HuContextMenuPanel } from './context-menu.component';

export interface HuContextMenuOpenOptions<T = string> {
  entries: readonly HuDropdownEntry<T>[];
  /** Ekran koordinatı. Olaydan alın: `event.clientX`, `event.clientY`. */
  x: number;
  y: number;
  /** Menünün ekran okuyucu adı. */
  ariaLabel?: string;
  /** Menü kapanınca odağın döneceği element. */
  returnFocus?: HTMLElement | null;
  /** Menünün yerleşeceği yer (modal dialog içinde açılıyorsa dialog). */
  container?: HTMLElement | null;
}

/**
 * Sağ tık menüsünü programatik açar. Sayfaya bir şey yerleştirmeniz gerekmez.
 * Aynı anda tek menü açık olur; yenisi açılınca önceki kapanır.
 *
 * @example
 * onContextMenu(event: MouseEvent) {
 *   event.preventDefault();
 *   this.menu.open({ entries: this.actions, x: event.clientX, y: event.clientY })
 *     .then((option) => option && this.run(option.value));
 * }
 */
@Injectable({ providedIn: 'root' })
export class HuContextMenuService {
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(EnvironmentInjector);
  private readonly doc = inject(DOCUMENT);
  private current: ComponentRef<HuContextMenuPanel> | null = null;

  /** Seçilen öğeyi döndürür; seçim yapılmadan kapanırsa `null`. */
  open<T = string>(options: HuContextMenuOpenOptions<T>): Promise<HuDropdownOption<T> | null> {
    this.close();
    const entries = options.entries ?? [];
    if (!entries.length) return Promise.resolve(null);

    return new Promise((resolve) => {
      const ref = createComponent(HuContextMenuPanel, { environmentInjector: this.injector });
      ref.instance.state.set({ entries, x: options.x, y: options.y, ariaLabel: options.ariaLabel });
      const sub = ref.instance.closed.subscribe((option) => {
        sub.unsubscribe();
        if (this.current === ref) this.current = null;
        this.destroy(ref);
        // Seçimle kapandıysa veya klavyeyle açıldıysa odağı geri ver
        options.returnFocus?.focus({ preventScroll: true });
        resolve(option as HuDropdownOption<T> | null);
      });
      this.current = ref;
      this.appRef.attachView(ref.hostView);
      const container = options.container ?? options.returnFocus?.closest('dialog[open]') ?? this.doc.body;
      container.appendChild(ref.location.nativeElement);
    });
  }

  /** Açık menüyü seçim yapmadan kapatır. */
  close(): void {
    this.current?.instance.close(null);
  }

  private destroy(ref: ComponentRef<HuContextMenuPanel>): void {
    const el = ref.location.nativeElement as HTMLElement;
    if (el.matches?.(':popover-open')) el.hidePopover();
    this.appRef.detachView(ref.hostView);
    ref.destroy();
    el.remove();
  }
}

/** Dokunmatik ekranda bu kadar basılı tutunca menü açılır (ms). */
const LONG_PRESS = 550;

/**
 * Elemente sağ tık menüsü ekler. Fare (sağ tık), klavye (menü tuşu veya Shift+F10)
 * ve dokunmatik ekranda uzun basma ile açılır. Öğe listesi boşsa veya `null` ise
 * tarayıcının kendi menüsü çıkar.
 *
 * @example
 * <li [huContextMenu]="fileActions" (contextMenuSelect)="run($event.value, file)">{{ file.name }}</li>
 */
@Directive({
  selector: '[huContextMenu]',
  host: {
    '(contextmenu)': 'onContextMenu($event)',
    '(keydown)': 'onKeydown($event)',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'cancelLongPress()',
    '(pointercancel)': 'cancelLongPress()',
    '[attr.aria-haspopup]': "active() ? 'menu' : null",
  },
})
export class HuContextMenu<T = string> {
  private readonly service = inject(HuContextMenuService);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly entries = input<readonly HuDropdownEntry<T>[] | null | undefined>(null, { alias: 'huContextMenu' });
  readonly disabled = input(false, { alias: 'huContextMenuDisabled', transform: booleanAttribute });
  readonly ariaLabel = input<string>(undefined, { alias: 'huContextMenuLabel' });

  /** Bir öğe seçildiğinde. */
  readonly contextMenuSelect = output<HuDropdownOption<T>>();
  readonly contextMenuOpen = output<void>();
  /** Menü kapandığında (seçimle veya vazgeçerek). */
  readonly contextMenuClose = output<void>();

  private pressTimer?: ReturnType<typeof setTimeout>;
  private pressStart: { x: number; y: number } | null = null;
  private openedByPress = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.cancelLongPress());
  }

  protected active(): boolean {
    return !this.disabled() && !!this.entries()?.length;
  }

  protected onContextMenu(event: MouseEvent): void {
    if (!this.active()) return; // tarayıcının menüsü
    event.preventDefault();
    event.stopPropagation(); // iç içe huContextMenu'de en içteki kazanır
    // Android uzun basmada contextmenu da gönderir: az önce biz açtıysak tekrar açma
    if (Date.now() - this.openedByPress < 800) return;
    this.open(event.clientX, event.clientY, null);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.active()) return;
    if (event.key === 'ContextMenu' || (event.key === 'F10' && event.shiftKey)) {
      event.preventDefault();
      event.stopPropagation();
      const target = (event.target as HTMLElement) ?? this.element.nativeElement;
      const rect = target.getBoundingClientRect();
      this.open(rect.left + 8, rect.bottom, target);
    }
  }

  protected onPointerDown(event: PointerEvent): void {
    if (event.pointerType !== 'touch' || !this.active()) return;
    this.cancelLongPress();
    this.pressStart = { x: event.clientX, y: event.clientY };
    this.pressTimer = setTimeout(() => {
      this.openedByPress = Date.now();
      this.open(event.clientX, event.clientY, null);
    }, LONG_PRESS);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.pressStart) return;
    // Kaydırma hareketi: uzun basma değil
    if (Math.hypot(event.clientX - this.pressStart.x, event.clientY - this.pressStart.y) > 10) this.cancelLongPress();
  }

  protected cancelLongPress(): void {
    clearTimeout(this.pressTimer);
    this.pressTimer = undefined;
    this.pressStart = null;
  }

  private async open(x: number, y: number, returnFocus: HTMLElement | null): Promise<void> {
    this.cancelLongPress();
    this.contextMenuOpen.emit();
    const option = await this.service.open<T>({
      entries: this.entries() ?? [],
      x,
      y,
      ariaLabel: this.ariaLabel(),
      returnFocus,
      container: this.element.nativeElement.closest('dialog[open]') as HTMLElement | null,
    });
    this.contextMenuClose.emit();
    if (option) this.contextMenuSelect.emit(option);
  }
}
