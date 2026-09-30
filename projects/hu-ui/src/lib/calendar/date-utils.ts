/*
 * Bağımlılıksız tarih yardımcıları. Tüm fonksiyonlar yerel saatle ve gün
 * hassasiyetinde çalışır (saat bilgisi yok sayılır).
 */

export interface HuDateRange {
  start: Date | null;
  end: Date | null;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/** Ay ekler; hedef ayda o gün yoksa ayın son gününe sabitler (31 Ocak + 1 ay = 28/29 Şubat). */
export function addMonths(date: Date, months: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = daysInMonth(target.getFullYear(), target.getMonth());
  target.setDate(Math.min(date.getDate(), lastDay));
  return target;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function isSameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** Gün bazında karşılaştırma: a < b → negatif. */
export function compareDays(a: Date, b: Date): number {
  return startOfDay(a).getTime() - startOfDay(b).getTime();
}

/** Haftanın başlangıcı (varsayılan Pazartesi). */
export function startOfWeek(date: Date, firstDayOfWeek = 1): Date {
  const diff = (date.getDay() - firstDayOfWeek + 7) % 7;
  return addDays(date, -diff);
}

export function clampDate(date: Date, min?: Date | null, max?: Date | null): Date {
  if (min && compareDays(date, min) < 0) return startOfDay(min);
  if (max && compareDays(date, max) > 0) return startOfDay(max);
  return date;
}

export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/** `gg.aa.yyyy` biçiminde yazar. */
export function formatDate(date: Date | null | undefined): string {
  if (!isValidDate(date)) return '';
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}.${m}.${date.getFullYear()}`;
}

/**
 * Kullanıcı girdisini ayrıştırır. Kabul edilenler: `5.10.2026`, `05/10/2026`,
 * `05-10-2026`, `05102026`. Geçersiz tarihte (31.02.2026 gibi) `null` döner.
 */
export function parseDate(text: string): Date | null {
  const value = text.trim();
  let match = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.exec(value);
  if (!match) match = /^(\d{2})(\d{2})(\d{4})$/.exec(value);
  if (!match) return null;
  const [day, month, year] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(year, month - 1, day);
  // Taşan tarihleri (32.01 → 01.02) reddet
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

const RANGE_SEPARATOR = /\s+[–-]\s+|\s*[–]\s*/;

export function formatRange(range: HuDateRange | null | undefined): string {
  if (!range?.start) return '';
  return range.end ? `${formatDate(range.start)} – ${formatDate(range.end)}` : `${formatDate(range.start)} – `;
}

/** `gg.aa.yyyy – gg.aa.yyyy` ayrıştırır. Başarısızsa `null`. */
export function parseRange(text: string): HuDateRange | null {
  const parts = text.split(RANGE_SEPARATOR).map((p) => p.trim()).filter(Boolean);
  if (parts.length !== 2) return null;
  const start = parseDate(parts[0]);
  const end = parseDate(parts[1]);
  if (!start || !end) return null;
  return compareDays(start, end) <= 0 ? { start, end } : { start: end, end: start };
}
