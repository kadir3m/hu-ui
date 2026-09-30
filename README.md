# HU UI

Angular uygulamaları için component kütüphanesi ve admin layout.
Dışa bağımlılık yok: Angular 19 (standalone + signals), SCSS ve CSS değişkenleri.

```
projects/
  hu-ui/     → Kütüphane (npm paketi olarak derlenir)
    styles/  → Token'lar, reset ve kontrol stilleri (hu-ui.scss)
    src/lib/ → Componentler
  demo/      → Admin panel örneği (tüm componentleri kullanır)
```

## Komutlar

| Komut | Açıklama |
| --- | --- |
| `npm run start:demo` | Demo uygulaması (kütüphane kaynağından canlı yüklenir) |
| `npm run build:ui` | Kütüphaneyi `dist/hu-ui` altına derler |
| `npm run pack:ui` | Yayınlamadan denemek için `dist/hu-ui-x.y.z.tgz` üretir |
| `npm run publish:ui` | Derler ve npmjs.org'a elle yayınlar (normalde CI yapar) |

Geliştirme sırasında `tsconfig.json` içindeki `@ucme-ui/angular` yolu doğrudan kaynağa bakar. Bu yüzden
kütüphanede yaptığınız değişiklik demo'ya derleme gerektirmeden yansır.

## Yayınlama (`@ucme-ui/angular` → npmjs.org)

Yayını GitHub Actions yapar ([.github/workflows/publish.yml](.github/workflows/publish.yml)).
Sürüm etiketi push'landığında paket derlenir ve provenance ile yayınlanır:

```bash
cd projects/hu-ui && npm version minor --no-git-tag-version && cd ../..   # 0.1.0 → 0.2.0
git commit -am "hu-ui 0.2.0"
git tag v0.2.0
git push --follow-tags
```

Workflow, etiketin `package.json` sürümüyle eşleşmesini de kontrol eder.

**Sürümleme (semver):** Kırıcı API değişikliğinde major, yeni component veya özellikte minor,
hata düzeltmesinde patch. Angular'ın major sürümüne geçildiğinde kütüphanenin de major sürümü artar.
Yayınlanan bir sürüm yalnızca 72 saat içinde geri çekilebilir ve aynı numara bir daha kullanılamaz.

## Başka bir projede kullanım

```bash
npm install @ucme-ui/angular
```

```scss
// styles.scss
@use '@ucme-ui/angular/styles';          // token'lar + reset + kontrol stilleri
// @use '@ucme-ui/angular/styles/tokens'; // yalnızca CSS değişkenleri
```

```html
<!-- index.html: tasarım Inter fontuyla yapıldı (yoksa sistem fontu kullanılır) -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

```ts
import { HuButton, HU_FORM_FIELD_IMPORTS, HU_TABLE_IMPORTS } from '@ucme-ui/angular';

imports: [HuButton, HU_FORM_FIELD_IMPORTS, HU_TABLE_IMPORTS]
```

## Componentler

| Grup | Parçalar |
| --- | --- |
| Form | `hu-button` (5 görünüm × 6 renk, 5 boyut), `hu-button-group`, `huInput` (input/textarea/select), `hu-form-field` (+`huPrefix`/`huSuffix`), `hu-checkbox`, `hu-switch`, `hu-date-picker` (tek tarih / aralık) |
| Tarih | `hu-calendar` (tek/aralık seçimi, min/max, `dateFilter`, etkinlik işaretleri, ay/yıl görünümü), tarih yardımcıları (`parseDate`, `formatDate`, `addDays` …) |
| Geri bildirim | `hu-alert`, `hu-badge`, `hu-avatar`, `hu-spinner`, `hu-dialog`, `HuToastService` + `hu-toaster` |
| Veri | `hu-card`, `hu-table` (+`huCell`), `hu-paginator`, `hu-tabs`/`hu-tab`, `hu-breadcrumb`, `hu-menu` |
| Layout | `hu-shell`, `hu-sidebar-nav`, `hu-theme-toggle`, `HuThemeService` |
| Çekirdek | `hu-icon` (+`provideHuIcons`), `provideHuErrorMessages`, `huMediaQuery` |

Kullanım örnekleri her component dosyasının JSDoc'unda ve `demo/src/app/pages` altında.

## Tasarım kuralları

- **Yalnızca token kullanın.** Renk, boşluk, köşe ve gölge değerleri `styles/_tokens.scss` içindeki
  `--hu-*` değişkenlerinden gelir. Koyu tema, token'ların `[data-theme='dark']` altında yeniden
  tanımlanmasıdır. Component'e sabit renk yazmayın.
- **Native elementleri sarın, yeniden yazmayın.** `hu-button` bir `<button>`, `huInput` bir `<input>`,
  `hu-dialog` ise bir `<dialog>` üzerine kurulu. Klavye, form ve erişilebilirlik davranışı tarayıcıdan gelir.
- **`ViewEncapsulation.None` + BEM (`hu-` öneki).** Tüketen projeler stilleri tek bir sınıfla ezebilir.
- **Signals API**: `input()`, `model()` (iki yönlü: `[(open)]`, `[(sort)]`, `[(pageIndex)]`), `output()`.
  Tüm componentler `OnPush`.
- **Metinler Türkçe**, `tr-TR` sıralama ve baş harf kuralları kullanılır.

## Butonlar

Görünüm (`variant`) ve renk (`color`) birbirinden bağımsızdır:

```html
<button hu-button>Kaydet</button>                                  <!-- solid + primary -->
<button hu-button variant="soft" color="success">Onayla</button>
<button hu-button variant="outline" color="danger">Sil</button>
<button hu-button variant="ghost" iconOnly aria-label="Düzenle"><hu-icon name="edit" /></button>
<a hu-button variant="link" routerLink="/kullanicilar">Tümü</a>
```

| `variant` | `color` | `size` | Diğer |
| --- | --- | --- | --- |
| `solid` · `soft` · `outline` · `ghost` · `link` | `primary` · `neutral` · `success` · `warning` · `danger` · `info` | `xs` · `sm` · `md` · `lg` · `xl` | `iconOnly`, `pill`, `block`, `loading`, `disabled` |

`color` verilmezse `solid`, `soft` ve `link` için `primary`; `outline` ve `ghost` için `neutral` kullanılır.
Aç/kapa butonları için `[attr.aria-pressed]` verin ve bunları `hu-button-group` içine koyun.

## Form hataları

`hu-form-field`, içindeki `huInput`'un reactive form durumunu okur. Kontrol dokunulduktan sonra
geçersizse hatayı otomatik gösterir. Mesajlar `HU_DEFAULT_ERROR_MESSAGES` içinden gelir ve şöyle
genişletilebilir:

```ts
provideHuErrorMessages({ tckn: 'Geçerli bir T.C. kimlik numarası giriniz.' })
```
