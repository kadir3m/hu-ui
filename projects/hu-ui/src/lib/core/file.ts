/** `<input accept>` kurallarına uyuyor mu? (`'image/*,.pdf'`) */
export function huMatchesAccept(file: File, accept: string): boolean {
  const rules = accept
    .split(',')
    .map((r) => r.trim().toLowerCase())
    .filter(Boolean);
  if (!rules.length) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return rules.some((rule) => {
    if (rule.startsWith('.')) return name.endsWith(rule);
    if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1));
    return type === rule;
  });
}

/** Sürüklenen içerik dosya mı? */
export function huDragHasFiles(event: DragEvent): boolean {
  return !!event.dataTransfer?.types.includes('Files');
}

/** Dosya adı / türüne göre ikon. */
export function huFileIcon(name: string, type = ''): string {
  if (type.startsWith('image/') || /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(name)) return 'file-image';
  if (/zip|rar|7z|tar|gzip/.test(type) || /\.(zip|rar|7z|tar|gz)$/i.test(name)) return 'file-archive';
  if (/pdf|word|document|text|sheet|excel|presentation/.test(type) || /\.(pdf|docx?|xlsx?|pptx?|odt|txt|csv)$/i.test(name))
    return 'file-text';
  return 'file';
}

/** accept değerinden okunur kısa metin: `'.pdf,.docx'` → `'PDF, DOCX'` */
export function huAcceptLabel(accept: string): string {
  return accept
    .split(',')
    .map((a) => a.trim())
    .filter(Boolean)
    .map((a) => (a.startsWith('.') ? a.slice(1).toUpperCase() : a === 'image/*' ? 'Görseller' : a))
    .join(', ');
}
