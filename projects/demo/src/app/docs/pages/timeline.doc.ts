import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { HU_CARD_IMPORTS, HU_TIMELINE_IMPORTS, HuAvatar, HuBadge, HuButton, HuTimelineEvent } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

interface Activity {
  user: string;
  action: string;
  time: string;
  tag?: string;
}

@Component({
  selector: 'app-timeline-doc',
  imports: [DocPage, DocExample, HU_TIMELINE_IMPORTS, HU_CARD_IMPORTS, HuAvatar, HuBadge, HuButton],
  template: `
    <app-doc-page slug="timeline">
      <app-doc-example
        title="Süreç adımları"
        description="status ile tamamlanan (done), şu anki (current) ve bekleyen (todo) adımlar ayrışır; tarih sol tarafta gösterilir."
        [code]="basicCode"
      >
        <hu-timeline [events]="steps()" />
        <div class="row">
          <button hu-button size="sm" variant="outline" (click)="advance()" [disabled]="done()">Sonraki adım</button>
          <button hu-button size="sm" variant="ghost" (click)="reset()">Başa al</button>
        </div>
      </app-doc-example>

      <app-doc-example title="Dönüşümlü ve ikonlu" description="align=&quot;alternate&quot; olaylar sırayla iki yana dizilir; dar ekranda tek sütuna iner." [code]="alternateCode">
        <hu-timeline [events]="history" align="alternate" />
      </app-doc-example>

      <app-doc-example title="Yatay" description="Sipariş / başvuru durumu gibi kısa süreçler için." [code]="horizontalCode">
        <hu-timeline [events]="order" layout="horizontal" />
      </app-doc-example>

      <app-doc-example
        title="Özel içerik ve işaret"
        description="huTimelineContent ve huTimelineMarker şablonlarıyla kendi veri tipinizi kullanabilirsiniz."
        [code]="templateCode"
      >
        <hu-timeline [events]="activity" [opposite]="false">
          <ng-template huTimelineMarker [huTimelineMarkerOf]="activity" let-a>
            <hu-avatar [name]="a.user" size="sm" />
          </ng-template>
          <ng-template huTimelineContent [huTimelineContentOf]="activity" let-a>
            <hu-card padding="sm" class="activity">
              <div class="activity__head">
                <strong>{{ a.user }}</strong>
                <span class="hu-text-muted">{{ a.time }}</span>
              </div>
              <span>{{ a.action }}</span>
              @if (a.tag) {
                <hu-badge variant="info">{{ a.tag }}</hu-badge>
              }
            </hu-card>
          </ng-template>
        </hu-timeline>
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `
    .activity { margin-bottom: var(--hu-space-2); }
    .activity .hu-card__body { display: flex; flex-direction: column; align-items: flex-start; gap: var(--hu-space-1); font-size: var(--hu-text-sm); }
    .activity__head { display: flex; gap: var(--hu-space-2); align-items: baseline; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineDoc {
  private readonly titles = ['Başvuru alındı', 'Belgeler incelendi', 'Mülakat', 'Sonuç bildirildi'];
  private readonly dates = ['3 Eyl, 09:12', '5 Eyl, 14:30', '12 Eyl, 10:00', '15 Eyl, 16:00'];
  protected readonly current = signal(2);
  protected readonly done = computed(() => this.current() >= this.titles.length);
  protected readonly steps = computed(() =>
    this.titles.map<HuTimelineEvent>((title, i) => ({
      title,
      date: i < this.current() ? this.dates[i] : undefined,
      status: i < this.current() ? 'done' : i === this.current() ? 'current' : 'todo',
      color: i < this.current() ? 'success' : undefined,
      description: i === this.current() ? 'Bu adım devam ediyor.' : undefined,
    })),
  );

  protected advance(): void {
    this.current.update((c) => c + 1);
  }

  protected reset(): void {
    this.current.set(0);
  }

  protected readonly history: HuTimelineEvent[] = [
    { title: 'Proje başlatıldı', date: 'Ocak 2024', icon: 'zap', description: 'Kapsam ve ekip belirlendi.' },
    { title: 'İlk sürüm', date: 'Mart 2024', icon: 'star', color: 'success', description: 'Temel modüller kullanıma açıldı.' },
    { title: 'Güvenlik denetimi', date: 'Haziran 2024', icon: 'lock', color: 'warning', description: 'Bulgular giderildi.' },
    { title: 'Mobil uygulama', date: 'Ekim 2024', icon: 'monitor', color: 'info', description: 'iOS ve Android sürümleri yayında.' },
  ];

  protected readonly order: HuTimelineEvent[] = [
    { title: 'Sipariş', date: '1 Eki', status: 'done', color: 'success' },
    { title: 'Hazırlanıyor', date: '2 Eki', status: 'done', color: 'success' },
    { title: 'Kargoda', date: '3 Eki', status: 'current' },
    { title: 'Teslim', status: 'todo' },
  ];

  protected readonly activity: Activity[] = [
    { user: 'Ayşe Yılmaz', action: 'BİL 203 ödevini yükledi.', time: '10 dk önce', tag: 'Ödev' },
    { user: 'Mehmet Demir', action: 'Duyuruya yorum yaptı.', time: '1 saat önce' },
    { user: 'Zeynep Kaya', action: 'Sınav notlarını yayınladı.', time: 'Dün', tag: 'Not' },
  ];

  protected readonly basicCode = `
steps: HuTimelineEvent[] = [
  { title: 'Başvuru alındı', date: '3 Eyl, 09:12', status: 'done', color: 'success' },
  { title: 'Belgeler incelendi', date: '5 Eyl, 14:30', status: 'done', color: 'success' },
  { title: 'Mülakat', date: '12 Eyl, 10:00', status: 'current', description: 'Bu adım devam ediyor.' },
  { title: 'Sonuç bildirildi', status: 'todo' },
];

<hu-timeline [events]="steps" />`;

  protected readonly alternateCode = `
history: HuTimelineEvent[] = [
  { title: 'Proje başlatıldı', date: 'Ocak 2024', icon: 'zap', description: 'Kapsam ve ekip belirlendi.' },
  { title: 'İlk sürüm', date: 'Mart 2024', icon: 'star', color: 'success' },
  { title: 'Güvenlik denetimi', date: 'Haziran 2024', icon: 'lock', color: 'warning' },
];

<hu-timeline [events]="history" align="alternate" />`;

  protected readonly horizontalCode = `
order: HuTimelineEvent[] = [
  { title: 'Sipariş', date: '1 Eki', status: 'done', color: 'success' },
  { title: 'Hazırlanıyor', date: '2 Eki', status: 'done', color: 'success' },
  { title: 'Kargoda', date: '3 Eki', status: 'current' },
  { title: 'Teslim', status: 'todo' },
];

<hu-timeline [events]="order" layout="horizontal" />`;

  protected readonly templateCode = `
activity = [
  { user: 'Ayşe Yılmaz', action: 'BİL 203 ödevini yükledi.', time: '10 dk önce' },
  { user: 'Mehmet Demir', action: 'Duyuruya yorum yaptı.', time: '1 saat önce' },
];

<hu-timeline [events]="activity" [opposite]="false">
  <ng-template huTimelineMarker [huTimelineMarkerOf]="activity" let-a>
    <hu-avatar [name]="a.user" size="sm" />
  </ng-template>
  <ng-template huTimelineContent [huTimelineContentOf]="activity" let-a>
    <strong>{{ a.user }}</strong> {{ a.action }}
    <small>{{ a.time }}</small>
  </ng-template>
</hu-timeline>`;
}
