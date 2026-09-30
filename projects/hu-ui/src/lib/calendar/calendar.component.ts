import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { HuIcon } from '../icon/icon.component';
import { huUniqueId } from '../core/unique-id';
import {
  HuDateRange,
  addDays,
  addMonths,
  clampDate,
  compareDays,
  daysInMonth,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfWeek,
} from './date-utils';

export type HuCalendarMode = 'single' | 'range';
export type HuCalendarView = 'days' | 'months' | 'years';
export type HuMarkerVariant = 'primary' | 'info' | 'success' | 'warning' | 'danger';

/** Takvimde bir güne işaret (nokta) koyar; örn. sınav, tatil, son başvuru. */
export interface HuCalendarMarker {
  date: Date;
  label?: string;
  variant?: HuMarkerVariant;
}

interface DayCell {
  date: Date;
  key: string;
  day: number;
  inMonth: boolean;
  today: boolean;
  selected: boolean;
  rangeStart: boolean;
  rangeEnd: boolean;
  inRange: boolean;
  disabled: boolean;
  markers: HuCalendarMarker[];
  label: string;
}

interface PickerCell {
  value: number;
  label: string;
  current: boolean;
  selected: boolean;
  disabled: boolean;
}

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const YEARS_PER_PAGE = 12;

/**
 * Satır içi takvim. Tek gün veya tarih aralığı seçer; ay/yıl görünümü ve
 * tam klavye desteği vardır (oklar, Home/End, PageUp/PageDown, Enter).
 *
 * @example
 * <hu-calendar [(value)]="date" [min]="today" [markers]="events" />
 * <hu-calendar mode="range" [(range)]="period" />
 */
