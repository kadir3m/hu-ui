import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChildren,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { HuIcon } from '../icon/icon.component';
import { huUniqueId } from '../core/unique-id';

/** Stepper içindeki bir adım. İçeriği yalnızca aktifken render edilir. */
@Component({
  selector: 'hu-step',
  template: `<ng-template><ng-content /></ng-template>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuStep {
  readonly label = input.required<string>();
  /** Etiketin altındaki küçük açıklama. */
  readonly description = input<string>();
  /** Numara yerine ikon. */
  readonly icon = input<string>();
  /**
   * Adım tamamlandı mı? `linear` modda `false` olan adımdan ileri geçilemez.
   * Verilmezse ziyaret edilip geçilen adımlar tamamlanmış sayılır.
   */
  readonly completed = input<boolean | undefined>(undefined);
  /** Adımda hata var (kırmızı gösterilir). */
  readonly error = input(false, { transform: booleanAttribute });
  /** İsteğe bağlı adım ("İsteğe bağlı" etiketi gösterilir). */
  readonly optional = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  /** @internal */
  readonly content = viewChild.required(TemplateRef);
}

export type HuStepperOrientation = 'horizontal' | 'vertical';
export type HuStepState = 'done' | 'active' | 'error' | 'todo';

/**
 * Çok adımlı formlar ve sihirbazlar.
 *
 * @example
 * <hu-stepper #stepper linear [(activeIndex)]="step">
 *   <hu-step label="Kişisel bilgiler" [completed]="personal.valid">
 *     …
 *     <button hu-button huStepperNext>İleri</button>
 *   </hu-step>
 *   <hu-step label="Onay">
 *     <button hu-button variant="ghost" huStepperPrevious>Geri</button>
 *     <button hu-button (click)="save()">Kaydet</button>
 *   </hu-step>
 * </hu-stepper>
 */
@Component({
  selector: 'hu-stepper',
  imports: [NgTemplateOutlet, HuIcon],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss',
  host: {
    class: 'hu-stepper',
    '[attr.data-orientation]': 'orientation()',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuStepper {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly activeIndex = model(0);
  readonly orientation = input<HuStepperOrientation>('horizontal');
  /** Sıralı mod: bir adım tamamlanmadan sonrakine geçilemez (başlığa tıklayarak da). */
  readonly linear = input(false, { transform: booleanAttribute });

  /** Linear modda tamamlanmamış adımdan ileri gidilmek istendiğinde (adımın index'i). */
  readonly blocked = output<number>();

  protected readonly steps = contentChildren(HuStep);
  protected readonly baseId = huUniqueId('hu-stepper');
  /** Ziyaret edilmiş en ileri adım: `completed` verilmeyen adımların durumu için. */
  private readonly furthest = signal(0);

  protected readonly current = computed(() =>
    Math.max(0, Math.min(this.activeIndex(), this.steps().length - 1)),
  );

  readonly isFirst = computed(() => this.current() === 0);
  readonly isLast = computed(() => this.current() === this.steps().length - 1);

  /** Adım tamamlanmış sayılıyor mu? */
  protected isCompleted(index: number): boolean {
    const explicit = this.steps()[index]?.completed();
    if (explicit !== undefined) return explicit;
    return index < Math.max(this.furthest(), this.current());
  }

  protected state(index: number): HuStepState {
    if (this.steps()[index]?.error()) return 'error';
    if (index === this.current()) return 'active';
    return this.isCompleted(index) ? 'done' : 'todo';
  }

  /** Bu adıma (başlığa tıklayarak) gidilebilir mi? */
  protected canSelect(index: number): boolean {
    const step = this.steps()[index];
    if (!step || step.disabled()) return false;
    if (!this.linear() || index <= this.current()) return true;
    // İleriye: aradaki tüm adımlar tamamlanmış (veya isteğe bağlı) olmalı
    for (let i = 0; i < index; i++) {
      const s = this.steps()[i];
      if (!this.isCompleted(i) && !s.optional()) return false;
    }
    return true;
  }

  select(index: number): void {
    if (index === this.current() || index < 0 || index >= this.steps().length) return;
    if (!this.canSelect(index)) {
      this.blocked.emit(this.firstIncomplete());
      return;
    }
    this.furthest.update((f) => Math.max(f, this.current(), index));
    this.activeIndex.set(index);
    this.focusContent();
  }

  next(): void {
    const current = this.current();
    const step = this.steps()[current];
    // Açıkça tamamlanmamış işaretlenen adımdan ileri geçilmez
    if (this.linear() && step?.completed() === false && !step.optional()) {
      this.blocked.emit(current);
      return;
    }
    let target = current + 1;
    while (this.steps()[target]?.disabled()) target++;
    if (target < this.steps().length) this.select(target);
  }

  previous(): void {
    let target = this.current() - 1;
    while (target >= 0 && this.steps()[target]?.disabled()) target--;
    if (target >= 0) this.select(target);
  }

  /** İlk adıma döner ve ilerleme bilgisini sıfırlar. */
  reset(): void {
    this.furthest.set(0);
    this.activeIndex.set(0);
  }

  private firstIncomplete(): number {
    const index = this.steps().findIndex((s, i) => !this.isCompleted(i) && !s.optional());
    return index < 0 ? this.current() : index;
  }

  /** Klavye ve ekran okuyucu kullanıcısı yeni adımın başından devam etsin. */
  private focusContent(): void {
    setTimeout(() => {
      const panel = this.host.nativeElement.querySelector<HTMLElement>('.hu-stepper__panel');
      if (panel && this.host.nativeElement.contains(document.activeElement)) panel.focus({ preventScroll: true });
    });
  }
}

/** Tıklanınca stepper'da bir sonraki adıma geçer. */
@Directive({
  selector: 'button[huStepperNext]',
  host: { type: 'button', '(click)': 'stepper.next()' },
})
export class HuStepperNext {
  protected readonly stepper = inject(HuStepper);
}

/** Tıklanınca stepper'da bir önceki adıma döner. */
@Directive({
  selector: 'button[huStepperPrevious]',
  host: { type: 'button', '(click)': 'stepper.previous()' },
})
export class HuStepperPrevious {
  protected readonly stepper = inject(HuStepper);
}
