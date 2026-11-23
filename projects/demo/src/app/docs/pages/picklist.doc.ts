import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { HU_PICKLIST_IMPORTS, HuBadge, HuPickListMoveEvent } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

interface Course {
  code: string;
  name: string;
  credit: number;
}

const COURSES: Course[] = [
  { code: 'BİL 101', name: 'Programlamaya Giriş', credit: 4 },
  { code: 'BİL 203', name: 'Veri Yapıları', credit: 4 },
  { code: 'BİL 205', name: 'Ayrık Matematik', credit: 3 },
  { code: 'BİL 301', name: 'Algoritmalar', credit: 4 },
  { code: 'BİL 305', name: 'İşletim Sistemleri', credit: 3 },
  { code: 'BİL 311', name: 'Veritabanı Sistemleri', credit: 3 },
  { code: 'MAT 123', name: 'Analiz I', credit: 5 },
  { code: 'FİZ 137', name: 'Fizik I', credit: 4 },
  { code: 'İST 291', name: 'Olasılık ve İstatistik', credit: 3 },
];

@Component({
  selector: 'app-picklist-doc',
  imports: [DocPage, DocExample, HU_PICKLIST_IMPORTS, HuBadge],
  template: `
    <app-doc-page slug="picklist">
      <app-doc-example
        title="Temel"
        description="Tıklayarak seçin (Ctrl ile ekle, Shift ile aralık), düğmelerle taşıyın; çift tıklama tek öğeyi hemen taşır. Klavye: ↑/↓, Boşluk seç, Enter taşı, Ctrl+A tümünü seç."
        [code]="basicCode"
      >
        <hu-picklist [(source)]="cities" [(target)]="chosen" sourceHeader="Şehirler" targetHeader="Tercihlerim" listHeight="13rem" />
        <p class="demo-label">Tercihler: {{ chosen().join(', ') || '—' }}</p>
      </app-doc-example>

      <app-doc-example
        title="Ders seçimi: arama, sıralama ve şablon"
        description="optionLabel/dataKey ile nesne listeleri; filter liste başına arama, reorder hedef listede sıralama düğmeleri ekler."
        [code]="courseCode"
      >
        <hu-picklist
          [(source)]="available"
          [(target)]="selected"
          optionLabel="name"
          dataKey="code"
          sourceHeader="Açılan dersler"
          targetHeader="Seçilen dersler"
          filter
          reorder
          (moved)="onMoved($event)"
        >
          <ng-template huPickListItem [huPickListItemOf]="available()" let-c>
            <div class="course">
              <span class="course__code">{{ c.code }}</span>
              <span class="course__name">{{ c.name }}</span>
              <hu-badge variant="neutral">{{ c.credit }} AKTS</hu-badge>
            </div>
          </ng-template>
        </hu-picklist>
        <p class="demo-label">
          Toplam {{ credits() }} AKTS
          @if (credits() > 20) {
            · <strong class="over">Dönem sınırı (20) aşıldı</strong>
          }
          @if (lastMove()) {
            · {{ lastMove() }}
          }
        </p>
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `
    .course { display: flex; align-items: center; gap: var(--hu-space-2); min-width: 0; }
    .course__code { flex-shrink: 0; width: 4.5rem; font-variant-numeric: tabular-nums; color: var(--hu-text-muted); }
    .course__name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .hu-picklist__item--selected .course__code { color: inherit; }
    .over { color: var(--hu-danger); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PickListDoc {
  protected readonly cities = signal(['Ankara', 'İstanbul', 'İzmir', 'Bursa', 'Antalya', 'Eskişehir', 'Konya', 'Trabzon']);
  protected readonly chosen = signal<string[]>([]);

  protected readonly available = signal(COURSES.slice(2));
  protected readonly selected = signal(COURSES.slice(0, 2));
  protected readonly credits = computed(() => this.selected().reduce((t, c) => t + c.credit, 0));
  protected readonly lastMove = signal('');

  protected onMoved(e: HuPickListMoveEvent<Course>): void {
    this.lastMove.set(`${e.items.length} ders ${e.to === 'target' ? 'eklendi' : 'çıkarıldı'}`);
  }

  protected readonly basicCode = `
cities = signal(['Ankara', 'İstanbul', 'İzmir', 'Bursa', 'Antalya']);
chosen = signal<string[]>([]);

<hu-picklist [(source)]="cities" [(target)]="chosen" sourceHeader="Şehirler" targetHeader="Tercihlerim" />`;

  protected readonly courseCode = `
available = signal<Course[]>([
  { code: 'BİL 205', name: 'Ayrık Matematik', credit: 3 },
  { code: 'BİL 301', name: 'Algoritmalar', credit: 4 },
  { code: 'MAT 123', name: 'Analiz I', credit: 5 },
]);
selected = signal<Course[]>([{ code: 'BİL 101', name: 'Programlamaya Giriş', credit: 4 }]);
credits = computed(() => this.selected().reduce((t, c) => t + c.credit, 0));

<hu-picklist [(source)]="available" [(target)]="selected" optionLabel="name" dataKey="code"
             sourceHeader="Açılan dersler" targetHeader="Seçilen dersler" filter reorder>
  <ng-template huPickListItem [huPickListItemOf]="available()" let-c>
    <span>{{ c.code }}</span> {{ c.name }}
    <hu-badge variant="neutral">{{ c.credit }} AKTS</hu-badge>
  </ng-template>
</hu-picklist>
<p>Toplam {{ credits() }} AKTS</p>`;
}
