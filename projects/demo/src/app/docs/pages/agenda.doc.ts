import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HuAgenda, HuAgendaEvent, HuAgendaSlot, HuToastService, addDays, startOfDay, startOfWeek } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

/** Bu haftanın pazartesisinden itibaren gün + saat. */
function at(dayOffset: number, hour: number, minute = 0): Date {
  const d = addDays(startOfWeek(startOfDay(new Date()), 1), dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function sampleEvents(): HuAgendaEvent[] {
  return [
    { id: 1, title: 'Ayşe Yılmaz · danışmanlık', start: at(0, 9, 30), end: at(0, 10, 15), category: 'appointment', location: 'Oda 204' },
    { id: 2, title: 'Haftalık birim toplantısı', start: at(0, 11), end: at(0, 12), category: 'meeting', location: 'Toplantı salonu B' },
    { id: 3, title: 'Veri Yapıları', start: at(1, 13, 30), end: at(1, 15, 20), category: 'lesson', location: 'D-12' },
    { id: 18, title: 'Laboratuvar', start: at(1, 10), end: at(1, 11, 30), category: 'lesson', location: 'Lab 3' },
    { id: 4, title: 'Mehmet Demir · kayıt', start: at(1, 14), end: at(1, 14, 30), category: 'appointment' },
    { id: 5, title: 'Can Şahin · staj görüşmesi', start: at(1, 14, 15), end: at(1, 15), category: 'appointment' },
    { id: 6, title: 'Bütçe teslimi', start: at(2, 0), end: at(3, 0), allDay: true, category: 'reminder' },
    { id: 7, title: 'Programlamaya Giriş', start: at(2, 9), end: at(2, 10, 50), category: 'lesson', location: 'Amfi 1' },
    { id: 8, title: 'Proje değerlendirme', start: at(3, 15), end: at(3, 16, 30), category: 'meeting', description: 'Dönem sonu proje sunumları' },
    { id: 9, title: 'Diş hekimi', start: at(3, 17, 30), end: at(3, 18, 15), category: 'personal' },
    { id: 10, title: 'Konferans', start: at(4, 0), end: at(6, 0), allDay: true, category: 'meeting', location: 'Kongre merkezi' },
    { id: 11, title: 'Zeynep Kaya · tez', start: at(4, 10), end: at(4, 11), category: 'appointment' },
    { id: 12, title: 'Spor', start: at(5, 9), end: at(5, 10, 30), category: 'personal' },
    { id: 13, title: 'Sınav gözetmenliği', start: at(-3, 10), end: at(-3, 12), category: 'lesson' },
    { id: 14, title: 'Komisyon toplantısı', start: at(8, 14), end: at(8, 15, 30), category: 'meeting' },
    { id: 15, title: 'Elif Çelik · danışmanlık', start: at(9, 10), end: at(9, 10, 30), category: 'appointment' },
    { id: 16, title: 'Kurul raporu', start: at(10, 0), end: at(11, 0), allDay: true, category: 'reminder' },
    { id: 17, title: 'Bölüm semineri', start: at(15, 16), end: at(15, 17), category: 'meeting' },
  ];
}

@Component({
  selector: 'app-agenda-doc',
  imports: [DocPage, DocExample, HuAgenda],
  template: `
    <app-doc-page slug="agenda">
      <app-doc-example
        title="Ajanda"
        description="Boş bir saate tıklayın veya sürükleyerek aralık seçin: form açılır. Kayıtları sürükleyerek taşıyın, alt kenarından çekip süresini değiştirin, tıklayarak düzenleyin. Üstteki türlere tıklayarak filtreleyin."
        [code]="basicCode"
      >
        <hu-agenda [(events)]="events" [(view)]="view" (eventCreate)="log('Eklendi', $event)" (eventUpdate)="log('Güncellendi', $event.event)" (eventDelete)="log('Silindi', $event)" />
        <ul class="log" aria-label="Son işlemler">
          @for (l of history(); track $index) {
            <li>{{ l }}</li>
          } @empty {
            <li class="hu-text-muted">Henüz işlem yok. Bir kayıt ekleyin, taşıyın veya silin.</li>
          }
        </ul>
      </app-doc-example>

      <app-doc-example
        title="Ay görünümü"
        description="Bir günde sığmayan kayıtlar '+2 daha' olarak görünür; gün numarasına tıklayınca o güne gidilir. Kayıtları başka bir güne sürükleyebilirsiniz."
        [code]="monthCode"
      >
        <hu-agenda [(events)]="events" view="month" [views]="['month', 'list']" />
      </app-doc-example>

      <app-doc-example
        title="Hafta içi ve iş saatleri"
        description="weekends: false ile cumartesi-pazar gizlenir. businessHours ile yalnızca 09:00–17:00 gösterilir; dışarıda kalan bir kayıt olursa ızgara onu kapsayacak kadar genişler. 15 dakikalık çizgiler, daha sıkı saat yüksekliği."
        [code]="workCode"
      >
        <hu-agenda
          [(events)]="events"
          view="week"
          [views]="['week', 'day']"
          [weekends]="false"
          [slotMinutes]="15"
          [hourHeight]="40"
          [businessHours]="{ start: 9, end: 17 }"
          [scrollToHour]="9"
        />
      </app-doc-example>

      <app-doc-example
        title="Salt okunur liste"
        description="editable: false ile ekleme, sürükleme ve düzenleme kapanır; tıklama (eventClick) yine çalışır."
        [code]="readonlyCode"
      >
        <hu-agenda [events]="events()" view="list" [views]="['list', 'month']" [editable]="false" (eventClick)="toast.info($event.title)" />
      </app-doc-example>

      <app-doc-example
        title="Kendi formunuz"
        description="editor: false ile yerleşik form kapanır; slotSelect ve eventClick ile kendi akışınızı kurarsınız. Bu örnekte seçilen aralığa doğrudan 'Hızlı randevu' eklenir."
        [code]="customCode"
      >
        <hu-agenda [(events)]="quick" view="day" [views]="['day', 'week']" [editor]="false" (slotSelect)="addQuick($event)" (eventClick)="toast.info($event.title + ' tıklandı')" />
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `
    .log {
      display: flex; flex-direction: column-reverse; gap: 2px;
      max-height: 7rem; margin: var(--hu-space-3) 0 0; padding: var(--hu-space-2) var(--hu-space-3);
      overflow-y: auto; font-size: var(--hu-text-xs); list-style: none;
      background: var(--hu-surface-2); border-radius: var(--hu-radius-md);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgendaDoc {
  protected readonly toast = inject(HuToastService);
  protected readonly events = signal<HuAgendaEvent[]>(sampleEvents());
  protected readonly view = signal<'month' | 'week' | 'day' | 'list'>('week');
  protected readonly history = signal<string[]>([]);
  protected readonly quick = signal<HuAgendaEvent[]>([]);

  protected log(action: string, e: HuAgendaEvent): void {
    const when = e.start.toLocaleString('tr-TR', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    this.history.update((h) => [...h.slice(-19), `${action}: ${e.title || '(başlıksız)'} · ${when}`]);
  }

  protected addQuick(slot: HuAgendaSlot): void {
    this.quick.update((list) => [...list, { id: Date.now(), title: 'Hızlı randevu', ...slot, category: 'appointment' }]);
  }

  protected readonly basicCode = `
import { HuAgenda, HuAgendaEvent } from '@ucme-ui/angular';

events = signal<HuAgendaEvent[]>([
  { id: 1, title: 'Ayşe Yılmaz · danışmanlık', start: new Date(2026, 9, 5, 9, 30), end: new Date(2026, 9, 5, 10, 15),
    category: 'appointment', location: 'Oda 204' },
  { id: 2, title: 'Bütçe teslimi', start: new Date(2026, 9, 7), end: new Date(2026, 9, 8), allDay: true, category: 'reminder' },
]);

// [(events)] listeyi kendisi günceller; sunucuya kaydetmek için olayları dinleyin
<hu-agenda
  [(events)]="events"
  view="week"
  (eventCreate)="api.create($event)"
  (eventUpdate)="api.update($event.event)"
  (eventDelete)="api.delete($event.id)"
/>`;

  protected readonly monthCode = `
<hu-agenda [(events)]="events" view="month" [views]="['month', 'list']" [maxPerDay]="3" />`;

  protected readonly workCode = `
<hu-agenda
  [(events)]="events"
  view="week"
  [weekends]="false"
  [slotMinutes]="15"
  [hourHeight]="40"
  [businessHours]="{ start: 9, end: 17 }"
  [scrollToHour]="9"
/>

<!-- Tüm gün (24 saat) için: [businessHours]="null" -->

<!-- Kendi türleriniz -->
categories: HuAgendaCategory[] = [
  { key: 'exam', label: 'Sınav', color: 'danger' },
  { key: 'office', label: 'Ofis saati', color: 'success' },
];
<hu-agenda [categories]="categories" … />`;

  protected readonly readonlyCode = `
<hu-agenda [events]="events()" view="list" [editable]="false" (eventClick)="open($event)" />`;

  protected readonly customCode = `
addQuick(slot: HuAgendaSlot) {
  this.events.update((list) => [...list, { id: Date.now(), title: 'Hızlı randevu', ...slot }]);
}

<hu-agenda [(events)]="events" [editor]="false"
           (slotSelect)="addQuick($event)" (eventClick)="openMyDialog($event)" />

<!-- Görünen aralığa göre sunucudan getirmek için: (rangeChange)="load($event.start, $event.end)" -->`;
}
