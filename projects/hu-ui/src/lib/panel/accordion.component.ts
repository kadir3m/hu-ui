import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChildren,
  forwardRef,
  inject,
  input,
  model,
} from '@angular/core';
import { HuIcon } from '../icon/icon.component';
import { huUniqueId } from '../core/unique-id';

type Key = string | number;

/** Accordion içindeki bir panel. */
@Component({
  selector: 'hu-accordion-panel',
  imports: [HuIcon],
  template: `
    <h3 class="hu-accordion__heading">
      <button
        type="button"
        class="hu-accordion__header"
        [id]="headerId"
        [attr.aria-expanded]="open()"
        [attr.aria-controls]="regionId"
        [attr.aria-disabled]="disabled() || null"
        (click)="!disabled() && accordion.toggle(key())"
        (keydown)="accordion.onHeaderKeydown($event)"
      >
        @if (icon()) {
          <hu-icon class="hu-accordion__icon" [name]="icon()!" [size]="18" />
        }
        <span class="hu-accordion__titles">
          <span class="hu-accordion__title">{{ header() }}</span>
          @if (subtitle()) {
            <span class="hu-accordion__subtitle">{{ subtitle() }}</span>
          }
        </span>
        <ng-content select="[huAccordionHeaderEnd]" />
        <hu-icon class="hu-accordion__chevron" name="chevron-down" [size]="18" />
      </button>
    </h3>
    <div class="hu-accordion__region" role="region" [id]="regionId" [attr.aria-labelledby]="headerId" [attr.inert]="!open() || null">
      <div class="hu-accordion__inner">
        <div class="hu-accordion__content"><ng-content /></div>
      </div>
    </div>
  `,
  host: {
    class: 'hu-accordion-panel',
    '[class.hu-accordion-panel--open]': 'open()',
    '[class.hu-accordion-panel--disabled]': 'disabled()',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuAccordionPanel {
  protected readonly accordion = inject(forwardRef(() => HuAccordion));

  readonly header = input.required<string>();
  readonly subtitle = input<string>();
  readonly icon = input<string>();
  /** Açık panelleri takip etmek için anahtar. Verilmezse sırası. */
  readonly value = input<Key>();
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly headerId = huUniqueId('hu-acc-h');
  protected readonly regionId = huUniqueId('hu-acc-r');
  /** @internal */
  readonly key = computed<Key>(() => this.value() ?? this.accordion.indexOf(this));
  protected readonly open = computed(() => this.accordion.isOpen(this.key()));
}

/**
 * Açılır paneller. Varsayılan olarak bir anda tek panel açıktır; `multiple` ile birden çok.
 * Başlıklar arasında ↑/↓, Home/End ile gezilir. Kapalı paneldeki içerik DOM'da kalır.
 *
 * @example
 * <hu-accordion [(value)]="open">
 *   <hu-accordion-panel header="Kayıt" value="kayit">…</hu-accordion-panel>
 *   <hu-accordion-panel header="Ödeme" value="odeme">…</hu-accordion-panel>
 * </hu-accordion>
 */
@Component({
  selector: 'hu-accordion',
  template: `<ng-content />`,
  styleUrl: './accordion.component.scss',
  host: { class: 'hu-accordion', '[attr.data-variant]': 'variant()' },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuAccordion {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Açık panellerin anahtarları. */
  readonly value = model<Key[]>([]);
  readonly multiple = input(false, { transform: booleanAttribute });
  /** `default` çerçeveli liste, `separated` aralıklı kartlar, `flush` çerçevesiz. */
  readonly variant = input<'default' | 'separated' | 'flush'>('default');

  private readonly panels = contentChildren(HuAccordionPanel);

  /** @internal */
  indexOf(panel: HuAccordionPanel): number {
    return this.panels().indexOf(panel);
  }

  isOpen(key: Key): boolean {
    return (this.value() ?? []).includes(key);
  }

  toggle(key: Key): void {
    const open = this.value() ?? [];
    if (open.includes(key)) this.value.set(open.filter((k) => k !== key));
    else this.value.set(this.multiple() ? [...open, key] : [key]);
  }

  /** Tüm panelleri aç (multiple) / kapat. */
  expandAll(): void {
    if (this.multiple()) this.value.set(this.panels().filter((p) => !p.disabled()).map((p) => p.key()));
  }

  collapseAll(): void {
    this.value.set([]);
  }

  /** @internal Başlıklar arasında klavyeyle gezinme. */
  onHeaderKeydown(event: KeyboardEvent): void {
    const headers = Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>(':scope > hu-accordion-panel > .hu-accordion__heading > .hu-accordion__header'));
    const i = headers.indexOf(event.currentTarget as HTMLElement);
    let next = -1;
    if (event.key === 'ArrowDown') next = (i + 1) % headers.length;
    else if (event.key === 'ArrowUp') next = (i - 1 + headers.length) % headers.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = headers.length - 1;
    if (next < 0) return;
    event.preventDefault();
    headers[next].focus();
  }
}
