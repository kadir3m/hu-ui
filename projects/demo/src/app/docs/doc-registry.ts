import { Type } from '@angular/core';
import { Routes } from '@angular/router';
import { HuNavItem } from '@ucme-ui/angular';

/** [ad, tip, varsayılan, açıklama] */
export type ApiRow = readonly [name: string, type: string, defaultValue: string, description: string];

export interface DocApi {
  inputs?: ApiRow[];
  /** İki yönlü: `[(ad)]` */
  models?: ApiRow[];
  /** [ad, değer tipi, —, ne zaman] */
  outputs?: ApiRow[];
  /** [öznitelik, —, —, nereye yerleşir] */
  slots?: ApiRow[];
  /** Servis metotları vb. */
  methods?: ApiRow[];
}

export const DOC_CATEGORIES = ['Form', 'Tarih', 'Veri', 'Navigasyon', 'Geri bildirim', 'Çekirdek'] as const;
export type DocCategory = (typeof DOC_CATEGORIES)[number];

export interface DocEntry {
  slug: string;
  name: string;
  category: DocCategory;
  description: string;
  /** Kullanımdaki etiket/öznitelik (örn. `button[hu-button]`). */
  selector: string;
  /** `import { … } from '@ucme-ui/angular'` satırı. */
  imports: string;
  icon: string;
  isNew?: boolean;
  api: DocApi;
  load: () => Promise<Type<unknown>>;
}

const BUTTON_VARIANT = `'solid' | 'soft' | 'outline' | 'ghost' | 'link'`;
const BUTTON_COLOR = `'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'`;
const BUTTON_SIZE = `'xs' | 'sm' | 'md' | 'lg' | 'xl'`;

