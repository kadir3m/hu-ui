# @hu/ui

Admin panelleri için Angular 19 component kütüphanesi. Hazır bir admin layout, form, tablo,
takvim ve geri bildirim componentleri içerir.

- **Bağımlılıksız:** Angular dışında hiçbir paket gerektirmez; stiller düz SCSS ve CSS değişkenleri.
- **Modern Angular:** standalone componentler, signals (`input()`, `model()`), `OnPush`.
- **Tema:** tüm renk ve ölçüler `--hu-*` token'larıdır. Açık/koyu tema hazır, marka rengi tek satırla değişir.
- **Erişilebilir:** native `<button>`, `<input>`, `<dialog>` üzerine kurulu. Tam klavye desteği ve ARIA.
- **Türkçe:** metinler, tarih biçimi (`gg.aa.yyyy`), sıralama ve baş harf kuralları `tr-TR`.

> *English:* Angular 19 UI kit & admin layout. Standalone, signal-based, zero dependencies,
> themeable via CSS custom properties. UI texts default to Turkish.

## Kurulum

```bash
npm install @hu/ui
```

Gereksinim: Angular `^19.2` (`@angular/common`, `core`, `forms`, `router`).

**1. Stiller** (`src/styles.scss`)

```scss
@use '@hu/ui/styles';
```

**2. Font** (`index.html`, isteğe bağlı). Tasarım Inter ile yapıldı; eklenmezse sistem fontu kullanılır.

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**3. Kullanım**

```ts
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { HuButton, HU_FORM_FIELD_IMPORTS, HuDatePicker, HuToastService } from '@hu/ui';

@Component({
  selector: 'app-example',
  imports: [ReactiveFormsModule, HuButton, HU_FORM_FIELD_IMPORTS, HuDatePicker],
  template: `
    <hu-form-field label="E-posta" required>
      <input huInput type="email" [formControl]="email" />
    </hu-form-field>

    <hu-form-field label="Başlangıç tarihi">
      <hu-date-picker [formControl]="start" />
    </hu-form-field>

    <button hu-button (click)="save()">Kaydet</button>
  `,
})
export class ExampleComponent {
  private readonly toast = inject(HuToastService);
  readonly email = new FormControl('', [Validators.required, Validators.email]);
  readonly start = new FormControl<Date | null>(null);

  save() {
    this.toast.success('Kaydedildi.');
  }
}
```

Toast'ların görünmesi için kök componente bir kez `<hu-toaster />` ekleyin.

## Componentler

| Grup | |
| --- | --- |
| **Layout** | `hu-shell` (daraltılabilir sidebar, mobil çekmece, topbar), `hu-sidebar-nav`, `hu-breadcrumb`, `hu-theme-toggle` |
| **Form** | `hu-button`, `hu-button-group`, `huInput`, `hu-form-field`, `hu-checkbox`, `hu-switch`, `hu-date-picker` |
| **Tarih** | `hu-calendar`: tek gün/aralık seçimi, min/max, `dateFilter`, etkinlik işaretleri |
| **Veri** | `hu-table` (sıralama, özel hücreler), `hu-paginator`, `hu-tabs`, `hu-card`, `hu-menu` |
| **Geri bildirim** | `hu-alert`, `hu-dialog`, `HuToastService`, `hu-badge`, `hu-avatar`, `hu-spinner` |
| **Çekirdek** | `hu-icon` (+`provideHuIcons`), `HuThemeService`, `provideHuErrorMessages`, tarih yardımcıları |

Birlikte kullanılan parçalar için gruplu import'lar var: `HU_FORM_FIELD_IMPORTS`, `HU_TABLE_IMPORTS`,
`HU_DIALOG_IMPORTS`, `HU_MENU_IMPORTS`, `HU_TABS_IMPORTS`, `HU_CARD_IMPORTS`, `HU_SHELL_IMPORTS`.

### Butonlar

Görünüm ve renk birbirinden bağımsızdır:

```html
<button hu-button>Kaydet</button>
<button hu-button variant="soft" color="success">Onayla</button>
<button hu-button variant="outline" color="danger" size="sm">Sil</button>
<button hu-button variant="ghost" iconOnly aria-label="Düzenle"><hu-icon name="edit" /></button>
```

`variant`: `solid` `soft` `outline` `ghost` `link`. `color`: `primary` `neutral` `success` `warning` `danger` `info`.
`size`: `xs` … `xl`.

### Admin layout

```html
<hu-shell [nav]="nav" brand="Yönetim Paneli">
  <hu-breadcrumb huTopbarStart [items]="crumbs" />
  <div huTopbarEnd><hu-theme-toggle /></div>
  <router-outlet />
</hu-shell>
```

```ts
nav: HuNavGroup[] = [
  { items: [{ label: 'Genel Bakış', icon: 'home', link: '/', exact: true }] },
  { title: 'Yönetim', items: [
    { label: 'Kullanıcılar', icon: 'users', link: '/kullanicilar', badge: 12 },
    { label: 'Akademik', icon: 'graduation-cap', children: [
      { label: 'Dersler', link: '/dersler' },
    ]},
  ]},
];
```

### Form hataları

`hu-form-field`, reactive form hatalarını otomatik olarak Türkçe mesaja çevirir. Mesajları
değiştirmek ya da yeni validator'lara mesaj eklemek için:

```ts
providers: [provideHuErrorMessages({ tckn: 'Geçerli bir T.C. kimlik numarası giriniz.' })]
```

## Tema

Token'ları kendi stil dosyanızda ezin:

```scss
:root {
  --hu-primary: #0b5cad;
  --hu-primary-hover: #094a8c;
  --hu-primary-soft: #e8f1fb;
  --hu-radius-md: 8px;
}
```

Koyu tema `<html data-theme="dark">` ile açılır. `HuThemeService.setMode('light' | 'dark' | 'system')`
tercihi yönetir ve saklar.

## Tarayıcı desteği

Chrome/Edge 114+, Firefox 125+, Safari 17+. Kütüphane Popover API, `:has()` ve `color-mix()` kullanır.

## Lisans

MIT
