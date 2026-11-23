import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, effect, input, model, output, signal, untracked } from '@angular/core';
import { HuButton } from '../button/button.component';
import { HuDatePicker } from '../calendar/date-picker.component';
import { addDays, startOfDay } from '../calendar/date-utils';
import { HuDialog, HuDialogFooter } from '../dialog/dialog.component';
import { HuFormField } from '../form-field/form-field.component';
import { HuInput } from '../form-field/input.directive';
import { HuIcon } from '../icon/icon.component';
import { HuSwitch } from '../switch/switch.component';
import { huUniqueId } from '../core/unique-id';
import { fromTimeValue, toTimeValue } from './agenda-utils';
import { HuAgendaCategory, HuAgendaEvent } from './agenda.types';

/**
 * Ajandanın yerleşik etkinlik formu (dialog). `hu-agenda` kendisi açar;
 * `[editor]="false"` ile kapatıp kendi formunuzu kullanabilirsiniz.
 */
@Component({
  selector: 'hu-agenda-editor',
  imports: [HuButton, HuDatePicker, HuDialog, HuDialogFooter, HuFormField, HuInput, HuIcon, HuSwitch],
  template: `
    <hu-dialog [(open)]="open" [title]="isNew() ? 'Yeni kayıt' : 'Kaydı düzenle'" size="md">
      <form class="hu-agenda-editor" [id]="formId" (submit)="$event.preventDefault(); submit()">
        <hu-form-field label="Başlık" required [error]="submitted() && !title().trim() ? 'Başlık giriniz.' : null">
          <input
            huInput
            autocomplete="off"
            placeholder="Örn. Ayşe Yılmaz ile görüşme"
            [value]="title()"
            (input)="title.set($any($event.target).value)"
          />
        </hu-form-field>

        @if (categories().length) {
          <fieldset class="hu-agenda-editor__cats">
            <legend>Tür</legend>
            @for (c of categories(); track c.key) {
              <label class="hu-agenda-editor__cat" [attr.data-color]="c.color">
                <input type="radio" name="hu-agenda-category" [value]="c.key" [checked]="category() === c.key" (change)="category.set(c.key)" />
                <span class="hu-agenda-editor__dot"></span>
                {{ c.label }}
              </label>
            }
          </fieldset>
        }

        <hu-switch [checked]="allDay()" (checkedChange)="allDay.set($event)">Tüm gün</hu-switch>

        <div class="hu-agenda-editor__row">
          <hu-form-field label="Başlangıç" class="hu-agenda-editor__date">
            <hu-date-picker [value]="startDate()" (valueChange)="onStartDate($any($event))" />
          </hu-form-field>
          @if (!allDay()) {
            <hu-form-field label="Saat" class="hu-agenda-editor__time">
              <input huInput type="time" step="300" [value]="startTime()" (change)="onStartTime($any($event.target).value)" />
            </hu-form-field>
          }
        </div>
        <div class="hu-agenda-editor__row">
          <hu-form-field label="Bitiş" class="hu-agenda-editor__date" [error]="submitted() && rangeError() ? rangeError() : null">
            <hu-date-picker [value]="endDate()" (valueChange)="endDate.set($any($event) ?? startDate())" />
          </hu-form-field>
          @if (!allDay()) {
            <hu-form-field label="Saat" class="hu-agenda-editor__time">
              <input huInput type="time" step="300" [value]="endTime()" (change)="endTime.set($any($event.target).value)" />
            </hu-form-field>
          }
        </div>

        <hu-form-field label="Konum">
          <input huInput autocomplete="off" placeholder="Oda, adres veya bağlantı" [value]="location()" (input)="location.set($any($event.target).value)" />
        </hu-form-field>
        <hu-form-field label="Açıklama">
          <textarea huInput rows="3" [value]="description()" (input)="description.set($any($event.target).value)"></textarea>
        </hu-form-field>
      </form>

      <div huDialogFooter class="hu-agenda-editor__footer">
        @if (!isNew()) {
          <button hu-button type="button" variant="ghost" color="danger" (click)="remove()">
            <hu-icon name="trash" [size]="16" /> Sil
          </button>
        }
        <span class="hu-agenda-editor__spacer"></span>
        <button hu-button type="button" variant="outline" (click)="open.set(false)">Vazgeç</button>
        <button hu-button type="submit" [attr.form]="formId">Kaydet</button>
      </div>
    </hu-dialog>
  `,
  styles: `
    .hu-agenda-editor { display: flex; flex-direction: column; gap: var(--hu-space-4); }
    .hu-agenda-editor__row { display: flex; gap: var(--hu-space-3); }
    .hu-agenda-editor__date { flex: 1 1 auto; min-width: 0; }
    .hu-agenda-editor__time { flex: 0 0 8.5rem; }
    .hu-agenda-editor__cats { display: flex; flex-wrap: wrap; gap: var(--hu-space-2); margin: 0; padding: 0; border: 0; }
    .hu-agenda-editor__cats legend { width: 100%; margin-bottom: var(--hu-space-2); padding: 0; font-size: var(--hu-text-sm); font-weight: 500; }
    .hu-agenda-editor__cat {
      display: inline-flex; align-items: center; gap: var(--hu-space-2);
      height: 2rem; padding: 0 var(--hu-space-3);
      font-size: var(--hu-text-sm); border: 1px solid var(--hu-border-strong); border-radius: var(--hu-radius-full); cursor: pointer;
    }
    .hu-agenda-editor__cat input { position: absolute; opacity: 0; pointer-events: none; }
    .hu-agenda-editor__cat:has(input:checked) { border-color: var(--_c); background: color-mix(in srgb, var(--_c) 14%, var(--hu-surface)); font-weight: 500; }
    .hu-agenda-editor__cat:has(input:focus-visible) { box-shadow: var(--hu-ring); }
    .hu-agenda-editor__dot { width: 0.625rem; height: 0.625rem; background: var(--_c); border-radius: 50%; }
    .hu-agenda-editor__footer { display: flex; align-items: center; gap: var(--hu-space-2); }
    .hu-agenda-editor__spacer { flex: 1; }
    @media (max-width: 479.98px) {
      .hu-agenda-editor__row { flex-wrap: wrap; }
      .hu-agenda-editor__time { flex: 1 1 100%; }
    }
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuAgendaEditor {
  readonly open = model(false);
  /** Düzenlenecek kayıt (yeni kayıtta taslak). */
  readonly event = input<HuAgendaEvent | null>(null);
  readonly isNew = input(false);
  readonly categories = input<readonly HuAgendaCategory[]>([]);

  readonly save = output<HuAgendaEvent>();
  readonly delete = output<HuAgendaEvent>();

  protected readonly formId = huUniqueId('hu-agenda-form');
  protected readonly title = signal('');
  protected readonly category = signal<string | undefined>(undefined);
  protected readonly allDay = signal(false);
  protected readonly startDate = signal<Date>(startOfDay(new Date()));
  protected readonly startTime = signal('09:00');
  protected readonly endDate = signal<Date>(startOfDay(new Date()));
  protected readonly endTime = signal('10:00');
  protected readonly location = signal('');
  protected readonly description = signal('');
  protected readonly submitted = signal(false);

  private readonly range = computed(() => {
    if (this.allDay()) {
      return { start: startOfDay(this.startDate()), end: addDays(startOfDay(this.endDate()), 1) };
    }
    return { start: fromTimeValue(this.startDate(), this.startTime()), end: fromTimeValue(this.endDate(), this.endTime()) };
  });
  protected readonly rangeError = computed(() => {
    const { start, end } = this.range();
    return end.getTime() <= start.getTime() ? 'Bitiş, başlangıçtan sonra olmalı.' : null;
  });

  constructor() {
    // Dialog her açıldığında formu kayıtla doldur
    effect(() => {
      const open = this.open();
      const e = this.event();
      if (!open || !e) return;
      untracked(() => {
        this.submitted.set(false);
        this.title.set(e.title ?? '');
        this.category.set(e.category ?? this.categories()[0]?.key);
        this.allDay.set(!!e.allDay);
        this.startDate.set(startOfDay(e.start));
        this.startTime.set(toTimeValue(e.start));
        // Tüm gün kayıtta bitiş hariçtir: formda son günü göster
        const endDay = e.allDay ? addDays(startOfDay(e.end), -1) : startOfDay(e.end);
        this.endDate.set(endDay.getTime() < startOfDay(e.start).getTime() ? startOfDay(e.start) : endDay);
        this.endTime.set(toTimeValue(e.end));
        this.location.set(e.location ?? '');
        this.description.set(e.description ?? '');
      });
    });
  }

  /** Başlangıç değişince süre korunarak bitiş de kayar. */
  protected onStartDate(date: Date | null): void {
    if (!date) return;
    const diff = startOfDay(this.endDate()).getTime() - startOfDay(this.startDate()).getTime();
    this.startDate.set(startOfDay(date));
    this.endDate.set(new Date(startOfDay(date).getTime() + Math.max(0, diff)));
  }

  protected onStartTime(value: string): void {
    const before = this.range();
    const duration = before.end.getTime() - before.start.getTime();
    this.startTime.set(value);
    if (duration > 0) {
      const end = new Date(fromTimeValue(this.startDate(), value).getTime() + duration);
      this.endDate.set(startOfDay(end));
      this.endTime.set(toTimeValue(end));
    }
  }

  protected submit(): void {
    this.submitted.set(true);
    if (!this.title().trim() || this.rangeError()) return;
    const base = this.event();
    if (!base) return;
    const { start, end } = this.range();
    this.save.emit({
      ...base,
      title: this.title().trim(),
      category: this.category(),
      allDay: this.allDay(),
      start,
      end,
      location: this.location().trim() || undefined,
      description: this.description().trim() || undefined,
    });
    this.open.set(false);
  }

  protected remove(): void {
    const base = this.event();
    if (!base) return;
    this.delete.emit(base);
    this.open.set(false);
  }
}