export const DOCS: DocEntry[] = [
  // --- Form ----------------------------------------------------------------------
  {
    slug: 'button',
    name: 'Button',
    category: 'Form',
    icon: 'plus',
    description: 'Native <button> ve <a> elementlerine uygulanan buton. Görünüm ve renk birbirinden bağımsızdır.',
    selector: 'button[hu-button], a[hu-button]',
    imports: 'HuButton',
    api: {
      inputs: [
        ['variant', BUTTON_VARIANT, `'solid'`, 'Görünüm'],
        ['color', BUTTON_COLOR, 'görünüme göre', 'Verilmezse solid/soft/link → primary, outline/ghost → neutral'],
        ['size', BUTTON_SIZE, `'md'`, 'Boyut'],
        ['disabled', 'boolean', 'false', 'Devre dışı'],
        ['loading', 'boolean', 'false', 'Spinner gösterir, tıklamayı engeller'],
        ['iconOnly', 'boolean', 'false', 'Kare, yalnızca ikon içeren buton (aria-label verin)'],
        ['pill', 'boolean', 'false', 'Tam yuvarlak köşeler'],
        ['block', 'boolean', 'false', 'Kapsayıcının tüm genişliği'],
      ],
    },
    load: () => import('./pages/button.doc').then((m) => m.ButtonDoc),
  },
  {
    slug: 'button-group',
    name: 'ButtonGroup',
    category: 'Form',
    icon: 'grid',
    isNew: true,
    description: 'Butonları bitişik bir grup olarak gösterir: araç çubukları, görünüm seçiciler, bölünmüş butonlar.',
    selector: 'hu-button-group',
    imports: 'HuButtonGroup',
    api: {
      inputs: [
        ['vertical', 'boolean', 'false', 'Butonları alt alta dizer'],
        ['pill', 'boolean', 'false', 'Grubun dış köşeleri tam yuvarlak'],
      ],
    },
    load: () => import('./pages/button-group.doc').then((m) => m.ButtonGroupDoc),
  },
  {
    slug: 'checkbox',
    name: 'Checkbox',
    category: 'Form',
    icon: 'check',
    description: 'Onay kutusu. Reactive/template-driven formlarla veya [(checked)] ile çalışır; kısmen seçili durumu destekler.',
    selector: 'hu-checkbox',
    imports: 'HuCheckbox',
    api: {
      inputs: [
        ['disabled', 'boolean', 'false', 'Devre dışı'],
        ['name', 'string', '—', 'Native name özniteliği'],
        ['aria-label', 'string', '—', 'Görünür metin yoksa ekran okuyucu etiketi'],
        ['inputId', 'string', 'otomatik', 'İçteki input’un id’si'],
      ],
      models: [
        ['checked', 'boolean', 'false', 'İşaretli mi'],
        ['indeterminate', 'boolean', 'false', 'Kısmen seçili (–); tıklanınca kalkar'],
      ],
    },
    load: () => import('./pages/checkbox.doc').then((m) => m.CheckboxDoc),
  },
  {
    slug: 'date-picker',
    name: 'DatePicker',
    category: 'Form',
    icon: 'calendar',
    isNew: true,
    description: 'Tarih seçici form kontrolü. Tarih elle (gg.aa.yyyy) yazılabilir veya açılan takvimden seçilir; tek tarih veya aralık.',
    selector: 'hu-date-picker',
    imports: 'HuDatePicker',
    api: {
      inputs: [
        ['mode', `'single' | 'range'`, `'single'`, 'Tek tarih veya aralık'],
        ['min / max', 'Date | null', 'null', 'Seçilebilir en erken / en geç tarih'],
        ['dateFilter', '(date: Date) => boolean', 'null', 'false döndüren günler seçilemez'],
        ['markers', 'HuCalendarMarker[]', '[]', 'Takvimde işaretli günler'],
        ['placeholder', 'string', 'gg.aa.yyyy', 'Boş input metni'],
        ['size', `'sm' | 'md' | 'lg'`, `'md'`, 'Yükseklik'],
        ['disabled', 'boolean', 'false', 'Devre dışı'],
      ],
      models: [['value', 'Date | HuDateRange | null', 'null', 'single: Date · range: { start, end }']],
    },
    load: () => import('./pages/date-picker.doc').then((m) => m.DatePickerDoc),
  },
  {
    slug: 'editor',
    name: 'Editor',
    category: 'Form',
    icon: 'bold',
    isNew: true,
    description: 'Zengin metin editörü: başlıklar, kalın/italik, renkler, listeler, alıntı, kod, link ve görsel. Değer HTML’dir; yapıştırılan içerik güvenli hale getirilir.',
    selector: 'hu-editor',
    imports: 'HuEditor',
    api: {
      inputs: [
        ['toolbar', 'HuEditorTool[]', 'HU_EDITOR_DEFAULT_TOOLBAR', 'Araç çubuğu öğeleri; \'|\' ayraç'],
        ['placeholder', 'string', `'Yazmaya başlayın…'`, 'Boşken görünen metin'],
        ['readonly', 'boolean', 'false', 'Araç çubuğu gizlenir, içerik düzenlenemez'],
        ['disabled', 'boolean', 'false', 'Devre dışı'],
        ['showCount', 'boolean', 'false', 'Altta kelime ve karakter sayısı'],
        ['ariaLabel', 'string', '—', 'hu-form-field dışında kullanırken ekran okuyucu etiketi'],
        ['textColors', 'HuEditorColor[]', 'HU_EDITOR_TEXT_COLORS', 'Yazı rengi paleti; yalnızca bu renkler kalıcıdır'],
        ['highlightColors', 'HuEditorColor[]', 'HU_EDITOR_HIGHLIGHT_COLORS', 'Vurgu (arka plan) paleti'],
        ['imageUpload', '(file: File) => Promise<string>', 'null', 'Görseli sunucuya yükleyip adresini döndürür; yoksa data URL olarak gömülür'],
        ['maxImageSize', 'number (bayt)', '2097152 (2 MB)', 'Kabul edilen en büyük görsel dosyası'],
      ],
      models: [['value', 'string (HTML)', `''`, 'Boş içerik \'\' olur (Validators.required ile uyumlu)']],
      methods: [
        ['huSanitizeHtml(html)', 'string', '—', 'HTML’i editörün izin verdiği etiketlere indirger'],
        ['huIsSafeImageSrc(src)', 'boolean', '—', 'http(s), göreli adres veya PNG/JPEG/GIF/WebP data URL mi?'],
        ['HU_EDITOR_MINIMAL_TOOLBAR', 'HuEditorTool[]', '—', 'Kalın, italik, altı çizili, listeler, link'],
      ],
    },
    load: () => import('./pages/editor.doc').then((m) => m.EditorDoc),
  },
  {
    slug: 'form-field',
    name: 'FormField',
    category: 'Form',
    icon: 'file-text',
    description: 'Label, yardım metni ve doğrulama hatasını bir kontrol etrafında toplar. Reactive form hataları otomatik olarak Türkçe mesaja çevrilir.',
    selector: 'hu-form-field',
    imports: 'HU_FORM_FIELD_IMPORTS',
    api: {
      inputs: [
        ['label', 'string', '—', 'Alan etiketi'],
        ['hint', 'string', '—', 'Yardım metni (hata varken gizlenir)'],
        ['error', 'string | null', '—', 'Sabit hata mesajı; verilmezse validator hatasından üretilir'],
        ['required', 'boolean', 'false', 'Etiketin yanına * koyar (validasyon yapmaz)'],
      ],
      slots: [
        ['huPrefix', '—', '—', 'Kontrolün solu (ikon vb.)'],
        ['huSuffix', '—', '—', 'Kontrolün sağı (buton vb.)'],
      ],
    },
    load: () => import('./pages/form-field.doc').then((m) => m.FormFieldDoc),
  },
  {
    slug: 'input',
    name: 'InputText',
    category: 'Form',
    icon: 'edit',
    description: 'Native input, textarea ve select elementlerine HU görünümünü ve form-field entegrasyonunu ekleyen directive.',
    selector: 'input[huInput], textarea[huInput], select[huInput]',
    imports: 'HuInput',
    api: {
      inputs: [
        ['size', `'sm' | 'md' | 'lg'`, `'md'`, 'Yükseklik'],
        ['invalid', 'boolean', 'false', 'Form kontrolü olmadan hatalı görünümü zorlar'],
        ['id', 'string', 'otomatik', 'hu-form-field label’ı bu id’ye bağlanır'],
      ],
    },
    load: () => import('./pages/input.doc').then((m) => m.InputDoc),
  },
  {
    slug: 'switch',
    name: 'InputSwitch',
    category: 'Form',
    icon: 'settings',
    description: 'Açık/kapalı anahtarı. Ayarlar ekranları için; formlarla veya [(checked)] ile çalışır.',
    selector: 'hu-switch',
    imports: 'HuSwitch',
    api: {
      inputs: [
        ['disabled', 'boolean', 'false', 'Devre dışı'],
        ['aria-label', 'string', '—', 'Görünür metin yoksa ekran okuyucu etiketi'],
      ],
      models: [['checked', 'boolean', 'false', 'Açık mı']],
    },
    load: () => import('./pages/switch.doc').then((m) => m.SwitchDoc),
  },

  // --- Tarih ---------------------------------------------------------------------
  {
    slug: 'calendar',
    name: 'Calendar',
    category: 'Tarih',
    icon: 'calendar',
    isNew: true,
    description: 'Satır içi takvim: tek gün veya aralık seçimi, min/max, kapalı günler, etkinlik işaretleri, ay/yıl görünümü ve tam klavye desteği.',
    selector: 'hu-calendar',
    imports: 'HuCalendar',
    api: {
      inputs: [
        ['mode', `'single' | 'range'`, `'single'`, 'Seçim türü'],
        ['min / max', 'Date | null', 'null', 'Seçilebilir aralık'],
        ['dateFilter', '(date: Date) => boolean', 'null', 'false döndüren günler seçilemez'],
        ['markers', 'HuCalendarMarker[]', '[]', 'Günlerin altındaki renkli noktalar'],
        ['startAt', 'Date | null', 'null', 'Seçim yokken açılacak ay'],
        ['locale', 'string', `'tr-TR'`, 'Ay ve gün adları'],
        ['firstDayOfWeek', 'number', '1', '0 = Pazar, 1 = Pazartesi'],
      ],
      models: [
        ['value', 'Date | null', 'null', 'Seçili gün (single)'],
        ['range', 'HuDateRange | null', 'null', 'Seçili aralık (range)'],
      ],
      outputs: [
        ['dateSelected', 'Date', '—', 'Kullanıcı bir güne tıklayınca'],
        ['monthChange', 'Date', '—', 'Görüntülenen ay değişince (ayın ilk günü)'],
      ],
    },
    load: () => import('./pages/calendar.doc').then((m) => m.CalendarDoc),
  },

  // --- Veri ----------------------------------------------------------------------
  {
    slug: 'card',
    name: 'Card',
    category: 'Veri',
    icon: 'layers',
    description: 'Başlık, aksiyonlar ve alt bilgi alanı olan içerik kartı.',
    selector: 'hu-card',
    imports: 'HU_CARD_IMPORTS',
    api: {
      inputs: [
        ['title', 'string', '—', 'Başlık'],
        ['subtitle', 'string', '—', 'Başlığın altındaki küçük metin'],
        ['padding', `'none' | 'sm' | 'md'`, `'md'`, 'İçerik boşluğu (none: tablo gibi kenara dayanan içerik)'],
      ],
      slots: [
        ['huCardActions', '—', '—', 'Başlığın sağı'],
        ['huCardFooter', '—', '—', 'Kartın altı'],
      ],
    },
    load: () => import('./pages/card.doc').then((m) => m.CardDoc),
  },
  {
    slug: 'paginator',
    name: 'Paginator',
    category: 'Veri',
    icon: 'chevrons-right',
    description: 'Sayfalama: sayfa numaraları, önceki/sonraki ve sayfa başına kayıt seçimi.',
    selector: 'hu-paginator',
    imports: 'HuPaginator',
    api: {
      inputs: [
        ['length', 'number', 'zorunlu', 'Toplam kayıt sayısı'],
        ['pageSizeOptions', 'number[]', '[10, 25, 50]', 'Sayfa başına seçenekleri (tek eleman → seçici gizlenir)'],
      ],
      models: [
        ['pageIndex', 'number', '0', 'Geçerli sayfa, 0’dan başlar'],
        ['pageSize', 'number', '10', 'Sayfa başına kayıt'],
      ],
    },
    load: () => import('./pages/paginator.doc').then((m) => m.PaginatorDoc),
  },
  {
    slug: 'table',
    name: 'Table',
    category: 'Veri',
    icon: 'grid',
    description: 'Veri tablosu: sıralama, özel hücre şablonları, yükleniyor ve boş durumları.',
    selector: 'hu-table',
    imports: 'HU_TABLE_IMPORTS',
    api: {
      inputs: [
        ['columns', 'HuColumn<T>[]', 'zorunlu', 'Sütun tanımları'],
        ['data', 'T[]', '[]', 'Satırlar'],
        ['loading', 'boolean', 'false', 'Yükleniyor göstergesi'],
        ['emptyText', 'string', `'Kayıt bulunamadı.'`, 'Veri yokken metin'],
        ['sortMode', `'client' | 'server'`, `'client'`, 'server: yalnızca sort değişir, veriyi siz getirirsiniz'],
        ['trackBy', '(row: T) => unknown', 'satırın kendisi', 'Satır kimliği'],
        ['striped / dense / stickyHeader', 'boolean', 'false', 'Görünüm seçenekleri'],
        ['clickableRows', 'boolean', 'false', 'Satırlar tıklanabilir olur'],
      ],
      models: [['sort', 'HuSort', `{ key: '', direction: '' }`, 'Artan → azalan → sırasız']],
      outputs: [['rowClick', 'T', '—', 'Satıra tıklanınca (clickableRows açıkken)']],
      slots: [
        ['ng-template[huCell]', '—', '—', 'Özel hücre: huCell="sütunAnahtarı" let-row'],
        ['huTableEmpty', '—', '—', 'Boş durum içeriği'],
      ],
    },
    load: () => import('./pages/table.doc').then((m) => m.TableDoc),
  },
  {
    slug: 'tabs',
    name: 'Tabs',
    category: 'Veri',
    icon: 'menu',
    description: 'Sekmeler. İçerik yalnızca aktifken çizilir; ok tuşları ve Home/End ile gezilir.',
    selector: 'hu-tabs, hu-tab',
    imports: 'HU_TABS_IMPORTS',
    api: {
      inputs: [
        ['variant (hu-tabs)', `'line' | 'pills'`, `'line'`, 'Alt çizgili veya kapsül görünüm'],
        ['label (hu-tab)', 'string', 'zorunlu', 'Sekme başlığı'],
        ['icon (hu-tab)', 'string', '—', 'Başlıktaki ikon'],
        ['disabled (hu-tab)', 'boolean', 'false', 'Seçilemez'],
      ],
      models: [['selectedIndex (hu-tabs)', 'number', '0', 'Aktif sekmenin sırası']],
    },
    load: () => import('./pages/tabs.doc').then((m) => m.TabsDoc),
  },

  // --- Navigasyon ----------------------------------------------------------------
  {
    slug: 'breadcrumb',
    name: 'Breadcrumb',
    category: 'Navigasyon',
    icon: 'chevron-right',
    description: 'Sayfanın uygulama içindeki konumunu gösteren adımlar.',
    selector: 'hu-breadcrumb',
    imports: 'HuBreadcrumb',
    api: {
      inputs: [['items', 'HuBreadcrumbItem[]', '[]', '{ label, link?, icon? } — sonuncusu geçerli sayfa']],
    },
    load: () => import('./pages/breadcrumb.doc').then((m) => m.BreadcrumbDoc),
  },
  {
    slug: 'dropdown',
    name: 'Dropdown',
    category: 'Navigasyon',
    icon: 'chevron-down',
    isNew: true,
    description: 'Açılır menü. Öğeler dizi olarak verilir, seçim (selected) ile döner; tetikleyici butonu component kendisi çizer.',
    selector: 'hu-dropdown',
    imports: 'HuDropdown, HuDropdownEntry',
    api: {
      inputs: [
        ['options', 'HuDropdownEntry<T>[]', '[]', 'Seçenek, { divider: true } veya { header: … }'],
        ['label', 'string', '—', 'Tetikleyici metni'],
        ['icon', 'string', '—', 'Tetikleyici ikonu; label yoksa kare ikon butonu'],
        ['variant / color / size', 'HuButton…', `'outline'`, 'Tetikleyici görünümü'],
        ['caret', 'boolean', 'true', 'Etiketin yanında aşağı ok'],
        ['ariaLabel', 'string', '—', 'Yalnızca ikonlu tetikleyicide gerekli'],
        ['align', `'start' | 'end'`, `'start'`, 'Panel hizası'],
        ['disabled', 'boolean', 'false', 'Tetikleyici devre dışı'],
      ],
      models: [['open', 'boolean', 'false', 'Panel açık mı']],
      outputs: [['selected', 'HuDropdownOption<T>', '—', 'Öğe seçilince (value yoksa label döner)']],
      slots: [
        ['huDropdownTrigger', '—', '—', 'Hazır buton yerine kendi tetikleyiciniz'],
        ['huDropdownHeader', '—', '—', 'Panelin üstüne serbest içerik'],
      ],
    },
    load: () => import('./pages/dropdown.doc').then((m) => m.DropdownDoc),
  },
  {
    slug: 'shell',
    name: 'Shell (Layout)',
    category: 'Navigasyon',
    icon: 'home',
    description: 'Admin uygulama iskeleti: daraltılabilir sidebar, mobilde çekmece menü, üst çubuk. Bu demo uygulamanın kendisi hu-shell ile yapıldı.',
    selector: 'hu-shell',
    imports: 'HU_SHELL_IMPORTS, HuNavGroup',
    api: {
      inputs: [
        ['nav', 'HuNavGroup[]', '[]', 'Sidebar menüsü'],
        ['brand', 'string', `''`, 'Uygulama adı'],
        ['brandSubtitle', 'string', '—', 'Adın altındaki satır'],
        ['brandLink', 'string', `'/'`, 'Marka alanının linki'],
        ['sidebarTheme', `'default' | 'dark'`, `'default'`, 'dark: açık temada da koyu sidebar'],
      ],
      models: [['collapsed', 'boolean', 'son tercih', 'Masaüstünde sidebar daraltılmış mı (saklanır)']],
      slots: [
        ['huTopbarStart', '—', '—', 'Üst çubuğun solu'],
        ['huTopbarEnd', '—', '—', 'Üst çubuğun sağı'],
        ['huSidebarFooter', '—', '—', 'Sidebar’ın altı'],
        ['huShellLogo', '—', '—', 'Kendi logonuz'],
      ],
    },
    load: () => import('./pages/shell.doc').then((m) => m.ShellDoc),
  },

  // --- Geri bildirim -------------------------------------------------------------
  {
    slug: 'alert',
    name: 'Alert',
    category: 'Geri bildirim',
    icon: 'info',
    description: 'Sayfa içi bilgi, başarı, uyarı ve hata kutusu.',
    selector: 'hu-alert',
    imports: 'HuAlert',
    api: {
      inputs: [
        ['variant', `'info' | 'success' | 'warning' | 'danger'`, `'info'`, 'Tür ve renk'],
        ['title', 'string', '—', 'Kalın başlık'],
        ['dismissible', 'boolean', 'false', 'Kapatma butonu'],
      ],
      outputs: [['closed', 'void', '—', 'Kullanıcı kapattığında']],
    },
    load: () => import('./pages/alert.doc').then((m) => m.AlertDoc),
  },
  {
    slug: 'avatar',
    name: 'Avatar',
    category: 'Geri bildirim',
    icon: 'user',
    description: 'Kullanıcı görseli; görsel yoksa veya yüklenemezse baş harfleri gösterir.',
    selector: 'hu-avatar',
    imports: 'HuAvatar',
    api: {
      inputs: [
        ['name', 'string', `''`, 'Kişi adı (baş harfler Türkçe kurallarla)'],
        ['src', 'string | null', '—', 'Görsel adresi'],
        ['size', `'sm' | 'md' | 'lg'`, `'md'`, 'Boyut'],
      ],
    },
    load: () => import('./pages/avatar.doc').then((m) => m.AvatarDoc),
  },
  {
    slug: 'badge',
    name: 'Badge',
    category: 'Geri bildirim',
    icon: 'check-circle',
    description: 'Durum etiketi.',
    selector: 'hu-badge',
    imports: 'HuBadge',
    api: {
      inputs: [
        ['variant', `'neutral' | 'primary' | 'info' | 'success' | 'warning' | 'danger'`, `'neutral'`, 'Renk'],
        ['dot', 'boolean', 'false', 'Metnin önünde nokta'],
      ],
    },
    load: () => import('./pages/badge.doc').then((m) => m.BadgeDoc),
  },
  {
    slug: 'dialog',
    name: 'Dialog',
    category: 'Geri bildirim',
    icon: 'layers',
    description: 'Modal pencere. Native <dialog> kullanır; odak hapsi ve Esc ile kapanma hazır gelir.',
    selector: 'hu-dialog',
    imports: 'HU_DIALOG_IMPORTS',
    api: {
      inputs: [
        ['title', 'string', `''`, 'Başlık'],
        ['description', 'string', '—', 'Başlığın altındaki açıklama'],
        ['size', `'sm' | 'md' | 'lg' | 'xl'`, `'md'`, 'Genişlik (24 / 32 / 44 / 60 rem)'],
        ['closeOnBackdrop', 'boolean', 'true', 'Dışarı tıklayınca kapansın'],
        ['closeOnEsc', 'boolean', 'true', 'Esc ile kapansın'],
      ],
      models: [['open', 'boolean', 'false', 'Açık mı']],
      outputs: [['closed', 'void', '—', 'Herhangi bir yolla kapandığında']],
      slots: [['huDialogFooter', '—', '—', 'Alttaki aksiyon butonları']],
    },
    load: () => import('./pages/dialog.doc').then((m) => m.DialogDoc),
  },
  {
    slug: 'spinner',
    name: 'Spinner',
    category: 'Geri bildirim',
    icon: 'clock',
    description: 'Yükleniyor göstergesi.',
    selector: 'hu-spinner',
    imports: 'HuSpinner',
    api: {
      inputs: [
        ['size', `'sm' | 'md' | 'lg'`, `'md'`, 'Boyut'],
        ['label', 'string', `'Yükleniyor'`, 'Ekran okuyucu metni'],
      ],
    },
    load: () => import('./pages/spinner.doc').then((m) => m.SpinnerDoc),
  },
  {
    slug: 'toast',
    name: 'Toast',
    category: 'Geri bildirim',
    icon: 'bell',
    description: 'Geçici bildirimler. Kök component’e bir kez <hu-toaster /> koyun, HuToastService ile gösterin.',
    selector: 'hu-toaster + HuToastService',
    imports: 'HuToaster, HuToastService',
    api: {
      inputs: [['position (hu-toaster)', `'top-right' | 'top-center' | 'bottom-right' | 'bottom-center'`, `'top-right'`, 'Ekrandaki yeri']],
      methods: [
        ['success / info / warning (message, title?)', 'number', '5 sn', 'Bildirim gösterir, id döndürür'],
        ['error(message, title?)', 'number', '8 sn', 'Hata bildirimi'],
        ['show({ message, title?, variant?, duration? })', 'number', '—', 'duration: 0 → kapatılana kadar kalır'],
        ['dismiss(id) / clear()', 'void', '—', 'Bildirimi veya hepsini kapatır'],
      ],
    },
    load: () => import('./pages/toast.doc').then((m) => m.ToastDoc),
  },

  // --- Çekirdek ------------------------------------------------------------------
  {
    slug: 'icon',
    name: 'Icon',
    category: 'Çekirdek',
    icon: 'sun',
    description: 'SVG ikon seti. provideHuIcons ile kendi ikonlarınızı ekleyebilirsiniz.',
    selector: 'hu-icon',
    imports: 'HuIcon',
    api: {
      inputs: [
        ['name', 'string', 'zorunlu', 'İkon adı'],
        ['size', 'number', '18', 'Piksel'],
        ['strokeWidth', 'number', '2', 'Çizgi kalınlığı'],
        ['label', 'string', '—', 'Verilirse ekran okuyucu okur; yoksa dekoratif'],
      ],
    },
    load: () => import('./pages/icon.doc').then((m) => m.IconDoc),
  },
  {
    slug: 'theme',
    name: 'Tema',
    category: 'Çekirdek',
    icon: 'moon',
    description: 'Açık/koyu/sistem teması ve tasarım token’ları. HuThemeService tercihi saklar, hu-theme-toggle geçiş butonudur.',
    selector: 'hu-theme-toggle + HuThemeService',
    imports: 'HuThemeToggle, HuThemeService',
    api: {
      methods: [
        ['mode', `Signal<'light' | 'dark' | 'system'>`, `'system'`, 'Kullanıcının tercihi (saklanır)'],
        ['resolved', `Signal<'light' | 'dark'>`, '—', 'Şu an uygulanan tema'],
        ['setMode(mode)', 'void', '—', 'Tercihi değiştirir'],
        ['toggle()', 'void', '—', 'Açık ↔ koyu'],
      ],
    },
    load: () => import('./pages/theme.doc').then((m) => m.ThemeDoc),
  },
];

