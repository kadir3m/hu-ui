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
  /** [sınıf, —, —, açıklama] */
  classes?: ApiRow[];
  /** [değişken, varsayılan, —, açıklama] */
  cssVars?: ApiRow[];
}

export const DOC_CATEGORIES = ['Yerleşim', 'Form', 'Tarih', 'Veri', 'Panel', 'Medya', 'Navigasyon', 'Geri bildirim', 'Çekirdek'] as const;
export type DocCategory = (typeof DOC_CATEGORIES)[number];

export interface DocEntry {
  slug: string;
  name: string;
  category: DocCategory;
  description: string;
  /** Kullanımdaki etiket/öznitelik (örn. `button[hu-button]`). */
  selector: string;
  /** `import { … } from '@ucme-ui/angular'` satırı. Boşsa (yalnızca CSS) import gerekmez. */
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
  // --- Yerleşim ------------------------------------------------------------------
  {
    slug: 'grid',
    name: 'Grid',
    category: 'Yerleşim',
    icon: 'grid',
    description:
      '12 kolonlu responsive grid. CSS sınıflarıyla kullanılır; kırılımlar ekranın değil grid’in kendi genişliğine göre çalışır, bu yüzden kart ve dialog içinde de doğru davranır.',
    selector: '.hu-grid',
    imports: '',
    api: {
      classes: [
        ['hu-grid', '', '', '12 kolonlu grid kapsayıcısı. Kolon sınıfı verilmeyen öğe tam satır kaplar'],
        ['hu-col-{1-12}', '', '', 'Öğenin kapladığı kolon sayısı (tüm genişliklerde)'],
        ['hu-col-{sm|md|lg|xl}-{1-12}', '', '', 'Grid bu genişlikten büyükse kolon sayısı: sm 480px, md 720px, lg 960px, xl 1200px'],
        ['hu-col-start-{1-12}', '', '', 'Öğenin başladığı kolon (boşluk bırakmak için); kırılımlı hali: hu-col-md-start-4'],
        ['hu-col-{bp}-hidden', '', '', 'O genişlikten itibaren gizler (yalnızca dar alanda görünür)'],
        ['hu-col-{bp}-visible', '', '', 'Yalnızca o genişlikten itibaren görünür (dar alanda gizli)'],
        ['hu-col-hidden', '', '', 'Her zaman gizli'],
        ['hu-grid--auto', '', '', 'Kolon sayısı otomatik: her öğe en az --hu-grid-min genişliğinde (kart listeleri)'],
        ['hu-grid--gap-{none|sm|lg|xl}', '', '', 'Aralık: 0, 0.5rem, 1.5rem, 2rem (varsayılan 1rem)'],
      ],
      cssVars: [
        ['--hu-grid-gap', 'var(--hu-space-4)', '', 'Öğeler arası boşluk'],
        ['--hu-grid-min', '16rem', '', 'hu-grid--auto: öğenin en küçük genişliği'],
      ],
    },
    load: () => import('./pages/grid.doc').then((m) => m.GridDoc),
  },

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
  {
    slug: 'input-number',
    name: 'InputNumber',
    category: 'Form',
    icon: 'plus',
    isNew: true,
    description:
      'Sayı girişi. Türkçe biçimde gösterir (1.234,56), yazarken basamakları gruplar; ok tuşları ve basılı tutulabilen +/− butonlarıyla değer değişir. Para birimi, ön/son ek ve min/max destekler.',
    selector: 'hu-input-number',
    imports: 'HuInputNumber',
    api: {
      inputs: [
        ['min / max', 'number', 'null', 'Sınırlar; dışındaki değer odaktan çıkınca sınıra çekilir, formda min/max hatası verir'],
        ['step', 'number', '1', '↑/↓ ve butonlarla değişim miktarı (Shift ile 10 katı)'],
        ['mode', `'decimal' | 'currency'`, `'decimal'`, 'currency: para birimi simgesi ve 2 ondalık'],
        ['currency', 'string', `'TRY'`, `ISO kodu: 'TRY' → ₺, 'USD' → $, 'EUR' → €`],
        ['minFractionDigits / maxFractionDigits', 'number', 'decimal 0 · currency 2', 'Ondalık basamak sayısı'],
        ['useGrouping', 'boolean', 'true', 'Binlik ayracı (1.234)'],
        ['prefix / suffix', 'string', '—', `Kutudaki sabit metin: '%', 'kg', 'adet'`],
        ['buttons', `'none' | 'stacked' | 'horizontal'`, `'none'`, 'Artır/azalt butonları; basılı tutunca hızlanarak tekrar eder'],
        ['placeholder', 'string', '—', 'Boşken görünen metin'],
        ['size', `'sm' | 'md' | 'lg'`, `'md'`, 'Boyut'],
        ['disabled / readonly', 'boolean', 'false', 'Devre dışı / salt okunur'],
        ['ariaLabel', 'string', '—', 'hu-form-field dışında ekran okuyucu etiketi'],
      ],
      models: [['value', 'number | null', 'null', 'Boş alan null olur (Validators.required ile uyumlu)']],
      methods: [['spin(1 | -1)', 'void', '—', 'Değeri bir adım artırır / azaltır']],
    },
    load: () => import('./pages/input-number.doc').then((m) => m.InputNumberDoc),
  },
  {
    slug: 'multi-select',
    name: 'MultiSelect',
    category: 'Form',
    icon: 'check-circle',
    isNew: true,
    description:
      'Çoklu seçim kutusu: arama (Türkçe karakterleri yok sayar), tümünü seç, gruplar, seçim sınırı. Seçilenler çip veya metin olarak gösterilir.',
    selector: 'hu-multi-select',
    imports: 'HuMultiSelect, HuSelectOption',
    api: {
      inputs: [
        ['options', 'HuSelectOption<T>[]', '[]', '{ label, value, description?, icon?, disabled?, group? }'],
        ['placeholder', 'string', `'Seçin'`, 'Seçim yokken görünen metin'],
        ['filter', 'boolean', 'true', 'Panelde arama kutusu ("ogr" → "Öğrenci")'],
        ['showSelectAll', 'boolean', 'true', 'Tümünü seç kutusu (aramaya uyanlar için; selectionLimit varken gizli)'],
        ['showClear', 'boolean', 'true', 'Seçimi temizleyen ✕'],
        ['display', `'chips' | 'text'`, `'chips'`, 'Seçilenlerin gösterimi'],
        ['maxSelectedLabels', 'number', '3', 'Bundan fazlasında "5 seçildi" yazılır'],
        ['selectionLimit', 'number', 'null', 'En fazla seçim sayısı'],
        ['compareWith', '(a, b) => boolean', 'Object.is', 'Nesne değerlerde eşitlik: (a, b) => a.id === b.id'],
        ['emptyMessage', 'string', `'Sonuç bulunamadı'`, 'Arama sonucu boşken'],
        ['size / disabled / ariaLabel', '—', '—', 'Diğer form kontrolleriyle aynı'],
      ],
      models: [['value', 'T[]', '[]', 'Seçilen değerler (seçenek sırasıyla)']],
      outputs: [['closed', 'void', '—', 'Panel kapanınca']],
      methods: [['show() / close() / toggle()', 'void', '—', 'Paneli aç / kapat']],
    },
    load: () => import('./pages/multi-select.doc').then((m) => m.MultiSelectDoc),
  },
  {
    slug: 'password',
    name: 'Password',
    category: 'Form',
    icon: 'lock',
    isNew: true,
    description: 'Şifre girişi: göster/gizle, 4 seviyeli güç göstergesi, canlı kural listesi ve Caps Lock uyarısı. minStrength ile zayıf şifreye form hatası.',
    selector: 'hu-password',
    imports: 'HuPassword',
    api: {
      inputs: [
        ['toggleMask', 'boolean', 'true', 'Göz ikonuyla göster/gizle'],
        ['feedback', 'boolean', 'false', 'Güç göstergesi (Çok zayıf → Güçlü)'],
        ['showRules / rulesAlways', 'boolean', 'false', 'Kural listesi / alan boşken de göster'],
        ['rules', 'HuPasswordRule[]', 'HU_PASSWORD_RULES', '{ label, test(value) } — 8 karakter, büyük/küçük harf, rakam, sembol'],
        ['minStrength', 'number (0–4)', '0', 'Bundan zayıfsa huPasswordWeak hatası'],
        ['autocomplete', "'current-password' | 'new-password' | 'off'", "'current-password'", 'Tarayıcı / şifre yöneticisi ipucu'],
        ['placeholder / size / disabled / ariaLabel', '—', '—', 'Diğer form kontrolleriyle aynı'],
      ],
      models: [['value', 'string', "''", 'Şifre']],
      methods: [['huPasswordStrength(value)', 'number', '—', '0–4 güç puanı (kendi kontrolleriniz için)']],
    },
    load: () => import('./pages/password.doc').then((m) => m.PasswordDoc),
  },
  {
    slug: 'input-mask',
    name: 'InputMask',
    category: 'Form',
    icon: 'grid',
    isNew: true,
    description: 'Input maskesi: telefon, tarih, T.C. kimlik no, IBAN, kart. Yazarken biçimler, yapıştırmayı düzeltir, sabit karakterlerin üzerinden silmeyi bilir. Eksik girişte form hatası.',
    selector: 'input[huMask]',
    imports: 'HuInputMask, HU_MASKS',
    api: {
      inputs: [
        ['huMask', 'string', 'zorunlu', "9 rakam · a harf · * harf/rakam · diğerleri sabit. Hazırlar: HU_MASKS.phone, date, time, tckn, iban, card…"],
        ['unmask', 'boolean', 'false', "Forma yalnızca girilen karakterler ('5551234567')"],
        ['uppercase', 'boolean', 'true', 'Harfleri büyük yaz'],
        ['placeholder / slotChar', 'string', "maskeden · '_'", "Boşken örnek: (___) ___ __ __"],
      ],
      methods: [
        ['huMask hatası', 'ValidationErrors', '—', 'Değer eksikse { huMask: { mask } } — mesaj: Eksik veya hatalı giriş.'],
        ['complete', 'boolean', '—', 'Tüm alanlar dolu mu (exportAs: huMask)'],
      ],
    },
    load: () => import('./pages/input-mask.doc').then((m) => m.InputMaskDoc),
  },
  {
    slug: 'radio',
    name: 'RadioButton',
    category: 'Form',
    icon: 'check-circle',
    isNew: true,
    description: 'Radyo düğmesi grubu: tek seçim, ok tuşlarıyla gezinme, yatay/dikey ve açıklamalı kart görünümü. Seçenekler options ile veya hu-radio olarak verilir.',
    selector: 'hu-radio-group, hu-radio',
    imports: 'HU_RADIO_IMPORTS, HuRadioOption',
    api: {
      inputs: [
        ['options', 'HuRadioOption<T>[]', '[]', '{ label, value, description?, disabled? }'],
        ['orientation', "'vertical' | 'horizontal'", "'vertical'", 'Yerleşim'],
        ['variant', "'default' | 'card'", "'default'", 'card: çerçeveli, açıklamalı seçenekler'],
        ['disabled / required', 'boolean', 'false', 'Grup durumu'],
        ['compareWith', '(a, b) => boolean', 'Object.is', 'Nesne değerlerde eşitlik'],
        ['hu-radio: value / description / disabled', '—', '—', 'Tek seçenek'],
      ],
      models: [['value', 'T | null', 'null', 'Seçilen değer']],
    },
    load: () => import('./pages/radio.doc').then((m) => m.RadioDoc),
  },
  {
    slug: 'rating',
    name: 'Rating',
    category: 'Form',
    icon: 'star',
    isNew: true,
    description: 'Yıldızla puanlama: üzerine gelince önizleme, tekrar tıklayınca temizleme, ok tuşlarıyla puan. Salt okunurda ondalık ortalamalar kısmi dolu yıldızla gösterilir.',
    selector: 'hu-rating',
    imports: 'HuRating',
    api: {
      inputs: [
        ['max', 'number', '5', 'Yıldız sayısı'],
        ['readonly', 'boolean', 'false', 'Gösterim (4,6 gibi ondalık değerler)'],
        ['clearable', 'boolean', 'true', 'Seçili yıldıza tekrar tıklayınca 0'],
        ['showLabel / labels', 'boolean / string[]', "false / ['Çok kötü' … 'Çok iyi']", 'Yanında etiket; labels boşsa "4 / 5"'],
        ['size', "'sm' | 'md' | 'lg'", "'md'", 'Boyut'],
        ['disabled / ariaLabel', '—', "false / 'Puan'", 'Durum / ekran okuyucu adı'],
      ],
      models: [['value', 'number', '0', '0 = puan yok']],
    },
    load: () => import('./pages/rating.doc').then((m) => m.RatingDoc),
  },
  {
    slug: 'file-upload',
    name: 'FileUpload',
    category: 'Form',
    icon: 'upload',
    isNew: true,
    description:
      'Sürükle-bırak destekli dosya seçme alanı. Tür, boyut ve adet kontrolü yapar; görselleri önizler. İsterseniz dosyaları ilerleme çubuğuyla hemen sunucuya yükler.',
    selector: 'hu-file-upload',
    imports: 'HuFileUpload',
    api: {
      inputs: [
        ['accept', 'string', `''`, `Kabul edilen türler: 'image/*,.pdf'`],
        ['multiple', 'boolean', 'false', 'Birden çok dosya; kapalıyken yeni dosya eskisinin yerine geçer'],
        ['maxFileSize', 'number (bayt)', 'null', 'Dosya başına en büyük boyut'],
        ['maxFiles', 'number', 'null', 'En fazla dosya sayısı'],
        ['uploader', '(file, progress) => Promise', 'null', 'Verilirse dosyalar eklenince yüklenir; satırda ilerleme ve tekrar dene gösterilir'],
        ['label', 'string', `'Dosyaları buraya sürükleyin veya'`, 'Alandaki metin'],
        ['hint', 'string', 'otomatik', 'Alt bilgi; verilmezse accept ve boyuttan üretilir'],
        ['preview', 'boolean', 'true', 'Görseller için küçük önizleme'],
        ['disabled', 'boolean', 'false', 'Devre dışı'],
      ],
      models: [['files', 'File[]', '[]', 'Seçilen dosyalar (formControlName ile de çalışır)']],
      outputs: [
        ['rejected', 'HuFileRejection[]', '—', `Kurala uymayan dosyalar (reason: 'type' | 'size' | 'count')`],
        ['uploaded', '{ file, result }', '—', 'uploader başarıyla bitince'],
        ['uploadError', '{ file, error }', '—', 'uploader hata verince'],
        ['removed', 'File', '—', 'Kullanıcı listeden kaldırınca'],
      ],
      methods: [
        ['browse()', 'void', '—', 'Dosya seçme penceresini açar'],
        ['clear()', 'void', '—', 'Tüm dosyaları kaldırır'],
        ['formatFileSize(bytes)', 'string', '—', `1536 → '1,5 KB'`],
      ],
    },
    load: () => import('./pages/file-upload.doc').then((m) => m.FileUploadDoc),
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

  {
    slug: 'agenda',
    name: 'Agenda',
    category: 'Tarih',
    icon: 'calendar',
    isNew: true,
    description:
      'Ajanda / takvim: ay, hafta, gün ve liste görünümleri. Boş alana tıklayarak veya sürükleyerek randevu ekleyin; kayıtları sürükleyerek taşıyın, süresini değiştirin. Yerleşik form, türler ve filtre, çakışan kayıtların yan yana dizilmesi, şu an çizgisi.',
    selector: 'hu-agenda',
    imports: 'HuAgenda, HuAgendaEvent',
    api: {
      inputs: [
        ['views', 'HuAgendaView[]', '["month", "week", "day", "list"]', 'Görünüm seçicideki görünümler'],
        ['categories', 'HuAgendaCategory[]', 'Randevu, Toplantı, Ders, Hatırlatma, Kişisel', 'Türler: { key, label, color }; renk ve filtre'],
        ['editable', 'boolean', 'true', 'Ekleme, sürükleme, düzenleme'],
        ['editor', 'boolean', 'true', 'Yerleşik form; false ise slotSelect / eventClick ile kendi formunuz'],
        ['weekends', 'boolean', 'true', 'Hafta görünümünde cumartesi-pazar'],
        ['slotMinutes / snapMinutes', 'number', '30 / 15', 'Izgara çizgisi / sürükleme adımı (dk)'],
        ['hourHeight', 'number', '48', 'Bir saatin yüksekliği (px)'],
        ['businessHours', '{ start, end } | null', '{ start: 8, end: 18 }', 'Gösterilen saat aralığı; dışı gizlenir (dışında kayıt varsa ızgara genişler). null → 24 saat'],
        ['scrollToHour', 'number', '8', 'Açılışta kaydırılan saat'],
        ['maxPerDay', 'number', '3', 'Ay görünümünde günde en çok kayıt'],
        ['listDays', 'number', '30', 'Liste görünümünün kapsadığı gün'],
      ],
      models: [
        ['events', 'HuAgendaEvent[]', '[]', '{ id, title, start, end, allDay?, category?, color?, location?, description?, readonly?, data? }'],
        ['view', '\'month\' | \'week\' | \'day\' | \'list\'', '\'week\'', 'Görünüm'],
        ['date', 'Date', 'bugün', 'Gösterilen tarih'],
      ],
      outputs: [
        ['eventCreate / eventDelete', 'HuAgendaEvent', '—', 'Formdan eklenince / silinince'],
        ['eventUpdate', '{ event, previous, kind }', '—', 'kind: move | resize | edit'],
        ['eventClick', 'HuAgendaEvent', '—', 'Kayda tıklanınca'],
        ['slotSelect', '{ start, end, allDay }', '—', 'Boş alana tıklanınca / sürükleyerek seçilince'],
        ['rangeChange', '{ start, end }', '—', 'Görünen aralık değişince (sunucudan yüklemek için)'],
      ],
      methods: [['today() / previous() / next()', 'void', '—', 'Gezinme (template referansıyla)']],
    },
    load: () => import('./pages/agenda.doc').then((m) => m.AgendaDoc),
  },

  // --- Veri ----------------------------------------------------------------------
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
    isNew: true,
    description:
      'Veri tablosu: arama, sütun seçici (göster/gizle, sırala), sıralama, çoklu/tekli seçim ve toplu işlem, açılır satır detayı, sayfalama, CSV dışa aktarma, alt toplam, sabit sütunlar, mobilde kart görünümü. Dört tasarım: default, bordered, card, minimal.',
    selector: 'hu-table',
    imports: 'HU_TABLE_IMPORTS, HuColumn',
    api: {
      inputs: [
        ['columns', 'HuColumn<T>[]', 'zorunlu', 'Sütun tanımları (aşağıdaki HuColumn alanları)'],
        ['data', 'T[]', '[]', 'Satırlar'],
        ['trackBy', '(row: T) => unknown', 'satırın kendisi', 'Satır kimliği: seçim ve detay için verin, örn. (u) => u.id'],
        ['variant', `'default' | 'bordered' | 'card' | 'minimal'`, `'default'`, 'Tasarım'],
        ['size', `'sm' | 'md' | 'lg'`, `'md'`, 'Satır yüksekliği'],
        ['striped / hoverable / stickyHeader', 'boolean', 'false / true / false', 'Görünüm seçenekleri'],
        ['nowrap', 'boolean', 'false', 'Hücreler satır kırmaz; geniş tablo yatay kayar'],
        ['responsive', `'scroll' | 'stack'`, `'scroll'`, 'stack: 640px altında her satır kart olur'],
        ['title', 'string', '—', 'Araç çubuğunun solunda başlık'],
        ['searchable / searchPlaceholder', 'boolean / string', 'false', 'Genel arama (Türkçe karakterleri yok sayar)'],
        ['columnToggle', 'boolean', 'false', 'Sütun seçici: göster/gizle ve sırala'],
        ['exportable / exportFileName', 'boolean / string', `false / 'tablo'`, 'CSV indir (filtrelenmiş tüm satırlar)'],
        ['stateKey', 'string', '—', 'Gizli sütunlar, sıra ve sayfa boyutu tarayıcıda saklanır'],
        ['selectionMode', `'none' | 'single' | 'multiple'`, `'none'`, 'Satır seçimi'],
        ['multiExpand', 'boolean', 'true', 'Birden çok satır detayı açık olabilir'],
        ['paginator / pageSizeOptions', 'boolean / number[]', 'false / [10, 25, 50]', 'Dahili sayfalama'],
        ['lazy / totalRecords', 'boolean / number', 'false', 'Sunucu tarafı: arama, sıralama, sayfalama tabloda yapılmaz'],
        ['loading / emptyText', 'boolean / string', `false / 'Kayıt bulunamadı.'`, 'Durumlar'],
        ['clickableRows', 'boolean', 'false', 'Satır tıklaması (rowClick)'],
        ['contextMenu', 'HuDropdownEntry[] | (row, rows) => HuDropdownEntry[]', 'null', 'Sağ tık menüsü (klavye: menü tuşu / Shift+F10, dokunmatik: uzun basma). null → tarayıcının menüsü'],
      ],
      models: [
        ['sort', 'HuSort', `{ key: '', direction: '' }`, 'Artan → azalan → sırasız'],
        ['search', 'string', `''`, 'Arama metni'],
        ['selection', 'T[]', '[]', 'Seçilen satırlar'],
        ['pageIndex / pageSize', 'number', '0 / 10', 'Sayfalama'],
        ['hiddenColumns', 'string[] | null', 'column.hidden', 'Gizli sütun anahtarları'],
        ['columnOrder', 'string[] | null', 'columns sırası', 'Sütun sırası'],
      ],
      outputs: [
        ['rowClick', 'T', '—', 'Satıra tıklanınca (clickableRows açıkken)'],
        ['contextMenuSelect', '{ option, row, rows }', '—', 'Sağ tık menüsünden seçim; rows: seçili satıra tıklandıysa tüm seçim'],
      ],
      methods: [
        ['exportCsv()', 'void', '—', 'CSV indir (Excel için ; ayırıcı, UTF-8)'],
        ['clearSelection() / resetColumns()', 'void', '—', 'Seçimi / sütun düzenini sıfırla'],
        ['HuColumn.hideable / hidden', 'boolean', 'true / false', 'Sütun seçicide gizlenebilir / başta gizli'],
        ['HuColumn.sticky', `'start' | 'end'`, '—', 'Yatay kaydırmada sabit sütun'],
        ['HuColumn.footer', 'string | (rows) => unknown', '—', 'Alt toplam satırı'],
        ['HuColumn.searchable / exportable', 'boolean', 'true', 'Aramaya / CSV\'ye dahil'],
      ],
      slots: [
        ['ng-template[huCell]', '—', '—', 'Özel hücre: huCell="sütunAnahtarı" let-row'],
        ['ng-template[huRowDetail]', '—', '—', 'Açılır satır detayı: let-row'],
        ['huTableToolbar', '—', '—', 'Araç çubuğunun sağına butonlar'],
        ['huTableBulkActions', '—', '—', 'Satır seçiliyken görünen toplu işlem butonları'],
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

  {
    slug: 'timeline',
    name: 'Timeline',
    category: 'Veri',
    icon: 'clock',
    isNew: true,
    description: 'Zaman çizelgesi: süreç adımları, geçmiş, sipariş durumu. Dikey (sağ, sol, dönüşümlü) veya yatay; tamamlanan / şu anki / bekleyen adımlar ayrı işaretlenir. İçerik, karşı taraf ve işaret şablonla özelleştirilir.',
    selector: 'hu-timeline',
    imports: 'HU_TIMELINE_IMPORTS',
    api: {
      inputs: [
        ['events', 'T[] (varsayılan HuTimelineEvent[])', '[]', 'Olaylar: { title, description?, date?, icon?, color?, status? }'],
        ['layout', `'vertical' | 'horizontal'`, `'vertical'`, 'Yön'],
        ['align', `'right' | 'left' | 'alternate'`, `'right'`, 'Dikeyde içeriğin yeri; alternate sırayla iki yana (dar alanda tek sütun)'],
        ['opposite', 'boolean | null', 'null', 'Tarihi karşı tarafta göster; null: dikeyde ve tarih varsa açık'],
        ['events[].color', "'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'", "'primary'", 'İşaret ve çizgi rengi'],
        ['events[].status', "'done' | 'current' | 'todo'", "'done'", 'Dolu, halkalı veya boş işaret'],
      ],
      slots: [
        ['ng-template huTimelineContent', 'let-e, let-index', '—', 'Olay içeriği'],
        ['ng-template huTimelineOpposite', 'let-e, let-index', '—', 'Karşı taraf (tarih yerine)'],
        ['ng-template huTimelineMarker', 'let-e, let-index', '—', 'İşaret (daire yerine avatar vb.)'],
      ],
    },
    load: () => import('./pages/timeline.doc').then((m) => m.TimelineDoc),
  },
  {
    slug: 'tree',
    name: 'Tree',
    category: 'Veri',
    icon: 'git-branch',
    isNew: true,
    description: 'Ağaç: klasörler, birim hiyerarşisi, yetki atama. Tekli / çoklu / onay kutulu seçim (kısmi seçim üst düğümlere yansır), arama, tembel yükleme ve WAI-ARIA tree klavye desteği.',
    selector: 'hu-tree',
    imports: 'HU_TREE_IMPORTS',
    api: {
      inputs: [
        ['nodes', 'HuTreeNode<T>[]', '[]', '{ key, label, icon?, expandedIcon?, children?, leaf?, disabled?, selectable?, data? }'],
        ['selectionMode', `'none' | 'single' | 'multiple' | 'checkbox'`, `'none'`, 'Seçim türü'],
        ['propagate', 'boolean', 'true', 'Onay kutulu modda seçim alt / üst düğümlere yayılır'],
        ['filter / filterPlaceholder', 'boolean / string', `false / 'Ara…'`, 'Arama kutusu; eşleşenlerin üstleri açılır, eşleşme vurgulanır'],
        ['loadChildren', '(node) => Promise<HuTreeNode[]>', 'null', 'leaf: false olan düğüm açılınca çağrılır'],
        ['ariaLabel / emptyMessage', 'string', `'Ağaç' / 'Sonuç bulunamadı'`, 'Erişilebilir ad / boş arama metni'],
      ],
      models: [
        ['selection', 'HuTreeKey[]', '[]', 'Seçili anahtarlar (checkbox modda tamamı seçili üst düğümler dahil)'],
        ['expanded', 'HuTreeKey[]', '[]', 'Açık düğümler'],
      ],
      outputs: [
        ['nodeSelect / nodeUnselect', 'HuTreeNode', '—', 'Seçim değişti'],
        ['nodeExpand / nodeCollapse', 'HuTreeNode', '—', 'Düğüm açıldı / kapandı'],
      ],
      methods: [
        ['expandAll()', 'void', '—', 'Yüklenmiş tüm dalları açar'],
        ['collapseAll()', 'void', '—', 'Tümünü kapatır'],
        ['expand(node) / collapse(node) / toggle(node)', 'void', '—', 'Tek düğüm'],
      ],
      slots: [['ng-template huTreeNode', 'let-node, let-level, let-expanded', '—', 'Düğüm içeriği (ikon + etiket yerine)']],
    },
    load: () => import('./pages/tree.doc').then((m) => m.TreeDoc),
  },
  {
    slug: 'picklist',
    name: 'PickList',
    category: 'Veri',
    icon: 'chevrons-right',
    isNew: true,
    description: 'İki liste arasında öğe taşıma: ders seçimi, yetki ve sütun atama. Ctrl/Shift ile çoklu seçim, çift tıkla taşıma, liste başına arama ve hedef listede sıralama.',
    selector: 'hu-picklist',
    imports: 'HU_PICKLIST_IMPORTS',
    api: {
      inputs: [
        ['sourceHeader / targetHeader', 'string', `'Seçilebilir' / 'Seçilen'`, 'Liste başlıkları'],
        ['optionLabel', 'string | (item) => string', 'null', 'Nesnelerde etiket alanı; yoksa String(item)'],
        ['dataKey', 'string', 'null', 'Takip anahtarı alanı (yoksa nesnenin kendisi)'],
        ['filter / filterPlaceholder', 'boolean / string', `false / 'Ara…'`, 'Liste başına arama'],
        ['reorder', 'boolean', 'false', 'Hedef listede en üste / yukarı / aşağı / en alta'],
        ['listHeight', 'string', `'16rem'`, 'Liste yüksekliği'],
        ['disabled / emptyMessage', 'boolean / string', `false / 'Öğe yok'`, 'Durum / boş liste metni'],
      ],
      models: [
        ['source', 'T[]', '[]', 'Sol liste'],
        ['target', 'T[]', '[]', 'Sağ liste (seçilenler)'],
      ],
      outputs: [['moved', '{ items, from, to }', '—', 'Öğeler taşındı']],
      methods: [
        ['moveSelected(from)', 'void', '—', `Seçilenleri karşıya taşır ('source' | 'target')`],
        ['moveAll(from)', 'void', '—', 'Görünen (aramaya uyan) tümünü taşır'],
      ],
      slots: [['ng-template huPickListItem', 'let-item, let-side, let-selected', '—', 'Öğe içeriği']],
    },
    load: () => import('./pages/picklist.doc').then((m) => m.PickListDoc),
  },
  {
    slug: 'org-chart',
    name: 'OrganizationChart',
    category: 'Veri',
    icon: 'sitemap',
    isNew: true,
    description: 'Organizasyon şeması: hiyerarşik kartlar ve bağlantı çizgileri. Alt dallar katlanabilir, kartlar seçilebilir, içerik şablonla özelleştirilir; geniş şemalar yatay kaydırılır.',
    selector: 'hu-org-chart',
    imports: 'HU_ORG_CHART_IMPORTS',
    api: {
      inputs: [
        ['value', 'HuOrgChartNode | HuOrgChartNode[]', 'null', 'Kök (veya kökler): { key, label, title?, image?, avatar?, icon?, color?, children?, selectable?, data? }'],
        ['selectionMode', `'none' | 'single' | 'multiple'`, `'none'`, 'Kart seçimi'],
        ['collapsible', 'boolean', 'true', 'Alt dalları katlama düğmesi'],
        ['compact', 'boolean', 'false', 'Daha dar kart ve aralıklar'],
        ['ariaLabel', 'string', `'Organizasyon şeması'`, 'Erişilebilir ad'],
      ],
      models: [
        ['selection', 'HuOrgChartKey[]', '[]', 'Seçili kartlar'],
        ['collapsed', 'HuOrgChartKey[]', '[]', 'Katlanmış düğümler'],
      ],
      outputs: [['nodeSelect / nodeUnselect', 'HuOrgChartNode', '—', 'Seçim değişti']],
      methods: [
        ['toggle(node)', 'void', '—', 'Alt dalı aç / kapat'],
        ['expandAll()', 'void', '—', 'Tümünü açar'],
        ['collapseFrom(level = 2)', 'void', '—', 'Bu seviyeden (1 = kök) itibaren katlar'],
      ],
      slots: [['ng-template huOrgChartNode', 'let-node, let-selected, let-collapsed, let-level', '—', 'Kart içeriği']],
      cssVars: [
        ['--hu-org-chart-node-width', '11rem', '', 'Kart genişliği (compact: 8.5rem)'],
        ['--hu-org-chart-line', 'var(--hu-border-strong)', '', 'Bağlantı çizgisi rengi'],
      ],
    },
    load: () => import('./pages/org-chart.doc').then((m) => m.OrgChartDoc),
  },

  // --- Panel ---------------------------------------------------------------------
  {
    slug: 'accordion',
    name: 'Accordion',
    category: 'Panel',
    icon: 'chevrons-up-down',
    isNew: true,
    description: 'Açılır paneller: SSS, ayar grupları, filtreler. Tek veya çoklu açık panel, ikon / alt başlık / sağ slot, üç görünüm; başlıklar arasında ok tuşlarıyla gezinme.',
    selector: 'hu-accordion',
    imports: 'HU_ACCORDION_IMPORTS',
    api: {
      inputs: [
        ['multiple (hu-accordion)', 'boolean', 'false', 'Birden çok panel açık kalabilir'],
        ['variant (hu-accordion)', `'default' | 'separated' | 'flush'`, `'default'`, 'Çerçeveli, aralıklı kartlar veya çerçevesiz'],
        ['header (panel)', 'string', 'zorunlu', 'Başlık'],
        ['subtitle / icon (panel)', 'string', '—', 'Alt başlık / ikon'],
        ['value (panel)', 'string | number', 'sırası', 'Paneli takip anahtarı'],
        ['disabled (panel)', 'boolean', 'false', 'Açılamaz'],
      ],
      models: [['value (hu-accordion)', '(string | number)[]', '[]', 'Açık panellerin anahtarları']],
      methods: [
        ['toggle(key)', 'void', '—', 'Paneli aç / kapat'],
        ['expandAll()', 'void', '—', 'Tümünü açar (multiple)'],
        ['collapseAll()', 'void', '—', 'Tümünü kapatır'],
      ],
      slots: [['[huAccordionHeaderEnd]', '—', '—', 'Başlığın sağı (rozet, sayaç)']],
    },
    load: () => import('./pages/accordion.doc').then((m) => m.AccordionDoc),
  },
  {
    slug: 'card',
    name: 'Card',
    category: 'Panel',
    icon: 'layers',
    description: 'İçerik kartı: başlık, aksiyonlar, kapak görseli ve alt bilgi alanı; dört görünüm ve tıklanabilir kartlar için hover efekti.',
    selector: 'hu-card',
    imports: 'HU_CARD_IMPORTS',
    api: {
      inputs: [
        ['title', 'string', '—', 'Başlık'],
        ['subtitle', 'string', '—', 'Başlığın altındaki küçük metin'],
        ['padding', `'none' | 'sm' | 'md'`, `'md'`, 'İçerik boşluğu (none: tablo gibi kenara dayanan içerik)'],
        ['variant', `'outlined' | 'elevated' | 'flat' | 'soft'`, `'outlined'`, 'Görünüm'],
        ['hoverable', 'boolean', 'false', 'Üzerine gelince öne çıkar'],
      ],
      slots: [
        ['huCardMedia', '—', '—', 'Kartın üstünde kenarlara dayanan görsel'],
        ['huCardActions', '—', '—', 'Başlığın sağı'],
        ['huCardFooter', '—', '—', 'Kartın altı'],
      ],
    },
    load: () => import('./pages/card.doc').then((m) => m.CardDoc),
  },
  {
    slug: 'divider',
    name: 'Divider',
    category: 'Panel',
    icon: 'minus',
    isNew: true,
    description: 'Ayırıcı çizgi: yatay veya dikey, isteğe bağlı metinli (“veya”), düz / kesikli / noktalı.',
    selector: 'hu-divider',
    imports: 'HuDivider',
    api: {
      inputs: [
        ['layout', `'horizontal' | 'vertical'`, `'horizontal'`, 'Yön'],
        ['align', `'start' | 'center' | 'end'`, `'center'`, 'Metnin konumu'],
        ['type', `'solid' | 'dashed' | 'dotted'`, `'solid'`, 'Çizgi türü'],
      ],
      slots: [['içerik', '—', '—', 'Çizginin üstündeki metin']],
    },
    load: () => import('./pages/divider.doc').then((m) => m.DividerDoc),
  },
  {
    slug: 'fieldset',
    name: 'Fieldset',
    category: 'Panel',
    icon: 'file-text',
    isNew: true,
    description: 'Başlıklı alan grubu (native fieldset). Açılır kapanır olabilir; disabled içindeki tüm kontrolleri birden devre dışı bırakır.',
    selector: 'hu-fieldset',
    imports: 'HuFieldset',
    api: {
      inputs: [
        ['legend', 'string', 'zorunlu', 'Başlık'],
        ['icon', 'string', '—', 'Başlıktaki ikon'],
        ['toggleable', 'boolean', 'false', 'Başlığa tıklayınca açılıp kapanır'],
        ['disabled', 'boolean', 'false', 'İçindeki tüm form kontrollerini devre dışı bırakır'],
      ],
      models: [['collapsed', 'boolean', 'false', 'Kapalı mı (içerik DOM’da kalır)']],
    },
    load: () => import('./pages/fieldset.doc').then((m) => m.FieldsetDoc),
  },

  // --- Medya ---------------------------------------------------------------------
  {
    slug: 'carousel',
    name: 'Carousel',
    category: 'Medya',
    icon: 'play',
    isNew: true,
    description: 'Kayan içerik: afişler, ürün / haber kartları. Aynı anda birden çok öğe, genişliğe göre öğe sayısı, döngü, otomatik geçiş (durdurulabilir), noktalı gösterge, klavye ve kaydırma hareketi.',
    selector: 'hu-carousel',
    imports: 'HU_CAROUSEL_IMPORTS',
    api: {
      inputs: [
        ['items', 'T[]', '[]', 'Öğeler'],
        ['numVisible', 'number', '1', 'Aynı anda görünen öğe'],
        ['numScroll', 'number | null', 'numVisible', 'Bir adımda kayan öğe'],
        ['breakpoints', '{ minWidth, numVisible, numScroll? }[]', '[]', 'Carousel’in kendi genişliğine göre öğe sayısı'],
        ['circular', 'boolean', 'true', 'Sondan başa döner'],
        ['autoplay', 'number (ms)', '0', 'Otomatik geçiş; üzerine gelince / odaklanınca durur, durdur düğmesi çıkar'],
        ['showIndicators / showNavigators', 'boolean', 'true', 'Noktalar / önceki-sonraki düğmeleri'],
        ['ariaLabel', 'string', `'Carousel'`, 'Erişilebilir ad'],
      ],
      models: [['page', 'number', '0', 'Geçerli sayfa']],
      methods: [['next() / prev()', 'void', '—', 'Sonraki / önceki sayfa']],
      slots: [['ng-template huCarouselItem', 'let-item, let-index', '—', 'Öğe içeriği ([huCarouselItemOf] ile tip çıkarılır)']],
    },
    load: () => import('./pages/carousel.doc').then((m) => m.CarouselDoc),
  },
  {
    slug: 'gallery',
    name: 'Galleria',
    category: 'Medya',
    icon: 'image',
    isNew: true,
    description: 'Fotoğraf galerisi: ana görsel + küçük resim şeridi veya ızgara. Tam ekran lightbox ile yakınlaştırma, kaydırma, döndürme, klavye ve kaydırma hareketiyle gezinme.',
    selector: 'hu-gallery',
    imports: 'HuGallery',
    api: {
      inputs: [
        ['images', 'HuMediaImage[]', '[]', '{ src, thumbnail?, alt, caption?, description? }'],
        ['mode', `'inline' | 'grid'`, `'inline'`, 'Ana görsel + şerit veya ızgara'],
        ['showThumbnails', 'boolean', 'true', 'Küçük resim şeridi (inline)'],
        ['fullscreen', 'boolean', 'true', 'Tam ekran (lightbox) düğmesi'],
        ['minColumnWidth', 'string', `'10rem'`, 'Izgarada döşeme genişliği'],
        ['ariaLabel', 'string', `'Galeri'`, 'Erişilebilir ad'],
        ['images / loop / rotatable (hu-lightbox)', 'HuMediaImage[] / boolean', '[] / true / true', 'Lightbox tek başına da kullanılabilir'],
      ],
      models: [
        ['activeIndex', 'number', '0', 'Seçili görsel'],
        ['open / index (hu-lightbox)', 'boolean / number', 'false / 0', 'Lightbox açık mı / görsel'],
      ],
      methods: [['go(step)', 'void', '—', 'İleri / geri (±1)']],
    },
    load: () => import('./pages/gallery.doc').then((m) => m.GalleryDoc),
  },
  {
    slug: 'image',
    name: 'Image',
    category: 'Medya',
    icon: 'file-image',
    isNew: true,
    description: 'Görsel: yüklenirken iskelet, hata durumunda yedek görsel veya yer tutucu, tembel yükleme ve tıklayınca yakınlaştırılabilir önizleme.',
    selector: 'hu-image',
    imports: 'HuImage',
    api: {
      inputs: [
        ['src', 'string', 'zorunlu', 'Görsel adresi'],
        ['alt', 'string', `''`, 'Alternatif metin (süs görselinde boş)'],
        ['preview / previewSrc', 'boolean / string', 'false / src', 'Tıklayınca lightbox; önizlemede farklı (büyük) dosya'],
        ['caption', 'string', '—', 'Görselin altında ve önizlemede gösterilen alt yazı'],
        ['width / height', 'number | string', '—', 'Boyut (yer ayırır, sayfa kayması olmaz)'],
        ['fit', `'cover' | 'contain'`, `'cover'`, 'Sığdırma'],
        ['rounded', 'boolean', 'true', 'Yuvarlak köşe'],
        ['lazy', 'boolean', 'true', 'Ekrana gelince yükle'],
        ['fallback', 'string', '—', 'Yüklenemezse gösterilecek görsel'],
      ],
    },
    load: () => import('./pages/image.doc').then((m) => m.ImageDoc),
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
    slug: 'stepper',
    name: 'Stepper',
    category: 'Navigasyon',
    icon: 'list-ordered',
    isNew: true,
    description:
      'Çok adımlı formlar ve sihirbazlar. Yatay veya dikey; linear modda bir adım tamamlanmadan sonrakine geçilemez.',
    selector: 'hu-stepper, hu-step',
    imports: 'HU_STEPPER_IMPORTS',
    api: {
      inputs: [
        ['orientation', `'horizontal' | 'vertical'`, `'horizontal'`, 'Yerleşim; dar alanda yatayda yalnızca aktif adımın adı görünür'],
        ['linear', 'boolean', 'false', 'Adımlar sırayla tamamlanmalı'],
        ['hu-step: label', 'string', '—', 'Adım adı (zorunlu)'],
        ['hu-step: description', 'string', '—', 'Adın altındaki küçük açıklama'],
        ['hu-step: completed', 'boolean', 'ziyarete göre', 'Tamamlandı mı? linear modda false ise ileri geçilmez'],
        ['hu-step: error', 'boolean', 'false', 'Adımı hatalı (kırmızı) gösterir'],
        ['hu-step: optional', 'boolean', 'false', 'İsteğe bağlı; linear modda atlanabilir'],
        ['hu-step: icon / disabled', 'string / boolean', '—', 'Numara yerine ikon / tıklanamaz adım'],
      ],
      models: [['activeIndex', 'number', '0', 'Aktif adım']],
      outputs: [['blocked', 'number', '—', 'Linear modda tamamlanmamış adımdan ileri gidilmek istenince (adımın index’i)']],
      methods: [
        ['next() / previous()', 'void', '—', 'Template referansıyla: #stepper → stepper.next()'],
        ['select(index) / reset()', 'void', '—', 'Adıma git / başa dön'],
        ['huStepperNext / huStepperPrevious', 'button direktifi', '—', 'Tıklanınca ileri / geri'],
      ],
    },
    load: () => import('./pages/stepper.doc').then((m) => m.StepperDoc),
  },
  {
    slug: 'context-menu',
    name: 'ContextMenu',
    category: 'Navigasyon',
    icon: 'more-vertical',
    isNew: true,
    description:
      'Sağ tık menüsü. Herhangi bir elemente direktifle eklenir; klavyeden (menü tuşu, Shift+F10) ve dokunmatikte uzun basmayla da açılır. Tabloda satır menüsü için hu-table [contextMenu] kullanın.',
    selector: '[huContextMenu]',
    imports: 'HuContextMenu, HuContextMenuService',
    api: {
      inputs: [
        ['huContextMenu', 'HuDropdownEntry[] | null', '—', 'Menü öğeleri (dropdown ile aynı: label, value, icon, description, shortcut, disabled, danger, link, divider, header). Boş/null → tarayıcının menüsü'],
        ['huContextMenuDisabled', 'boolean', 'false', 'Geçici olarak kapat'],
        ['huContextMenuLabel', 'string', 'İşlemler', 'Menünün ekran okuyucu adı'],
      ],
      outputs: [
        ['contextMenuSelect', 'HuDropdownOption', '—', 'Öğe seçilince (value yoksa label döner)'],
        ['contextMenuOpen / contextMenuClose', 'void', '—', 'Menü açılınca / kapanınca'],
      ],
      methods: [
        ['open({ entries, x, y, returnFocus? })', 'Promise<HuDropdownOption | null>', '—', 'HuContextMenuService: istediğiniz konumda açar; vazgeçilirse null'],
        ['close()', 'void', '—', 'Açık menüyü kapatır'],
        ['HuDropdownOption.shortcut', 'string', '—', 'Sağda kısayol ipucu (yalnızca görsel)'],
      ],
    },
    load: () => import('./pages/context-menu.doc').then((m) => m.ContextMenuDoc),
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
    slug: 'tooltip',
    name: 'Tooltip',
    category: 'Geri bildirim',
    icon: 'info',
    isNew: true,
    description: 'Kısa açıklama balonu: üzerine gelince veya klavyeyle odaklanınca açılır, Esc kapatır, sığmazsa ters tarafa geçer. Üst katmanda açılır; ekran okuyucuya aria-describedby ile okunur.',
    selector: '[huTooltip]',
    imports: 'HuTooltip',
    api: {
      inputs: [
        ['huTooltip', 'string', '—', 'Metin (boşsa açılmaz)'],
        ['huTooltipPosition', "'top' | 'bottom' | 'left' | 'right'", "'top'", 'Tercih edilen taraf'],
        ['huTooltipDelay', 'number', '350', 'Açılma gecikmesi (ms); bir ipucundan diğerine geçerken beklemez'],
        ['huTooltipDisabled', 'boolean', 'false', 'Kapat'],
      ],
      methods: [
        ['show() / hide()', 'void', '—', 'Template referansıyla elle aç / kapat'],
        ['--hu-tooltip-bg / --hu-tooltip-fg', 'CSS', 'koyu / açık', 'Renkler (koyu temada ters)'],
      ],
    },
    load: () => import('./pages/tooltip.doc').then((m) => m.TooltipDoc),
  },
  {
    slug: 'confirm-popup',
    name: 'ConfirmPopup',
    category: 'Geri bildirim',
    icon: 'help-circle',
    isNew: true,
    description:
      'Butonun yanında açılan küçük onay kutusu. Silme gibi geri alınamaz işlemlerden önce sorar; sayfaya ek bir şey yerleştirmek gerekmez.',
    selector: '[huConfirm]',
    imports: 'HuConfirm, HuConfirmPopupService',
    api: {
      inputs: [
        ['huConfirm', 'string', '—', 'Sorulacak mesaj (zorunlu)'],
        ['header', 'string', '—', 'Mesajın üstünde kalın başlık'],
        ['icon', 'string | null', `'alert-triangle'`, 'İkon; null verilirse gösterilmez'],
        ['acceptLabel / rejectLabel', 'string', `'Evet' / 'Hayır'`, 'Buton metinleri'],
        ['acceptColor', BUTTON_COLOR, `'primary'`, `Onay butonu rengi; silmede 'danger'`],
        ['defaultFocus', `'accept' | 'reject'`, `'accept'`, 'Açılınca odaklanacak buton'],
        ['confirmDisabled', 'boolean', 'false', 'true ise sormadan doğrudan (confirmed) yayınlar'],
      ],
      outputs: [
        ['confirmed', 'void', '—', 'Kullanıcı onaylayınca (işlemi buraya bağlayın, (click)’e değil)'],
        ['rejected', 'void', '—', 'Hayır, Esc veya dışarı tıklama'],
      ],
      methods: [
        ['confirm(options)', 'Promise<boolean>', '—', 'HuConfirmPopupService: { target: event.currentTarget, message, … }'],
        ['close()', 'void', '—', 'Açık onay kutusunu kapatır'],
      ],
    },
    load: () => import('./pages/confirm-popup.doc').then((m) => m.ConfirmPopupDoc),
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
    expanded: true,
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
    expanded: true,
    children: [
      { label: 'Tümü', link: '/componentler', exact: true },
      ...DOC_CATEGORIES.map((category) => ({
        label: category,
        children: DOCS.filter((d) => d.category === category).map((d) => ({
          label: d.name,
          link: `/componentler/${d.slug}`,
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
