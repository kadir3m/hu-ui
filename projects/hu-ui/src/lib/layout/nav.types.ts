export interface HuNavItem {
  label: string;
  icon?: string;
  /** Router linki. Alt öğesi olan öğelerde verilmez. */
  link?: string;
  /** Link yalnızca birebir eşleştiğinde aktif sayılsın. */
  exact?: boolean;
  /** Sayı (`12`) dolu rozet olarak, metin (`'Yeni'`) açık renkli etiket olarak gösterilir. */
  badge?: string | number;
  /**
   * Alt menü. Alt öğelerin kendi `children`'ı varsa o öğe tıklanamaz bir
   * kategori başlığı olur ve altındaki linkler onun altında listelenir:
   *
   * `{ label: 'Componentler', children: [{ label: 'Form', children: [{ label: 'Button', link: '…' }] }] }`
   */
  children?: HuNavItem[];
}

export interface HuNavGroup {
  /** Grup başlığı (örn. "Yönetim"). */
  title?: string;
  items: HuNavItem[];
}