export function findDoc(slug: string): DocEntry | undefined {
  return DOCS.find((d) => d.slug === slug);
}

/** "Başlarken" sayfaları: menü ve route'lar bu listeden üretilir. */
const GUIDES = [
  { slug: 'kurulum', name: 'Kurulum', load: () => import('./getting-started/installation.page').then((m) => m.InstallationPage) },
  { slug: 'yapilandirma', name: 'Yapılandırma', load: () => import('./getting-started/configuration.page').then((m) => m.ConfigurationPage) },
  { slug: 'playground', name: 'Playground', load: () => import('./getting-started/playground.page').then((m) => m.PlaygroundPage) },
];

export function gettingStartedNavItem(): HuNavItem {
  return {
    label: 'Başlarken',
    icon: 'home',
    children: GUIDES.map((g) => ({ label: g.name, link: `/baslarken/${g.slug}` })),
  };
}

export function gettingStartedRoutes(): Routes {
  return [
    { path: '', pathMatch: 'full', redirectTo: GUIDES[0].slug },
    ...GUIDES.map((g) => ({
      path: g.slug,
      title: `${g.name} · @ucme-ui/angular`,
      data: { breadcrumb: g.name, section: 'Başlarken' },
      loadComponent: g.load,
    })),
  ];
}

/** Sidebar için: "Componentler" → kategori başlıkları → component sayfaları. */
export function docsNavItem(): HuNavItem {
  return {
    label: 'Componentler',
    icon: 'layers',
    children: [
      { label: 'Tümü', link: '/componentler', exact: true },
      ...DOC_CATEGORIES.map((category) => ({
        label: category,
        children: DOCS.filter((d) => d.category === category).map((d) => ({
          label: d.name,
          link: `/componentler/${d.slug}`,
          badge: d.isNew ? 'Yeni' : undefined,
        })),
      })),
    ],
  };
}

/** /componentler altındaki route'lar (sayfalar ayrı chunk olarak yüklenir). */
export function docsRoutes(): Routes {
  return [
    {
      path: '',
      title: 'Componentler · @ucme-ui/angular',
      data: { breadcrumb: 'Componentler' },
      loadComponent: () => import('./docs-overview.component').then((m) => m.DocsOverview),
    },
    ...DOCS.map((d) => ({
      path: d.slug,
      title: `${d.name} · Componentler`,
      data: { breadcrumb: d.name, section: 'Componentler', sectionLink: '/componentler' },
      loadComponent: d.load,
    })),
  ];
}
