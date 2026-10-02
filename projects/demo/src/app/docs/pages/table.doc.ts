import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  HU_DROPDOWN_IMPORTS,
  HU_TABLE_IMPORTS,
  HuAvatar,
  HuBadge,
  HuButton,
  HuButtonGroup,
  HuCheckbox,
  HuColumn,
  HuDropdownEntry,
  HuDropdownOption,
  HuIcon,
  HuSort,
  HuTableContextEvent,
  HuTableSize,
  HuTableVariant,
  HuToastService,
  formatFileSize,
} from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

interface Course {
  code: string;
  name: string;
  credit: number;
  quota: number;
  open: boolean;
}

type Status = 'active' | 'leave' | 'passive';

interface Person {
  id: number;
  name: string;
  email: string;
  department: string;
  title: string;
  status: Status;
  start: Date;
  projects: number;
}

interface FileItem {
  id: number;
  name: string;
  kind: 'folder' | 'doc' | 'image';
  size: number;
  modified: Date;
  starred: boolean;
}

interface Order {
  id: string;
  customer: string;
  date: Date;
  total: number;
  items: { name: string; qty: number; price: number }[];
}

const FIRST = ['Ayşe', 'Mehmet', 'Zeynep', 'Can', 'Elif', 'Burak', 'Selin', 'Emre', 'Deniz', 'Oğuz', 'İpek', 'Kaan', 'Gizem', 'Umut'];
const LAST = ['Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Aydın', 'Öztürk', 'Arslan', 'Doğan', 'Kılıç', 'Koç', 'Kurt'];
const DEPTS = ['Bilgi İşlem', 'İnsan Kaynakları', 'Öğrenci İşleri', 'Muhasebe', 'Kütüphane'];
const TITLES = ['Uzman', 'Kıdemli Uzman', 'Şef', 'Müdür', 'Asistan'];
const STATUSES: Status[] = ['active', 'active', 'active', 'leave', 'passive'];
const tr = (s: string) => s.toLocaleLowerCase('tr-TR').replace(/[çğıöşü]/g, (c) => ({ ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' })[c]!);

const PEOPLE: Person[] = Array.from({ length: 42 }, (_, i) => {
  const first = FIRST[(i * 3) % FIRST.length];
  const last = LAST[(i * 5 + 3) % LAST.length];
  return {
    id: i + 1,
    name: `${first} ${last}`,
    email: `${tr(first)}.${tr(last)}${i}@example.com`,
    department: DEPTS[(i * 3) % DEPTS.length],
    title: TITLES[(i * 2 + 1) % TITLES.length],
    status: STATUSES[(i * 3 + 1) % STATUSES.length],
    start: new Date(2015 + (i % 10), (i * 5) % 12, 1 + ((i * 11) % 27)),
    projects: (i * 7) % 13,
  };
});

@Component({
  selector: 'app-table-doc',
  imports: [DocPage, DocExample, HU_TABLE_IMPORTS, HU_DROPDOWN_IMPORTS, HuAvatar, HuBadge, HuButton, HuButtonGroup, HuCheckbox, HuIcon],
  template: `
    <app-doc-page slug="table">
      <app-doc-example
        title="Gelişmiş tablo"
        description="Arama (Türkçe karakterleri yok sayar), sütun seçici (göster/gizle, sırala), CSV dışa aktarma, çoklu seçim ve toplu işlem, sayfalama, sağda sabit işlem sütunu. Sütun tercihleri stateKey ile tarayıcıda saklanır."
        [code]="fullCode"
      >
        <hu-table
          variant="card"
          title="Personel"
          [data]="people()"
          [columns]="peopleColumns"
          [trackBy]="byId"
          searchable
          columnToggle
          exportable
          exportFileName="personel"
          paginator
          [pageSizeOptions]="[5, 10, 25]"
          [pageSize]="5"
          selectionMode="multiple"
          [(selection)]="selected"
          stateKey="docs-personel"
        >
          <button huTableToolbar hu-button size="sm" (click)="toast.info('Yeni personel formu açılır.')">
            <hu-icon name="plus" [size]="14" /> Yeni
          </button>
          <button huTableBulkActions hu-button size="sm" variant="outline" (click)="toast.info(selected().length + ' kişiye e-posta')">
            <hu-icon name="mail" [size]="14" /> E-posta gönder
          </button>
          <button huTableBulkActions hu-button size="sm" color="danger" (click)="removeSelected()">
            <hu-icon name="trash" [size]="14" /> Sil
          </button>

          <ng-template huCell="name" [huCellOf]="people()" let-p>
            <span class="person">
              <hu-avatar [name]="p.name" size="sm" />
              <span>
                <span class="person__name">{{ p.name }}</span>
                <span class="person__mail">{{ p.email }}</span>
              </span>
            </span>
          </ng-template>
          <ng-template huCell="status" [huCellOf]="people()" let-p>
            <hu-badge [variant]="statusVariant[p.status]" dot>{{ statusLabel[p.status] }}</hu-badge>
          </ng-template>
          <ng-template huCell="actions" [huCellOf]="people()" let-p>
            <hu-dropdown icon="more-vertical" variant="ghost" size="sm" align="end" ariaLabel="İşlemler" [options]="rowActions" (selected)="onAction($event, p)" />
          </ng-template>
        </hu-table>
      </app-doc-example>

      <app-doc-example
        title="Sağ tık menüsü"
        description="contextMenu verilince satıra sağ tıklayınca menü açılır (klavyede menü tuşu veya Shift+F10, dokunmatikte uzun basma). Menü satıra göre değişebilir; seçili satırlardan birine sağ tıklarsanız işlem tüm seçime uygulanır. Vermezseniz tarayıcının menüsü çıkar."
        [code]="contextCode"
      >
        <hu-table
          variant="card"
          title="Dosyalar"
          size="sm"
          [data]="files()"
          [columns]="fileColumns"
          [trackBy]="byFileId"
          selectionMode="multiple"
          [(selection)]="selectedFiles"
          [contextMenu]="fileMenu"
          (contextMenuSelect)="onFileAction($event)"
        >
          <ng-template huCell="name" [huCellOf]="files()" let-f>
            <span class="file">
              <hu-icon [name]="f.kind === 'folder' ? 'folder' : f.kind === 'image' ? 'file-image' : 'file-text'" [size]="16" />
              {{ f.name }}
              @if (f.starred) {
                <span class="file__star" aria-label="Yıldızlı">★</span>
              }
            </span>
          </ng-template>
        </hu-table>
        <p class="demo-label">Son işlem: {{ lastAction() }}</p>
      </app-doc-example>

      <app-doc-example
        title="Görünümler"
        description="variant: default, bordered, card, minimal · size: sm, md, lg · striped. Aynı veri, farklı tasarımlar."
        [code]="variantsCode"
      >
        <div class="controls">
          <hu-button-group aria-label="Görünüm">
            @for (v of variants; track v) {
              <button hu-button variant="outline" size="sm" [attr.aria-pressed]="variant() === v" (click)="variant.set(v)">{{ v }}</button>
            }
          </hu-button-group>
          <hu-button-group aria-label="Boyut">
            @for (s of sizes; track s) {
              <button hu-button variant="outline" size="sm" [attr.aria-pressed]="size() === s" (click)="size.set(s)">{{ s }}</button>
            }
          </hu-button-group>
          <hu-checkbox [checked]="striped()" (checkedChange)="striped.set($event)">Çizgili</hu-checkbox>
        </div>
        <hu-table
          [variant]="variant()"
          [size]="size()"
          [striped]="striped()"
          [title]="variant() === 'card' ? 'Dersler' : undefined"
          [data]="courses"
          [columns]="columnsWithStatus"
          [(sort)]="sort"
        >
          <ng-template huCell="open" [huCellOf]="courses" let-c>
            <hu-badge [variant]="c.open ? 'success' : 'neutral'" dot>{{ c.open ? 'Açık' : 'Kapalı' }}</hu-badge>
          </ng-template>
        </hu-table>
      </app-doc-example>

      <app-doc-example
        title="Açılır satır detayı"
        description="ng-template huRowDetail verilince her satırın başında ok çıkar; detayda iç içe tablo veya form olabilir."
        [code]="detailCode"
      >
        <hu-table variant="bordered" [data]="orders" [columns]="orderColumns" [trackBy]="byOrderId">
          <ng-template huRowDetail [huRowDetailOf]="orders" let-o>
            <hu-table variant="minimal" size="sm" [data]="o.items" [columns]="itemColumns" [hoverable]="false" />
          </ng-template>
        </hu-table>
      </app-doc-example>

      <app-doc-example
        title="Alt toplam ve sabit sütunlar"
        description="footer ile toplam satırı (aramadan sonra hesaplanır). nowrap ile hücreler kırılmaz, tablo yatay kayar; sticky: 'start' ad sütununu, 'end' işlem sütununu kaydırırken sabit tutar. Tabloyu sağa kaydırıp deneyin."
        [code]="stickyCode"
      >
        <div class="narrow-scroll">
          <hu-table [data]="courses" [columns]="wideColumns" striped nowrap>
            <ng-template huCell="open" [huCellOf]="courses" let-c>
              <hu-badge [variant]="c.open ? 'success' : 'neutral'" dot>{{ c.open ? 'Açık' : 'Kapalı' }}</hu-badge>
            </ng-template>
            <ng-template huCell="edit" [huCellOf]="courses" let-c>
              <button hu-button size="xs" variant="ghost" (click)="toast.info(c.code + ' düzenle')">Düzenle</button>
            </ng-template>
          </hu-table>
        </div>
      </app-doc-example>

      <app-doc-example
        title="Mobilde kart görünümü"
        description="responsive=&quot;stack&quot;: tablo 640px'ten darsa her satır etiketli bir karta dönüşür. Kırılım ekranın değil tablonun genişliğine göredir; burada dar bir kutuda gösteriliyor."
        [code]="stackCode"
      >
        <div class="phone">
          <hu-table responsive="stack" [data]="people().slice(0, 3)" [columns]="stackColumns" selectionMode="multiple">
            <ng-template huCell="status" [huCellOf]="people()" let-p>
              <hu-badge [variant]="statusVariant[p.status]" dot>{{ statusLabel[p.status] }}</hu-badge>
            </ng-template>
          </hu-table>
        </div>
      </app-doc-example>

      <app-doc-example
        title="Sunucu tarafı (lazy)"
        description="lazy: arama, sıralama ve sayfalama tabloda yapılmaz; modeller değişir, veriyi siz getirirsiniz. Bu örnek 600 ms gecikmeli bir sunucuyu taklit eder."
        [code]="lazyCode"
      >
        <hu-table
          variant="card"
          lazy
          searchable
          paginator
          [data]="serverRows()"
          [totalRecords]="serverTotal()"
          [loading]="serverLoading()"
          [columns]="serverColumns"
          [sort]="serverSort()"
          (sortChange)="serverSort.set($event); load()"
          [search]="serverSearch()"
          (searchChange)="serverSearch.set($event); serverPage.set(0); load()"
          [pageIndex]="serverPage()"
          (pageIndexChange)="serverPage.set($event); load()"
          [pageSize]="serverSize()"
          (pageSizeChange)="serverSize.set($event); serverPage.set(0); load()"
        />
      </app-doc-example>

      <app-doc-example
        title="Tekli seçim ve tıklanabilir satır"
        description="selectionMode=&quot;single&quot;: satıra tıklayınca seçilir. clickableRows ile (rowClick) olayı gelir; satırdaki buton ve linkler satır tıklaması sayılmaz."
        [code]="singleCode"
      >
        <hu-table [data]="courses" [columns]="columns" selectionMode="single" [(selection)]="single" clickableRows size="sm" />
        <p class="demo-label">Seçilen: {{ single()[0]?.name ?? '—' }}</p>
      </app-doc-example>

      <app-doc-example title="Yükleniyor ve boş durum" [code]="statesCode">
        <div class="row actions">
          <button hu-button size="sm" variant="outline" (click)="reload()"><hu-icon name="rotate-cw" [size]="14" /> Yeniden yükle</button>
          <button hu-button size="sm" variant="outline" (click)="empty.set(!empty())">{{ empty() ? 'Veriyi geri getir' : 'Boşalt' }}</button>
        </div>
        <hu-table variant="bordered" [data]="empty() ? [] : courses" [columns]="columns" [loading]="loading()">
          <div huTableEmpty>
            <p><strong>Ders bulunamadı</strong></p>
            <p class="hu-text-muted">Filtreleri değiştirmeyi deneyin.</p>
          </div>
        </hu-table>
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `
    .controls { display: flex; flex-wrap: wrap; align-items: center; gap: var(--hu-space-3); margin-bottom: var(--hu-space-4); }
    .demo-label { margin-top: var(--hu-space-3); }
    .actions { margin-bottom: var(--hu-space-3); }
    .person { display: inline-flex; align-items: center; gap: var(--hu-space-3); }
    .person > span:last-child { display: flex; flex-direction: column; min-width: 0; }
    .person__name { font-weight: 500; }
    .person__mail { font-size: var(--hu-text-xs); color: var(--hu-text-subtle); }
    .file { display: inline-flex; align-items: center; gap: var(--hu-space-2); }
    .file hu-icon { color: var(--hu-text-subtle); }
    .file__star { color: #f59e0b; }
    .narrow-scroll { max-width: 34rem; }
    .phone {
      width: 22rem; max-width: 100%; padding: var(--hu-space-3);
      background: var(--hu-surface-2); border: 1px solid var(--hu-border); border-radius: var(--hu-radius-xl);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableDoc {
  protected readonly toast = inject(HuToastService);

  // --- Gelişmiş tablo -------------------------------------------------------------------
  protected readonly people = signal<Person[]>(PEOPLE);
  protected readonly selected = signal<Person[]>([]);
  protected readonly byId = (p: Person) => p.id;
  protected readonly statusLabel: Record<Status, string> = { active: 'Aktif', leave: 'İzinde', passive: 'Pasif' };
  protected readonly statusVariant: Record<Status, 'success' | 'warning' | 'neutral'> = {
    active: 'success',
    leave: 'warning',
    passive: 'neutral',
  };
  protected readonly peopleColumns: HuColumn<Person>[] = [
    { key: 'name', header: 'Ad Soyad', sortable: true, hideable: false },
    // Gizli sütunlar da aranır: e-postayla arama yapılabilir, istenirse sütun olarak açılır
    { key: 'email', header: 'E-posta', hidden: true },
    { key: 'department', header: 'Birim', sortable: true },
    { key: 'title', header: 'Unvan', sortable: true, hideOnMobile: true },
    { key: 'status', header: 'Durum', sortable: true, value: (p) => this.statusLabel[p.status] },
    { key: 'start', header: 'Başlangıç', sortable: true, hidden: true, value: (p) => p.start.toLocaleDateString('tr-TR') },
    { key: 'projects', header: 'Proje', sortable: true, align: 'end', hidden: true },
    { key: 'actions', header: '', width: '56px', align: 'end', sticky: 'end', hideable: false, exportable: false, searchable: false },
  ];
  protected readonly rowActions: HuDropdownEntry[] = [
    { label: 'Görüntüle', value: 'view', icon: 'eye' },
    { label: 'Düzenle', value: 'edit', icon: 'edit' },
    { divider: true },
    { label: 'Sil', value: 'delete', icon: 'trash', danger: true },
  ];

  protected onAction(action: HuDropdownOption, person: Person): void {
    if (action.value === 'delete') {
      this.people.update((list) => list.filter((p) => p.id !== person.id));
      this.toast.success(`${person.name} silindi.`);
    } else {
      this.toast.info(`${person.name}: ${action.label}`);
    }
  }

  protected removeSelected(): void {
    const ids = new Set(this.selected().map((p) => p.id));
    this.people.update((list) => list.filter((p) => !ids.has(p.id)));
    this.toast.success(`${ids.size} kişi silindi.`);
    this.selected.set([]);
  }

  // --- Sağ tık menüsü ------------------------------------------------------------------------
  protected readonly files = signal<FileItem[]>([
    { id: 1, name: 'Ders programı 2026', kind: 'folder', size: 0, modified: new Date(2026, 8, 28), starred: true },
    { id: 2, name: 'Kayıt kılavuzu.pdf', kind: 'doc', size: 2_480_000, modified: new Date(2026, 8, 20), starred: false },
    { id: 3, name: 'Kampüs haritası.png', kind: 'image', size: 845_000, modified: new Date(2026, 7, 2), starred: false },
    { id: 4, name: 'Bütçe 2027.xlsx', kind: 'doc', size: 312_000, modified: new Date(2026, 8, 30), starred: true },
    { id: 5, name: 'Toplantı notları.docx', kind: 'doc', size: 48_000, modified: new Date(2026, 9, 1), starred: false },
  ]);
  protected readonly selectedFiles = signal<FileItem[]>([]);
  protected readonly lastAction = signal('—');
  protected readonly byFileId = (f: FileItem) => f.id;
  protected readonly fileColumns: HuColumn<FileItem>[] = [
    { key: 'name', header: 'Ad', sortable: true },
    { key: 'modified', header: 'Değiştirilme', sortable: true, value: (f) => f.modified.toLocaleDateString('tr-TR') },
    { key: 'size', header: 'Boyut', align: 'end', sortable: true, value: (f) => (f.kind === 'folder' ? '—' : formatFileSize(f.size)) },
  ];

  /** Menü satıra göre değişir: tek öğede "Aç", "Yeniden adlandır"; yıldıza göre etiket. */
  protected readonly fileMenu = (file: FileItem, rows: readonly FileItem[]): HuDropdownEntry[] => {
    const many = rows.length > 1;
    const allStarred = rows.every((f) => f.starred);
    return [
      { header: many ? `${rows.length} öğe seçili` : file.name },
      { label: 'Aç', value: 'open', icon: 'eye', shortcut: 'Enter', disabled: many },
      { label: 'Yeniden adlandır', value: 'rename', icon: 'edit', shortcut: 'F2', disabled: many },
      { label: 'Bağlantıyı kopyala', value: 'link', icon: 'link', shortcut: 'Ctrl+L', disabled: many },
      { label: 'İndir', value: 'download', icon: 'download', disabled: !many && file.kind === 'folder' },
      { label: allStarred ? 'Yıldızı kaldır' : 'Yıldızla', value: 'star', icon: 'check-circle' },
      { divider: true },
      { label: many ? `${rows.length} öğeyi sil` : 'Sil', value: 'delete', icon: 'trash', danger: true, shortcut: 'Del' },
    ];
  };

  protected onFileAction({ option, rows }: HuTableContextEvent<FileItem>): void {
    const names = rows.length > 1 ? `${rows.length} öğe` : rows[0].name;
    this.lastAction.set(`${option.label} · ${names}`);
    const ids = new Set(rows.map((f) => f.id));
    if (option.value === 'delete') {
      this.files.update((list) => list.filter((f) => !ids.has(f.id)));
      this.selectedFiles.set([]);
      this.toast.success(`${names} silindi.`);
    } else if (option.value === 'star') {
      const star = !rows.every((f) => f.starred);
      this.files.update((list) => list.map((f) => (ids.has(f.id) ? { ...f, starred: star } : f)));
    } else {
      this.toast.info(`${option.label}: ${names}`);
    }
  }

  // --- Görünümler --------------------------------------------------------------------------
  protected readonly variants: HuTableVariant[] = ['default', 'bordered', 'card', 'minimal'];
  protected readonly sizes: HuTableSize[] = ['sm', 'md', 'lg'];
  protected readonly variant = signal<HuTableVariant>('default');
  protected readonly size = signal<HuTableSize>('md');
  protected readonly striped = signal(false);

  protected readonly courses: Course[] = [
    { code: 'BİL 101', name: 'Programlamaya Giriş I', credit: 4, quota: 120, open: true },
    { code: 'BİL 203', name: 'Veri Yapıları', credit: 3, quota: 90, open: true },
    { code: 'MAT 123', name: 'Analiz I', credit: 4, quota: 150, open: false },
    { code: 'İST 292', name: 'Olasılık ve İstatistik', credit: 3, quota: 80, open: true },
    { code: 'FİZ 137', name: 'Fizik I', credit: 4, quota: 140, open: true },
  ];
  protected readonly columns: HuColumn<Course>[] = [
    { key: 'code', header: 'Kod', sortable: true, width: '110px' },
    { key: 'name', header: 'Ders adı', sortable: true },
    { key: 'credit', header: 'Kredi', sortable: true, align: 'end' },
  ];
  protected readonly columnsWithStatus: HuColumn<Course>[] = [
    ...this.columns,
    { key: 'quota', header: 'Kontenjan', sortable: true, align: 'end' },
    { key: 'open', header: 'Durum' },
  ];
  protected readonly sort = signal<HuSort>({ key: '', direction: '' });

  // --- Detay ----------------------------------------------------------------------------
  protected readonly orders: Order[] = [
    { id: 'SP-1042', customer: 'Kütüphane', date: new Date(2026, 8, 12), total: 0, items: [{ name: 'Kitap rafı', qty: 4, price: 2450 }, { name: 'Okuma lambası', qty: 10, price: 380 }] },
    { id: 'SP-1043', customer: 'Bilgi İşlem', date: new Date(2026, 8, 18), total: 0, items: [{ name: 'Dizüstü bilgisayar', qty: 3, price: 32500 }] },
    { id: 'SP-1044', customer: 'Öğrenci İşleri', date: new Date(2026, 8, 25), total: 0, items: [{ name: 'Yazıcı toneri', qty: 12, price: 940 }, { name: 'A4 kâğıt (koli)', qty: 8, price: 610 }, { name: 'Zımba', qty: 5, price: 120 }] },
  ].map((o) => ({ ...o, total: o.items.reduce((s, i) => s + i.qty * i.price, 0) }));
  protected readonly byOrderId = (o: Order) => o.id;
  private readonly money = (n: number) => n.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });
  protected readonly orderColumns: HuColumn<Order>[] = [
    { key: 'id', header: 'Sipariş', width: '120px' },
    { key: 'customer', header: 'Birim' },
    { key: 'date', header: 'Tarih', value: (o) => o.date.toLocaleDateString('tr-TR') },
    { key: 'count', header: 'Kalem', align: 'end', value: (o) => o.items.length },
    { key: 'total', header: 'Tutar', align: 'end', value: (o) => this.money(o.total) },
  ];
  protected readonly itemColumns: HuColumn<Order['items'][number]>[] = [
    { key: 'name', header: 'Ürün' },
    { key: 'qty', header: 'Adet', align: 'end' },
    { key: 'price', header: 'Birim fiyat', align: 'end', value: (i) => this.money(i.price) },
    { key: 'sum', header: 'Toplam', align: 'end', value: (i) => this.money(i.qty * i.price) },
  ];

  // --- Sabit sütunlar ve alt toplam ----------------------------------------------------------
  protected readonly wideColumns: HuColumn<Course>[] = [
    { key: 'name', header: 'Ders adı', sticky: 'start', width: '200px', footer: 'Toplam' },
    { key: 'code', header: 'Kod', width: '110px' },
    { key: 'credit', header: 'Kredi', align: 'end', footer: (rows) => rows.reduce((s, r) => s + r.credit, 0) },
    { key: 'quota', header: 'Kontenjan', align: 'end', footer: (rows) => rows.reduce((s, r) => s + r.quota, 0) },
    { key: 'open', header: 'Durum' },
    { key: 'term', header: 'Dönem', value: () => 'Güz 2026' },
    { key: 'lang', header: 'Dil', value: (c) => (c.code.startsWith('BİL') ? 'İngilizce' : 'Türkçe') },
    { key: 'edit', header: '', sticky: 'end', align: 'end', exportable: false },
  ];

  // --- Kart görünümü -------------------------------------------------------------------------
  protected readonly stackColumns: HuColumn<Person>[] = [
    { key: 'name', header: 'Ad Soyad' },
    { key: 'department', header: 'Birim' },
    { key: 'status', header: 'Durum' },
  ];

  // --- Sunucu tarafı --------------------------------------------------------------------------
  protected readonly serverColumns: HuColumn<Person>[] = [
    { key: 'id', header: 'No', sortable: true, width: '72px', align: 'end' },
    { key: 'name', header: 'Ad Soyad', sortable: true },
    { key: 'department', header: 'Birim', sortable: true },
  ];
  protected readonly serverRows = signal<Person[]>([]);
  protected readonly serverTotal = signal(0);
  protected readonly serverLoading = signal(false);
  protected readonly serverSort = signal<HuSort>({ key: '', direction: '' });
  protected readonly serverSearch = signal('');
  protected readonly serverPage = signal(0);
  protected readonly serverSize = signal(10);
  private request = 0;

  constructor() {
    this.load();
  }

  /** Sunucuyu taklit eder: filtrele, sırala, sayfala, 600 ms bekle. */
  protected load(): void {
    const id = ++this.request;
    this.serverLoading.set(true);
    const q = this.serverSearch().toLocaleLowerCase('tr-TR');
    const { key, direction } = this.serverSort();
    let rows = PEOPLE.filter((p) => !q || p.name.toLocaleLowerCase('tr-TR').includes(q) || p.department.toLocaleLowerCase('tr-TR').includes(q));
    if (key && direction) {
      const f = direction === 'asc' ? 1 : -1;
      rows = [...rows].sort((a, b) => String(a[key as keyof Person]).localeCompare(String(b[key as keyof Person]), 'tr', { numeric: true }) * f);
    }
    const start = this.serverPage() * this.serverSize();
    setTimeout(() => {
      if (id !== this.request) return; // eski isteğin cevabı
      this.serverRows.set(rows.slice(start, start + this.serverSize()));
      this.serverTotal.set(rows.length);
      this.serverLoading.set(false);
    }, 600);
  }

  // --- Tekli seçim / durumlar --------------------------------------------------------------
  protected readonly single = signal<Course[]>([]);
  protected readonly loading = signal(false);
  protected readonly empty = signal(false);
  protected readonly selectedCount = computed(() => this.selected().length);

  protected reload(): void {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 1200);
  }

  // --- Kod örnekleri -------------------------------------------------------------------------
  protected readonly fullCode = `
people = signal<Person[]>([]);
selected = signal<Person[]>([]);
byId = (p: Person) => p.id;

columns: HuColumn<Person>[] = [
  { key: 'name', header: 'Ad Soyad', sortable: true, hideable: false },
  { key: 'department', header: 'Birim', sortable: true },
  { key: 'title', header: 'Unvan', sortable: true, hideOnMobile: true },
  { key: 'status', header: 'Durum', sortable: true },
  { key: 'start', header: 'Başlangıç', hidden: true },   // sütun seçiciden açılır
  { key: 'actions', header: '', sticky: 'end', hideable: false, exportable: false, searchable: false },
];

<hu-table
  variant="card" title="Personel"
  [data]="people()" [columns]="columns" [trackBy]="byId"
  searchable columnToggle exportable exportFileName="personel"
  paginator [pageSize]="5" [pageSizeOptions]="[5, 10, 25]"
  selectionMode="multiple" [(selection)]="selected"
  stateKey="personel-tablosu"
>
  <button huTableToolbar hu-button size="sm">Yeni</button>
  <button huTableBulkActions hu-button size="sm" color="danger" (click)="removeSelected()">Sil</button>

  <ng-template huCell="status" [huCellOf]="people()" let-p>
    <hu-badge [variant]="p.status === 'active' ? 'success' : 'neutral'" dot>{{ p.status }}</hu-badge>
  </ng-template>
  <ng-template huCell="actions" [huCellOf]="people()" let-p>
    <hu-dropdown icon="more-vertical" variant="ghost" size="sm" ariaLabel="İşlemler" [options]="rowActions" />
  </ng-template>
</hu-table>`;

  protected readonly contextCode = `
import { HuDropdownEntry, HuTableContextEvent } from '@ucme-ui/angular';

// Sabit liste de verilebilir: [contextMenu]="actions"
fileMenu = (file: FileItem, rows: readonly FileItem[]): HuDropdownEntry[] => [
  { header: rows.length > 1 ? \`\${rows.length} öğe seçili\` : file.name },
  { label: 'Aç', value: 'open', icon: 'eye', shortcut: 'Enter', disabled: rows.length > 1 },
  { label: 'Yeniden adlandır', value: 'rename', icon: 'edit', shortcut: 'F2' },
  { label: 'İndir', value: 'download', icon: 'download' },
  { divider: true },
  { label: 'Sil', value: 'delete', icon: 'trash', danger: true, shortcut: 'Del' },
];

onFileAction({ option, row, rows }: HuTableContextEvent<FileItem>) {
  // rows: seçili bir satıra sağ tıklandıysa tüm seçim, değilse yalnızca row
  if (option.value === 'delete') this.remove(rows);
}

<hu-table
  [data]="files()" [columns]="columns" [trackBy]="byId"
  selectionMode="multiple" [(selection)]="selected"
  [contextMenu]="fileMenu" (contextMenuSelect)="onFileAction($event)"
/>`;

  protected readonly variantsCode = `
<hu-table variant="default" [data]="courses" [columns]="columns" />
<hu-table variant="bordered" size="sm" [data]="courses" [columns]="columns" />
<hu-table variant="card" title="Dersler" [data]="courses" [columns]="columns" />
<hu-table variant="minimal" size="lg" striped [data]="courses" [columns]="columns" />`;

  protected readonly detailCode = `
<hu-table variant="bordered" [data]="orders" [columns]="orderColumns" [trackBy]="byOrderId">
  <ng-template huRowDetail [huRowDetailOf]="orders" let-o>
    <hu-table variant="minimal" size="sm" [data]="o.items" [columns]="itemColumns" />
  </ng-template>
</hu-table>

<!-- Aynı anda tek satır açık kalsın: [multiExpand]="false" -->`;

  protected readonly stickyCode = `
columns: HuColumn<Course>[] = [
  { key: 'name', header: 'Ders adı', sticky: 'start', footer: 'Toplam' },
  { key: 'credit', header: 'Kredi', align: 'end', footer: (rows) => rows.reduce((s, r) => s + r.credit, 0) },
  { key: 'quota', header: 'Kontenjan', align: 'end', footer: (rows) => rows.reduce((s, r) => s + r.quota, 0) },
  // …
  { key: 'edit', header: '', sticky: 'end', exportable: false },
];

<hu-table [data]="courses" [columns]="columns" striped nowrap />`;

  protected readonly stackCode = `
<hu-table responsive="stack" [data]="people()" [columns]="columns" selectionMode="multiple" />`;

  protected readonly lazyCode = `
rows = signal<Person[]>([]);
total = signal(0);
loading = signal(false);
sort = signal<HuSort>({ key: '', direction: '' });
search = signal('');
page = signal(0);
size = signal(10);

load() {
  this.loading.set(true);
  this.api.people({ q: this.search(), sort: this.sort(), page: this.page(), size: this.size() })
    .subscribe((res) => {
      this.rows.set(res.items);
      this.total.set(res.total);
      this.loading.set(false);
    });
}

<hu-table lazy searchable paginator
  [data]="rows()" [totalRecords]="total()" [loading]="loading()" [columns]="columns"
  [sort]="sort()" (sortChange)="sort.set($event); load()"
  [search]="search()" (searchChange)="search.set($event); page.set(0); load()"
  [pageIndex]="page()" (pageIndexChange)="page.set($event); load()"
  [pageSize]="size()" (pageSizeChange)="size.set($event); page.set(0); load()" />`;

  protected readonly singleCode = `
selection = signal<Course[]>([]);

<hu-table [data]="courses" [columns]="columns" selectionMode="single" [(selection)]="selection"
          clickableRows (rowClick)="open($event)" size="sm" />`;

  protected readonly statesCode = `
<hu-table [data]="rows()" [columns]="columns" [loading]="loading()">
  <div huTableEmpty>Ders bulunamadı</div>
</hu-table>`;
}
