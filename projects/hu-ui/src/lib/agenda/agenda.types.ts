export type HuAgendaView = 'month' | 'week' | 'day' | 'list';

export type HuAgendaColor = 'primary' | 'info' | 'success' | 'warning' | 'danger' | 'neutral' | 'purple' | 'pink';

/** Ajandadaki bir kayıt (randevu, toplantı, ders, hatırlatma…). */
export interface HuAgendaEvent<T = unknown> {
  id: string | number;
  title: string;
  start: Date;
  /** Bitiş (hariç). Tüm gün etkinliklerde son günün ertesi gün 00:00 veya aynı gün verilebilir. */
  end: Date;
  allDay?: boolean;
  /** `categories` içindeki bir anahtar; rengi ve filtreyi belirler. */
  category?: string;
  /** Kategoriden bağımsız renk. */
  color?: HuAgendaColor;
  location?: string;
  description?: string;
  /** Sürükleme / düzenleme kapalı. */
  readonly?: boolean;
  /** Kendi verileriniz (müşteri no, oda vb.). */
  data?: T;
}

export interface HuAgendaCategory {
  key: string;
  label: string;
  color: HuAgendaColor;
}

/** Boş bir alana tıklanınca veya sürükleyerek seçilince. */
export interface HuAgendaSlot {
  start: Date;
  end: Date;
  allDay: boolean;
}

/** Sürükleyerek taşıma / süre değiştirme sonucu. */
export interface HuAgendaEventChange<T = unknown> {
  event: HuAgendaEvent<T>;
  previous: HuAgendaEvent<T>;
  kind: 'move' | 'resize';
}

export const HU_AGENDA_DEFAULT_CATEGORIES: HuAgendaCategory[] = [
  { key: 'appointment', label: 'Randevu', color: 'primary' },
  { key: 'meeting', label: 'Toplantı', color: 'info' },
  { key: 'lesson', label: 'Ders', color: 'success' },
  { key: 'reminder', label: 'Hatırlatma', color: 'warning' },
  { key: 'personal', label: 'Kişisel', color: 'purple' },
];
