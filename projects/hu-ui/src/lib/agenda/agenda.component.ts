import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { HuButton } from '../button/button.component';
import { HuButtonGroup } from '../button/button-group.component';
import { addDays, addMonths, isSameDay, isSameMonth, startOfDay } from '../calendar/date-utils';
import { HuIcon } from '../icon/icon.component';
import { HuAgendaEditor } from './agenda-editor.component';
import {
  DAY,
  MINUTE,
  addMinutes,
  atMinutes,
  effectiveEnd,
  formatTime,
  formatTimeRange,
  isAllDayLike,
  layoutDay,
  minutesOfDay,
  overlaps,
  shiftDays,
  snap,
  viewRange,
} from './agenda-utils';
import {
  HU_AGENDA_DEFAULT_CATEGORIES,
  HuAgendaCategory,
  HuAgendaColor,
  HuAgendaEvent,
  HuAgendaEventChange,
  HuAgendaSlot,
  HuAgendaView,
} from './agenda.types';

type DragKind = 'select' | 'move' | 'resize' | 'day-move';

interface DragState {
  kind: DragKind;
  pointerId: number;
  x: number;
  y: number;
  moved: boolean;
  /** Başlangıç sütunu (zaman ızgarası) ve dakika. */
  column: number;
  minute: number;
  event?: HuAgendaEvent;
  /** Önizleme aralığı. */
  start: Date;
  end: Date;
}

const VIEW_LABELS: Record<HuAgendaView, string> = { month: 'Ay', week: 'Hafta', day: 'Gün', list: 'Liste' };
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const parseDayKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};
let nextId = 1;

/**
 * Ajanda / takvim: ay, hafta, gün ve liste görünümleri. Boş alana tıklayarak veya
 * sürükleyerek kayıt eklenir; kayıtlar sürüklenerek taşınır, alt kenarından süresi
 * değiştirilir. Yerleşik form ile düzenlenir. `[(events)]` ile çift yönlü bağlanır;
 * sunucuyla eşitlemek için `eventCreate`, `eventUpdate`, `eventDelete` olaylarını dinleyin.
 *
 * @example
 * <hu-agenda [(events)]="events" view="week" (eventCreate)="api.create($event)" />
 */
