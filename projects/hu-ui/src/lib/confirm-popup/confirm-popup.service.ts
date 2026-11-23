import {
  ApplicationRef,
  ComponentRef,
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
import { HuButtonColor } from '../button/button.component';
import { HuConfirmOptions, HuConfirmPopup } from './confirm-popup.component';

/**
 * Tetikleyicinin yanında onay kutusu açar. Sayfaya bir şey yerleştirmeniz gerekmez.
 *
 * @example
 * async remove(event: Event, user: User) {
 *   const ok = await this.confirm.confirm({
 *     target: event.currentTarget,
 *     message: 'Kullanıcı silinsin mi?',
 *     acceptLabel: 'Sil',
 *     acceptColor: 'danger',
 *   });
 *   if (ok) this.users.delete(user.id);
 * }
 */
@Injectable({ providedIn: 'root' })
export class HuConfirmPopupService {
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(EnvironmentInjector);
  private current: { ref: ComponentRef<HuConfirmPopup>; resolve: (value: boolean) => void } | null = null;

  /** Kullanıcı onaylarsa `true`, vazgeçerse (Hayır, Esc, dışarı tıklama) `false`. */
  confirm(options: HuConfirmOptions): Promise<boolean> {
    const target = options.target instanceof HTMLElement ? options.target : null;
    // Aynı butona tekrar basıldıysa açık olanı kapat (aç/kapa)
    const sameTarget = !!target && this.current?.ref.instance.options().target === target;
    this.close(false);
    if (sameTarget || !target) return Promise.resolve(false);

    return new Promise<boolean>((resolve) => {
      const ref = createComponent(HuConfirmPopup, { environmentInjector: this.injector });
      ref.instance.options.set({ ...options, target });
      const sub = ref.instance.closed.subscribe((accepted) => {
        sub.unsubscribe();
        if (this.current?.ref === ref) this.current = null;
        this.destroy(ref);
        resolve(accepted);
      });
      this.current = { ref, resolve };

      this.appRef.attachView(ref.hostView);
      // Modal dialog'un dışı tıklanamaz (inert); popup'ı dialog'un içine koy
      const container = target.closest('dialog[open]') ?? target.ownerDocument.body;
      container.appendChild(ref.location.nativeElement);
    });
  }

  /** Açık onay kutusunu kapatır. */
  close(accepted = false): void {
    const current = this.current;
    if (!current) return;
    this.current = null;
    current.ref.instance.resolve(accepted, false);
  }

  private destroy(ref: ComponentRef<HuConfirmPopup>): void {
    const el = ref.location.nativeElement as HTMLElement;
    if (el.matches?.(':popover-open')) el.hidePopover();
    this.appRef.detachView(ref.hostView);
    ref.destroy();
    el.remove();
  }
}

/**
 * Tıklanınca önce onay soran buton. İşlemi `(click)` yerine `(confirmed)` ile bağlayın.
 *
 * @example
 * <button hu-button color="danger" huConfirm="Kayıt silinsin mi?" acceptLabel="Sil" acceptColor="danger"
 *         (confirmed)="remove()">Sil</button>
 */
@Directive({
  selector: '[huConfirm]',
  host: { '(click)': 'open($event)', 'aria-haspopup': 'dialog' },
})
export class HuConfirm {
  private readonly service = inject(HuConfirmPopupService);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Sorulacak mesaj. */
  readonly message = input.required<string>({ alias: 'huConfirm' });
  readonly header = input<string>();
  readonly icon = input<string | null>();
  readonly acceptLabel = input<string>();
  readonly rejectLabel = input<string>();
  readonly acceptColor = input<HuButtonColor>();
  readonly defaultFocus = input<'accept' | 'reject'>();
  /** `true` ise onay sorulmadan doğrudan `(confirmed)` yayınlanır. */
  readonly confirmDisabled = input(false, { transform: booleanAttribute });

  /** Kullanıcı onayladığında. */
  readonly confirmed = output<void>();
  /** Kullanıcı vazgeçtiğinde. */
  readonly rejected = output<void>();

  protected async open(event: Event): Promise<void> {
    if (this.confirmDisabled()) {
      this.confirmed.emit();
      return;
    }
    event.preventDefault(); // form içindeki submit butonu formu hemen göndermesin
    const accepted = await this.service.confirm({
      target: this.element.nativeElement,
      message: this.message(),
      header: this.header(),
      icon: this.icon(),
      acceptLabel: this.acceptLabel(),
      rejectLabel: this.rejectLabel(),
      acceptColor: this.acceptColor(),
      defaultFocus: this.defaultFocus(),
    });
    if (accepted) this.confirmed.emit();
    else this.rejected.emit();
  }
}
