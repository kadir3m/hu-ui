/**
 * Arama karşılaştırması için metni sadeleştirir: küçük harf, Türkçe karakterler ve
 * aksanlar yok sayılır. `"Öğrenci İşleri"` → `"ogrenci isleri"`.
 */
export function huFold(text: string): string {
  return text
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}
