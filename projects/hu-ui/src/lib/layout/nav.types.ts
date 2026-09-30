export interface HuNavItem {
  label: string;
  icon?: string;
  /** Router linki. Alt öğesi olan öğelerde verilmez. */
  link?: string;
  /** Link yalnızca birebir eşleştiğinde aktif sayılsın. */
  exact?: boolean;
  badge?: string | number;
  children?: HuNavItem[];
}

export interface HuNavGroup {
  /** Grup başlığı (örn. "Yönetim"). */
  title?: string;
  items: HuNavItem[];
}
