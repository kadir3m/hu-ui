import { HuMarkerVariant } from '@kadirucme/hu-ui';

export type EventCategory = 'ders' | 'kayit' | 'sinav' | 'tatil' | 'etkinlik';

export interface AcademicEvent {
  id: number;
  title: string;
  category: EventCategory;
  start: Date;
  end: Date;
}

export const CATEGORIES: Record<EventCategory, { label: string; variant: HuMarkerVariant }> = {
  ders: { label: 'Ders', variant: 'primary' },
  kayit: { label: 'Kayıt', variant: 'info' },
  sinav: { label: 'Sınav', variant: 'warning' },
  tatil: { label: 'Tatil', variant: 'danger' },
  etkinlik: { label: 'Etkinlik', variant: 'success' },
};

const d = (day: number, month: number, year = 2026) => new Date(year, month - 1, day);

export const ACADEMIC_EVENTS: AcademicEvent[] = [
  { id: 1, title: 'Güz dönemi ders kayıtları', category: 'kayit', start: d(21, 9), end: d(25, 9) },
  { id: 2, title: 'Güz dönemi derslerin başlaması', category: 'ders', start: d(28, 9), end: d(28, 9) },
  { id: 3, title: 'Ders ekleme-bırakma haftası', category: 'kayit', start: d(6, 10), end: d(10, 10) },
  { id: 4, title: 'Burs başvuruları son gün', category: 'kayit', start: d(16, 10), end: d(16, 10) },
  { id: 5, title: 'Cumhuriyet Bayramı', category: 'tatil', start: d(28, 10), end: d(29, 10) },
  { id: 6, title: 'Kariyer Günleri', category: 'etkinlik', start: d(4, 11), end: d(5, 11) },
  { id: 7, title: 'Ara sınavlar', category: 'sinav', start: d(16, 11), end: d(27, 11) },
  { id: 8, title: 'Yılbaşı tatili', category: 'tatil', start: d(1, 1, 2027), end: d(1, 1, 2027) },
  { id: 9, title: 'Derslerin son günü', category: 'ders', start: d(8, 1, 2027), end: d(8, 1, 2027) },
  { id: 10, title: 'Dönem sonu sınavları', category: 'sinav', start: d(11, 1, 2027), end: d(22, 1, 2027) },
];
