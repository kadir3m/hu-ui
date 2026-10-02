import { HuDropdownOption } from '../dropdown/dropdown.types';

export type HuSortDirection = 'asc' | 'desc' | '';

export interface HuSort {
  key: string;
  direction: HuSortDirection;
}

export interface HuColumn<T = any> {
  /** Satır nesnesindeki alan adı veya `huCell` şablonunun anahtarı. */
  key: string;
  header: string;
  sortable?: boolean;
  align?: 'start' | 'center' | 'end';
  /** Örn. '120px' veya '20%'. */
  width?: string;
  /** Hücre değeri / sıralama / arama / dışa aktarma değeri için özel erişimci. */
  value?: (row: T) => unknown;
  /** Dar ekranlarda gizlenir. */
  hideOnMobile?: boolean;
  /** Sütun seçicide gizlenebilir mi? Varsayılan `true`. */
  hideable?: boolean;
  /** Başlangıçta gizli (sütun seçiciden açılabilir). */
  hidden?: boolean;
  /**
   * Yatay kaydırmada sabit kalır. `'start'`: soldaki ilk veri sütunu (örn. ad),
   * `'end'`: sağdaki son sütun (örn. işlemler).
   */
  sticky?: 'start' | 'end';
  /** Alt toplam satırı: sabit metin veya (filtrelenmiş) satırlardan hesaplanan değer. */
  footer?: string | ((rows: readonly T[]) => unknown);
  /** Genel aramaya dahil mi? Varsayılan `true`. */
  searchable?: boolean;
  /** CSV dışa aktarmaya dahil mi? Varsayılan `true` (işlemler sütununda `false` verin). */
  exportable?: boolean;
}

export type HuTableVariant = 'default' | 'bordered' | 'card' | 'minimal';
export type HuTableSize = 'sm' | 'md' | 'lg';
export type HuTableSelectionMode = 'none' | 'single' | 'multiple';

/** `hu-table` sağ tık menüsünden seçim. */
export interface HuTableContextEvent<T = any> {
  option: HuDropdownOption<any>;
  /** Sağ tıklanan satır. */
  row: T;
  /** İşlemin uygulanacağı satırlar (seçili satıra tıklandıysa tüm seçim). */
  rows: readonly T[];
}
