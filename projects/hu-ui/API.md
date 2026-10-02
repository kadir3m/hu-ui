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

- **Layout:** [hu-shell](#hu-shell) · [hu-breadcrumb](#hu-breadcrumb) · [hu-theme-toggle](#hu-theme-toggle) · [Grid](#grid)
- **Form:** [hu-button](#hu-button) · [hu-button-group](#hu-button-group) · [huInput](#huinput) · [hu-form-field](#hu-form-field) · [hu-checkbox](#hu-checkbox) · [hu-switch](#hu-switch) · [hu-date-picker](#hu-date-picker) · [hu-editor](#hu-editor) · [hu-input-number](#hu-input-number) · [hu-multi-select](#hu-multi-select) · [hu-password](#hu-password) · [huMask](#humask-inputmask) · [hu-radio-group](#hu-radio-group--hu-radio) · [hu-rating](#hu-rating) · [hu-file-upload](#hu-file-upload)
- **Tarih:** [hu-agenda](#hu-agenda) · [hu-calendar](#hu-calendar) · [tarih yardımcıları](#tarih-yardımcıları)
- **Veri:** [hu-table](#hu-table) · [hu-paginator](#hu-paginator) · [hu-tabs](#hu-tabs--hu-tab) · [hu-stepper](#hu-stepper--hu-step) · [ContextMenu](#contextmenu-hucontextmenu) · [hu-card](#hu-card) · [hu-dropdown](#hu-dropdown)
- **Geri bildirim:** [hu-dialog](#hu-dialog) · [ConfirmPopup](#confirmpopup-huconfirm) · [huTooltip](#hutooltip) · [HuToastService + hu-toaster](#hutoastservice--hu-toaster) · [hu-alert](#hu-alert) · [hu-badge](#hu-badge) · [hu-avatar](#hu-avatar) · [hu-spinner](#hu-spinner)
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
| `expanded` | `boolean?` | Alt menü başlangıçta açık gelsin; kullanıcı sonra kapatabilir |

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

### Grid

12 kolonlu responsive grid. Yalnızca CSS sınıflarıdır, TypeScript import'u gerekmez
(`@use '@ucme-ui/angular/styles'` ile gelir). Kırılımlar **ekranın değil grid'in kendi genişliğine** göre
çalışır (container query), bu yüzden kart, dialog veya dar bir yan panel içinde de doğru davranır.
Grid bulunduğu alanın tüm genişliğini kaplar. Kırılım değerleri ekran değil içerik alanı ölçüsüdür: örneğin
1440 px ekranda sidebar ve kenar boşlukları çıkınca içerik alanı ~1000–1150 px olur ve `lg` (960 px) devreye girer.

| Sınıf | Açıklama |
| --- | --- |
| `hu-grid` | Grid kapsayıcısı. Kolon sınıfı verilmeyen öğe tam satır kaplar |
| `hu-col-{1-12}` | Öğenin kapladığı kolon sayısı |
| `hu-col-{sm\|md\|lg\|xl}-{1-12}` | Grid bu genişlikten büyükse kolon sayısı (sm 480px, md 720px, lg 960px, xl 1200px) |
| `hu-col-start-{1-12}`, `hu-col-{bp}-start-{1-12}` | Öğenin başladığı kolon |
| `hu-col-{bp}-hidden` | O genişlikten itibaren gizli |
| `hu-col-{bp}-visible` | Yalnızca o genişlikten itibaren görünür |
| `hu-col-hidden` | Her zaman gizli |
| `hu-grid--auto` | Kolon sayısı otomatik; her öğe en az `--hu-grid-min` genişliğinde |
| `hu-grid--gap-{none\|sm\|lg\|xl}` | Aralık: 0 / 0.5rem / 1.5rem / 2rem (varsayılan 1rem) |

| CSS değişkeni | Varsayılan | Açıklama |
| --- | --- | --- |
| `--hu-grid-gap` | `var(--hu-space-4)` | Öğeler arası boşluk |
| `--hu-grid-min` | `16rem` | `hu-grid--auto` için en küçük öğe genişliği |

```html
<!-- Dar alanda alt alta, 720px üstünde 2, 960px üstünde 4 kolon -->
<div class="hu-grid">
  <hu-card class="hu-col-12 hu-col-md-6 hu-col-lg-3">…</hu-card>
  <hu-card class="hu-col-12 hu-col-md-6 hu-col-lg-3">…</hu-card>
  <hu-card class="hu-col-12 hu-col-lg-8">Ana içerik</hu-card>
  <hu-card class="hu-col-12 hu-col-lg-4">Yan panel</hu-card>
</div>

<!-- Form: iki kolon, adres tam satır -->
<form class="hu-grid">
  <hu-form-field class="hu-col-12 hu-col-md-6" label="Ad"><input huInput /></hu-form-field>
  <hu-form-field class="hu-col-12 hu-col-md-6" label="Soyad"><input huInput /></hu-form-field>
  <hu-form-field class="hu-col-12" label="Adres"><textarea huInput></textarea></hu-form-field>
</form>

<!-- Kart listesi: kolon sayısı genişliğe göre -->
<div class="hu-grid hu-grid--auto" style="--hu-grid-min: 14rem">…</div>
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

### hu-input-number

Sayı girişi. Türkçe biçimde gösterir (`1.234,56`) ve yazarken basamakları gruplar. Değer `number | null`'dır.
↑/↓ ile `step` kadar artırır (Shift ile 10 katı), Home/End ile `min`/`max`'a gider. Nokta tuşu da ondalık
virgülü yazar. `min`/`max` dışındaki değer odaktan çıkınca sınıra çekilir; formda yazarken `min`/`max` hatası
verir (`HU_DEFAULT_ERROR_MESSAGES` ile Türkçe mesaj).

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `min` / `max` | `number` | `null` | Sınırlar |
| `step` | `number` | `1` | Adım; ondalık olabilir (`0.05`), kayan nokta hatası düzeltilir |
| `mode` | `'decimal' \| 'currency'` | `'decimal'` | `currency`: para simgesi ve 2 ondalık |
| `currency` | `string` | `'TRY'` | ISO kodu: `TRY` → ₺, `USD` → $, `EUR` → € |
| `minFractionDigits` / `maxFractionDigits` | `number` | decimal `0` · currency `2` | Ondalık basamak sayısı |
| `useGrouping` | `boolean` | `true` | Binlik ayracı |
| `prefix` / `suffix` | `string` | — | Kutudaki sabit metin: `'%'`, `'kg'`, `'adet'` |
| `buttons` | `'none' \| 'stacked' \| 'horizontal'` | `'none'` | Artır/azalt butonları. Basılı tutunca hızlanarak tekrar eder; sınırda pasifleşir |
| `placeholder`, `size`, `disabled`, `readonly`, `ariaLabel`, `id` | | | Diğer form kontrolleriyle aynı |

| Model | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `value` | `number \| null` | `null` | Boş alan `null` olur |

```html
<hu-form-field label="Kontenjan" required>
  <hu-input-number formControlName="quota" [min]="1" [max]="500" buttons="horizontal" />
</hu-form-field>

<hu-input-number [(value)]="fee" mode="currency" currency="TRY" />
<hu-input-number [(value)]="gpa" [min]="0" [max]="4" [step]="0.05" [minFractionDigits]="2" [maxFractionDigits]="2" buttons="stacked" />
<hu-input-number [(value)]="discount" suffix="%" [min]="0" [max]="100" />
```

### hu-multi-select

Çoklu seçim kutusu. Değer seçilen `value`'ların dizisidir (`T[]`, seçenek sırasıyla). Arama Türkçe karakterleri
ve büyük/küçük harfi yok sayar ("ogr" → "Öğrenci", "İNSAN" → "İnsan"). Panel üst katmanda açılır.
Klavye: ↑/↓, Enter (aramasızken Boşluk) ile seç, Esc ile kapat. Kapalıyken Backspace son seçimi kaldırır.

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `options` | `HuSelectOption<T>[]` | `[]` | `{ label, value, description?, icon?, disabled?, group? }` |
| `placeholder` | `string` | `'Seçin'` | Seçim yokken |
| `filter` | `boolean` | `true` | Panelde arama kutusu |
| `filterPlaceholder` | `string` | `'Ara…'` | |
| `showSelectAll` | `boolean` | `true` | Tümünü seç (aramaya uyan, devre dışı olmayan seçenekler). `selectionLimit` varken gizlenir |
| `showClear` | `boolean` | `true` | Seçimi temizleyen ✕ |
| `display` | `'chips' \| 'text'` | `'chips'` | Seçilenlerin gösterimi |
| `maxSelectedLabels` | `number` | `3` | Bundan fazlasında "5 seçildi" yazılır |
| `selectionLimit` | `number` | `null` | En fazla seçim; sınırda diğer seçenekler pasifleşir |
| `compareWith` | `(a: T, b: T) => boolean` | `Object.is` | Nesne değerlerde eşitlik |
| `emptyMessage` | `string` | `'Sonuç bulunamadı'` | |
| `size`, `disabled`, `ariaLabel`, `id` | | | Diğer form kontrolleriyle aynı |

| Model | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `value` | `T[]` | `[]` | Seçilen değerler |

| Output | Değer | Ne zaman |
| --- | --- | --- |
| `closed` | `void` | Panel kapanınca |

```ts
departments: HuSelectOption[] = [
  { label: 'Bilgisayar Mühendisliği', value: 'bm', group: 'Mühendislik' },
  { label: 'Matematik', value: 'mat', group: 'Fen', description: 'Lisans' },
];
```

```html
<hu-form-field label="Bölümler" required>
  <hu-multi-select formControlName="departments" [options]="departments" placeholder="Bölüm seçin" />
</hu-form-field>

<!-- Nesne değerler -->
<hu-multi-select [options]="courseOptions" [compareWith]="sameCourse" [selectionLimit]="3" />
```

### hu-password

Şifre girişi: göz ikonuyla göster/gizle, güç göstergesi, canlı kural listesi ve Caps Lock uyarısı. Değer `string`.

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `toggleMask` | `boolean` | `true` | Göster/gizle butonu |
| `feedback` | `boolean` | `false` | 4 çubuklu güç göstergesi (Çok zayıf, Zayıf, Orta, İyi, Güçlü) |
| `showRules` / `rulesAlways` | `boolean` | `false` | Kural listesi / alan boşken de göster |
| `rules` | `HuPasswordRule[]` | `HU_PASSWORD_RULES` | `{ label, test(value) }`. Varsayılan: 8 karakter, büyük harf, küçük harf, rakam, sembol |
| `minStrength` | `number` (0–4) | `0` | Bundan zayıf şifrede `huPasswordWeak` hatası ("Daha güçlü bir şifre seçin.") |
| `autocomplete` | `'current-password' \| 'new-password' \| 'off'` | `'current-password'` | Kayıt / değiştirmede `new-password` verin |
| `placeholder`, `size`, `disabled`, `ariaLabel`, `id` | | | Diğer form kontrolleriyle aynı |

| Model | Tip | Varsayılan |
| --- | --- | --- |
| `value` | `string` | `''` |

Yardımcı: `huPasswordStrength(value): number` (0–4). Uzunluk ve karakter çeşitliliğini puanlar; tekrar eden
(`aaaa`) ve sıralı (`1234`, `qwer`) karakterler puanı düşürür.

```html
<hu-form-field label="Yeni şifre" required>
  <hu-password formControlName="password" feedback showRules [minStrength]="3" autocomplete="new-password" />
</hu-form-field>
```

### huMask (InputMask)

`<input>`'a maske ekler. Yazarken biçimlendirir, fazla veya uygun olmayan karakteri yazdırmaz, yapıştırılan metni
düzeltir, sabit karakterlerin (parantez, boşluk) üzerinden Backspace / Delete ile silmeyi bilir. Eksik girişte
`huMask` hatası ("Eksik veya hatalı giriş.") verir. `huInput` ile birlikte kullanın.

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `huMask` | `string` | **zorunlu** | `9` rakam, `a` harf (Türkçe dahil), `*` harf veya rakam; diğerleri sabit (`\9` ile kaçış) |
| `unmask` | `boolean` | `false` | Forma yalnızca girilen karakterler gider (`5551234567`); ekranda maskeli kalır |
| `uppercase` | `boolean` | `true` | Harfleri büyük yaz |
| `placeholder` | `string` | maskeden | Boşken örnek; verilmezse `(___) ___ __ __` |
| `slotChar` | `string` | `'_'` | Placeholder'daki boş karakter |

Hazır maskeler (`HU_MASKS`): `phone` `(999) 999 99 99` · `mobile` `0(999) 999 99 99` · `date` `99.99.9999` ·
`time` `99:99` · `tckn` · `iban` `TR99 9999 …` · `card` · `postalCode`. `exportAs: 'huMask'` ile `complete`
(tamamı girildi mi) okunabilir.

```html
<input huInput [huMask]="masks.phone" formControlName="phone" />
<input huInput [huMask]="masks.mobile" unmask formControlName="mobile" />
<input huInput huMask="aa-9999999" />
```

### hu-radio-group / hu-radio

Tek seçim. Native radyo düğmeleri kullanır: Tab ile gruba girilir, ok tuşlarıyla seçilir (pasif seçenekler atlanır).
`hu-form-field` içinde grup, alanın etiketiyle adlandırılır. `HU_RADIO_IMPORTS` ile import edin.

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `options` | `HuRadioOption<T>[]` | `[]` | `{ label, value, description?, disabled? }`. Ya da içeride `hu-radio` yazın |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Yerleşim |
| `variant` | `'default' \| 'card'` | `'default'` | `card`: çerçeveli, açıklamalı, geniş tıklama alanlı seçenekler |
| `disabled` / `required` | `boolean` | `false` | |
| `compareWith` | `(a, b) => boolean` | `Object.is` | Nesne değerlerde eşitlik |

| Model | Tip | Varsayılan |
| --- | --- | --- |
| `value` | `T \| null` | `null` |

`hu-radio`: `value` (zorunlu), `description`, `disabled`; içerik etikettir.

```html
<hu-form-field label="Ödeme yöntemi" required>
  <hu-radio-group variant="card" formControlName="payment" [options]="payments" />
</hu-form-field>

<hu-radio-group [(value)]="size" orientation="horizontal" aria-label="Beden">
  <hu-radio value="s">Küçük</hu-radio>
  <hu-radio value="m">Orta</hu-radio>
</hu-radio-group>
```

### hu-rating

Yıldızla puanlama. Her yıldız görünmez bir radyo düğmesidir: ok tuşlarıyla puan verilir, ekran okuyucu
"4 / 5, İyi" okur. Üzerine gelince önizleme; seçili yıldıza tekrar tıklamak puanı temizler. `readonly` ile
ondalık değerler (4,6) kısmi dolu yıldızla gösterilir.

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `max` | `number` | `5` | Yıldız sayısı |
| `readonly` | `boolean` | `false` | Gösterim modu |
| `clearable` | `boolean` | `true` | Seçili yıldıza tekrar tıklayınca 0 |
| `showLabel` | `boolean` | `false` | Yanında etiket |
| `labels` | `string[]` | `['Çok kötü', 'Kötü', 'Orta', 'İyi', 'Çok iyi']` | Puan etiketleri; boş dizi → `4 / 5` |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | |
| `disabled`, `ariaLabel` | | `false`, `'Puan'` | |

| Model | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `value` | `number` | `0` | 0 = puan yok. Zorunlu tutmak için `Validators.min(1)` |

```html
<hu-form-field label="Memnuniyet" required>
  <hu-rating formControlName="score" showLabel />
</hu-form-field>
<hu-rating [value]="4.6" readonly size="sm" />
```

### hu-file-upload

Sürükle-bırak destekli dosya seçme alanı. Değer `File[]`'dir; form kontrolü olarak veya `[(files)]` ile
kullanılır ve `hu-form-field` içinde hata gösterir. Görseller küçük önizlemeyle listelenir.

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `accept` | `string` | `''` | Kabul edilen türler, `<input accept>` biçiminde: `'image/*,.pdf'` |
| `multiple` | `boolean` | `false` | Birden çok dosya. Kapalıyken yeni dosya eskisinin yerine geçer |
| `maxFileSize` | `number` (bayt) | `null` | Dosya başına en büyük boyut |
| `maxFiles` | `number` | `null` | En fazla dosya sayısı |
| `uploader` | `HuFileUploader` | `null` | Verilirse eklenen dosyalar hemen yüklenir; satırda ilerleme çubuğu, hata olursa "tekrar dene" |
| `label` | `string` | `'Dosyaları buraya sürükleyin veya'` | Alandaki metin |
| `hint` | `string` | otomatik | Alt bilgi; verilmezse `accept`, boyut ve adetten üretilir |
| `preview` | `boolean` | `true` | Görsellerin önizlemesi |
| `disabled` | `boolean` | `false` | Devre dışı |

| Model | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `files` | `File[]` | `[]` | Seçilen dosyalar |

| Output | Değer | Ne zaman |
| --- | --- | --- |
| `rejected` | `HuFileRejection[]` | Kurala uymayan dosyalar (`reason`: `'type' \| 'size' \| 'count'`, `message`). Mesajlar alanın altında da gösterilir |
| `uploaded` | `{ file, result }` | `uploader` başarıyla bitince |
| `uploadError` | `{ file, error }` | `uploader` hata verince |
| `removed` | `File` | Kullanıcı listeden kaldırınca |

Metotlar: `browse()` (seçme penceresini açar), `clear()`. Yardımcı: `formatFileSize(1536)` → `'1,5 KB'`.
Aynı dosya iki kez eklenmez.

`HuFileUploader = (file: File, progress: (percent: number) => void) => Promise<unknown>`:

```ts
upload: HuFileUploader = (file, progress) =>
  new Promise((resolve, reject) => {
    const body = new FormData();
    body.append('file', file);
    this.http.post('/api/uploads', body, { reportProgress: true, observe: 'events' }).subscribe({
      next: (e) => {
        if (e.type === HttpEventType.UploadProgress && e.total) progress((e.loaded / e.total) * 100);
        if (e.type === HttpEventType.Response) resolve(e.body);
      },
      error: reject,
    });
  });
```

```html
<hu-form-field label="Başvuru belgeleri" required>
  <hu-file-upload formControlName="documents" accept=".pdf,.docx" multiple [maxFiles]="3" [maxFileSize]="2 * 1024 * 1024" />
</hu-form-field>

<hu-file-upload multiple [uploader]="upload" (uploaded)="onUploaded($event.result)" />
```

---

## Tarih

### hu-agenda

Ajanda / takvim: **ay**, **hafta**, **gün** ve **liste** görünümleri. Boş bir saate tıklayarak veya sürükleyerek
aralık seçip kayıt eklenir; kayıtlar sürüklenerek taşınır (hafta/gün: saat ve gün, ay: gün), alt kenarından çekilerek
süresi değiştirilir, tıklanınca yerleşik formla düzenlenir veya silinir. Çakışan kayıtlar yan yana dizilir; bugünde
"şu an" çizgisi görünür; türlere (kategori) göre renklendirme ve filtre vardır. Pazartesi ile başlar, Türkçe gün/ay
adları kullanılır. Dokunmatikte sürükleme sayfa kaydırmasını bozmasın diye kapalıdır, dokunarak ekleme ve düzenleme çalışır.

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `views` | `HuAgendaView[]` | `['month', 'week', 'day', 'list']` | Görünüm seçicideki görünümler |
| `categories` | `HuAgendaCategory[]` | Randevu, Toplantı, Ders, Hatırlatma, Kişisel | Türler: `{ key, label, color }`. Renk ve filtre için |
| `editable` | `boolean` | `true` | Ekleme, sürükleme, düzenleme. `false` → salt okunur |
| `editor` | `boolean` | `true` | Yerleşik form. `false` ise `slotSelect` / `eventClick` ile kendi formunuzu açın |
| `weekends` | `boolean` | `true` | Hafta görünümünde cumartesi-pazar |
| `slotMinutes` | `number` | `30` | Izgara çizgisi aralığı (dk) |
| `snapMinutes` | `number` | `15` | Sürükleme ve seçim adımı (dk) |
| `hourHeight` | `number` | `48` | Bir saatin yüksekliği (px) |
| `businessHours` | `{ start, end } \| null` | `{ start: 8, end: 18 }` | Hafta/gün görünümünde gösterilen saat aralığı; dışındaki saatler gizlenir. Aralık dışında bir kayıt varsa ızgara onu kapsayacak kadar genişler, kayıt kaybolmaz. `null` → 24 saat |
| `scrollToHour` | `number` | `8` | Hafta/gün görünümüne geçince kaydırılan saat (ızgara ekrana sığmıyorsa) |
| `maxPerDay` | `number` | `3` | Ay görünümünde günde en çok kayıt; fazlası "+N daha" (gün görünümüne gider) |
| `listDays` | `number` | `30` | Liste görünümünün kapsadığı gün sayısı |

| Model | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `events` | `HuAgendaEvent[]` | `[]` | Kayıtlar. Ekleme / taşıma / silmede bileşen listeyi kendisi günceller |
| `view` | `'month' \| 'week' \| 'day' \| 'list'` | `'week'` | Görünüm |
| `date` | `Date` | bugün | Gösterilen tarih |

| Output | Değer | Ne zaman |
| --- | --- | --- |
| `eventCreate` | `HuAgendaEvent` | Formdan yeni kayıt kaydedilince |
| `eventUpdate` | `{ event, previous, kind }` | Taşıma (`'move'`), süre değiştirme (`'resize'`) veya formla düzenleme (`'edit'`) |
| `eventDelete` | `HuAgendaEvent` | Formdan silinince |
| `eventClick` | `HuAgendaEvent` | Kayda tıklanınca (salt okunurda da) |
| `slotSelect` | `{ start, end, allDay }` | Boş alana tıklanınca / sürükleyerek seçilince |
| `rangeChange` | `{ start, end }` | Görünen aralık değişince (veriyi sunucudan aralığa göre getirmek için) |

Metotlar (template referansıyla): `today()`, `previous()`, `next()`.

**`HuAgendaEvent<T>`**

| Alan | Tip | Açıklama |
| --- | --- | --- |
| `id` | `string \| number` | Kimlik |
| `title` | `string` | Başlık |
| `start` / `end` | `Date` | Başlangıç / bitiş (bitiş hariç). Tüm gün kayıtta bitiş son günün ertesi 00:00 (veya aynı gün) |
| `allDay` | `boolean?` | Tüm gün; hafta/gün görünümünde üst satırda |
| `category` | `string?` | `categories` anahtarı: renk ve filtre |
| `color` | `HuAgendaColor?` | `primary`, `info`, `success`, `warning`, `danger`, `neutral`, `purple`, `pink` (kategoriyi ezer) |
| `location` / `description` | `string?` | Konum, açıklama |
| `readonly` | `boolean?` | Bu kayıt taşınamaz / düzenlenemez |
| `data` | `T?` | Kendi verileriniz |

```html
<hu-agenda
  [(events)]="events"
  view="week"
  (eventCreate)="api.create($event)"
  (eventUpdate)="api.update($event.event)"
  (eventDelete)="api.delete($event.id)"
  (rangeChange)="load($event.start, $event.end)"
/>

<!-- Hafta içi, 15 dk, 09–17 mesai -->
<hu-agenda [(events)]="events" [weekends]="false" [slotMinutes]="15" [businessHours]="{ start: 9, end: 17 }" />

<!-- Kendi formunuz -->
<hu-agenda [(events)]="events" [editor]="false" (slotSelect)="openMyForm($event)" (eventClick)="openMyForm($event)" />
```

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

Veri tablosu. Arama, sütun seçici (göster/gizle, sırala), sıralama, tekli/çoklu seçim ve toplu işlem, açılır
satır detayı, dahili sayfalama, CSV dışa aktarma, alt toplam satırı, sabit sütunlar ve mobilde kart görünümü
destekler. `HU_TABLE_IMPORTS` ile import edin (`HuTable`, `HuCellDef`, `HuRowDetail`, `HuTableToolbar`,
`HuTableBulkActions`).

**Veri**

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `columns` | `HuColumn<T>[]` | **zorunlu** | Sütun tanımları |
| `data` | `T[]` | `[]` | Satırlar (`null` / `undefined` boş sayılır) |
| `trackBy` | `(row: T) => unknown` | satırın kendisi | Satır kimliği (örn. `u => u.id`). Seçim ve detay için verin |
| `loading` | `boolean` | `false` | Spinner (veri varsa üstünde, yoksa yerinde) |
| `emptyText` | `string` | `'Kayıt bulunamadı.'` | Veri yokken metin |
| `lazy` | `boolean` | `false` | Sunucu tarafı: arama, sıralama, sayfalama tabloda yapılmaz; yalnızca modeller değişir |
| `totalRecords` | `number` | `null` | `lazy` iken toplam kayıt (sayfalama için) |
| `sortMode` | `'client' \| 'server'` | `'client'` | Eski seçenek; `lazy` kullanın |

**Görünüm**

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `variant` | `'default' \| 'bordered' \| 'card' \| 'minimal'` | `'default'` | `bordered`: hücre ızgarası · `card`: araç çubuğuyla birlikte çerçeveli kutu · `minimal`: arka plansız, büyük harfli başlıklar |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Satır yüksekliği (`dense` = `sm`) |
| `striped` | `boolean` | `false` | Dönüşümlü satır rengi |
| `hoverable` | `boolean` | `true` | Üzerine gelince satır vurgusu |
| `nowrap` | `boolean` | `false` | Hücreler satır kırmaz; geniş tablo yatay kayar |
| `stickyHeader` | `boolean` | `false` | Kaydırırken başlık sabit (yükseklik: `--hu-table-max-height`) |
| `responsive` | `'scroll' \| 'stack'` | `'scroll'` | `stack`: tablo 640 px'ten darsa her satır etiketli bir kart olur (tablonun genişliğine göre) |
| `clickableRows` | `boolean` | `false` | Satır tıklaması `rowClick` yayınlar. Satırdaki buton, link ve input tıklamaları sayılmaz |
| `contextMenu` | `HuDropdownEntry[] \| (row, rows) => HuDropdownEntry[]` | `null` | Satıra sağ tıklayınca açılan menü (klavye: menü tuşu / Shift+F10, dokunmatik: uzun basma). Fonksiyon verilirse menü satıra göre değişir. `null` → tarayıcının menüsü. Ayrıntı: [ContextMenu](#contextmenu-hucontextmenu) |

**Araç çubuğu.** `title`, `searchable`, `columnToggle`, `exportable` veya `huTableToolbar` içeriği varsa tablonun
üstünde görünür.

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `title` | `string` | — | Solda başlık |
| `searchable` | `boolean` | `false` | Genel arama: tüm sütunlarda (gizliler dahil, `searchable: false` hariç); Türkçe karakterleri yok sayar |
| `searchPlaceholder` | `string` | `'Tabloda ara…'` | |
| `columnToggle` | `boolean` | `false` | "Sütunlar" paneli: göster/gizle ve yukarı/aşağı taşı, "Varsayılan" ile sıfırla |
| `exportable` | `boolean` | `false` | "Dışa aktar": filtrelenmiş tüm satırları görünen sütunlarla CSV indirir (Excel için `;` ve UTF-8 BOM) |
| `exportFileName` | `string` | `'tablo'` | |
| `stateKey` | `string` | — | Gizli sütunlar, sütun sırası ve sayfa boyutu tarayıcıda (`localStorage`) bu adla saklanır |

**Seçim, detay, sayfalama**

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `selectionMode` | `'none' \| 'single' \| 'multiple'` | `'none'` | `multiple`: onay kutusu sütunu (başlıktaki kutu sayfayı seçer). `single`: satıra tıklayınca seçilir |
| `multiExpand` | `boolean` | `true` | Birden çok satır detayı aynı anda açık olabilir |
| `paginator` | `boolean` | `false` | Altta sayfalama (`hu-paginator`) |
| `pageSizeOptions` | `number[]` | `[10, 25, 50]` | |

| Model | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `sort` | `HuSort` | `{ key: '', direction: '' }` | Başlığa her tıklama: artan → azalan → sırasız |
| `search` | `string` | `''` | Arama metni (değişince ilk sayfaya dönülür) |
| `selection` | `T[]` | `[]` | Seçilen satırlar |
| `pageIndex` / `pageSize` | `number` | `0` / `10` | Sayfalama |
| `hiddenColumns` | `string[] \| null` | `column.hidden`'dan | Gizli sütun anahtarları |
| `columnOrder` | `string[] \| null` | `columns` sırası | Sütun sırası |

| Output | Değer | Ne zaman |
| --- | --- | --- |
| `rowClick` | `T` | Satıra tıklanınca (`clickableRows` açıkken) |
| `contextMenuSelect` | `HuTableContextEvent<T>` | Sağ tık menüsünden seçim: `{ option, row, rows }`. `rows`: seçili satırlardan birine sağ tıklandıysa tüm seçim, değilse yalnızca `row` |

Metotlar (template referansıyla): `exportCsv()`, `clearSelection()`, `resetColumns()`.

| Slot | Nereye yerleşir |
| --- | --- |
| `ng-template[huCell]` | Özel hücre: `huCell="sütunAnahtarı" let-row let-i="index"`; `[huCellOf]="data"` ile tip güvenli |
| `ng-template[huRowDetail]` | Açılır satır detayı (`let-row`); verilince her satırın başında ok çıkar. `[huRowDetailOf]="data"` |
| `[huTableToolbar]` | Araç çubuğunun sağına butonlar (Yeni, filtre…) |
| `[huTableBulkActions]` | Satır seçiliyken araç çubuğunda görünen toplu işlem butonları |
| `[huTableEmpty]` | Boş durum içeriği |

**`HuColumn<T>`**

| Alan | Tip | Açıklama |
| --- | --- | --- |
| `key` | `string` | Satırdaki alan adı veya `huCell` şablonunun anahtarı |
| `header` | `string` | Başlık metni |
| `sortable` | `boolean?` | Başlık tıklanınca sıralansın |
| `align` | `'start' \| 'center' \| 'end'?` | Hizalama |
| `width` | `string?` | Örn. `'120px'`, `'20%'` |
| `value` | `(row: T) => unknown?` | Görünen / sıralanan / aranan / dışa aktarılan değeri özel hesaplar |
| `hideOnMobile` | `boolean?` | Tablo 768 px'ten darsa gizlenir |
| `hideable` | `boolean?` | Sütun seçicide kapatılabilir mi (varsayılan `true`) |
| `hidden` | `boolean?` | Başlangıçta gizli; sütun seçiciden açılır |
| `sticky` | `'start' \| 'end'?` | Yatay kaydırmada sabit: `start` soldaki ilk veri sütunu, `end` sağdaki son sütun (işlemler) |
| `footer` | `string \| (rows) => unknown` | Alt toplam satırı; fonksiyon filtrelenmiş tüm satırları alır |
| `searchable` | `boolean?` | Genel aramaya dahil mi (varsayılan `true`) |
| `exportable` | `boolean?` | CSV'ye dahil mi (varsayılan `true`; işlem sütununda `false` verin) |

```html
<hu-table
  variant="card" title="Personel"
  [data]="people()" [columns]="columns" [trackBy]="byId"
  searchable columnToggle exportable paginator [pageSize]="10"
  selectionMode="multiple" [(selection)]="selected"
  stateKey="personel-tablosu"
>
  <button huTableToolbar hu-button size="sm">Yeni</button>
  <button huTableBulkActions hu-button size="sm" color="danger" (click)="remove(selected())">Sil</button>

  <ng-template huCell="status" [huCellOf]="people()" let-p>
    <hu-badge [variant]="p.active ? 'success' : 'neutral'" dot>{{ p.active ? 'Aktif' : 'Pasif' }}</hu-badge>
  </ng-template>
  <ng-template huRowDetail [huRowDetailOf]="people()" let-p>…</ng-template>
  <div huTableEmpty>Arama kriterlerine uyan kullanıcı yok.</div>
</hu-table>
```

**Sunucu tarafı:** `lazy` verin; `sortChange`, `searchChange`, `pageIndexChange`, `pageSizeChange` olaylarında veriyi
getirin ve `totalRecords` ile toplam kaydı bildirin.

```html
<hu-table lazy searchable paginator [data]="rows()" [totalRecords]="total()" [loading]="loading()" [columns]="columns"
  [(sort)]="sort" (sortChange)="load()" [(search)]="q" (searchChange)="load()"
  [(pageIndex)]="page" (pageIndexChange)="load()" />
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

### ContextMenu (huContextMenu)

Sağ tık menüsü. Herhangi bir elemente direktifle eklenir; sayfaya ayrıca bir şey yerleştirmek gerekmez.
Fareyle sağ tık, klavyede **menü tuşu** veya **Shift+F10**, dokunmatik ekranda **uzun basma** (550 ms) ile açılır.
Menüde ↑/↓, Home/End, harfle atlama, Enter ve Esc çalışır. İmlecin yanında açılır; ekrana sığmazsa sola/yukarı
döner. Kaydırma, pencere değişimi veya dışarı tıklama menüyü kapatır. Aynı anda tek menü açık olur. Tabloda
satır menüsü için `hu-table [contextMenu]` kullanın.

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `huContextMenu` | `HuDropdownEntry[] \| null` | — | Menü öğeleri ([hu-dropdown](#hu-dropdown) ile aynı tipler). Boş veya `null` → tarayıcının menüsü |
| `huContextMenuDisabled` | `boolean` | `false` | Geçici olarak kapatır |
| `huContextMenuLabel` | `string` | `'İşlemler'` | Menünün ekran okuyucu adı |

| Output | Değer | Ne zaman |
| --- | --- | --- |
| `contextMenuSelect` | `HuDropdownOption` | Öğe seçilince (`value` yoksa `label` döner) |
| `contextMenuOpen` / `contextMenuClose` | `void` | Menü açılınca / kapanınca |

Öğelerde `shortcut` alanı (`'Ctrl+C'`) sağda kısayol ipucu olarak görünür; kısayolu kendiniz bağlarsınız.

**Servis (`HuContextMenuService`):** `open({ entries, x, y, returnFocus?, ariaLabel? }): Promise<HuDropdownOption | null>`
menüyü verilen ekran koordinatında açar; seçim yapılmadan kapanırsa `null` döner. `close()` açık menüyü kapatır.

```html
<li tabindex="0" [huContextMenu]="fileActions" (contextMenuSelect)="run($event.value, file)">{{ file.name }}</li>

<hu-table [data]="files()" [columns]="columns" selectionMode="multiple" [(selection)]="selected"
          [contextMenu]="fileMenu" (contextMenuSelect)="onAction($event)" />
```

```ts
fileActions: HuDropdownEntry[] = [
  { label: 'Aç', value: 'open', icon: 'eye', shortcut: 'Enter' },
  { label: 'Yeniden adlandır', value: 'rename', icon: 'edit', shortcut: 'F2' },
  { divider: true },
  { label: 'Sil', value: 'delete', icon: 'trash', danger: true },
];

// Tabloda satıra göre menü; rows: işlemin uygulanacağı satırlar
fileMenu = (file: FileItem, rows: readonly FileItem[]): HuDropdownEntry[] => [
  { header: rows.length > 1 ? `${rows.length} öğe seçili` : file.name },
  { label: 'Aç', value: 'open', disabled: rows.length > 1 },
  { label: 'Sil', value: 'delete', danger: true },
];

onAction({ option, rows }: HuTableContextEvent<FileItem>) {
  if (option.value === 'delete') this.remove(rows);
}
```

### hu-stepper / hu-step

Çok adımlı formlar ve sihirbazlar. `HU_STEPPER_IMPORTS` ile import edin.

**hu-stepper**

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Yerleşim. Dar alanda (< 640 px) yatayda yalnızca aktif adımın adı görünür |
| `linear` | `boolean` | `false` | Bir adım tamamlanmadan sonrakine geçilemez (başlığa tıklayarak da) |

| Model | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `activeIndex` | `number` | `0` | Aktif adım |

| Output | Değer | Ne zaman |
| --- | --- | --- |
| `blocked` | `number` | Linear modda tamamlanmamış adımdan ileri gidilmek istenince (o adımın sırası) |

Metotlar (template referansıyla, `#stepper`): `next()`, `previous()`, `select(index)`, `reset()`.
Butonlar için kısayol direktifleri: `huStepperNext`, `huStepperPrevious`.

**hu-step**

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `label` | `string` | **zorunlu** | Adım adı |
| `description` | `string` | — | Adın altındaki küçük açıklama |
| `completed` | `boolean` | ziyarete göre | Tamamlandı mı? Verilmezse geçilen adımlar tamamlanmış sayılır. Linear modda `false` ise ileri geçilmez |
| `error` | `boolean` | `false` | Adımı hatalı gösterir |
| `optional` | `boolean` | `false` | İsteğe bağlı; linear modda atlanabilir |
| `icon` | `string` | — | Numara yerine ikon |
| `disabled` | `boolean` | `false` | Tıklanamaz adım |

```html
<hu-stepper #stepper linear [(activeIndex)]="step" (blocked)="personal.markAllAsTouched()">
  <hu-step label="Kişisel bilgiler" [completed]="personalValid()">
    <form [formGroup]="personal">…</form>
    <button hu-button huStepperNext>İleri</button>
  </hu-step>
  <hu-step label="Onay">
    <button hu-button variant="ghost" huStepperPrevious>Geri</button>
    <button hu-button (click)="save(); stepper.reset()">Gönder</button>
  </hu-step>
</hu-stepper>
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

### hu-timeline

Zaman çizelgesi: süreç adımları, geçmiş, sipariş durumu. Dikey (sağ, sol, dönüşümlü) veya yatay.
`HU_TIMELINE_IMPORTS` ile gelir.

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `events` | `T[]` (varsayılan `HuTimelineEvent[]`) | `[]` | `{ title, description?, date?, icon?, color?, status? }` |
| `layout` | `'vertical' \| 'horizontal'` | `'vertical'` | Yön |
| `align` | `'right' \| 'left' \| 'alternate'` | `'right'` | Dikeyde içeriğin yeri; `alternate` dar alanda tek sütuna iner |
| `opposite` | `boolean \| null` | `null` | Tarihi karşı tarafta göster (`null`: dikeyde ve tarih varsa) |

`status`: `'done'` dolu, `'current'` halkalı, `'todo'` boş işaret. `color`: `'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'`.

| Şablon | Context | Açıklama |
| --- | --- | --- |
| `ng-template huTimelineContent` | `let-e`, `let-index` | Olay içeriği |
| `ng-template huTimelineOpposite` | `let-e`, `let-index` | Karşı taraf |
| `ng-template huTimelineMarker` | `let-e`, `let-index` | İşaret (avatar vb.) |

```html
<hu-timeline [events]="steps" align="alternate" />

<hu-timeline [events]="activity" [opposite]="false">
  <ng-template huTimelineMarker [huTimelineMarkerOf]="activity" let-a><hu-avatar [name]="a.user" size="sm" /></ng-template>
  <ng-template huTimelineContent [huTimelineContentOf]="activity" let-a>{{ a.user }} — {{ a.action }}</ng-template>
</hu-timeline>
```

### hu-tree

Ağaç. Tekli / çoklu / onay kutulu seçim (kısmi seçim üst düğüme yansır), arama (eşleşenlerin üstleri açılır),
tembel yükleme, WAI-ARIA tree klavye desteği (↑/↓, ←/→, Home/End, Enter/Boşluk, harfle atlama).
`HU_TREE_IMPORTS` ile gelir.

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `nodes` | `HuTreeNode<T>[]` | `[]` | `{ key, label, icon?, expandedIcon?, children?, leaf?, disabled?, selectable?, data? }` |
| `selectionMode` | `'none' \| 'single' \| 'multiple' \| 'checkbox'` | `'none'` | |
| `propagate` | `boolean` | `true` | Onay kutusunda seçim alt / üst düğümlere yayılır |
| `filter`, `filterPlaceholder` | `boolean`, `string` | `false`, `'Ara…'` | Arama kutusu |
| `loadChildren` | `(node) => Promise<HuTreeNode[]>` | `null` | `leaf: false` düğüm açılınca çağrılır |
| `ariaLabel`, `emptyMessage` | `string` | `'Ağaç'`, `'Sonuç bulunamadı'` | |

| Model | Tip | Açıklama |
| --- | --- | --- |
| `selection` | `HuTreeKey[]` | Seçili anahtarlar |
| `expanded` | `HuTreeKey[]` | Açık düğümler |

Output: `nodeSelect`, `nodeUnselect`, `nodeExpand`, `nodeCollapse` (`HuTreeNode`).
Metotlar: `expandAll()`, `collapseAll()`, `expand(node)`, `collapse(node)`, `toggle(node)`.
Şablon: `<ng-template huTreeNode let-node let-level="level" let-expanded="expanded">`.

```html
<hu-tree [nodes]="units" selectionMode="checkbox" [(selection)]="granted" filter />
<hu-tree [nodes]="roots" [loadChildren]="load" />
```

### hu-picklist

İki liste arasında öğe taşıma. Tık seç/bırak, Ctrl ile ekle, Shift ile aralık, çift tık taşı;
klavye: ↑/↓, Boşluk, Enter (taşı), Ctrl+A. Dar alanda listeler alt alta dizilir. `HU_PICKLIST_IMPORTS` ile gelir.

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `sourceHeader`, `targetHeader` | `string` | `'Seçilebilir'`, `'Seçilen'` | |
| `optionLabel` | `string \| (item) => string` | `null` | Nesnelerde etiket |
| `dataKey` | `string` | `null` | Takip anahtarı alanı |
| `filter`, `filterPlaceholder` | `boolean`, `string` | `false`, `'Ara…'` | Liste başına arama |
| `reorder` | `boolean` | `false` | Hedef listede sıralama düğmeleri |
| `listHeight` | `string` | `'16rem'` | |
| `disabled`, `emptyMessage` | | `false`, `'Öğe yok'` | |

| Model | Tip | Açıklama |
| --- | --- | --- |
| `source` | `T[]` | Sol liste |
| `target` | `T[]` | Sağ liste |

Output: `moved` → `{ items, from, to }`. Metotlar: `moveSelected(from)`, `moveAll(from)`.
Şablon: `<ng-template huPickListItem [huPickListItemOf]="list" let-item let-selected="selected">`.

```html
<hu-picklist [(source)]="available" [(target)]="selected" optionLabel="name" dataKey="code" filter reorder />
```

### hu-org-chart

Organizasyon şeması: kartlar ve bağlantı çizgileri, katlanabilir alt dallar, isteğe bağlı seçim.
Geniş şema yatay kaydırılır ve kök ortada açılır. `HU_ORG_CHART_IMPORTS` ile gelir.

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `value` | `HuOrgChartNode \| HuOrgChartNode[]` | `null` | `{ key, label, title?, image?, avatar?, icon?, color?, children?, selectable?, data? }` |
| `selectionMode` | `'none' \| 'single' \| 'multiple'` | `'none'` | |
| `collapsible` | `boolean` | `true` | Katlama düğmesi (kapalıyken alt sayısını gösterir) |
| `compact` | `boolean` | `false` | Dar kart ve aralıklar |
| `ariaLabel` | `string` | `'Organizasyon şeması'` | |

| Model | Tip | Açıklama |
| --- | --- | --- |
| `selection` | `HuOrgChartKey[]` | Seçili kartlar |
| `collapsed` | `HuOrgChartKey[]` | Katlanmış düğümler |

Output: `nodeSelect`, `nodeUnselect`. Metotlar: `toggle(node)`, `expandAll()`, `collapseFrom(level = 2)`.
Şablon: `<ng-template huOrgChartNode let-node let-selected="selected" let-collapsed="collapsed">`.
CSS: `--hu-org-chart-node-width` (11rem), `--hu-org-chart-line`.

```html
<hu-org-chart [value]="company" selectionMode="single" [(selection)]="picked" />
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

## Panel

### hu-accordion / hu-accordion-panel

Açılır paneller. Varsayılan olarak tek panel açık; `multiple` ile birden çok. Başlıklar arasında ↑/↓, Home/End.
Kapalı panelin içeriği DOM'da kalır (`inert`). `HU_ACCORDION_IMPORTS` ile gelir.

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `multiple` (accordion) | `boolean` | `false` | |
| `variant` (accordion) | `'default' \| 'separated' \| 'flush'` | `'default'` | |
| `header` (panel) | `string` | zorunlu | |
| `subtitle`, `icon` (panel) | `string` | — | |
| `value` (panel) | `string \| number` | sırası | Takip anahtarı |
| `disabled` (panel) | `boolean` | `false` | |

Model: `value` (accordion) → açık panellerin anahtarları. Metotlar: `toggle(key)`, `expandAll()`, `collapseAll()`.
Slot: `[huAccordionHeaderEnd]` başlığın sağı.

```html
<hu-accordion [(value)]="open" multiple variant="separated">
  <hu-accordion-panel header="Profil" icon="user" value="profil">…</hu-accordion-panel>
  <hu-accordion-panel header="Bildirimler" value="bildirim">
    <hu-badge huAccordionHeaderEnd>3</hu-badge>…
  </hu-accordion-panel>
</hu-accordion>
```

### hu-card

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `title` | `string` | — | Başlık |
| `subtitle` | `string` | — | Başlığın altındaki küçük metin |
| `padding` | `'none' \| 'sm' \| 'md'` | `'md'` | İçerik boşluğu (`none`: tablo gibi kenara dayanan içerik için) |
| `variant` | `'outlined' \| 'elevated' \| 'flat' \| 'soft'` | `'outlined'` | Görünüm |
| `hoverable` | `boolean` | `false` | Üzerine gelince öne çıkar |

| Slot | Nereye yerleşir |
| --- | --- |
| `huCardMedia` | Üstte, kenarlara dayalı görsel |
| `huCardActions` | Başlığın sağı |
| `huCardFooter` | Kartın altı |

```html
<hu-card title="Son başvurular" subtitle="Son 7 gün" padding="none">
  <a huCardActions hu-button variant="ghost" size="sm" routerLink="/basvurular">Tümü</a>
  <hu-table … />
  <div huCardFooter>…</div>
</hu-card>
<hu-card title="Etkinlik" hoverable><img huCardMedia src="/kapak.jpg" alt="" />…</hu-card>
```

### hu-divider

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `layout` | `'horizontal' \| 'vertical'` | `'horizontal'` | |
| `align` | `'start' \| 'center' \| 'end'` | `'center'` | İçerik verilirse metnin konumu |
| `type` | `'solid' \| 'dashed' \| 'dotted'` | `'solid'` | |

```html
<hu-divider>veya</hu-divider>
<a href="/profil">Profil</a><hu-divider layout="vertical" /><a href="/ayarlar">Ayarlar</a>
```

### hu-fieldset

Native `<fieldset>`. `disabled` içindeki tüm kontrolleri birden kapatır.

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `legend` | `string` | zorunlu | |
| `icon` | `string` | — | |
| `toggleable` | `boolean` | `false` | Başlığa tıklayınca açılır / kapanır |
| `disabled` | `boolean` | `false` | |

Model: `collapsed` (`boolean`, içerik DOM'da kalır).

```html
<hu-fieldset legend="Gelişmiş ayarlar" toggleable [(collapsed)]="closed">…</hu-fieldset>
```

## Medya

`HuMediaImage`: `{ src, thumbnail?, alt, caption?, description? }`.

### hu-carousel

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `items` | `T[]` | `[]` | |
| `numVisible` | `number` | `1` | Aynı anda görünen |
| `numScroll` | `number \| null` | `numVisible` | Bir adımda kayan |
| `breakpoints` | `{ minWidth, numVisible, numScroll? }[]` | `[]` | Carousel'in **kendi** genişliğine göre |
| `circular` | `boolean` | `true` | |
| `autoplay` | `number` (ms) | `0` | Üzerine gelince / odakta durur; durdur düğmesi |
| `showIndicators`, `showNavigators` | `boolean` | `true` | |
| `ariaLabel` | `string` | `'Carousel'` | |

Model: `page`. Metotlar: `next()`, `prev()`. Klavye ←/→, kaydırma hareketi.
`HU_CAROUSEL_IMPORTS` ile gelir.

```html
<hu-carousel [items]="news" [numVisible]="3" [breakpoints]="[{ minWidth: 0, numVisible: 1 }, { minWidth: 640, numVisible: 3 }]">
  <ng-template huCarouselItem [huCarouselItemOf]="news" let-n>…</ng-template>
</hu-carousel>
```

### hu-gallery / hu-lightbox

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `images` | `HuMediaImage[]` | `[]` | |
| `mode` | `'inline' \| 'grid'` | `'inline'` | Ana görsel + şerit veya ızgara |
| `showThumbnails` | `boolean` | `true` | |
| `fullscreen` | `boolean` | `true` | Lightbox düğmesi |
| `minColumnWidth` | `string` | `'10rem'` | Izgara döşeme genişliği |

Model: `activeIndex`. `hu-lightbox` tek başına: `[images]`, `[(open)]`, `[(index)]`, `loop`, `rotatable`.
Lightbox: yakınlaştırma (düğme, +/−, tekerlek), yakınken sürükleme, döndürme, ←/→, Esc.

```html
<hu-gallery [images]="photos" [(activeIndex)]="i" />
<hu-lightbox [images]="photos" [(open)]="show" [(index)]="i" />
```

### hu-image

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `src` | `string` | zorunlu | |
| `alt` | `string` | `''` | |
| `preview`, `previewSrc` | `boolean`, `string` | `false`, `src` | Tıklayınca lightbox |
| `caption` | `string` | — | Altta ve önizlemede |
| `width`, `height` | `number \| string` | — | Yer ayırır (sayfa kayması olmaz) |
| `fit` | `'cover' \| 'contain'` | `'cover'` | |
| `rounded`, `lazy` | `boolean` | `true` | |
| `fallback` | `string` | — | Yüklenemezse |

```html
<hu-image src="/foto.jpg" previewSrc="/foto-buyuk.jpg" alt="Toplantı salonu" [width]="320" [height]="200" preview />
```

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

### ConfirmPopup (huConfirm)

Butonun yanında açılan küçük onay kutusu. Sayfaya bir şey yerleştirmeniz gerekmez. Popup üst katmanda
açılır, kart veya tablonun taşma sınırına takılmaz ve dialog içinde de çalışır. Altta yer yoksa yukarı açılır.

**Direktif:** İşlemi `(click)` yerine `(confirmed)` ile bağlayın.

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `huConfirm` | `string` | **zorunlu** | Sorulacak mesaj |
| `header` | `string` | — | Mesajın üstünde kalın başlık |
| `icon` | `string \| null` | `'alert-triangle'` | İkon; `null` → ikon yok |
| `acceptLabel` / `rejectLabel` | `string` | `'Evet'` / `'Hayır'` | Buton metinleri |
| `acceptColor` | `HuButtonColor` | `'primary'` | Onay butonunun rengi (silmede `'danger'`) |
| `defaultFocus` | `'accept' \| 'reject'` | `'accept'` | Açılınca odaklanan buton |
| `confirmDisabled` | `boolean` | `false` | `true` ise sormadan doğrudan `(confirmed)` |

| Output | Değer | Ne zaman |
| --- | --- | --- |
| `confirmed` | `void` | Kullanıcı onaylayınca |
| `rejected` | `void` | Hayır, Esc veya dışarı tıklama |

**Servis (`HuConfirmPopupService`):** `confirm(options): Promise<boolean>`. Seçenekler direktifle aynıdır;
ek olarak `target` (popup'ın bağlanacağı element, genellikle `event.currentTarget`) verilir. `close()` açık
kutuyu kapatır.

```html
<button hu-button color="danger" huConfirm="Kayıt silinsin mi?" acceptLabel="Sil" acceptColor="danger"
        (confirmed)="remove()">Sil</button>
```

```ts
const ok = await inject(HuConfirmPopupService).confirm({
  target: event.currentTarget,
  message: `${user.name} silinsin mi?`,
  acceptLabel: 'Sil',
  acceptColor: 'danger',
});
```

### huTooltip

Kısa açıklama balonu. Üzerine gelince (gecikmeyle) veya klavyeyle odaklanınca açılır; Esc ve ayrılma kapatır.
Tercih edilen tarafa sığmazsa ters tarafa geçer, ok tetikleyicinin ortasını gösterir. Üst katmanda açıldığı için
kart / tablo / dialog içinde kesilmez. Açıkken tetikleyiciye `aria-describedby` bağlanır. Bir ipucundan
komşusuna geçerken beklemeden açılır; aynı anda tek ipucu görünür. Tıklamada kapanmaz, böylece "Kopyalandı!" gibi
geri bildirimler için metni değiştirebilirsiniz.

Yalnızca ikonlu butonlarda ipucu `aria-label`'ın yerine geçmez; ikisini birlikte verin.

| Input | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `huTooltip` | `string` | — | Metin (boşsa açılmaz; açıkken değişirse güncellenir) |
| `huTooltipPosition` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Tercih edilen taraf |
| `huTooltipDelay` | `number` | `350` | Açılma gecikmesi (ms) |
| `huTooltipDisabled` | `boolean` | `false` | Kapat |

Metotlar: `show()`, `hide()`. Renkler: `--hu-tooltip-bg`, `--hu-tooltip-fg` (koyu temada açık balon).

```html
<button hu-button iconOnly aria-label="Sil" huTooltip="Kaydı kalıcı olarak siler"><hu-icon name="trash" /></button>
<span tabindex="0" huTooltip="Avrupa Kredi Transfer Sistemi" huTooltipPosition="right">AKTS</span>
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
| `HU_TABLE_IMPORTS` | `HuTable`, `HuCellDef`, `HuRowDetail`, `HuTableToolbar`, `HuTableBulkActions` |
| `HU_DIALOG_IMPORTS` | `HuDialog`, `HuDialogFooter` |
| `HU_DROPDOWN_IMPORTS` | `HuDropdown`, `HuDropdownTrigger`, `HuDropdownHeaderSlot` |
| `HU_TABS_IMPORTS` | `HuTabs`, `HuTab` |
| `HU_RADIO_IMPORTS` | `HuRadioGroup`, `HuRadio` |
| `HU_STEPPER_IMPORTS` | `HuStepper`, `HuStep`, `HuStepperNext`, `HuStepperPrevious` |
| `HU_CARD_IMPORTS` | `HuCard`, `HuCardActions`, `HuCardFooter`, `HuCardMedia` |
| `HU_ACCORDION_IMPORTS` | `HuAccordion`, `HuAccordionPanel` |
| `HU_TIMELINE_IMPORTS` | `HuTimeline`, `HuTimelineContent`, `HuTimelineOpposite`, `HuTimelineMarker` |
| `HU_TREE_IMPORTS` | `HuTree`, `HuTreeNodeDef` |
| `HU_PICKLIST_IMPORTS` | `HuPickList`, `HuPickListItem` |
| `HU_ORG_CHART_IMPORTS` | `HuOrgChart`, `HuOrgChartNodeDef` |
| `HU_CAROUSEL_IMPORTS` | `HuCarousel`, `HuCarouselItem` |
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
