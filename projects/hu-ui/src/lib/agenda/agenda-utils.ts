import { addDays, startOfDay, startOfWeek } from '../calendar/date-utils';
import { HuAgendaEvent, HuAgendaView } from './agenda.types';

export const MINUTE = 60_000;
export const DAY = 24 * 60 * MINUTE;

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * MINUTE);
}

/** Gün kaydırır, saati korur (date-utils addDays yalnızca tarih döndürür). */
export function shiftDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function minutesOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function atMinutes(day: Date, minutes: number): Date {
  const d = startOfDay(day);
  d.setMinutes(minutes);
  return d;
}

/** Görünümün kapsadığı tarih aralığı [start, end). */
export function viewRange(view: HuAgendaView, date: Date, listDays: number): { start: Date; end: Date } {
  const day = startOfDay(date);
  switch (view) {
    case 'day':
      return { start: day, end: addDays(day, 1) };
    case 'week': {
      const start = startOfWeek(day, 1);
      return { start, end: addDays(start, 7) };
    }
    case 'list':
      return { start: day, end: addDays(day, listDays) };
    case 'month': {
      // Ay ızgarası: ayın ilk gününün haftası, 6 hafta
      const first = new Date(day.getFullYear(), day.getMonth(), 1);
      const start = startOfWeek(first, 1);
      return { start, end: addDays(start, 42) };
    }
  }
}

/** Etkinliğin bitişi (tüm gün etkinlikte aynı gün verilirse gün sonu). */
export function effectiveEnd(e: HuAgendaEvent): Date {
  if (e.allDay) {
    const end = startOfDay(e.end);
    return end.getTime() <= startOfDay(e.start).getTime() ? addDays(startOfDay(e.start), 1) : end;
  }
  return e.end.getTime() > e.start.getTime() ? e.end : addMinutes(e.start, 15);
}

export function overlaps(e: HuAgendaEvent, start: Date, end: Date): boolean {
  return e.start.getTime() < end.getTime() && effectiveEnd(e).getTime() > start.getTime();
}

/** Birden çok güne yayılan etkinlik (veya tüm gün): zaman ızgarasında üst satırda gösterilir. */
export function isAllDayLike(e: HuAgendaEvent): boolean {
  if (e.allDay) return true;
  return startOfDay(e.start).getTime() !== startOfDay(addMinutes(effectiveEnd(e), -1)).getTime();
}

export interface TimedLayout<T> {
  event: T;
  /** Gün başından dakika. */
  top: number;
  height: number;
  /** Çakışan grupta sütun ve sütun sayısı. */
  column: number;
  columns: number;
}

/**
 * Bir gündeki saatli etkinlikleri yerleştirir: çakışanlar yan yana sütunlara bölünür.
 * (Klasik takvim algoritması: başlangıca göre sırala, çakışma kümelerinde ilk boş sütun.)
 */
export function layoutDay<T extends HuAgendaEvent>(events: T[], day: Date): TimedLayout<T>[] {
  const dayStart = startOfDay(day).getTime();
  const dayEnd = dayStart + DAY;
  const items = events
    .map((event) => {
      const s = Math.max(event.start.getTime(), dayStart);
      const e = Math.min(effectiveEnd(event).getTime(), dayEnd);
      return { event, s, e: Math.max(e, s + 15 * MINUTE) };
    })
    .sort((a, b) => a.s - b.s || b.e - a.e);

  const result: TimedLayout<T>[] = [];
  let cluster: { item: (typeof items)[number]; column: number }[] = [];
  let clusterEnd = -Infinity;
  const flush = () => {
    const columns = Math.max(1, ...cluster.map((c) => c.column + 1));
    for (const c of cluster) {
      result.push({
        event: c.item.event,
        top: (c.item.s - dayStart) / MINUTE,
        height: (c.item.e - c.item.s) / MINUTE,
        column: c.column,
        columns,
      });
    }
    cluster = [];
  };

  for (const item of items) {
    if (item.s >= clusterEnd && cluster.length) flush();
    const used = new Set(cluster.filter((c) => c.item.e > item.s).map((c) => c.column));
    let column = 0;
    while (used.has(column)) column++;
    cluster.push({ item, column });
    clusterEnd = Math.max(clusterEnd, item.e);
  }
  if (cluster.length) flush();
  return result;
}

/** Dakikayı en yakın adıma yuvarlar. */
export function snap(minutes: number, step: number): number {
  return Math.round(minutes / step) * step;
}

const timeFmt = new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit' });
export function formatTime(date: Date): string {
  return timeFmt.format(date);
}

export function formatTimeRange(e: HuAgendaEvent): string {
  if (e.allDay) return 'Tüm gün';
  return `${formatTime(e.start)}–${formatTime(e.end)}`;
}

/** `<input type="time">` değeri: "09:30" */
export function toTimeValue(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function fromTimeValue(day: Date, value: string): Date {
  const [h, m] = value.split(':').map(Number);
  const d = startOfDay(day);
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}
