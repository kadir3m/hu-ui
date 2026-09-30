import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  HU_DIALOG_IMPORTS,
  HU_FORM_FIELD_IMPORTS,
  HuBadge,
  HuButton,
  HuCalendar,
  HuCalendarMarker,
  HuCard,
  HuCardActions,
  HuDatePicker,
  HuDateRange,
  HuIcon,
  HuToastService,
  addDays,
  compareDays,
  isSameDay,
  startOfDay,
} from '@kadirucme/hu-ui';
import { ACADEMIC_EVENTS, AcademicEvent, CATEGORIES, EventCategory } from '../../data/academic-events';

@Component({
  selector: 'app-academic-calendar',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    HU_DIALOG_IMPORTS,
    HU_FORM_FIELD_IMPORTS,
    HuBadge,
    HuButton,
    HuCalendar,
    HuCard,
    HuCardActions,
    HuDatePicker,
    HuIcon,
  ],
  templateUrl: './academic-calendar.component.html',
  styleUrl: './academic-calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcademicCalendarComponent {
  private readonly toast = inject(HuToastService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly categories = CATEGORIES;
  protected readonly categoryKeys = Object.keys(CATEGORIES) as EventCategory[];

  protected readonly events = signal<AcademicEvent[]>(ACADEMIC_EVENTS);
  protected readonly activeCategories = signal<ReadonlySet<EventCategory>>(new Set(this.categoryKeys));
  protected readonly selectedDate = signal<Date | null>(null);
  protected readonly visibleMonth = signal(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  private readonly filteredEvents = computed(() => {
    const active = this.activeCategories();
    return this.events()
      .filter((e) => active.has(e.category))
      .sort((a, b) => compareDays(a.start, b.start));
  });

  /** Çok günlü etkinlikler her güne ayrı işaret olarak düşer. */
  protected readonly markers = computed<HuCalendarMarker[]>(() =>
    this.filteredEvents().flatMap((e) => {
      const markers: HuCalendarMarker[] = [];
      for (let day = e.start; compareDays(day, e.end) <= 0; day = addDays(day, 1)) {
        markers.push({ date: day, label: e.title, variant: CATEGORIES[e.category].variant });
      }
      return markers;
    }),
  );

  protected readonly listTitle = computed(() => {
    const selected = this.selectedDate();
    if (selected) return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'long' }).format(selected);
    return new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(this.visibleMonth());
  });

  /** Seçili gündeki veya görüntülenen aydaki etkinlikler. */
  protected readonly listedEvents = computed(() => {
    const selected = this.selectedDate();
    if (selected) {
      return this.filteredEvents().filter((e) => compareDays(e.start, selected) <= 0 && compareDays(e.end, selected) >= 0);
    }
    const month = this.visibleMonth();
    const monthStart = month;
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    return this.filteredEvents().filter((e) => compareDays(e.start, monthEnd) <= 0 && compareDays(e.end, monthStart) >= 0);
  });

  protected readonly upcoming = computed(() => {
    const today = startOfDay(new Date());
    return this.filteredEvents()
      .filter((e) => compareDays(e.end, today) >= 0)
      .slice(0, 4);
  });

  protected toggleCategory(category: EventCategory): void {
    this.activeCategories.update((set) => {
      const next = new Set(set);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

  protected onMonthChange(month: Date): void {
    this.visibleMonth.set(month);
    const selected = this.selectedDate();
    if (selected && (selected.getMonth() !== month.getMonth() || selected.getFullYear() !== month.getFullYear())) {
      this.selectedDate.set(null);
    }
  }

  protected isSingleDay(e: AcademicEvent): boolean {
    return isSameDay(e.start, e.end);
  }

  // --- Yeni etkinlik ---------------------------------------------------------------
  protected readonly formOpen = signal(false);
  protected readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    category: this.fb.control<EventCategory>('etkinlik'),
    period: this.fb.control<HuDateRange | null>(null, Validators.required),
  });

  protected openCreate(): void {
    const selected = this.selectedDate();
    this.form.reset({ title: '', category: 'etkinlik', period: selected ? { start: selected, end: selected } : null });
    this.formOpen.set(true);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { title, category, period } = this.form.getRawValue();
    const id = Math.max(0, ...this.events().map((e) => e.id)) + 1;
    this.events.update((list) => [...list, { id, title, category, start: period!.start!, end: period!.end! }]);
    this.activeCategories.update((set) => new Set([...set, category]));
    this.formOpen.set(false);
    this.toast.success(`"${title}" takvime eklendi.`);
  }
}
