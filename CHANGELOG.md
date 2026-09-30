# Değişiklik günlüğü

## 0.2.0

### Kırıcı değişiklikler

- **Angular 20, 21 ve 22 desteklenir; Angular 19 desteği kaldırıldı.** Angular 19'un desteği sona erdi
  ve düzeltilmemiş güvenlik açıkları var. Angular 19 kullanan projeler `0.1.x` sürümünde kalmalıdır.
- **`hu-menu` → `hu-dropdown`, öğeler artık veriyle tanımlanıyor.** Öğeleri tek tek buton olarak
  yazmak yerine `options` dizisi verilir; seçim `(selected)` ile döner. Tetikleyici butonu component
  kendisi çizer (`label`, `icon`, `variant`, `color`, `size`).

  ```html
  <!-- 0.1.x -->
  <hu-menu>
    <button huMenuTrigger hu-button variant="outline">İşlemler</button>
    <button huMenuItem (click)="edit()"><hu-icon name="edit" /> Düzenle</button>
    <hr class="hu-menu-divider" />
    <button huMenuItem class="hu-menu-item--danger" (click)="remove()"><hu-icon name="trash" /> Sil</button>
  </hu-menu>

  <!-- 0.2.0 -->
  <hu-dropdown label="İşlemler" [options]="actions" (selected)="run($event.value)" />
  ```
  ```ts
  actions: HuDropdownEntry[] = [
    { label: 'Düzenle', value: 'edit', icon: 'edit' },
    { divider: true },
    { label: 'Sil', value: 'delete', icon: 'trash', danger: true },
  ];
  ```

  | 0.1.x | 0.2.0 |
  | --- | --- |
  | `<hu-menu>` | `<hu-dropdown>` |
  | `huMenuTrigger` | `huDropdownTrigger` (yalnızca özel tetikleyici için; normalde `label`/`icon` yeterli) |
  | `huMenuItem` | kaldırıldı → `options` |
  | `<hr class="hu-menu-divider">`, `.hu-menu-label` | `{ divider: true }`, `{ header: '…' }` |
  | `.hu-menu-item--danger` | `{ danger: true }` |
  | `HuMenu`, `HuMenuTrigger`, `HuMenuAlign` | `HuDropdown`, `HuDropdownTrigger`, `HuDropdownAlign` |
  | `HU_MENU_IMPORTS` | `HU_DROPDOWN_IMPORTS` |
  | `--hu-menu-min-width` | `--hu-dropdown-min-width` |

### Diğer

- Zoneless (zone.js'siz) Angular uygulamalarında doğrulandı.
- Geliştirme ortamı Angular 22, TypeScript 6 ve `@angular/build` kullanır; geliştirme için Node 22.22+ veya 24+ gerekir.

## 0.1.0

İlk sürüm.
