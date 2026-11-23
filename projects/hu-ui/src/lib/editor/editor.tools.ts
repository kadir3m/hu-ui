/** Araç çubuğundaki öğeler. `'|'` bir ayraçtır. */
export type HuEditorTool =
  | 'heading'
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'textColor'
  | 'highlight'
  | 'bulletList'
  | 'orderedList'
  | 'blockquote'
  | 'codeBlock'
  | 'link'
  | 'image'
  | 'clear'
  | 'undo'
  | 'redo'
  | '|';

export const HU_EDITOR_DEFAULT_TOOLBAR: readonly HuEditorTool[] = [
  'heading',
  '|',
  'bold',
  'italic',
  'underline',
  'strike',
  '|',
  'textColor',
  'highlight',
  '|',
  'bulletList',
  'orderedList',
  'blockquote',
  'codeBlock',
  '|',
  'link',
  'image',
  'clear',
  '|',
  'undo',
  'redo',
];

/** Sade araç çubuğu: yorum, not gibi kısa metinler için. */
export const HU_EDITOR_MINIMAL_TOOLBAR: readonly HuEditorTool[] = ['bold', 'italic', 'underline', '|', 'bulletList', 'orderedList', '|', 'link'];

export interface HuEditorButton {
  tool: Exclude<HuEditorTool, 'heading' | '|'>;
  icon: string;
  label: string;
  /** Ekranda gösterilen kısayol (ipucu metninde). */
  shortcut?: string;
}

export const HU_EDITOR_BUTTONS: Record<HuEditorButton['tool'], HuEditorButton> = {
  bold: { tool: 'bold', icon: 'bold', label: 'Kalın', shortcut: 'Ctrl+B' },
  italic: { tool: 'italic', icon: 'italic', label: 'İtalik', shortcut: 'Ctrl+I' },
  underline: { tool: 'underline', icon: 'underline', label: 'Altı çizili', shortcut: 'Ctrl+U' },
  strike: { tool: 'strike', icon: 'strikethrough', label: 'Üstü çizili' },
  textColor: { tool: 'textColor', icon: 'text-color', label: 'Yazı rengi' },
  highlight: { tool: 'highlight', icon: 'highlighter', label: 'Vurgu rengi' },
  bulletList: { tool: 'bulletList', icon: 'list', label: 'Madde işaretli liste' },
  orderedList: { tool: 'orderedList', icon: 'list-ordered', label: 'Numaralı liste' },
  blockquote: { tool: 'blockquote', icon: 'quote', label: 'Alıntı' },
  codeBlock: { tool: 'codeBlock', icon: 'code', label: 'Kod bloğu' },
  link: { tool: 'link', icon: 'link', label: 'Link', shortcut: 'Ctrl+K' },
  image: { tool: 'image', icon: 'image', label: 'Görsel' },
  clear: { tool: 'clear', icon: 'eraser', label: 'Biçimi temizle' },
  undo: { tool: 'undo', icon: 'undo', label: 'Geri al', shortcut: 'Ctrl+Z' },
  redo: { tool: 'redo', icon: 'redo', label: 'Yinele', shortcut: 'Ctrl+Y' },
};

export type HuEditorBlock = 'p' | 'h1' | 'h2' | 'h3';

export const HU_EDITOR_BLOCKS: { value: HuEditorBlock; label: string }[] = [
  { value: 'p', label: 'Paragraf' },
  { value: 'h1', label: 'Başlık 1' },
  { value: 'h2', label: 'Başlık 2' },
  { value: 'h3', label: 'Başlık 3' },
];

export interface HuEditorColor {
  label: string;
  /** CSS renk değeri (hex veya rgb/rgba). */
  value: string;
}

/**
 * Yazı renkleri. Açık ve koyu temada okunabilen orta tonlar seçildi.
 * Yalnızca paletteki renkler kalıcıdır: tarayıcının kendiliğinden eklediği
 * (koyu temada okunmaz hale gelen) metin renkleri temizlenir.
 */
export const HU_EDITOR_TEXT_COLORS: readonly HuEditorColor[] = [
  { label: 'Kırmızı', value: '#dc2626' },
  { label: 'Turuncu', value: '#ea580c' },
  { label: 'Sarı', value: '#ca8a04' },
  { label: 'Yeşil', value: '#16a34a' },
  { label: 'Turkuaz', value: '#0891b2' },
  { label: 'Mavi', value: '#2563eb' },
  { label: 'Mor', value: '#7c3aed' },
  { label: 'Pembe', value: '#db2777' },
  { label: 'Gri', value: '#71717a' },
];

/** Vurgu (arka plan) renkleri: yarı saydam, böylece koyu temada da metin okunur. */
export const HU_EDITOR_HIGHLIGHT_COLORS: readonly HuEditorColor[] = [
  { label: 'Sarı', value: 'rgba(250, 204, 21, 0.4)' },
  { label: 'Yeşil', value: 'rgba(34, 197, 94, 0.3)' },
  { label: 'Mavi', value: 'rgba(59, 130, 246, 0.3)' },
  { label: 'Mor', value: 'rgba(139, 92, 246, 0.3)' },
  { label: 'Pembe', value: 'rgba(236, 72, 153, 0.3)' },
  { label: 'Kırmızı', value: 'rgba(239, 68, 68, 0.3)' },
  { label: 'Turuncu', value: 'rgba(249, 115, 22, 0.3)' },
];

/**
 * Görsel yükleme işleyicisi: dosyayı sunucuya yükleyip görselin adresini döndürür.
 * Verilmezse görsel data URL olarak HTML'e gömülür.
 */
export type HuEditorImageUpload = (file: File) => Promise<string>;
