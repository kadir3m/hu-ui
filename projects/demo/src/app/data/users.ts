export type UserRole = 'Yönetici' | 'Akademisyen' | 'Personel' | 'Öğrenci';
export type UserStatus = 'aktif' | 'pasif' | 'beklemede';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: UserStatus;
  createdAt: Date;
}

export const ROLES: UserRole[] = ['Yönetici', 'Akademisyen', 'Personel', 'Öğrenci'];

export const DEPARTMENTS = [
  'Bilgisayar Mühendisliği',
  'Elektrik-Elektronik Mühendisliği',
  'Tıp Fakültesi',
  'Hukuk Fakültesi',
  'Eczacılık Fakültesi',
  'İktisadi ve İdari Bilimler',
  'Edebiyat Fakültesi',
  'Bilgi İşlem Daire Başkanlığı',
];

export const STATUS_LABELS: Record<UserStatus, string> = {
  aktif: 'Aktif',
  pasif: 'Pasif',
  beklemede: 'Beklemede',
};

const FIRST = ['Ayşe', 'Mehmet', 'Elif', 'Can', 'Zeynep', 'Burak', 'Selin', 'Emre', 'Deniz', 'Ceren', 'Oğuz', 'İrem', 'Kaan', 'Ece', 'Serkan', 'Gizem', 'Barış', 'Nazlı', 'Tolga', 'Şule'];
const LAST = ['Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Yıldız', 'Aydın', 'Öztürk', 'Arslan', 'Doğan', 'Kılıç', 'Aslan', 'Çetin', 'Koç', 'Kurt', 'Özdemir'];

function slug(value: string): string {
  const map: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', İ: 'i' };
  return value.toLocaleLowerCase('tr-TR').replace(/[çğıöşüİ]/g, (c) => map[c] ?? c);
}

/** Deterministik sahte veri (her yenilemede aynı liste). */
export function createUsers(count = 57): User[] {
  const users: User[] = [];
  let seed = 7;
  const rand = (n: number) => {
    seed = (seed * 9301 + 49297) % 233280;
    return Math.floor((seed / 233280) * n);
  };
  const statuses: UserStatus[] = ['aktif', 'aktif', 'aktif', 'pasif', 'beklemede'];

  for (let i = 1; i <= count; i++) {
    const first = FIRST[rand(FIRST.length)];
    const last = LAST[rand(LAST.length)];
    users.push({
      id: i,
      name: `${first} ${last}`,
      email: `${slug(first)}.${slug(last)}${i}@example.com`,
      role: ROLES[rand(ROLES.length)],
      department: DEPARTMENTS[rand(DEPARTMENTS.length)],
      status: statuses[rand(statuses.length)],
      createdAt: new Date(2026, rand(9), 1 + rand(28)),
    });
  }
  return users;
}
