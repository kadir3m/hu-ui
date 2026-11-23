import type { HuMediaImage } from '@ucme-ui/angular';

/*
 * Demo görselleri: ağ isteği olmadan, SVG olarak üretilen manzara resimleri.
 * Gerçek projede `src` bir URL olur.
 */

interface Scene {
  title: string;
  sky: [string, string];
  sun: string;
  hills: [string, string, string];
  description: string;
}

const SCENES: Scene[] = [
  { title: 'Gün doğumu', sky: ['#fde68a', '#f97316'], sun: '#fff7ed', hills: ['#9a3412', '#7c2d12', '#431407'], description: 'Sabahın ilk ışıkları tepelerin ardından yükseliyor.' },
  { title: 'Göl kıyısı', sky: ['#bae6fd', '#38bdf8'], sun: '#f0f9ff', hills: ['#0e7490', '#155e75', '#164e63'], description: 'Durgun suyun üzerinde serin bir öğle vakti.' },
  { title: 'Orman', sky: ['#d9f99d', '#4ade80'], sun: '#f7fee7', hills: ['#15803d', '#166534', '#14532d'], description: 'Yemyeşil ağaçlarla kaplı yamaçlar.' },
  { title: 'Gün batımı', sky: ['#fbcfe8', '#a855f7'], sun: '#fdf4ff', hills: ['#7e22ce', '#6b21a8', '#3b0764'], description: 'Mor ve pembe tonlarında bir akşam.' },
  { title: 'Kış sabahı', sky: ['#f1f5f9', '#94a3b8'], sun: '#ffffff', hills: ['#cbd5e1', '#94a3b8', '#64748b'], description: 'Karla kaplı tepeler ve soluk bir güneş.' },
  { title: 'Çöl', sky: ['#fef3c7', '#f59e0b'], sun: '#fffbeb', hills: ['#d97706', '#b45309', '#92400e'], description: 'Sıcak kum tepeleri ufka kadar uzanıyor.' },
  { title: 'Gece', sky: ['#312e81', '#0f172a'], sun: '#e0e7ff', hills: ['#1e1b4b', '#172554', '#020617'], description: 'Yıldızlı bir gökyüzünün altında sessiz vadi.' },
  { title: 'Bahar', sky: ['#fce7f3', '#f472b6'], sun: '#fff1f2', hills: ['#be185d', '#9d174d', '#831843'], description: 'Çiçek açan ağaçlarla renklenen yamaçlar.' },
];

/** Tek bir manzara görseli (data URL). */
export function demoImage(index: number, width = 1200, height = 800, label = false): string {
  const s = SCENES[index % SCENES.length];
  const w = width;
  const h = height;
  const hill = (y: number, amp: number, phase: number) => {
    let d = `M0 ${h} L0 ${y}`;
    for (let x = 0; x <= w; x += w / 8) d += ` Q${x + w / 16} ${y - amp * Math.sin((x / w) * 6 + phase)} ${x + w / 8} ${y}`;
    return `${d} L${w} ${h} Z`;
  };
  const stars =
    index % SCENES.length === 6
      ? Array.from({ length: 40 }, (_, i) => `<circle cx="${(i * 197) % w}" cy="${(i * 89) % (h * 0.5)}" r="${1 + (i % 3)}" fill="#fff" opacity="0.7"/>`).join('')
      : '';
  const text = label
    ? `<text x="${w / 2}" y="${h * 0.9}" font-family="system-ui,sans-serif" font-size="${Math.round(h / 12)}" font-weight="700" fill="#fff" fill-opacity="0.85" text-anchor="middle">${s.title}</text>`
    : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.sky[0]}"/><stop offset="1" stop-color="${s.sky[1]}"/></linearGradient></defs>
<rect width="${w}" height="${h}" fill="url(#g)"/>${stars}
<circle cx="${w * (0.25 + (index % 3) * 0.25)}" cy="${h * 0.38}" r="${h * 0.11}" fill="${s.sun}" opacity="0.9"/>
<path d="${hill(h * 0.55, h * 0.08, index)}" fill="${s.hills[0]}" opacity="0.75"/>
<path d="${hill(h * 0.68, h * 0.06, index + 2)}" fill="${s.hills[1]}" opacity="0.9"/>
<path d="${hill(h * 0.8, h * 0.05, index + 4)}" fill="${s.hills[2]}"/>${text}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** Galeri / carousel için görsel listesi (küçük resimleriyle). */
export function demoImages(count = SCENES.length): HuMediaImage[] {
  return Array.from({ length: count }, (_, i) => {
    const s = SCENES[i % SCENES.length];
    return {
      src: demoImage(i),
      thumbnail: demoImage(i, 240, 160, false),
      alt: `${s.title} manzarası`,
      caption: s.title,
      description: s.description,
    };
  });
}
