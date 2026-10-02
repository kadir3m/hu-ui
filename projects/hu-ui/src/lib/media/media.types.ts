/** Galeri, carousel ve görüntüleyicide kullanılan görsel. */
export interface HuMediaImage {
  src: string;
  /** Küçük görsel (galeri şeridi, ızgara). Verilmezse `src`. */
  thumbnail?: string;
  /** Erişilebilirlik için zorunlu gibi düşünün; süs görselinde `''`. */
  alt: string;
  /** Görselin altında başlık. */
  caption?: string;
  description?: string;
}
