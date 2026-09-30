# Değişiklik günlüğü

## 0.2.0

### Kırıcı değişiklikler

- **Angular 20, 21 ve 22 desteklenir; Angular 19 desteği kaldırıldı.** Angular 19'un desteği sona erdi
  ve düzeltilmemiş güvenlik açıkları var. Angular 19 kullanan projeler `0.1.x` sürümünde kalmalıdır.
- **`hu-menu` → `hu-dropdown`.** Açılır menü ve ilgili tüm adlar değişti:

  | 0.1.x | 0.2.0 |
  | --- | --- |
  | `<hu-menu>` | `<hu-dropdown>` |
  | `huMenuTrigger` | `huDropdownTrigger` |
  | `huMenuItem` | `huDropdownItem` |
  | `HuMenu`, `HuMenuTrigger`, `HuMenuItem`, `HuMenuAlign` | `HuDropdown`, `HuDropdownTrigger`, `HuDropdownItem`, `HuDropdownAlign` |
  | `HU_MENU_IMPORTS` | `HU_DROPDOWN_IMPORTS` |
  | `.hu-menu-item`, `.hu-menu-item--danger`, `.hu-menu-divider`, `.hu-menu-label` | `.hu-dropdown-item`, `.hu-dropdown-item--danger`, `.hu-dropdown-divider`, `.hu-dropdown-label` |
  | `--hu-menu-min-width` | `--hu-dropdown-min-width` |

### Diğer

- Zoneless (zone.js'siz) Angular uygulamalarında doğrulandı.
- Geliştirme ortamı Angular 22, TypeScript 6 ve `@angular/build` kullanır; geliştirme için Node 22.22+ veya 24+ gerekir.

## 0.1.0

İlk sürüm.
