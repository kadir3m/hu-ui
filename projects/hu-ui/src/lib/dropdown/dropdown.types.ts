/** Seçilebilir bir menü öğesi. */
export interface HuDropdownOption<T = string> {
  label: string;
  /** `(selected)` ile döner. Verilmezse `label` kullanılır. */
  value?: T;
  icon?: string;
  /** Etiketin altında küçük ikinci satır (örn. "5 dk önce"). */
  description?: string;
  disabled?: boolean;
  /** Kırmızı, yıkıcı işlem (Sil, Çıkış yap). */
  danger?: boolean;
  /** Verilirse öğe bir router linki olur. */
  link?: string | readonly unknown[];
  /** Sağda gösterilen kısayol ipucu (örn. `'Ctrl+C'`). Yalnızca görseldir; kısayolu siz bağlarsınız. */
  shortcut?: string;
}

/** Öğeler arasına ince çizgi. */
export interface HuDropdownDivider {
  divider: true;
}

/** Bir grup öğenin üstünde küçük başlık. */
export interface HuDropdownHeader {
  header: string;
}

export type HuDropdownEntry<T = string> = HuDropdownOption<T> | HuDropdownDivider | HuDropdownHeader;

export function isDropdownDivider(entry: HuDropdownEntry<unknown>): entry is HuDropdownDivider {
  return 'divider' in entry;
}

export function isDropdownHeader(entry: HuDropdownEntry<unknown>): entry is HuDropdownHeader {
  return 'header' in entry;
}
