/*
 * Editör için izin listesi tabanlı HTML temizleyici. Yapıştırılan içerik ve
 * dışarıdan gelen değer bundan geçer: yalnızca editörün üretebildiği etiketler
 * kalır. Öznitelikler silinir; yalnızca link adresi, görsel adresi/açıklaması ve
 * span üzerindeki renk (color, background-color) korunur.
 */

/** İzinli etiket → çıktıda kullanılacak etiket. */
const TAG_MAP: Record<string, string> = {
  P: 'p',
  DIV: 'p',
  BR: 'br',
  STRONG: 'strong',
  B: 'strong',
  EM: 'em',
  I: 'em',
  U: 'u',
  S: 's',
  STRIKE: 's',
  DEL: 's',
  H1: 'h1',
  H2: 'h2',
  H3: 'h3',
  H4: 'h3',
  H5: 'h3',
  H6: 'h3',
  UL: 'ul',
  OL: 'ol',
  LI: 'li',
  BLOCKQUOTE: 'blockquote',
  PRE: 'pre',
  CODE: 'code',
  A: 'a',
  IMG: 'img',
  SPAN: 'span',
  FONT: 'span',
  MARK: 'span',
};

/** İçeriğiyle birlikte tamamen atılan etiketler. */
const DROP = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'NOSCRIPT', 'TEMPLATE', 'SVG', 'MATH', 'HEAD', 'META', 'LINK', 'TITLE', 'FORM', 'INPUT', 'BUTTON', 'SELECT', 'TEXTAREA', 'VIDEO', 'AUDIO', 'CANVAS']);

const BLOCKS = new Set(['p', 'ul', 'ol', 'blockquote', 'pre', 'h1', 'h2', 'h3']);

const SAFE_URL = /^(https?:|mailto:|tel:|\/|#|\.{0,2}\/)/i;
/** Görseller: http(s), göreli adres veya raster data URL (SVG içine betik gömülebildiği için hariç). */
const SAFE_IMAGE = /^(https?:\/\/|\/|\.{0,2}\/|data:image\/(png|jpe?g|gif|webp);base64,[a-z0-9+/=\s]+$)/i;
/** Renk değeri: hex, rgb(a) veya isim. `url(`, `expression(` gibi değerler eşleşmez. */
const SAFE_COLOR = /^(#[0-9a-f]{3,8}|rgba?\(\s*[\d.\s,%]+\)|[a-z]{3,20})$/i;

/** Link adresi güvenli mi? (`javascript:`, `data:` vb. reddedilir) */
export function huIsSafeUrl(url: string): boolean {
  const value = url.trim();
  return !!value && SAFE_URL.test(value) && !/^\s*(javascript|data|vbscript):/i.test(value);
}

/** Görsel adresi güvenli mi? */
export function huIsSafeImageSrc(src: string): boolean {
  return SAFE_IMAGE.test(src.trim());
}

/**
 * HTML'i editörün izin verdiği alt kümeye indirger.
 * Sunucudan gelen veya kullanıcıların girdiği HTML'i göstermeden önce de kullanabilirsiniz.
 */
export function huSanitizeHtml(html: string, doc: Document = document): string {
  if (!html) return '';
  const template = doc.createElement('template');
  template.innerHTML = html;
  const out = doc.createElement('div');
  copyChildren(template.content, out, doc);
  normalizeTopLevel(out, doc);
  return out.innerHTML;
}

/**
 * Tarayıcı komutları bazen `<p><ul>…</ul></p>` gibi geçersiz yapı üretir; HTML
 * ayrıştırıcısı bunu `<p></p><ul>…</ul><p></p>` + çıplak metne çevirir. Boş
 * paragrafları at, en üst seviyedeki çıplak satır içi içeriği `<p>` içine al.
 */
function normalizeTopLevel(root: Element, doc: Document): void {
  root.querySelectorAll('p').forEach((p) => {
    if (!p.textContent?.trim() && !p.querySelector('br, img')) p.remove();
  });

  let run: Element | null = null;
  Array.from(root.childNodes).forEach((node) => {
    const isBlock = node instanceof Element && BLOCKS.has(node.tagName.toLowerCase());
    if (isBlock) {
      run = null;
      return;
    }
    if (!run) {
      // Yalnızca boşluktan oluşan metin düğümü yeni paragraf açmasın
      if (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()) {
        node.remove();
        return;
      }
      run = doc.createElement('p');
      root.insertBefore(run, node);
    }
    run.appendChild(node);
  });
}

/** span/font/mark üzerindeki renkleri `style` olarak döndürür (yoksa boş). */
function colorStyle(el: Element): string {
  const style = (el as HTMLElement).style;
  let color = style?.color || (el.tagName === 'FONT' ? (el.getAttribute('color') ?? '') : '');
  let background = style?.backgroundColor || (el.tagName === 'MARK' ? 'rgba(250, 204, 21, 0.4)' : '');
  color = SAFE_COLOR.test(color.trim()) ? color.trim() : '';
  background = SAFE_COLOR.test(background.trim()) ? background.trim() : '';
  return [color && `color: ${color}`, background && `background-color: ${background}`].filter(Boolean).join('; ');
}

function copyChildren(from: Node, to: Node, doc: Document): void {
  from.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      to.appendChild(doc.createTextNode(node.textContent ?? ''));
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return; // yorumlar vb.

    const el = node as Element;
    if (DROP.has(el.tagName)) return;

    const tag = TAG_MAP[el.tagName];
    if (!tag) {
      // Bilinmeyen etiketler: kendisini at, içeriğini koru
      copyChildren(el, to, doc);
      return;
    }

    if (tag === 'img') {
      const src = el.getAttribute('src') ?? '';
      if (!huIsSafeImageSrc(src)) return;
      const img = doc.createElement('img');
      img.setAttribute('src', src.trim());
      img.setAttribute('alt', el.getAttribute('alt') ?? '');
      to.appendChild(img);
      return;
    }

    if (tag === 'span') {
      // Renk yoksa span anlamsızdır: aç, içeriğini koru
      const style = colorStyle(el);
      if (!style) {
        copyChildren(el, to, doc);
        return;
      }
      const span = doc.createElement('span');
      span.setAttribute('style', style);
      copyChildren(el, span, doc);
      to.appendChild(span);
      return;
    }

    const clean = doc.createElement(tag);
    if (tag === 'a') {
      const href = el.getAttribute('href') ?? '';
      if (!huIsSafeUrl(href)) {
        copyChildren(el, to, doc);
        return;
      }
      clean.setAttribute('href', href);
      clean.setAttribute('target', '_blank');
      clean.setAttribute('rel', 'noopener noreferrer');
    }
    copyChildren(el, clean, doc);
    to.appendChild(clean);
  });
}
