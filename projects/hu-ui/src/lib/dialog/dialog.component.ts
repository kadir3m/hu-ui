import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  effect,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { HuIcon } from '../icon/icon.component';
import { huUniqueId } from '../core/unique-id';

export type HuDialogSize = 'sm' | 'md' | 'lg' | 'xl';

/** Dialog alt kısmındaki aksiyon alanı. */
@Directive({ selector: '[huDialogFooter]', host: { class: 'hu-dialog__footer' } })
export class HuDialogFooter {}

/**
 * Modal pencere. Native `<dialog>` elementini kullanır; odak hapsi, Esc ile
 * kapanma ve üst katman (top layer) tarayıcıdan gelir.
 *
 * @example
 * <hu-dialog [(open)]="editOpen" title="Kullanıcıyı düzenle">
 *   ...form...
 *   <div huDialogFooter>
 *     <button hu-button variant="outline" (click)="editOpen.set(false)">Vazgeç</button>
 *     <button hu-button (click)="save()">Kaydet</button>
 *   </div>
 * </hu-dialog>
 */
@Component({
  selector: 'hu-dialog',
  imports: [HuIcon],
  template: `
    <dialog
      #dialog
      class="hu-dialog"
      [attr.data-size]="size()"
      [attr.aria-labelledby]="titleId"
      (close)="onNativeClose()"
      (cancel)="onCancel($event)"
      (mousedown)="pointerDownOnBackdrop = $event.target === dialog"
      (click)="onClick($event)"
    >
      <div class="hu-dialog__panel">
        <header class="hu-dialog__header">
          <div>
            <h2 class="hu-dialog__title" [id]="titleId">{{ title() }}</h2>
            @if (description()) {
              <p class="hu-dialog__description">{{ description() }}</p>
            }
          </div>
          <button type="button" class="hu-dialog__close" aria-label="Kapat" (click)="close()">
            <hu-icon name="x" [size]="18" />
          </button>
        </header>
        <div class="hu-dialog__body"><ng-content /></div>
        <ng-content select="[huDialogFooter]" />
      </div>
    </dialog>
  `,
  styleUrl: './dialog.component.scss',
  host: { class: 'hu-dialog-host' },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuDialog {
  readonly open = model(false);
  readonly title = input('');
  readonly description = input<string>();
  readonly size = input<HuDialogSize>('md');
  readonly closeOnBackdrop = input(true, { transform: booleanAttribute });
  readonly closeOnEsc = input(true, { transform: booleanAttribute });
  readonly closed = output<void>();

  protected readonly titleId = huUniqueId('hu-dialog-title');
  protected pointerDownOnBackdrop = false;
  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    effect(() => {
      const el = this.dialogRef().nativeElement;
      if (this.open() && !el.open) el.showModal();
      else if (!this.open() && el.open) el.close();
    });
  }

  close(): void {
    this.open.set(false);
  }

  protected onNativeClose(): void {
    if (this.open()) this.open.set(false);
    this.closed.emit();
  }

  protected onCancel(event: Event): void {
    if (!this.closeOnEsc()) event.preventDefault();
  }

  protected onClick(event: MouseEvent): void {
    // Yalnızca basma ve bırakma ikisi de backdrop üzerindeyse kapat (metin seçerken kapanmasın).
    if (this.closeOnBackdrop() && this.pointerDownOnBackdrop && event.target === this.dialogRef().nativeElement) {
      this.close();
    }
    this.pointerDownOnBackdrop = false;
  }
}
