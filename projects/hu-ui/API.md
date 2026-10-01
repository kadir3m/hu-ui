# @ucme-ui/angular — API referansı

Her component'in aldığı input'lar, iki yönlü bağlanabilen değerler (`model`), output'lar ve içerik
yuvaları (slot). Kurulum ve genel kullanım için [README](README.md)'ye bakın.

**Okuma kılavuzu**

- **Input:** `[ad]="değer"` ile verilir. `boolean` input'lar öznitelik olarak da yazılabilir:
  `<button hu-button disabled>` ile `[disabled]="true"` aynıdır.
- **Model:** iki yönlüdür, `[(ad)]="signal"` ile bağlanır; ayrıca `(adChange)` output'u da vardır.
- **Slot:** component'in içine koyduğunuz ve belirli bir özniteliği taşıyan elementler
  (örn. `<div huCardFooter>`).
- Bir tabloda bir satır **zorunlu** diye işaretlenmişse o input verilmeden component çalışmaz.

## İçindekiler

- **Layout:** [hu-shell](#hu-shell) · [hu-breadcrumb](#hu-breadcrumb) · [hu-theme-toggle](#hu-theme-toggle)
- **Form:** [hu-button](#hu-button) · [hu-button-group](#hu-button-group) · [huInput](#huinput) · [hu-form-field](#hu-form-field) · [hu-checkbox](#hu-checkbox) · [hu-switch](#hu-switch) · [hu-date-picker](#hu-date-picker) · [hu-editor](#hu-editor)
- **Tarih:** [hu-calendar](#hu-calendar) · [tarih yardımcıları](#tarih-yardımcıları)
- **Veri:** [hu-table](#hu-table) · [hu-paginator](#hu-paginator) · [hu-tabs](#hu-tabs--hu-tab) · [hu-card](#hu-card) · [hu-dropdown](#hu-dropdown)
- **Geri bildirim:** [hu-dialog](#hu-dialog) · [HuToastService + hu-toaster](#hutoastservice--hu-toaster) · [hu-alert](#hu-alert) · [hu-badge](#hu-badge) · [hu-avatar](#hu-avatar) · [hu-spinner](#hu-spinner)
- **Çekirdek:** [hu-icon](#hu-icon) · [HuThemeService](#huthemeservice) · [Form hata mesajları](#form-hata-mesajları) · [Gruplu import'lar](#gruplu-importlar) · [Tasarım token'ları](#tasarım-tokenları)

---

## Layout

### hu-shell

Admin uygulama iskeleti: daraltılabilir sidebar, mobilde çekmece menü, üst çubuk ve içerik alanı.

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `nav` | `HuNavGroup[]` | `[]` | Sidebar menüsü (aşağıya bakın) |
| `brand` | `string` | `''` | Sol üstteki uygulama adı |
| `brandSubtitle` | `string` | — | Adın altındaki küçük satır |
| `brandLink` | `string` | `'/'` | Marka alanına tıklanınca gidilecek adres |
| `sidebarTheme` | `'default' \| 'dark'` | `'default'` | `dark`: açık temada da koyu sidebar |

| Model | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `collapsed` | `boolean` | son tercih | Masaüstünde sidebar daraltılmış mı. Tercih tarayıcıda saklanır |

| Slot | Nereye yerleşir |
| --- | --- |
| `huTopbarStart` | Üst çubuğun solu (breadcrumb, arama) |
| `huTopbarEnd` | Üst çubuğun sağı (tema, bildirim, kullanıcı menüsü) |
| `huSidebarFooter` | Sidebar'ın altı |
| `huShellLogo` | Varsayılan logo yerine kendi logonuz |
| *(slot'suz içerik)* | Ana içerik alanı; genellikle `<router-outlet />` |

**`HuNavGroup`**

| Alan | Tip | Açıklama |
| --- | --- | --- |
| `title` | `string?` | Grup başlığı (örn. "Yönetim") |
| `items` | `HuNavItem[]` | Gruptaki öğeler |

**`HuNavItem`**

| Alan | Tip | Açıklama |
| --- | --- | --- |
| `label` | `string` | Görünen ad |
| `icon` | `string?` | [İkon](#hu-icon) adı |
| `link` | `string?` | Router adresi (alt menülü öğede verilmez) |
| `exact` | `boolean?` | Yalnızca birebir eşleşmede aktif say (ana sayfa `/` için `true` verin) |
| `badge` | `string \| number?` | Sağdaki rozet: sayı (`12`) dolu, metin (`'Yeni'`) açık renkli etiket olarak görünür |
| `children` | `HuNavItem[]?` | Alt menü; aktif alt sayfanın grubu otomatik açılır. Bir alt öğenin de `children`'ı varsa o öğe tıklanamaz bir **kategori başlığı** olur (iki seviyeli menü) |

İki seviyeli menü örneği (kategori başlıkları "Form", "Veri"):

```ts
{
  label: 'Componentler',
  icon: 'layers',
  children: [
    { label: 'Form', children: [
      { label: 'Button', link: '/componentler/button' },
      { label: 'Dropdown', link: '/componentler/dropdown', badge: 'Yeni' },
    ]},
    { label: 'Veri', children: [{ label: 'Table', link: '/componentler/table' }] },
  ],
}
```

Uzun menülerde aktif link otomatik olarak görünür alana kaydırılır.

```html
<hu-shell [nav]="nav" brand="Yönetim Paneli" brandSubtitle="Kurum adı">
  <hu-breadcrumb huTopbarStart [items]="crumbs" />
  <div huTopbarEnd><hu-theme-toggle /></div>
  <router-outlet />
</hu-shell>
```

> 1024 px'in altında sidebar çekmeceye dönüşür; bir linke tıklanınca veya Esc'e basılınca kapanır.

### hu-breadcrumb

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `items` | `HuBreadcrumbItem[]` | `[]` | Konum adımları; sonuncusu geçerli sayfa sayılır |

`HuBreadcrumbItem`: `label: string`, `link?: string | unknown[]`, `icon?: string`

```html
<hu-breadcrumb [items]="[{ label: 'Ana Sayfa', link: '/', icon: 'home' }, { label: 'Kullanıcılar' }]" />
```

### hu-theme-toggle

Açık ve koyu tema arasında geçiş yapan ikon butonu. Input'u yoktur; [HuThemeService](#huthemeservice)'i kullanır.

```html
<hu-theme-toggle />
```

---

## Form

### hu-button

Native `<button>` veya `<a>` elementine uygulanır: `button[hu-button]`, `a[hu-button]`.

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `variant` | `'solid' \| 'soft' \| 'outline' \| 'ghost' \| 'link'` | `'solid'` | Görünüm |
| `color` | `'primary' \| 'neutral' \| 'success' \| 'warning' \| 'danger' \| 'info'` | görünüme göre | Verilmezse `solid`/`soft`/`link` → `primary`, `outline`/`ghost` → `neutral` |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Boyut |
| `disabled` | `boolean` | `false` | Devre dışı |
| `loading` | `boolean` | `false` | Spinner gösterir ve tıklamayı engeller |
| `iconOnly` | `boolean` | `false` | Kare, yalnızca ikon içeren buton. `aria-label` verin |
| `pill` | `boolean` | `false` | Tam yuvarlak köşeler |
| `block` | `boolean` | `false` | Kapsayıcının tüm genişliği |

```html
<button hu-button>Kaydet</button>
<button hu-button variant="outline" color="danger" size="sm"><hu-icon name="trash" /> Sil</button>
<button hu-button variant="ghost" iconOnly aria-label="Düzenle"><hu-icon name="edit" /></button>
<a hu-button variant="link" routerLink="/kullanicilar">Tümü</a>
```

### hu-button-group

Butonları bitişik bir grup olarak gösterir. Aç/kapa butonları için butonlara `[attr.aria-pressed]` verin.

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `vertical` | `boolean` | `false` | Butonları alt alta dizer |
| `pill` | `boolean` | `false` | Grubun dış köşeleri tam yuvarlak |

```html
<hu-button-group aria-label="Görünüm">
  <button hu-button variant="outline" [attr.aria-pressed]="view() === 'list'" (click)="view.set('list')">Liste</button>
  <button hu-button variant="outline" [attr.aria-pressed]="view() === 'grid'" (click)="view.set('grid')">Kart</button>
</hu-button-group>
```

### huInput

Native `input`, `textarea` ve `select` elementlerine uygulanan directive.

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Yükseklik |
| `invalid` | `boolean` | `false` | Form kontrolü olmadan hatalı görünümü zorlar |
| `id` | `string` | otomatik | `hu-form-field` label'ı bu id'ye bağlanır |

Reactive/template-driven form'larla birlikte kullanılır (`formControlName`, `[formControl]`, `ngModel`).

```html
<input huInput formControlName="email" type="email" />
<select huInput formControlName="role">…</select>
```

### hu-form-field

Label, yardım metni ve hata mesajını bir kontrol etrafında toplar. İçine `huInput` veya `hu-date-picker` konur.

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `label` | `string` | — | Alan etiketi |
| `hint` | `string` | — | Alttaki yardım metni (hata varken gizlenir) |
| `error` | `string \| null` | — | Sabit hata mesajı. Verilmezse validator hatasından [otomatik üretilir](#form-hata-mesajları) |
| `required` | `boolean` | `false` | Etiketin yanına `*` koyar (validasyon yapmaz; `Validators.required` ayrıca gerekir) |

| Slot | Açıklama |
| --- | --- |
| `huPrefix` | Kontrolün solunda (ikon vb.) |
| `huSuffix` | Kontrolün sağında (buton vb.) |

Hata mesajı, kontrol geçersizse **ve** kullanıcı alana dokunduysa (touched/dirty) görünür.

```html
<hu-form-field label="E-posta" hint="Kurumsal adresinizi kullanın" required>
  <hu-icon huPrefix name="mail" [size]="16" />
  <input huInput type="email" formControlName="email" />
</hu-form-field>
```

### hu-checkbox

Form kontrolüdür (`formControlName`, `[formControl]`, `ngModel`) veya `[(checked)]` ile kullanılır.

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `disabled` | `boolean` | `false` | Devre dışı |
| `name` | `string` | — | Native `name` özniteliği |
| `aria-label` | `string` | — | Görünür metin yoksa ekran okuyucu etiketi |
| `inputId` | `string` | otomatik | İçteki input'un id'si |

| Model | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `checked` | `boolean` | `false` | İşaretli mi |
| `indeterminate` | `boolean` | `false` | Kısmen seçili (–). Tıklanınca kalkar; değeri alt seçimlerden hesaplayın |

İçerik (slot'suz): kutunun yanındaki metin.

```html
<hu-checkbox formControlName="kvkk">KVKK metnini okudum</hu-checkbox>

<!-- "Tümünü seç" -->
<hu-checkbox [checked]="allSelected()" [indeterminate]="someSelected()" (checkedChange)="selectAll($event)">
  Tümünü seç
</hu-checkbox>
```

### hu-switch

Açık/kapalı anahtarı. [hu-checkbox](#hu-checkbox) ile aynı kullanım; `indeterminate` yoktur.

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `disabled` | `boolean` | `false` | Devre dışı |
| `aria-label` | `string` | — | Görünür metin yoksa ekran okuyucu etiketi |
| `inputId` | `string` | otomatik | İçteki input'un id'si |

| Model | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `checked` | `boolean` | `false` | Açık mı |

```html
<hu-switch formControlName="emailNotifications">E-posta bildirimleri</hu-switch>
```

### hu-date-picker

Tarih seçici form kontrolü. Tarih elle yazılabilir veya açılan takvimden seçilebilir.

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `mode` | `'single' \| 'range'` | `'single'` | Tek tarih veya aralık |
| `min` | `Date \| null` | `null` | Seçilebilecek en erken tarih |
| `max` | `Date \| null` | `null` | Seçilebilecek en geç tarih |
| `dateFilter` | `(date: Date) => boolean` | `null` | `false` döndüren günler seçilemez (örn. hafta sonları) |
| `markers` | `HuCalendarMarker[]` | `[]` | Takvimde işaretli günler ([hu-calendar](#hu-calendar)) |
| `placeholder` | `string` | `gg.aa.yyyy` (aralıkta `gg.aa.yyyy – gg.aa.yyyy`) | Boş input'ta görünen metin |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Yükseklik |
| `disabled` | `boolean` | `false` | Devre dışı |
| `id` | `string` | otomatik | `hu-form-field` label'ı bu id'ye bağlanır |

| Model | Tip | Açıklama |
| --- | --- | --- |
| `value` | `Date \| HuDateRange \| null` | `single` modda `Date`, `range` modda `{ start, end }` |

**Elle yazım:** `5.11.2026`, `05/11/2026`, `05-11-2026` ve `05112026` kabul edilir. Aralık için:
`01.10.2026 – 15.10.2026`.

**Validasyon hataları** (form kontrolünde): `huDateParse` (geçersiz metin), `huDateMin`, `huDateMax`,
`huDateUnavailable` (`dateFilter`'a takılan gün). Mesajları `hu-form-field` otomatik gösterir.

```html
<hu-form-field label="Başlangıç tarihi" required>
  <hu-date-picker formControlName="startDate" [min]="today" />
</hu-form-field>

<hu-date-picker mode="range" [(value)]="period" placeholder="Tarih aralığı" />
```

### hu-editor

Zengin metin editörü. Değer **HTML metnidir**; form kontrolü olarak (`formControlName`, `[formControl]`) veya
`[(value)]` ile kullanılır. Bağımlılık yoktur, tarayıcının `contenteditable` alanı üzerine kuruludur.

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `toolbar` | `HuEditorTool[]` | `HU_EDITOR_DEFAULT_TOOLBAR` | Araç çubuğu öğeleri (aşağıda); `'\|'` ayraç |
| `placeholder` | `string` | `'Yazmaya başlayın…'` | Boşken görünen metin |
| `readonly` | `boolean` | `false` | Araç çubuğu gizlenir, içerik düzenlenemez |
| `disabled` | `boolean` | `false` | Devre dışı |
| `showCount` | `boolean` | `false` | Altta kelime ve karakter sayısı |
| `ariaLabel` | `string` | — | `hu-form-field` dışında kullanırken ekran okuyucu etiketi |
| `id` | `string` | otomatik | İçerik alanının id'si |
| `textColors` | `HuEditorColor[]` | `HU_EDITOR_TEXT_COLORS` | Yazı rengi paleti (`{ label, value }`) |
| `highlightColors` | `HuEditorColor[]` | `HU_EDITOR_HIGHLIGHT_COLORS` | Vurgu (arka plan) paleti |
| `imageUpload` | `(file: File) => Promise<string>` | `null` | Dosyayı sunucuya yükleyip görselin adresini döndürür. Verilmezse görsel data URL olarak HTML'e gömülür |
| `maxImageSize` | `number` (bayt) | `2 * 1024 * 1024` | Kabul edilen en büyük görsel dosyası |

| Model | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `value` | `string` (HTML) | `''` | Görünür metin yoksa `''` döner, bu yüzden `Validators.required` doğru çalışır |

**Araç çubuğu öğeleri (`HuEditorTool`):** `heading` (Paragraf / Başlık 1–3 seçici), `bold`, `italic`, `underline`,
`strike`, `textColor`, `highlight`, `bulletList`, `orderedList`, `blockquote`, `codeBlock`, `link`, `image`,
`clear` (biçimi temizle), `undo`, `redo`, `'|'`.
Hazır listeler: `HU_EDITOR_DEFAULT_TOOLBAR` (hepsi), `HU_EDITOR_MINIMAL_TOOLBAR` (kalın, italik, altı çizili, listeler, link).

**Kısayollar:** Ctrl+B / I / U, Ctrl+K (link), Ctrl+Z / Y.

**Renkler:** Renkler `<span style="color: …; background-color: …">` olarak kaydedilir. Yalnızca paletteki renkler
kalıcıdır; tarayıcının kendiliğinden eklediği veya başka sayfalardan yapıştırılan renkler temizlenir (koyu temada
okunmaz hale gelmesinler diye). Varsayılan vurgu renkleri yarı saydamdır.

**Görseller:** Görsel butonu adres girme ve dosya seçme paneli açar; görseller yapıştırılarak veya sürüklenerek de
eklenebilir. Yalnızca PNG, JPEG, GIF ve WebP kabul edilir. `imageUpload` verilmediğinde dosya base64 olarak HTML'e
gömülür; bu küçük görseller için uygundur, büyük içerikte kendi yükleme fonksiyonunuzu verin:

```ts
upload: HuEditorImageUpload = async (file) => {
  const body = new FormData();
  body.append('file', file);
  const res = await fetch('/api/uploads', { method: 'POST', body });
  return (await res.json()).url;
};
```

**Güvenlik:** Yapıştırılan, sürüklenen ve dışarıdan verilen HTML izin listesiyle temizlenir. Yalnızca `p`, `br`,
`strong`, `em`, `u`, `s`, `h1`–`h3`, `ul`, `ol`, `li`, `blockquote`, `pre`, `code`, `a`, `img` ve `span` kalır. Bütün
öznitelikler silinir; linklerde yalnızca `href`, görsellerde `src` ve `alt`, `span`'de yalnızca renk kalır.
`javascript:` adresleri ve SVG görselleri (içine betik gömülebilir) reddedilir. Aynı temizleyiciyi, kayıtlı HTML'i
göstermeden önce kendiniz de kullanabilirsiniz:

```ts
import { huSanitizeHtml } from '@ucme-ui/angular';
safeHtml = huSanitizeHtml(announcement.body);
```

| CSS değişkeni | Varsayılan | Açıklama |
| --- | --- | --- |
| `--hu-editor-min-height` | `10rem` | İçerik alanının en küçük yüksekliği |
| `--hu-editor-max-height` | `32rem` | Bu yükseklikten sonra içerik kaydırılır |

```html
<hu-form-field label="Duyuru metni" required>
  <hu-editor formControlName="body" placeholder="Duyurunun ayrıntılarını yazın…" showCount />
</hu-form-field>

<hu-editor [(value)]="html" [toolbar]="['bold', 'italic', '|', 'bulletList', 'link']" ariaLabel="Yorum" />
```

---

## Tarih

### hu-calendar

Satır içi takvim. Pazartesi ile başlar, Türkçedir.

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `mode` | `'single' \| 'range'` | `'single'` | Tek gün veya aralık seçimi |
| `min`, `max` | `Date \| null` | `null` | Seçilebilir aralık |
| `dateFilter` | `(date: Date) => boolean` | `null` | `false` döndüren günler seçilemez |
| `markers` | `HuCalendarMarker[]` | `[]` | Günlerin altındaki renkli noktalar |
| `startAt` | `Date \| null` | `null` | Seçim yokken açılacak ay |
| `locale` | `string` | `'tr-TR'` | Ay ve gün adları |
| `firstDayOfWeek` | `number` | `1` | Haftanın ilk günü (0 = Pazar, 1 = Pazartesi) |

| Model | Tip | Açıklama |
| --- | --- | --- |
| `value` | `Date \| null` | Seçili gün (`single`) |
| `range` | `HuDateRange \| null` | Seçili aralık (`range`) |

| Output | Değer | Ne zaman |
| --- | --- | --- |
| `dateSelected` | `Date` | Kullanıcı bir güne tıklayınca |
| `monthChange` | `Date` (ayın ilk günü) | Görüntülenen ay değişince |

**`HuCalendarMarker`:** `date: Date`, `label?: string` (ipucu metni),
`variant?: 'primary' | 'info' | 'success' | 'warning' | 'danger'`.
**`HuDateRange`:** `{ start: Date | null; end: Date | null }`.

**Klavye:** oklar (gün / hafta), Home/End (hafta başı / sonu), PageUp/PageDown (ay), Shift+PageUp/PageDown (yıl),
Enter/Space (seç). Başlığa tıklanınca ay ve yıl seçimi açılır.

```html
<hu-calendar [(value)]="day" [markers]="events" (monthChange)="loadEvents($event)" />
```

### Tarih yardımcıları

Paketten import edilen fonksiyonlar. Hepsi yerel saatle ve gün hassasiyetinde çalışır.

| Fonksiyon | Açıklama |
| --- | --- |
| `formatDate(date)` | `gg.aa.yyyy` metni |
| `parseDate(text)` | Metni `Date`'e çevirir; geçersizse `null` (31.02 gibi taşan tarihleri reddeder) |
| `formatRange(range)`, `parseRange(text)` | Aralık için aynısı |
| `startOfDay`, `addDays`, `addMonths`, `startOfWeek` | Tarih hesapları (`addMonths` ay sonunu korur: 31 Ocak + 1 ay = 28/29 Şubat) |
| `isSameDay`, `isSameMonth`, `compareDays` | Karşılaştırma (`compareDays(a, b) < 0` ise `a` daha önce) |
| `clampDate(date, min, max)`, `daysInMonth(year, month)`, `isValidDate(value)` | Diğer |

---

## Veri

### hu-table

Veri tablosu: sıralama, özel hücre şablonları, yükleniyor ve boş durumları.

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `columns` | `HuColumn<T>[]` | **zorunlu** | Sütun tanımları |
| `data` | `T[]` | `[]` | Satırlar |
| `loading` | `boolean` | `false` | Spinner gösterir (veri varsa üstünde, yoksa yerinde) |
| `emptyText` | `string` | `'Kayıt bulunamadı.'` | Veri yokken görünen metin |
| `sortMode` | `'client' \| 'server'` | `'client'` | `client`: tablo kendisi sıralar. `server`: yalnızca `sort` değişir, veriyi siz getirirsiniz |
| `trackBy` | `(row: T) => unknown` | satırın kendisi | Satır kimliği (örn. `u => u.id`) |
| `striped` | `boolean` | `false` | Satırları dönüşümlü renklendirir |
| `dense` | `boolean` | `false` | Sıkışık satırlar |
| `stickyHeader` | `boolean` | `false` | Kaydırırken başlık sabit kalır (yükseklik: `--hu-table-max-height`) |
| `clickableRows` | `boolean` | `false` | Satırlar tıklanabilir olur, `rowClick` tetiklenir |

| Model | Tip | Açıklama |
| --- | --- | --- |
| `sort` | `HuSort` | `{ key: string; direction: 'asc' \| 'desc' \| '' }`. Başlığa her tıklama: artan → azalan → sırasız |

| Output | Değer | Ne zaman |
| --- | --- | --- |
| `rowClick` | `T` | Bir satıra tıklanınca (`clickableRows` açıkken) |

**`HuColumn<T>`**

| Alan | Tip | Açıklama |
| --- | --- | --- |
| `key` | `string` | Satırdaki alan adı veya `huCell` şablonunun anahtarı |
| `header` | `string` | Başlık metni |
| `sortable` | `boolean?` | Başlık tıklanınca sıralansın |
| `align` | `'start' \| 'center' \| 'end'?` | Hizalama |
| `width` | `string?` | Örn. `'120px'`, `'20%'` |
| `value` | `(row: T) => unknown?` | Görünen / sıralanan değeri özel hesaplar |
| `hideOnMobile` | `boolean?` | 768 px'in altında gizlenir |

**Özel hücre:** `<ng-template huCell="sütunAnahtarı" let-row let-i="index">`. `[huCellOf]="data"` verirseniz
`row` değişkeni tip güvenli olur. **Boş durum:** içine `huTableEmpty` özniteliği olan bir element koyun.

```html
<hu-table [data]="users()" [columns]="columns" [(sort)]="sort" [trackBy]="byId">
  <ng-template huCell="status" [huCellOf]="users()" let-user>
    <hu-badge [variant]="user.active ? 'success' : 'neutral'" dot>{{ user.active ? 'Aktif' : 'Pasif' }}</hu-badge>
  </ng-template>
  <div huTableEmpty>Arama kriterlerine uyan kullanıcı yok.</div>
</hu-table>
```

### hu-paginator

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `length` | `number` | **zorunlu** | Toplam kayıt sayısı |
| `pageSizeOptions` | `number[]` | `[10, 25, 50]` | "Sayfa başına" seçenekleri (tek eleman verilirse seçici gizlenir) |

| Model | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `pageIndex` | `number` | `0` | Geçerli sayfa, **0'dan başlar** |
| `pageSize` | `number` | `10` | Sayfa başına kayıt; değişince `pageIndex` 0'a döner |

```html
<hu-paginator [length]="total()" [(pageIndex)]="page" [(pageSize)]="size" />
```

### hu-tabs / hu-tab

**hu-tabs**

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `variant` | `'line' \| 'pills'` | `'line'` | Alt çizgili veya kapsül görünüm |

| Model | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `selectedIndex` | `number` | `0` | Aktif sekmenin sırası |

**hu-tab**

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `label` | `string` | **zorunlu** | Sekme başlığı |
| `icon` | `string` | — | Başlıktaki ikon |
| `disabled` | `boolean` | `false` | Seçilemez |

Sekme içeriği yalnızca aktifken çizilir. Klavye: ←/→, Home/End.

```html
<hu-tabs [(selectedIndex)]="tab">
  <hu-tab label="Profil" icon="user">…</hu-tab>
  <hu-tab label="Güvenlik" icon="lock">…</hu-tab>
</hu-tabs>
```

### hu-card

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `title` | `string` | — | Başlık |
| `subtitle` | `string` | — | Başlığın altındaki küçük metin |
| `padding` | `'none' \| 'sm' \| 'md'` | `'md'` | İçerik boşluğu (`none`: tablo gibi kenara dayanan içerik için) |

| Slot | Nereye yerleşir |
| --- | --- |
| `huCardActions` | Başlığın sağı |
| `huCardFooter` | Kartın altı |

```html
<hu-card title="Son başvurular" subtitle="Son 7 gün" padding="none">
  <a huCardActions hu-button variant="ghost" size="sm" routerLink="/basvurular">Tümü</a>
  <hu-table … />
  <div huCardFooter>…</div>
</hu-card>
```

### hu-dropdown

Açılır menü. Öğeler dizi olarak verilir, tetikleyici butonu component kendisi çizer.

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `options` | `HuDropdownEntry<T>[]` | `[]` | Menü öğeleri (aşağıya bakın) |
| `label` | `string` | — | Tetikleyici butonun metni |
| `icon` | `string` | — | Tetikleyicinin ikonu. `label` yoksa kare ikon butonu olur |
| `variant` | `HuButtonVariant` | `'outline'` | Tetikleyici görünümü ([hu-button](#hu-button)) |
| `color` | `HuButtonColor` | görünüme göre | Tetikleyici rengi |
| `size` | `HuButtonSize` | `'md'` | Tetikleyici boyutu |
| `caret` | `boolean` | `true` | Etiketin yanında aşağı ok |
| `ariaLabel` | `string` | — | Ekran okuyucu etiketi; yalnızca ikonlu tetikleyicide **gerekli** |
| `disabled` | `boolean` | `false` | Tetikleyici devre dışı |
| `align` | `'start' \| 'end'` | `'start'` | Panel sola mı sağa mı hizalı açılsın |

| Model | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `open` | `boolean` | `false` | Panel açık mı |

| Output | Değer | Ne zaman |
| --- | --- | --- |
| `selected` | `HuDropdownOption<T>` | Bir öğe seçilince. `value` verilmemişse `label` döner |

**`HuDropdownEntry`** üç şeyden biridir:

| Tür | Şekil | Açıklama |
| --- | --- | --- |
| Seçenek | `{ label, value?, icon?, description?, disabled?, danger?, link? }` | `description`: ikinci satır · `danger`: kırmızı · `link`: router adresi |
| Ayraç | `{ divider: true }` | İnce çizgi |
| Grup başlığı | `{ header: 'Metin' }` | Küçük gri başlık |

| Slot | Açıklama |
| --- | --- |
| `huDropdownTrigger` | Hazır buton yerine kendi tetikleyiciniz (avatar vb.) |
| `huDropdownHeader` | Panelin en üstüne serbest içerik |

**Klavye:** tetikleyicide ↓/↑ açar · panelde ↑/↓, Home/End · harfe basınca o harfle başlayan öğeye gider · Enter seçer ·
Esc kapatır ve odağı tetikleyiciye döndürür.

**Konumlandırma:** Panel, tarayıcının Popover API'siyle sayfanın en üst katmanında açılır (`appendTo="body"` gibi).
Bu yüzden kart, tablo, dialog ya da `overflow: hidden` olan bir kapsayıcı paneli kesmez. Panel tetikleyicinin altında
açılır; aşağıda yer yoksa yukarı açılır, ekran kenarından taşmaz ve sayfa kaydırılınca tetikleyiciyi takip eder.
Çok uzun listelerde panel kaydırılabilir (`--hu-dropdown-max-height`, varsayılan `24rem`).

```html
<hu-dropdown label="İşlemler" [options]="actions" (selected)="run($event.value)" />
<hu-dropdown icon="more-vertical" variant="ghost" ariaLabel="Satır işlemleri" [options]="actions" />
```

```ts
actions: HuDropdownEntry[] = [
  { header: 'Kayıt' },
  { label: 'Düzenle', value: 'edit', icon: 'edit' },
  { label: 'Ayarlar', icon: 'settings', link: '/ayarlar' },
  { divider: true },
  { label: 'Sil', value: 'delete', icon: 'trash', danger: true },
];
```

---

## Geri bildirim

### hu-dialog

Modal pencere; native `<dialog>` kullanır (odak hapsi ve Esc hazır gelir).

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `title` | `string` | `''` | Başlık |
| `description` | `string` | — | Başlığın altındaki açıklama |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Genişlik (24 / 32 / 44 / 60 rem) |
| `closeOnBackdrop` | `boolean` | `true` | Dışarı tıklayınca kapansın |
| `closeOnEsc` | `boolean` | `true` | Esc ile kapansın |

| Model | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `open` | `boolean` | `false` | Açık mı |

| Output | Değer | Ne zaman |
| --- | --- | --- |
| `closed` | — | Pencere herhangi bir yolla kapandığında |

| Slot | Açıklama |
| --- | --- |
| `huDialogFooter` | Alt kısımdaki aksiyon butonları |
| *(slot'suz içerik)* | Pencere gövdesi |

```html
<hu-dialog [(open)]="editOpen" title="Kullanıcıyı düzenle" size="lg">
  …form…
  <div huDialogFooter>
    <button hu-button variant="outline" (click)="editOpen.set(false)">Vazgeç</button>
    <button hu-button (click)="save()">Kaydet</button>
  </div>
</hu-dialog>
```

### HuToastService + hu-toaster

Geçici bildirimler. Uygulamanın kök component'ine **bir kez** `<hu-toaster />` koyun.

**`hu-toaster`**

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `position` | `'top-right' \| 'top-center' \| 'bottom-right' \| 'bottom-center'` | `'top-right'` | Ekrandaki yeri |

**`HuToastService`** (`inject(HuToastService)`)

| Metot | Açıklama |
| --- | --- |
| `success(message, title?)` | Yeşil bildirim, 5 sn |
| `info(message, title?)` | Mavi bildirim, 5 sn |
| `warning(message, title?)` | Turuncu bildirim, 5 sn |
| `error(message, title?)` | Kırmızı bildirim, 8 sn |
| `show({ message, title?, variant?, duration? })` | Tam kontrol. `duration: 0` → kullanıcı kapatana kadar kalır |
| `dismiss(id)`, `clear()` | Tek bildirimi veya hepsini kapatır (metotlar `id` döndürür) |

Aynı anda en fazla 5 bildirim görünür.

```ts
this.toast.success('Kayıt güncellendi.', 'Kaydedildi');
```

### hu-alert

Sayfa içi bilgi veya uyarı kutusu.

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `variant` | `'info' \| 'success' \| 'warning' \| 'danger'` | `'info'` | Tür ve renk |
| `title` | `string` | — | Kalın başlık |
| `dismissible` | `boolean` | `false` | Sağda kapatma butonu |

| Output | Değer | Ne zaman |
| --- | --- | --- |
| `closed` | — | Kullanıcı kapattığında |

```html
<hu-alert variant="warning" title="Dikkat" dismissible>Oturumunuz 5 dakika içinde sona erecek.</hu-alert>
```

### hu-badge

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `variant` | `'neutral' \| 'primary' \| 'info' \| 'success' \| 'warning' \| 'danger'` | `'neutral'` | Renk |
| `dot` | `boolean` | `false` | Metnin önünde renkli nokta |

```html
<hu-badge variant="success" dot>Aktif</hu-badge>
```

### hu-avatar

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `name` | `string` | `''` | Kişi adı; görsel yoksa baş harfleri gösterilir (Türkçe büyük harf kurallarıyla) |
| `src` | `string \| null` | — | Görsel adresi; yüklenemezse baş harflere düşer |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Boyut |

```html
<hu-avatar name="Ayşe Yılmaz" [src]="user.photo" size="lg" />
```

### hu-spinner

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Boyut |
| `label` | `string` | `'Yükleniyor'` | Ekran okuyucu metni |

---

## Çekirdek

### hu-icon

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `name` | `string` | **zorunlu** | İkon adı (liste aşağıda) |
| `size` | `number` | `18` | Piksel |
| `strokeWidth` | `number` | `2` | Çizgi kalınlığı |
| `label` | `string` | — | Verilirse ekran okuyucu okur; verilmezse ikon dekoratif sayılır |

**Yerleşik ikonlar:** `menu` `x` `check` `minus` `plus` `chevron-down` `chevron-up` `chevron-left` `chevron-right`
`chevrons-left` `chevrons-right` `chevrons-up-down` `arrow-up` `arrow-down` `home` `user` `users` `settings` `bell`
`search` `sun` `moon` `monitor` `log-out` `info` `check-circle` `alert-triangle` `alert-circle` `edit` `trash`
`file-text` `bar-chart` `calendar` `folder` `grid` `layers` `more-vertical` `mail` `lock` `eye` `book-open`
`trending-up` `trending-down` `download` `filter` `graduation-cap` `building` `clock`

**Kendi ikonlarınız:** 24×24 viewBox'lı SVG path verisi verin.

```ts
providers: [provideHuIcons({ rocket: 'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2' })]
```

### HuThemeService

`inject(HuThemeService)`

| Üye | Tip | Açıklama |
| --- | --- | --- |
| `mode` | `Signal<'light' \| 'dark' \| 'system'>` | Kullanıcının tercihi (tarayıcıda saklanır, varsayılan `system`) |
| `resolved` | `Signal<'light' \| 'dark'>` | Şu an uygulanan tema |
| `setMode(mode)` | metot | Tercihi değiştirir |
| `toggle()` | metot | Açık ↔ koyu |

Tema `<html data-theme="light|dark">` özniteliğiyle uygulanır.

### Form hata mesajları

`hu-form-field`, validator hatalarını otomatik olarak Türkçe mesaja çevirir. Birden çok hata varsa `required`
dışındaki öncelikli gösterilir.

| Hata anahtarı | Varsayılan mesaj |
| --- | --- |
| `required` | Bu alan zorunludur. |
| `requiredTrue` | Devam etmek için onaylamanız gerekir. |
| `email` | Geçerli bir e-posta adresi giriniz. |
| `minlength` / `maxlength` | En az / en fazla N karakter … |
| `min` / `max` | Değer en az / en fazla N … |
| `pattern` | Geçersiz format. |
| `huDateParse` | Geçerli bir tarih giriniz (gg.aa.yyyy). |
| `huDateMin` / `huDateMax` | Tarih … veya sonrası / öncesi olmalıdır. |
| `huDateUnavailable` | Bu tarih seçilemez. |

Değiştirmek veya kendi validator'larınıza mesaj eklemek için:

```ts
providers: [
  provideHuErrorMessages({
    tckn: 'Geçerli bir T.C. kimlik numarası giriniz.',
    minlength: (e) => `En az ${e.requiredLength} karakter girin.`,
  }),
]
```

### Gruplu import'lar

Birlikte kullanılan parçalar. Birini import etmeyi unutmak Angular'da sessizce başarısız olduğu için bunları tercih edin.

| Sabit | İçerik |
| --- | --- |
| `HU_FORM_FIELD_IMPORTS` | `HuFormField`, `HuInput`, `HuPrefix`, `HuSuffix` |
| `HU_TABLE_IMPORTS` | `HuTable`, `HuCellDef` |
| `HU_DIALOG_IMPORTS` | `HuDialog`, `HuDialogFooter` |
| `HU_DROPDOWN_IMPORTS` | `HuDropdown`, `HuDropdownTrigger`, `HuDropdownHeaderSlot` |
| `HU_TABS_IMPORTS` | `HuTabs`, `HuTab` |
| `HU_CARD_IMPORTS` | `HuCard`, `HuCardActions`, `HuCardFooter` |
| `HU_SHELL_IMPORTS` | `HuShell`, `HuTopbarStart`, `HuTopbarEnd`, `HuSidebarFooter`, `HuShellLogo` |

```ts
imports: [HuButton, HU_FORM_FIELD_IMPORTS, HU_TABLE_IMPORTS]
```

### Tasarım token'ları

Bütün renk ve ölçüler CSS değişkenidir. Stil import'unun **altında** `:root { … }` içinde ezin. Koyu tema için
`:root[data-theme='dark'] { … }` kullanın.

| Grup | Değişkenler |
| --- | --- |
| Marka | `--hu-primary`, `--hu-primary-hover`, `--hu-primary-active`, `--hu-primary-fg`, `--hu-primary-soft`, `--hu-primary-soft-hover`, `--hu-primary-soft-fg` |
| Durum | `--hu-{success,warning,danger,info}`, `…-hover`, `…-contrast`, `…-soft`, `…-fg` |
| Yüzey ve metin | `--hu-bg`, `--hu-surface`, `--hu-surface-2`, `--hu-surface-3`, `--hu-border`, `--hu-border-strong`, `--hu-text`, `--hu-text-muted`, `--hu-text-subtle` |
| Tipografi | `--hu-font-sans`, `--hu-font-mono`, `--hu-text-{xs,sm,md,lg,xl,2xl,3xl}` |
| Boşluk | `--hu-space-{1,2,3,4,5,6,8,10}` (0.25rem – 2.5rem) |
| Köşe ve gölge | `--hu-radius-{sm,md,lg,xl,full}`, `--hu-shadow-{sm,md,lg}` |
| Kontrol yüksekliği | `--hu-control-{xs,sm,md,lg,xl}` |
| Layout | `--hu-sidebar-width`, `--hu-sidebar-collapsed-width`, `--hu-topbar-height`, `--hu-content-max-width`, `--hu-sidebar-{bg,fg,muted,hover,active-bg,active-fg,border}` |
| Component'e özel | `--hu-dropdown-min-width`, `--hu-dropdown-max-width`, `--hu-dropdown-max-height`, `--hu-table-max-height` |

```scss
@use '@ucme-ui/angular/styles';

:root {
  --hu-primary: #0b5cad;
  --hu-primary-hover: #094a8c;
  --hu-radius-md: 8px;
}
```
