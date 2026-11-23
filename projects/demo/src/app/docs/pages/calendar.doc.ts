import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HuCalendar, HuCalendarMarker, HuDateRange, addDays, formatRange, startOfDay } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

@Component({
  selector: 'app-calendar-doc',
  imports: [DatePipe, DocPage, DocExample, HuCalendar],
  template: `
    <app-doc-page slug="calendar">
      <div class="grid grid--2">
        <app-doc-example title="Tek gün" [code]="basicCode">
          <hu-calendar [(value)]="day" />
          <p class="demo-label">Seçili: {{ day() ? (day() | date: 'fullDate') : '—' }}</p>
        </app-doc-example>

        <app-doc-example title="Aralık" description="İlk tıklama başlangıç, ikincisi bitiş." [code]="rangeCode">
          <hu-calendar mode="range" [(range)]="range" />
          <p class="demo-label">Aralık: {{ rangeText() }}</p>
        </app-doc-example>

        <app-doc-example title="Etkinlik işaretleri" description="Noktaların üzerine gelince etkinlik adı görünür." [code]="markersCode">
          <hu-calendar [markers]="markers" />
        </app-doc-example>

        <app-doc-example title="Kısıtlar" description="Bugünden önce ve hafta sonları seçilemez." [code]="limitsCode">
          <hu-calendar [min]="today" [dateFilter]="weekdays" />
        </app-doc-example>
      </div>
    </app-doc-page>
  `,
  styles: `app-doc-example .demo-label { margin-top: var(--hu-space-3); }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarDoc {
  protected readonly today = startOfDay(new Date());
  protected readonly day = signal<Date | null>(null);
  protected readonly range = signal<HuDateRange | null>(null);
  protected readonly weekdays = (d: Date) => d.getDay() !== 0 && d.getDay() !== 6;
  protected readonly markers: HuCalendarMarker[] = [
    { date: addDays(this.today, 2), label: 'Ara sınav', variant: 'warning' },
    { date: addDays(this.today, 2), label: 'Kulüp toplantısı', variant: 'success' },
    { date: addDays(this.today, 8), label: 'Burs son gün', variant: 'primary' },
    { date: addDays(this.today, 14), label: 'Resmî tatil', variant: 'danger' },
  ];

  protected rangeText(): string {
    return formatRange(this.range()) || '—';
  }

  protected readonly basicCode = `<hu-calendar [(value)]="day" />`;
  protected readonly rangeCode = `<hu-calendar mode="range" [(range)]="range" />`;
  protected readonly markersCode = `
markers: HuCalendarMarker[] = [
  { date: new Date(2026, 10, 16), label: 'Ara sınav', variant: 'warning' },
  { date: new Date(2026, 9, 29), label: 'Resmî tatil', variant: 'danger' },
];

<hu-calendar [markers]="markers" (monthChange)="loadEvents($event)" />`;
  protected readonly limitsCode = `
weekdays = (d: Date) => d.getDay() !== 0 && d.getDay() !== 6;

<hu-calendar [min]="today" [dateFilter]="weekdays" />`;
}
