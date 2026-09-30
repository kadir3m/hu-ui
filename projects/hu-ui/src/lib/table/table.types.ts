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
  /** Hücre değeri / sıralama değeri için özel erişimci. */
  value?: (row: T) => unknown;
  /** Dar ekranlarda gizlenir. */
  hideOnMobile?: boolean;
}
