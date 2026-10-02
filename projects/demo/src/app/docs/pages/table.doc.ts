import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HU_TABLE_IMPORTS, HuBadge, HuButton, HuColumn, HuIcon, HuSort, HuToastService } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

interface Course {
  code: string;
  name: string;
  credit: number;
  quota: number;
  open: boolean;
}

@Component({
  selector: 'app-table-doc',
  imports: [DocPage, DocExample, HU_TABLE_IMPORTS, HuBadge, HuButton, HuIcon],
  template: `
    <app-doc-page slug="table">
      <app-doc-example title="Sıralama" description="Başlıklara tıklayın: artan → azalan → sırasız." [code]="basicCode">
        <div class="box"><hu-table [data]="courses" [columns]="columns" [(sort)]="sort" /></div>
        <p class="demo-label">sort: {{ sort().key || '—' }} {{ sort().direction }}</p>
      </app-doc-example>

      <app-doc-example title="Özel hücreler" description="ng-template huCell ile; [huCellOf] satır tipini sağlar." [code]="cellCode">
        <div class="box">
          <hu-table [data]="courses" [columns]="columnsWithStatus" striped>
            <ng-template huCell="open" [huCellOf]="courses" let-c>
              <hu-badge [variant]="c.open ? 'success' : 'neutral'" dot>{{ c.open ? 'Açık' : 'Kapalı' }}</hu-badge>
            </ng-template>
            <ng-template huCell="quota" [huCellOf]="courses" let-c>
              <strong>{{ c.quota }}</strong> <span class="hu-text-muted">kişi</span>
            </ng-template>
          </hu-table>
        </div>
      </app-doc-example>

      <app-doc-example title="Yükleniyor ve boş durum" [code]="statesCode">
        <div class="row actions">
          <button hu-button size="sm" variant="outline" (click)="reload()"><hu-icon name="chevrons-up-down" [size]="14" /> Yeniden yükle</button>
          <button hu-button size="sm" variant="outline" (click)="empty.set(!empty())">{{ empty() ? 'Veriyi geri getir' : 'Boşalt' }}</button>
        </div>
        <div class="box">
          <hu-table [data]="empty() ? [] : courses" [columns]="columns" [loading]="loading()">
            <div huTableEmpty>
              <p><strong>Ders bulunamadı</strong></p>
              <p class="hu-text-muted">Filtreleri değiştirmeyi deneyin.</p>
            </div>
          </hu-table>
        </div>
      </app-doc-example>

      <app-doc-example title="Tıklanabilir satırlar" [code]="clickCode">
        <div class="box">
          <hu-table [data]="courses" [columns]="columns" clickableRows dense (rowClick)="toast.info($event.name + ' seçildi')" />
        </div>
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `
    .box { overflow: hidden; border: 1px solid var(--hu-border); border-radius: var(--hu-radius-md); }
    .demo-label { margin-top: var(--hu-space-3); }
    .actions { margin-bottom: var(--hu-space-3); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableDoc {
  protected readonly toast = inject(HuToastService);
  protected readonly courses: Course[] = [
    { code: 'BİL 101', name: 'Programlamaya Giriş I', credit: 4, quota: 120, open: true },
    { code: 'BİL 203', name: 'Veri Yapıları', credit: 3, quota: 90, open: true },
    { code: 'MAT 123', name: 'Analiz I', credit: 4, quota: 150, open: false },
    { code: 'İST 292', name: 'Olasılık ve İstatistik', credit: 3, quota: 80, open: true },
  ];
  protected readonly columns: HuColumn<Course>[] = [
    { key: 'code', header: 'Kod', sortable: true, width: '110px' },
    { key: 'name', header: 'Ders adı', sortable: true },
    { key: 'credit', header: 'Kredi', sortable: true, align: 'end' },
  ];
  protected readonly columnsWithStatus: HuColumn<Course>[] = [
    ...this.columns,
    { key: 'quota', header: 'Kontenjan', align: 'end' },
    { key: 'open', header: 'Durum' },
  ];
  protected readonly sort = signal<HuSort>({ key: '', direction: '' });
  protected readonly loading = signal(false);
  protected readonly empty = signal(false);

  protected reload(): void {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 1200);
  }

  protected readonly basicCode = `
columns: HuColumn<Course>[] = [
  { key: 'code', header: 'Kod', sortable: true, width: '110px' },
  { key: 'name', header: 'Ders adı', sortable: true },
  { key: 'credit', header: 'Kredi', sortable: true, align: 'end' },
];

<hu-table [data]="courses" [columns]="columns" [(sort)]="sort" />`;

  protected readonly cellCode = `
<hu-table [data]="courses" [columns]="columns" striped>
  <ng-template huCell="open" [huCellOf]="courses" let-c>
    <hu-badge [variant]="c.open ? 'success' : 'neutral'" dot>{{ c.open ? 'Açık' : 'Kapalı' }}</hu-badge>
  </ng-template>
</hu-table>`;

  protected readonly statesCode = `
<hu-table [data]="rows()" [columns]="columns" [loading]="loading()">
  <div huTableEmpty>Ders bulunamadı</div>
</hu-table>`;

  protected readonly clickCode = `<hu-table [data]="courses" [columns]="columns" clickableRows (rowClick)="open($event)" />`;
}