@Component({
  selector: 'hu-calendar',
  imports: [HuIcon],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  host: { class: 'hu-calendar' },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuCalendar {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  readonly mode = input<HuCalendarMode>('single');
  /** Seçili gün (`mode="single"`). */
  readonly value = model<Date | null>(null);
  /** Seçili aralık (`mode="range"`). */
  readonly range = model<HuDateRange | null>(null);
  readonly min = input<Date | null>(null);
  readonly max = input<Date | null>(null);
  /** `false` döndüren günler seçilemez (örn. hafta sonları). */
  readonly dateFilter = input<((date: Date) => boolean) | null>(null);
  readonly markers = input<HuCalendarMarker[]>([]);
  /** Hiç seçim yokken açılacak ay. */
  readonly startAt = input<Date | null>(null);
  readonly locale = input('tr-TR');
  readonly firstDayOfWeek = input(1);

  /** Kullanıcı bir gün seçtiğinde. */
  readonly dateSelected = output<Date>();
  /** Görüntülenen ay değiştiğinde (ayın ilk günü). */
  readonly monthChange = output<Date>();

  protected readonly today = startOfDay(new Date());
  protected readonly gridId = huUniqueId('hu-calendar');
  protected readonly view = signal<HuCalendarView>('days');
  protected readonly activeDate = signal<Date>(this.today);
  protected readonly hoverDate = signal<Date | null>(null);
  /** Roving tabindex: yalnızca aktif gün Tab ile odaklanabilir. */
  protected readonly activeKey = computed(() => dayKey(this.activeDate()));

  // --- Biçimlendiriciler ----------------------------------------------------------
  private readonly fmt = computed(() => {
    const locale = this.locale();
    return {
      monthYear: new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }),
      month: new Intl.DateTimeFormat(locale, { month: 'long' }),
      monthShort: new Intl.DateTimeFormat(locale, { month: 'short' }),
      weekdayShort: new Intl.DateTimeFormat(locale, { weekday: 'short' }),
      weekdayLong: new Intl.DateTimeFormat(locale, { weekday: 'long' }),
      full: new Intl.DateTimeFormat(locale, { dateStyle: 'full' }),
    };
  });

  protected readonly weekdays = computed(() => {
    const first = startOfWeek(this.today, this.firstDayOfWeek());
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(first, i);
      return { short: this.fmt().weekdayShort.format(d), long: this.fmt().weekdayLong.format(d) };
    });
  });

  protected readonly headerLabel = computed(() => {
    const active = this.activeDate();
    switch (this.view()) {
      case 'days':
        return this.fmt().monthYear.format(active);
      case 'months':
        return String(active.getFullYear());
      case 'years': {
        const start = this.yearPageStart();
        return `${start} – ${start + YEARS_PER_PAGE - 1}`;
      }
    }
  });

  // --- Gün görünümü ----------------------------------------------------------------
  private readonly markerMap = computed(() => {
    const map = new Map<string, HuCalendarMarker[]>();
    for (const m of this.markers()) {
      const key = dayKey(m.date);
      map.set(key, [...(map.get(key) ?? []), m]);
    }
    return map;
  });

  protected readonly weeks = computed<DayCell[][]>(() => {
    const active = this.activeDate();
    const first = new Date(active.getFullYear(), active.getMonth(), 1);
    const gridStart = startOfWeek(first, this.firstDayOfWeek());
    const mode = this.mode();
    const value = this.value();
    const range = this.range();
    const preview = this.previewEnd();
    const markers = this.markerMap();
    const fmt = this.fmt().full;

    let rangeStart = range?.start ?? null;
    let rangeEnd = range?.end ?? preview;
    if (rangeStart && rangeEnd && compareDays(rangeEnd, rangeStart) < 0) [rangeStart, rangeEnd] = [rangeEnd, rangeStart];

    const weeks: DayCell[][] = [];
    for (let w = 0; w < 6; w++) {
      const row: DayCell[] = [];
      for (let i = 0; i < 7; i++) {
        const date = addDays(gridStart, w * 7 + i);
        const key = dayKey(date);
        const isStart = mode === 'range' && isSameDay(date, rangeStart);
        const isEnd = mode === 'range' && isSameDay(date, rangeEnd);
        const dayMarkers = markers.get(key) ?? [];
        row.push({
          date,
          key,
          day: date.getDate(),
          inMonth: isSameMonth(date, active),
          today: isSameDay(date, this.today),
          selected: mode === 'single' ? isSameDay(date, value) : isStart || isEnd,
          rangeStart: isStart && !!rangeEnd && !isSameDay(rangeStart, rangeEnd),
          rangeEnd: isEnd && !!rangeStart && !isSameDay(rangeStart, rangeEnd),
          inRange:
            mode === 'range' &&
            !!rangeStart &&
            !!rangeEnd &&
            compareDays(date, rangeStart) > 0 &&
            compareDays(date, rangeEnd) < 0,
          disabled: !this.isSelectable(date),
          markers: dayMarkers,
          label: fmt.format(date) + (dayMarkers.length ? ` — ${dayMarkers.map((m) => m.label).filter(Boolean).join(', ')}` : ''),
        });
      }
      weeks.push(row);
    }
    return weeks;
  });

  /** Aralık seçiminde bitiş henüz seçilmemişken fareyle önizleme. */
  private readonly previewEnd = computed(() => {
    const range = this.range();
    if (this.mode() !== 'range' || !range?.start || range.end) return null;
    return this.hoverDate();
  });

  // --- Ay / yıl görünümleri --------------------------------------------------------
  protected readonly months = computed<PickerCell[]>(() => {
    const year = this.activeDate().getFullYear();
    const selected = this.selectedAnchor();
    return Array.from({ length: 12 }, (_, month) => ({
      value: month,
      label: this.fmt().monthShort.format(new Date(year, month, 1)),
      current: year === this.today.getFullYear() && month === this.today.getMonth(),
      selected: !!selected && selected.getFullYear() === year && selected.getMonth() === month,
      disabled: !this.isRangeAllowed(new Date(year, month, 1), new Date(year, month, daysInMonth(year, month))),
    }));
  });

  private readonly yearPageStart = computed(() => {
    const year = this.activeDate().getFullYear();
    return year - (((year % YEARS_PER_PAGE) + YEARS_PER_PAGE) % YEARS_PER_PAGE);
  });

  protected readonly years = computed<PickerCell[]>(() => {
    const start = this.yearPageStart();
    const selected = this.selectedAnchor();
    return Array.from({ length: YEARS_PER_PAGE }, (_, i) => {
      const year = start + i;
      return {
        value: year,
        label: String(year),
        current: year === this.today.getFullYear(),
        selected: selected?.getFullYear() === year,
        disabled: !this.isRangeAllowed(new Date(year, 0, 1), new Date(year, 11, 31)),
      };
    });
  });

  private readonly selectedAnchor = computed(() => (this.mode() === 'single' ? this.value() : this.range()?.start) ?? null);

  protected readonly prevDisabled = computed(() => {
    const min = this.min();
    if (!min) return false;
    const active = this.activeDate();
    switch (this.view()) {
      case 'days':
        return compareDays(new Date(active.getFullYear(), active.getMonth(), 0), min) < 0;
      case 'months':
        return active.getFullYear() - 1 < min.getFullYear();
      case 'years':
        return this.yearPageStart() - 1 < min.getFullYear();
    }
  });

  protected readonly nextDisabled = computed(() => {
    const max = this.max();
    if (!max) return false;
    const active = this.activeDate();
    switch (this.view()) {
      case 'days':
        return compareDays(new Date(active.getFullYear(), active.getMonth() + 1, 1), max) > 0;
      case 'months':
        return active.getFullYear() + 1 > max.getFullYear();
      case 'years':
        return this.yearPageStart() + YEARS_PER_PAGE > max.getFullYear();
    }
  });

  constructor() {
    // Seçim dışarıdan değiştiğinde (örn. input'a tarih yazıldığında) o aya git.
    effect(() => {
      const anchor = this.selectedAnchor() ?? this.startAt();
      if (!anchor) return;
      untracked(() => {
        if (!isSameMonth(anchor, this.activeDate())) this.setActive(startOfDay(anchor));
      });
    });
  }

  // --- Etkileşim ------------------------------------------------------------------
  select(date: Date): void {
    if (!this.isSelectable(date)) return;
    this.setActive(date);

    if (this.mode() === 'single') {
      this.value.set(date);
    } else {
      const range = this.range();
      if (!range?.start || range.end || compareDays(date, range.start) < 0) {
        this.range.set({ start: date, end: null });
      } else {
        this.range.set({ start: range.start, end: date });
      }
    }
    this.dateSelected.emit(date);
  }

  /** Klavye odağını takvime taşır (tarih seçici açıldığında kullanılır). */
  focusActiveCell(): void {
    this.focusAfterRender('.hu-calendar__cell[tabindex="0"]');
  }

  /** Görünüm değişince tıklanan buton DOM'dan kalkar; odağı yeni görünüme taşı. */
  private focusAfterRender(...selectors: string[]): void {
    afterNextRender(
      () => {
        for (const selector of selectors) {
          const el = this.host.nativeElement.querySelector<HTMLElement>(selector);
          if (el) return el.focus();
        }
      },
      { injector: this.injector },
    );
  }

  private focusPicker(): void {
    this.focusAfterRender('.hu-calendar__pick[aria-selected="true"]', '.hu-calendar__pick--current', '.hu-calendar__pick:not(:disabled)');
  }

  protected previous(): void {
    this.navigate(-1);
  }

  protected next(): void {
    this.navigate(1);
  }

  private navigate(direction: 1 | -1): void {
    const active = this.activeDate();
    switch (this.view()) {
      case 'days':
        return this.setActive(addMonths(active, direction), false);
      case 'months':
        return this.setActive(addMonths(active, direction * 12), false);
      case 'years':
        return this.setActive(addMonths(active, direction * 12 * YEARS_PER_PAGE), false);
    }
  }

  protected toggleView(): void {
    this.view.update((v) => (v === 'days' ? 'months' : v === 'months' ? 'years' : 'days'));
  }

  protected pickMonth(month: number): void {
    const active = this.activeDate();
    const day = Math.min(active.getDate(), daysInMonth(active.getFullYear(), month));
    this.setActive(new Date(active.getFullYear(), month, day));
    this.view.set('days');
    this.focusActiveCell();
  }

  protected pickYear(year: number): void {
    const active = this.activeDate();
    const day = Math.min(active.getDate(), daysInMonth(year, active.getMonth()));
    this.setActive(new Date(year, active.getMonth(), day));
    this.view.set('months');
    this.focusPicker();
  }

  protected onGridKeydown(event: KeyboardEvent): void {
    const active = this.activeDate();
    const first = this.firstDayOfWeek();
    let next: Date | null = null;

    switch (event.key) {
      case 'ArrowLeft':
        next = addDays(active, -1);
        break;
      case 'ArrowRight':
        next = addDays(active, 1);
        break;
      case 'ArrowUp':
        next = addDays(active, -7);
        break;
      case 'ArrowDown':
        next = addDays(active, 7);
        break;
      case 'Home':
        next = startOfWeek(active, first);
        break;
      case 'End':
        next = addDays(startOfWeek(active, first), 6);
        break;
      case 'PageUp':
        next = addMonths(active, event.shiftKey ? -12 : -1);
        break;
      case 'PageDown':
        next = addMonths(active, event.shiftKey ? 12 : 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.select(active);
        return;
      default:
        return;
    }
    event.preventDefault();
    this.setActive(next);
    this.focusActiveCell();
  }

  private setActive(date: Date, clamp = true): void {
    const next = clamp ? clampDate(date, this.min(), this.max()) : date;
    const previous = this.activeDate();
    this.activeDate.set(next);
    if (!isSameMonth(previous, next)) this.monthChange.emit(new Date(next.getFullYear(), next.getMonth(), 1));
  }

  private isSelectable(date: Date): boolean {
    const min = this.min();
    const max = this.max();
    if (min && compareDays(date, min) < 0) return false;
    if (max && compareDays(date, max) > 0) return false;
    return this.dateFilter()?.(date) ?? true;
  }

  private isRangeAllowed(from: Date, to: Date): boolean {
    const min = this.min();
    const max = this.max();
    return !(min && compareDays(to, min) < 0) && !(max && compareDays(from, max) > 0);
  }
}
