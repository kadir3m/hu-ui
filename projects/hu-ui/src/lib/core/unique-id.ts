let nextId = 0;

/** Sayfa içinde benzersiz bir DOM id'si üretir (label/aria bağlantıları için). */
export function huUniqueId(prefix = 'hu'): string {
  return `${prefix}-${nextId++}`;
}