@Component({
  selector: 'hu-agenda',
  imports: [NgTemplateOutlet, HuButton, HuButtonGroup, HuIcon, HuAgendaEditor],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.scss',
  host: {
    class: 'hu-agenda',
    '[attr.data-view]': 'view()',
    '[class.hu-agenda--dragging]': '!!drag()?.moved',
    '[style.--hu-agenda-hour]': "hourHeight() + 'px'",
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuAgenda<T = unknown> {
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  // --- Veri ve görünüm --------------------------------------------------------------
  readonly events = model<HuAgendaEvent<T>[]>([]);
  readonly view = model<HuAgendaView>('week');
  /** Gösterilen tarih (görünüm bu tarihi kapsar). */
  readonly date = model<Date>(startOfDay(new Date()));
  readonly views = input<HuAgendaView[]>(['month', 'week', 'day', 'list']);
  readonly categories = input<readonly HuAgendaCategory[]>(HU_AGENDA_DEFAULT_CATEGORIES);

  // --- Davranış --------------------------------------------------------------------
  /** Ekleme, sürükleme, düzenleme. `false` → salt okunur takvim. */
  readonly editable = input(true, { transform: booleanAttribute });
  /** Yerleşik form. `false` ise `slotSelect` / `eventClick` ile kendi formunuzu açın. */
  readonly editor = input(true, { transform: booleanAttribute });
  /** Hafta görünümünde cumartesi-pazar. */
  readonly weekends = input(true, { transform: booleanAttribute });
  /** Izgaradaki çizgi aralığı (dk). */
  readonly slotMinutes = input(30, { transform: numberAttribute });
  /** Sürükleme / seçim adımı (dk). */
  readonly snapMinutes = input(15, { transform: numberAttribute });
  /** Bir saatin yüksekliği (px). */
  readonly hourHeight = input(48, { transform: numberAttribute });
  /** Açılışta kaydırılacak saat. */
  readonly scrollToHour = input(8, { transform: numberAttribute });
  /**
   * Gösterilen saat aralığı (hafta/gün). Dışındaki saatler gizlenir; aralık dışında kayıt varsa
   * ızgara onu kapsayacak kadar genişler. `null` → 24 saat.
   */
  readonly businessHours = input<{ start: number; end: number } | null>({ start: 8, end: 18 });
  /** Ay görünümünde bir günde en çok kaç kayıt (fazlası "+3 daha"). */
  readonly maxPerDay = input(3, { transform: numberAttribute });
  /** Liste görünümünün kapsadığı gün sayısı. */
  readonly listDays = input(30, { transform: numberAttribute });

  // --- Olaylar ---------------------------------------------------------------------
  readonly eventClick = output<HuAgendaEvent<T>>();
  readonly slotSelect = output<HuAgendaSlot>();
  readonly eventCreate = output<HuAgendaEvent<T>>();
  readonly eventUpdate = output<HuAgendaEventChange<T> | { event: HuAgendaEvent<T>; previous: HuAgendaEvent<T>; kind: 'edit' }>();
  readonly eventDelete = output<HuAgendaEvent<T>>();
  /** Görünen aralık değişince (veriyi sunucudan aralığa göre getirmek için). */
  readonly rangeChange = output<{ start: Date; end: Date }>();

  // --- Durum -----------------------------------------------------------------------
  protected readonly viewLabels = VIEW_LABELS;
  protected readonly isAllDayLike = isAllDayLike;
  protected readonly hidden = signal<ReadonlySet<string>>(new Set());
  protected readonly drag = signal<DragState | null>(null);
  protected readonly now = signal(new Date());
  protected readonly editorOpen = signal(false);
  protected readonly editorEvent = signal<HuAgendaEvent | null>(null);
  protected readonly editorIsNew = signal(false);

  private readonly scroller = viewChild<ElementRef<HTMLElement>>('scroller');
  private readonly grid = viewChild<ElementRef<HTMLElement>>('grid');
  private suppressClick = false;

  protected readonly range = computed(() => viewRange(this.view(), this.date(), this.listDays()));
  private readonly categoryMap = computed(() => new Map(this.categories().map((c) => [c.key, c])));

  /** Sürüklenen kaydın önizlemesiyle birlikte, filtrelenmiş kayıtlar. */
  protected readonly shown = computed(() => {
    const hidden = this.hidden();
    const drag = this.drag();
    return (this.events() ?? [])
      .filter((e) => !e.category || !hidden.has(e.category))
      .map((e) => (drag?.moved && drag.event && drag.event.id === e.id ? { ...e, start: drag.start, end: drag.end } : e));
  });

  /** Zaman ızgarasının günleri. */
  protected readonly days = computed(() => {
    const { start, end } = this.range();
    if (this.view() === 'day') return [start];
    const days: Date[] = [];
    for (let d = start; d < end; d = addDays(d, 1)) {
      if (this.weekends() || (d.getDay() !== 0 && d.getDay() !== 6)) days.push(d);
    }
    return days;
  });

  protected readonly columns = computed(() =>
    this.days().map((day) => {
      const start = startOfDay(day);
      const end = addDays(start, 1);
      const inDay = this.shown().filter((e) => overlaps(e, start, end));
      return {
        day,
        key: dayKey(day),
        allDay: inDay.filter((e) => isAllDayLike(e)),
        timed: layoutDay(inDay.filter((e) => !isAllDayLike(e)), day),
      };
    }),
  );

  /** Izgaradaki saat aralığı: mesai saatleri, dışında kayıt varsa onu da kapsar. */
  protected readonly hourRange = computed(() => {
    const bh = this.businessHours();
    let start = bh ? bh.start : 0;
    let end = bh ? bh.end : 24;
    for (const col of this.columns()) {
      for (const l of col.timed) {
        start = Math.min(start, Math.floor(l.top / 60));
        end = Math.max(end, Math.ceil((l.top + l.height) / 60));
      }
    }
    start = Math.max(0, Math.min(23, start));
    end = Math.max(start + 1, Math.min(24, end));
    return { start, end };
  });
  protected readonly hours = computed(() => {
    const { start, end } = this.hourRange();
    return Array.from({ length: end - start }, (_, i) => start + i);
  });
  private readonly startMinute = computed(() => this.hourRange().start * 60);
  private readonly endMinute = computed(() => this.hourRange().end * 60);

  /** Ay ızgarası: 6 hafta × 7 gün. */
  protected readonly weeks = computed(() => {
    const { start } = this.range();
    const all = this.shown();
    return Array.from({ length: 6 }, (_, w) =>
      Array.from({ length: 7 }, (_, d) => {
        const day = addDays(start, w * 7 + d);
        const end = addDays(day, 1);
        const events = all
          .filter((e) => overlaps(e, day, end))
          .sort((a, b) => Number(!isAllDayLike(a)) - Number(!isAllDayLike(b)) || a.start.getTime() - b.start.getTime());
        return { day, key: dayKey(day), events, outside: !isSameMonth(day, this.date()) };
      }),
    );
  });

  protected readonly weekdayNames = computed(() => {
    const fmt = new Intl.DateTimeFormat('tr-TR', { weekday: 'short' });
    const monday = new Date(2024, 0, 1); // pazartesi
    return Array.from({ length: 7 }, (_, i) => fmt.format(addDays(monday, i)));
  });

  /** Liste görünümü: günlere göre gruplu. */
  protected readonly groups = computed(() => {
    const { start, end } = this.range();
    const events = this.shown()
      .filter((e) => overlaps(e, start, end))
      .sort((a, b) => a.start.getTime() - b.start.getTime());
    const groups: { day: Date; events: HuAgendaEvent<T>[] }[] = [];
    for (let d = start; d < end; d = addDays(d, 1)) {
      const next = addDays(d, 1);
      const list = events.filter((e) => overlaps(e, d, next));
      if (list.length) groups.push({ day: d, events: list });
    }
    return groups;
  });

  protected readonly title = computed(() => {
    const d = this.date();
    const { start, end } = this.range();
    const last = addDays(end, -1);
    const month = new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' });
    switch (this.view()) {
      case 'month':
        return month.format(d);
      case 'day':
        return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' }).format(d);
      default: {
        const days = this.view() === 'week' ? this.days() : [start, last];
        const a = days[0];
        const b = days[days.length - 1];
        const short = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short' });
        if (a.getMonth() === b.getMonth()) return `${a.getDate()} – ${b.getDate()} ${month.format(b)}`;
        return `${short.format(a)} – ${short.format(b)} ${b.getFullYear()}`;
      }
    }
  });

  constructor() {
    // "Şu an" çizgisi dakikada bir güncellenir
    const timer = setInterval(() => this.now.set(new Date()), 60_000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));

    effect(() => {
      const { start, end } = this.range();
      untracked(() => this.rangeChange.emit({ start, end }));
    });
    // Hafta / gün görünümüne geçince mesai başlangıcına kaydır
    effect(() => {
      const view = this.view();
      if (view !== 'week' && view !== 'day') return;
      afterNextRender(
        () => {
          const el = this.scroller()?.nativeElement;
          if (el) el.scrollTop = Math.max(0, (this.scrollToHour() - this.hourRange().start) * this.hourHeight() - 8);
        },
        { injector: this.injector },
      );
    });
  }

  // --- Gezinme -----------------------------------------------------------------------
  today(): void {
    this.date.set(startOfDay(new Date()));
  }

  previous(): void {
    this.shift(-1);
  }

  next(): void {
    this.shift(1);
  }

  private shift(direction: 1 | -1): void {
    const d = this.date();
    switch (this.view()) {
      case 'month':
        return this.date.set(addMonths(d, direction));
      case 'week':
        return this.date.set(addDays(d, 7 * direction));
      case 'day':
        return this.date.set(addDays(d, direction));
      case 'list':
        return this.date.set(addDays(d, this.listDays() * direction));
    }
  }

  protected goToDay(day: Date): void {
    this.date.set(startOfDay(day));
    if (this.views().includes('day')) this.view.set('day');
  }

  protected toggleCategory(key: string): void {
    this.hidden.update((set) => {
      const next = new Set(set);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // --- Görünüm yardımcıları ------------------------------------------------------------
  protected colorOf(e: HuAgendaEvent): HuAgendaColor {
    return e.color ?? (e.category ? this.categoryMap().get(e.category)?.color : undefined) ?? 'primary';
  }

  protected categoryLabel(e: HuAgendaEvent): string | undefined {
    return e.category ? this.categoryMap().get(e.category)?.label : undefined;
  }

  protected isToday(day: Date): boolean {
    return isSameDay(day, this.now());
  }

  protected timeLabel(e: HuAgendaEvent): string {
    return formatTimeRange(e);
  }

  protected startLabel(e: HuAgendaEvent): string {
    return formatTime(e.start);
  }

  protected ariaLabel(e: HuAgendaEvent): string {
    const date = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' }).format(e.start);
    return [e.title, date, formatTimeRange(e), this.categoryLabel(e), e.location].filter(Boolean).join(', ');
  }

  protected hourLabel(h: number): string {
    return `${String(h).padStart(2, '0')}:00`;
  }

  /** Zaman ızgarasında konum (px). */
  protected px(minutes: number): number {
    return (minutes * this.hourHeight()) / 60;
  }

  /** Gün başından dakikanın ızgaradaki konumu (görünen aralığın başına göre). */
  protected y(minuteOfDay: number): number {
    return this.px(minuteOfDay - this.startMinute());
  }

  protected nowTop(): number {
    return this.y(minutesOfDay(this.now()));
  }

  protected nowVisible(): boolean {
    const m = minutesOfDay(this.now());
    return m >= this.startMinute() && m < this.endMinute();
  }

  /** Görünen aralıkta mesai dışı kalan kısım (kayıt yüzünden genişlediyse) soluk. */
  protected bizStart(): number {
    const bh = this.businessHours();
    return bh ? this.y(bh.start * 60) : 0;
  }

  protected bizEnd(): number {
    const bh = this.businessHours();
    return bh ? this.y(bh.end * 60) : this.y(this.endMinute());
  }

  protected isPast(e: HuAgendaEvent): boolean {
    return effectiveEnd(e).getTime() < this.now().getTime();
  }

  protected canEdit(e: HuAgendaEvent): boolean {
    return this.editable() && !e.readonly;
  }

  protected selectionBox(column: number): { top: number; height: number } | null {
    const d = this.drag();
    if (!d || d.kind !== 'select' || !d.moved || d.column !== column) return null;
    const top = minutesOfDay(d.start);
    return { top: this.y(top), height: this.px((d.end.getTime() - d.start.getTime()) / MINUTE) };
  }

  /** Sürükleyerek seçimde kutunun içindeki saat aralığı. */
  protected selectionLabel(): string {
    const d = this.drag();
    return d ? `${formatTime(d.start)} – ${formatTime(d.end)}` : '';
  }

  protected isDragged(e: HuAgendaEvent): boolean {
    const d = this.drag();
    return !!d?.moved && d.event?.id === e.id;
  }

  // --- Oluşturma / düzenleme -------------------------------------------------------------
  /** Araç çubuğundaki "Yeni": bir sonraki tam saatte, 1 saatlik kayıt. */
  protected newAtNextHour(): void {
    const base = this.view() === 'day' || this.view() === 'week' ? this.date() : new Date();
    const now = new Date();
    const day = isSameDay(base, now) || this.view() === 'month' || this.view() === 'list' ? now : base;
    const start = atMinutes(day, isSameDay(day, now) ? (now.getHours() + 1) * 60 : 9 * 60);
    this.select({ start, end: addMinutes(start, 60), allDay: false });
  }

  private select(slot: HuAgendaSlot): void {
    this.slotSelect.emit(slot);
    if (!this.editable() || !this.editor()) return;
    this.editorIsNew.set(true);
    this.editorEvent.set({ id: `yeni-${Date.now()}-${nextId++}`, title: '', ...slot, category: this.categories()[0]?.key });
    this.editorOpen.set(true);
  }

  protected openEvent(e: HuAgendaEvent<T>): void {
    if (this.suppressClick) return;
    this.eventClick.emit(e);
    if (!this.editor()) return;
    if (!this.canEdit(e)) return;
    this.editorIsNew.set(false);
    this.editorEvent.set(e);
    this.editorOpen.set(true);
  }

  protected onSave(saved: HuAgendaEvent): void {
    const event = saved as HuAgendaEvent<T>;
    if (this.editorIsNew()) {
      this.events.update((list) => [...(list ?? []), event]);
      this.eventCreate.emit(event);
    } else {
      const previous = (this.events() ?? []).find((e) => e.id === event.id);
      this.events.update((list) => (list ?? []).map((e) => (e.id === event.id ? event : e)));
      if (previous) this.eventUpdate.emit({ event, previous, kind: 'edit' });
    }
  }

  protected onDelete(removed: HuAgendaEvent): void {
    this.events.update((list) => (list ?? []).filter((e) => e.id !== removed.id));
    this.eventDelete.emit(removed as HuAgendaEvent<T>);
  }

  // --- Tıklama ile seçim (fare, dokunmatik, klavye) ------------------------------------
  /** Zaman ızgarasında boş alana tıklama: o saatte bir aralık. */
  protected onGridClick(event: MouseEvent): void {
    if (this.suppressClick || !this.editable()) return;
    if ((event.target as HTMLElement).closest('.hu-agenda__event')) return;
    const point = this.gridPoint(event.clientX, event.clientY);
    if (!point) return;
    const start = atMinutes(this.days()[point.column], Math.floor(point.minute / this.slotMinutes()) * this.slotMinutes());
    this.select({ start, end: addMinutes(start, this.slotMinutes() * 2), allDay: false });
  }

  /** Ay görünümünde veya tüm gün satırında boş güne tıklama. */
  protected onDayClick(day: Date, allDay: boolean, event: MouseEvent): void {
    if (this.suppressClick || !this.editable()) return;
    if ((event.target as HTMLElement).closest('.hu-agenda__event, .hu-agenda__more, .hu-agenda__daynum')) return;
    if (allDay) {
      this.select({ start: startOfDay(day), end: addDays(startOfDay(day), 1), allDay: true });
    } else {
      const start = atMinutes(day, 9 * 60);
      this.select({ start, end: addMinutes(start, 60), allDay: false });
    }
  }

  // --- Sürükleme -------------------------------------------------------------------------
  protected onPointerDown(event: PointerEvent): void {
    if (event.button !== 0 || event.pointerType === 'touch' || !this.editable()) return;
    const target = event.target as HTMLElement;
    const eventEl = target.closest<HTMLElement>('[data-event-id]');
    const found = eventEl ? this.findEvent(eventEl.dataset['eventId']!) : undefined;
    if (found && !this.canEdit(found)) return;
    const inGrid = !!target.closest('.hu-agenda__grid');
    const point = inGrid ? this.gridPoint(event.clientX, event.clientY) : null;

    let kind: DragKind;
    if (found && target.closest('[data-resize]')) kind = 'resize';
    else if (found && inGrid && !isAllDayLike(found)) kind = 'move';
    else if (found) kind = 'day-move';
    else if (point) kind = 'select';
    else return;

    const startMinute = point ? snap(point.minute, this.snapMinutes()) : 0;
    const start = found ? found.start : atMinutes(this.days()[point!.column], startMinute);
    this.drag.set({
      kind,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      moved: false,
      column: point?.column ?? 0,
      minute: point?.minute ?? 0,
      event: found,
      start,
      end: found ? found.end : addMinutes(start, this.snapMinutes()),
    });
    // Yakalama sürükleme başlayınca yapılır: basit tıklamada click olayı yerinde kalsın
    if (kind !== 'select') event.preventDefault(); // metin seçimi başlamasın
  }

  protected onPointerMove(event: PointerEvent): void {
    const d = this.drag();
    if (!d || d.pointerId !== event.pointerId) return;
    if (!d.moved && Math.hypot(event.clientX - d.x, event.clientY - d.y) < 4) return;
    if (!d.moved) (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.autoScroll(event.clientY);

    if (d.kind === 'day-move') {
      const cell = (this.host.nativeElement.ownerDocument.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null)?.closest<HTMLElement>('[data-day]');
      if (!cell || !d.event) return this.drag.set({ ...d, moved: true });
      const target = parseDayKey(cell.dataset['day']!);
      const shift = Math.round((startOfDay(target).getTime() - startOfDay(d.event.start).getTime()) / DAY);
      this.drag.set({ ...d, moved: true, start: shiftDays(d.event.start, shift), end: shiftDays(d.event.end, shift) });
      return;
    }

    const point = this.gridPoint(event.clientX, event.clientY);
    if (!point) return;
    const step = this.snapMinutes();
    if (d.kind === 'select') {
      const a = snap(d.minute, step);
      const b = snap(point.minute, step);
      const day = this.days()[d.column];
      const from = Math.min(a, b);
      const to = Math.max(a, b, from + step);
      this.drag.set({ ...d, moved: true, start: atMinutes(day, from), end: atMinutes(day, Math.min(to, this.endMinute())) });
    } else if (d.kind === 'move' && d.event) {
      const delta = snap(point.minute - d.minute, step);
      const dayShift = this.days()[point.column].getTime() - this.days()[d.column].getTime();
      const start = new Date(d.event.start.getTime() + dayShift + delta * MINUTE);
      const duration = d.event.end.getTime() - d.event.start.getTime();
      this.drag.set({ ...d, moved: true, start, end: new Date(start.getTime() + duration) });
    } else if (d.kind === 'resize' && d.event) {
      const endDay = startOfDay(d.event.start);
      let end = atMinutes(endDay, snap(point.minute, step));
      if (end.getTime() < d.event.start.getTime() + step * MINUTE) end = addMinutes(d.event.start, step);
      this.drag.set({ ...d, moved: true, end });
    }
  }

  protected onPointerUp(event: PointerEvent): void {
    const d = this.drag();
    if (!d || d.pointerId !== event.pointerId) return;
    this.drag.set(null);
    if (!d.moved) return; // tıklama: click olayı işler
    this.suppressClick = true;
    setTimeout(() => (this.suppressClick = false));

    if (d.kind === 'select') {
      this.select({ start: d.start, end: d.end, allDay: false });
      return;
    }
    const original = d.event;
    if (!original) return;
    if (original.start.getTime() === d.start.getTime() && original.end.getTime() === d.end.getTime()) return;
    const updated = { ...original, start: d.start, end: d.end } as HuAgendaEvent<T>;
    this.events.update((list) => (list ?? []).map((e) => (e.id === original.id ? updated : e)));
    this.eventUpdate.emit({ event: updated, previous: original as HuAgendaEvent<T>, kind: d.kind === 'resize' ? 'resize' : 'move' });
  }

  protected onPointerCancel(): void {
    this.drag.set(null);
  }

  private findEvent(id: string): HuAgendaEvent<T> | undefined {
    return (this.events() ?? []).find((e) => String(e.id) === id);
  }

  /** Ekran koordinatından gün sütunu ve dakika. */
  private gridPoint(x: number, y: number): { column: number; minute: number } | null {
    const grid = this.grid()?.nativeElement;
    if (!grid) return null;
    const rect = grid.getBoundingClientRect();
    const count = this.days().length;
    const column = Math.max(0, Math.min(count - 1, Math.floor(((x - rect.left) / rect.width) * count)));
    const minute = Math.max(this.startMinute(), Math.min(this.endMinute() - 1, this.startMinute() + ((y - rect.top) / this.hourHeight()) * 60));
    return { column, minute };
  }

  /** Sürüklerken kenara yaklaşınca kaydır. */
  private autoScroll(y: number): void {
    const el = this.scroller()?.nativeElement;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (y < rect.top + 32) el.scrollTop -= 12;
    else if (y > rect.bottom - 32) el.scrollTop += 12;
  }

}
