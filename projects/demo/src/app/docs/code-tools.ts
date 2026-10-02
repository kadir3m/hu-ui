/*
 * Doküman örneklerindeki kod için yardımcılar: renklendirme, örnek metnini
 * HTML/TS'e ayırma, çalışır bir component üretme ve StackBlitz'te açma.
 */

export type CodeLang = 'html' | 'ts' | 'scss' | 'bash';

// --- Renklendirme ----------------------------------------------------------------------
const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const span = (cls: string, s: string) => `<span class="tk-${cls}">${escape(s)}</span>`;

const TS_KEYWORDS =
  'import|from|export|default|class|interface|type|extends|implements|const|let|var|function|return|new|if|else|for|of|in|while|switch|case|break|async|await|this|true|false|null|undefined|protected|private|public|readonly|static|as|typeof|keyof|void';
const TS_RE = new RegExp(
  [
    String.raw`(\/\/[^\n]*|\/\*[\s\S]*?\*\/)`, // 1 yorum
    String.raw`('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|` + '`(?:\\\\.|[^`\\\\])*`)', // 2 metin
    String.raw`(@[A-Za-z]\w*)`, // 3 dekoratör
    String.raw`\b(${TS_KEYWORDS})\b`, // 4 anahtar kelime
    String.raw`\b(\d[\d_]*(?:\.\d+)?)\b`, // 5 sayı
    String.raw`\b([A-Z][A-Za-z0-9_]*)\b`, // 6 tip / sınıf
    String.raw`\b([a-z_$][\w$]*)(?=\s*\()`, // 7 fonksiyon çağrısı
  ].join('|'),
  'g',
);

/** Etiket dışı: yorum, etiket başı, interpolation, kontrol akışı. */
const HTML_OUTSIDE = /<!--[\s\S]*?-->|<\/?[A-Za-z][\w-]*|\{\{[\s\S]*?\}\}|@(?:if|else if|else|for|empty|switch|case|default|let|defer)\b/g;
/** Etiket içi: boşluk, öznitelik adı, =, değer, kapanış. */
const HTML_INSIDE = /(\s+)|([^\s=>/"']+)|(=)|("[^"]*"|'[^']*')|(\/?>)/y;

function highlightHtml(code: string): string {
  let out = '';
  let i = 0;
  while (i < code.length) {
    HTML_OUTSIDE.lastIndex = i;
    const m = HTML_OUTSIDE.exec(code);
    if (!m) {
      out += escape(code.slice(i));
      break;
    }
    out += escape(code.slice(i, m.index));
    const t = m[0];
    i = m.index + t.length;
    if (t.startsWith('<!--')) out += span('comment', t);
    else if (t.startsWith('{{')) out += span('interp', t);
    else if (t.startsWith('@')) out += span('keyword', t);
    else {
      // Etiket: kapanana kadar öznitelikleri renklendir
      out += span('tag', t);
      while (i < code.length) {
        HTML_INSIDE.lastIndex = i;
        const a = HTML_INSIDE.exec(code);
        if (!a) break;
        i = HTML_INSIDE.lastIndex;
        if (a[1]) out += escape(a[1]);
        else if (a[2]) out += span('attr', a[2]);
        else if (a[3]) out += '=';
        else if (a[4]) out += span('string', a[4]);
        else {
          out += span('tag', a[5]);
          break;
        }
      }
    }
  }
  return out;
}

const SCSS_RE = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("[^"]*"|'[^']*')|(@[\w-]+)|(--[\w-]+|\$[\w-]+)|([\w-]+)(?=\s*:)/g;

/** Kodu güvenli (escape edilmiş) ve renklendirilmiş HTML'e çevirir. */
export function highlight(code: string, lang: CodeLang): string {
  if (lang === 'html') return highlightHtml(code);
  const re = lang === 'ts' ? TS_RE : lang === 'scss' ? SCSS_RE : null;
  if (!re) {
    // bash: yalnızca yorumlar
    return code
      .split('\n')
      .map((line) => (/^\s*#/.test(line) ? span('comment', line) : escape(line)))
      .join('\n');
  }
  let out = '';
  let last = 0;
  re.lastIndex = 0;
  for (let m = re.exec(code); m; m = re.exec(code)) {
    out += escape(code.slice(last, m.index));
    last = m.index + m[0].length;
    out += token(m, lang);
  }
  return out + escape(code.slice(last));
}

function token(m: RegExpExecArray, lang: CodeLang): string {
  if (lang === 'ts') {
    if (m[1]) return span('comment', m[1]);
    if (m[2]) return span('string', m[2]);
    if (m[3]) return span('decorator', m[3]);
    if (m[4]) return span('keyword', m[4]);
    if (m[5]) return span('number', m[5]);
    if (m[6]) return span('type', m[6]);
    if (m[7]) return span('fn', m[7]);
  } else {
    if (m[1]) return span('comment', m[1]);
    if (m[2]) return span('string', m[2]);
    if (m[3]) return span('keyword', m[3]);
    if (m[4]) return span('type', m[4]);
    if (m[5]) return span('attr', m[5]);
  }
  return escape(m[0]);
}

/** Dili kodun görünüşünden tahmin eder. */
export function guessLang(code: string): CodeLang {
  const t = code.trim();
  if (/^(npm|npx|ng|yarn|pnpm|git|cd)\s/m.test(t) && !/[{};]\s*$/m.test(t)) return 'bash';
  if (/^(@use|@import|:root|\$|--hu-|[.#][\w-]+\s*\{)/m.test(t) && !/^import\s/m.test(t)) return 'scss';
  if (/^\s*(<|@if|@for)/.test(t)) return 'html';
  return 'ts';
}

// --- Örnek metnini ayırma ------------------------------------------------------------------
/** Girintisiz bir satır HTML mi başlatıyor? */
const HTML_START = /^(<|@(if|else|for|empty|switch|case|default|let|defer)\b|\{\{|-->)/;
/** Kapanış satırları (`});`, `}`, `]`) türü değiştirmez, önceki satırı izler. */
const CLOSING = /^[}\])]/;
/** Girintisiz bir satır TS mi başlatıyor? (üye, ifade, yorum, import) */
const TS_START =
  /^(\/\/|\/\*|\*|import\s|export\s|const\s|let\s|var\s|await\s|this\.|(?:protected|private|public|readonly|static|async|override)\s|@[A-Z]\w*\(|[A-Za-z_$][\w$]*\s*[!?]?\s*(?:=|:|\(|<)|[A-Za-z_$][\w$.]*\()/;

/**
 * Örneklerdeki kod metinleri TS ve HTML'i karışık tutar. Satır satır ayrılır:
 * girintisiz her satır türünü belirler, girintili ve boş satırlar öncekini izler.
 */
export function splitSnippet(code: string): { html: string; ts: string } {
  const html: string[] = [];
  const ts: string[] = [];
  let mode: 'html' | 'ts' | null = null;
  for (const line of code.replace(/\r\n?/g, '\n').split('\n')) {
    const indented = /^\s/.test(line);
    const trimmed = line.trim();
    if (trimmed && !indented && !(mode && CLOSING.test(trimmed))) {
      if (HTML_START.test(trimmed)) mode = 'html';
      else if (TS_START.test(trimmed)) mode = 'ts';
      else if (trimmed.startsWith('{') || trimmed.startsWith('[')) mode = 'ts';
      else mode ??= 'html';
    }
    if (!mode) continue; // baştaki boş satırlar
    (mode === 'html' ? html : ts).push(line);
  }
  const tidy = (lines: string[]) => lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  return { html: tidy(html), ts: tidy(ts) };
}

/**
 * StackBlitz'e giden HTML: örneklerdeki `(rejected)="…"` gibi kısaltmaları çıkarır;
 * `formControlName` çevresinde form yoksa `<form [formGroup]="form">` ile sarar.
 */
export function runnableHtml(html: string): string {
  let out = html.replace(/\s+[[(*#]?[\w.\-[\]()]*\]?\)?="…"/g, '');
  if (/formControlName=/.test(out) && !/\[formGroup\]=/.test(out)) {
    out = `<form [formGroup]="form">\n${out.replace(/^/gm, '  ')}\n</form>`;
  }
  return out;
}

// --- Tam component ---------------------------------------------------------------------
/** HTML'de geçen kalıp → `@ucme-ui/angular`'dan import edilecek ad. */
const TEMPLATE_IMPORTS: [RegExp, string][] = [
  [/<hu-button-group\b/, 'HuButtonGroup'],
  [/<(button|a)\b[^>]*\shu-button\b/, 'HuButton'],
  [/<hu-form-field\b|\shuInput\b/, 'HU_FORM_FIELD_IMPORTS'],
  [/<hu-icon\b/, 'HuIcon'],
  [/<hu-card\b/, 'HU_CARD_IMPORTS'],
  [/<hu-dialog\b/, 'HU_DIALOG_IMPORTS'],
  [/<hu-dropdown\b|\shuDropdownTrigger\b/, 'HU_DROPDOWN_IMPORTS'],
  [/<hu-table\b/, 'HU_TABLE_IMPORTS'],
  [/<hu-tabs\b/, 'HU_TABS_IMPORTS'],
  [/<hu-stepper\b/, 'HU_STEPPER_IMPORTS'],
  [/<hu-shell\b/, 'HU_SHELL_IMPORTS'],
  [/<hu-checkbox\b/, 'HuCheckbox'],
  [/<hu-switch\b/, 'HuSwitch'],
  [/<hu-date-picker\b/, 'HuDatePicker'],
  [/<hu-calendar\b/, 'HuCalendar'],
  [/<hu-agenda\b/, 'HuAgenda'],
  [/<hu-password\b/, 'HuPassword'],
  [/\s\[?huMask\]?=/, 'HuInputMask'],
  [/<hu-radio-group\b/, 'HU_RADIO_IMPORTS'],
  [/<hu-rating\b/, 'HuRating'],
  [/\s\[?huTooltip\]?=/, 'HuTooltip'],
  [/<hu-editor\b/, 'HuEditor'],
  [/<hu-file-upload\b/, 'HuFileUpload'],
  [/<hu-input-number\b/, 'HuInputNumber'],
  [/<hu-multi-select\b/, 'HuMultiSelect'],
  [/<hu-badge\b/, 'HuBadge'],
  [/<hu-avatar\b/, 'HuAvatar'],
  [/<hu-alert\b/, 'HuAlert'],
  [/<hu-spinner\b/, 'HuSpinner'],
  [/<hu-paginator\b/, 'HuPaginator'],
  [/<hu-breadcrumb\b/, 'HuBreadcrumb'],
  [/<hu-theme-toggle\b/, 'HuThemeToggle'],
  [/\shuConfirm\b/, 'HuConfirm'],
  [/\s\[?huContextMenu\]?=/, 'HuContextMenu'],
  [/<hu-timeline\b/, 'HU_TIMELINE_IMPORTS'],
  [/<hu-tree\b/, 'HU_TREE_IMPORTS'],
  [/<hu-picklist\b/, 'HU_PICKLIST_IMPORTS'],
  [/<hu-org-chart\b/, 'HU_ORG_CHART_IMPORTS'],
  [/<hu-accordion\b/, 'HU_ACCORDION_IMPORTS'],
  [/<hu-divider\b/, 'HuDivider'],
  [/<hu-fieldset\b/, 'HuFieldset'],
  [/<hu-carousel\b/, 'HU_CAROUSEL_IMPORTS'],
  [/<hu-gallery\b/, 'HuGallery'],
  [/<hu-lightbox\b/, 'HuLightbox'],
  [/<hu-image\b/, 'HuImage'],
];
const PIPES: Record<string, string> = {
  json: 'JsonPipe',
  date: 'DatePipe',
  async: 'AsyncPipe',
  uppercase: 'UpperCasePipe',
  lowercase: 'LowerCasePipe',
  titlecase: 'TitleCasePipe',
  currency: 'CurrencyPipe',
  number: 'DecimalPipe',
  percent: 'PercentPipe',
  keyvalue: 'KeyValuePipe',
  slice: 'SlicePipe',
};
const CORE_FNS = ['signal', 'computed', 'effect', 'inject', 'input', 'output', 'model', 'viewChild', 'linkedSignal'];
const FORMS_NAMES = ['Validators', 'NonNullableFormBuilder', 'FormBuilder', 'FormControl', 'FormGroup', 'FormArray'];
const RXJS_OPS = ['map', 'filter', 'debounceTime', 'distinctUntilChanged', 'switchMap', 'startWith', 'tap', 'catchError'];
/** Tip olarak tanınan, import gerektirmeyen adlar. */
const GLOBAL_TYPES = new Set(
  ('Array Boolean Date Error Event File FileList FormData Intl JSON Map Math Number Object Promise ReadonlyArray Record Partial Required Pick Omit RegExp Set String Symbol URL Blob HTMLElement HTMLInputElement KeyboardEvent MouseEvent PointerEvent DragEvent ClipboardEvent Component ' +
    'ReadonlySet ReadonlyMap Readonly Exclude Extract NonNullable ReturnType Parameters Awaited Function Iterable WeakMap WeakSet ArrayBuffer Uint8Array AbortController Response Request Headers PromiseLike BigInt').split(
    ' ',
  ),
);
const TEMPLATE_RESERVED = new Set(
  'true false null undefined this typeof instanceof in of let as new void track $event $index $count $first $last $even $odd $implicit'.split(' '),
);

interface TemplateRef {
  name: string;
  /** Olay bağlamı dışında çağrılıyor: `rows()` → sinyal. */
  read: boolean;
  /** Yalnızca olayda çağrılıyor: `(click)="save()"` → metot. */
  handler: boolean;
  /** `.set(` / `.update(` ile yazılıyor → sinyal. */
  written: boolean;
  /** `@for (x of name)` veya dizi bekleyen girdiye bağlı → `[]`. */
  list: boolean;
  /** `[formGroup]="name"` → şablondaki formControlName'lerden FormGroup. */
  formGroup: boolean;
  /** `name.alan` diye alt alanına erişiliyor → `{}`. */
  member: boolean;
}

/** Dizi bekleyen girdi adları. */
const LIST_INPUTS = /^\[(options|data|columns|items|markers|nav|toolbar|textColors|highlightColors|pageSizeOptions)\]$/;

/** Şablondaki ifadelerin kök adlarını (component üyelerine başvuranları) toplar. */
function templateRefs(html: string): Map<string, TemplateRef> {
  const locals = new Set<string>();
  for (const m of html.matchAll(/#([A-Za-z_]\w*)|let-([A-Za-z_]\w*)|\blet\s+([A-Za-z_]\w*)\s*=|\bas\s+([A-Za-z_]\w*)|@let\s+([A-Za-z_]\w*)/g)) {
    locals.add(m[1] ?? m[2] ?? m[3] ?? m[4] ?? m[5]);
  }
  const exprs: { expr: string; event: boolean; list?: boolean; formGroup?: boolean }[] = [];
  for (const m of html.matchAll(/\s(\(?\[?\(?[\w.\-@]+\)?\]?\)?|\*\w+)="([^"]*)"/g)) {
    const name = m[1];
    if (/^\*|^\[|^\(/.test(name)) {
      exprs.push({
        expr: m[2],
        event: name.startsWith('(') && !name.startsWith('[('),
        list: LIST_INPUTS.test(name),
        formGroup: name === '[formGroup]',
      });
    }
  }
  for (const m of html.matchAll(/\{\{([\s\S]*?)\}\}/g)) exprs.push({ expr: m[1], event: false });
  // @if (…) / @for (x of …; …) / @switch (…) / @case (…) / @let x = …;
  for (const m of html.matchAll(/@(if|for|switch|case|else if)\s*\(/g)) {
    let depth = 1;
    let j = m.index! + m[0].length;
    const start = j;
    while (j < html.length && depth) {
      if (html[j] === '(') depth++;
      else if (html[j] === ')') depth--;
      j++;
    }
    let inner = html.slice(start, j - 1);
    if (m[1] === 'for') {
      const f = /^\s*([A-Za-z_]\w*)\s+of\s+([^;]+)(.*)$/s.exec(inner);
      if (f) {
        locals.add(f[1]);
        exprs.push({ expr: f[2], event: false });
        exprs.push({ expr: `__iter__ ${f[2]}`, event: false });
        inner = f[3].replace(/track\s+/, '');
      }
    } else {
      inner = inner.replace(/;\s*as\s+\w+/, '');
    }
    exprs.push({ expr: inner, event: false });
  }
  for (const m of html.matchAll(/@let\s+\w+\s*=\s*([^;]+);/g)) exprs.push({ expr: m[1], event: false });

  const refs = new Map<string, TemplateRef>();
  for (const { expr, event, list, formGroup } of exprs) {
    const iterated = expr.startsWith('__iter__') || !!list;
    const clean = expr
      .replace(/^__iter__/, '')
      .replace(/'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`[^`]*`/g, "''")
      .replace(/\|\|/g, ' OR ')
      .replace(/\|\s*\w+(\s*:\s*[^|)]+)?/g, '') // pipe'lar
      .replace(/[{,]\s*[A-Za-z_$][\w$]*\s*:/g, ','); // nesne anahtarları
    for (const m of clean.matchAll(/(?<![\w$.\]?)])([A-Za-z_$][\w$]*)(\s*\()?(\s*\.\s*(?:set|update)\s*\()?/g)) {
      const name = m[1];
      if (TEMPLATE_RESERVED.has(name) || locals.has(name) || name === 'OR') continue;
      const ref = refs.get(name) ?? { name, read: false, handler: false, written: false, list: false, formGroup: false, member: false };
      ref.formGroup ||= !!formGroup && expr.trim() === name;
      ref.member ||= !m[2] && /^\s*\.(?!\s*(set|update)\s*\()/.test(clean.slice(m.index! + name.length));
      if (m[2]) {
        if (event) ref.handler = true;
        else ref.read = true;
      }
      ref.written ||= !!m[3];
      ref.list ||= iterated && new RegExp(`^\\s*${name}\\b`).test(expr.replace('__iter__', ''));
      refs.set(name, ref);
    }
  }
  return refs;
}

/** Sınıf gövdesinde tanımlı üye adları (girintisiz satırlardan). */
function declaredMembers(body: string): Set<string> {
  const names = new Set<string>();
  for (const line of body.split('\n')) {
    const m = /^(?:(?:protected|private|public|readonly|static|override|async|declare)\s+)*(?:get\s+|set\s+)?([A-Za-z_$][\w$]*)\s*[!?]?\s*(?:=|:|\(|<)/.exec(line);
    if (m) names.add(m[1]);
  }
  return names;
}

/**
 * TS örneğini sınıf gövdesine uygun hale getirir: üye olmayan ifadeler
 * (`this.theme.toggle()` gibi) bir metoda, açıklayıcı parçalar (`providers: […]`) yoruma alınır.
 */
function toClassBody(ts: string): string {
  const segments: string[][] = [];
  for (const line of ts.split('\n')) {
    if (!segments.length || (line.trim() && !/^\s/.test(line) && !/^[)\]}]/.test(line.trim()))) segments.push([]);
    segments[segments.length - 1].push(line);
  }
  const members: string[] = [];
  const statements: string[] = [];
  let pendingComments: string[] = [];
  for (const seg of segments) {
    const first = seg[0].trim();
    if (!first) {
      members.push(...pendingComments, ...seg);
      pendingComments = [];
      continue;
    }
    if (/^(\/\/|\/\*|\*)/.test(first) && seg.length === 1) {
      pendingComments.push(seg[0]);
      continue;
    }
    const isConfig = /^[A-Za-z_$][\w$]*\s*:\s*[[{]/.test(first) && !/=/.test(first);
    const isLiteral = /^[{[]/.test(first);
    const isStatement =
      /^(this\.|const\s|let\s|var\s|await\s|return\s|if\s*\()/.test(first) ||
      (/^[\w$.]+(<[^>]*>)?\s*\(.*\)[^{]*$/.test(first) && !/\)\s*(:\s*[^=]+)?\{\s*$/.test(first) && !/=/.test(first.split('(')[0]));
    if (isConfig || isLiteral) {
      members.push(...pendingComments, ...seg.map((l) => `// ${l}`));
    } else if (isStatement) {
      statements.push(...pendingComments, ...seg);
    } else {
      members.push(...pendingComments, ...seg);
    }
    pendingComments = [];
  }
  members.push(...pendingComments);
  let body = members.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  if (statements.length) {
    const isAsync = statements.some((l) => /\bawait\b/.test(l));
    const method = [
      `${isAsync ? 'async ' : ''}ornek(): ${isAsync ? 'Promise<void>' : 'void'} {`,
      ...statements.map((l) => (l.trim() ? `  ${l}` : '')),
      '}',
    ].join('\n');
    body = body ? `${body}\n\n${method}` : method;
  }
  return body;
}

/**
 * Örnekten bağımsız çalışan bir component dosyası üretir: import'lar HTML ve TS'te
 * kullanılan adlardan çıkarılır, TS satırları sınıf gövdesine yerleşir, örnekte
 * tanımlanmamış alanlar için yer tutucu eklenir.
 */
export function buildComponent(snippetHtml: string, ts: string): string {
  // Component, StackBlitz'e gidecek (çalışır hale getirilmiş) şablona göre üretilir
  const html = runnableHtml(snippetHtml);
  const lib = new Set<string>();
  const core = new Set<string>(['Component']);
  const forms = new Set<string>();
  const common = new Set<string>();
  const rxjs = new Set<string>();
  const interop = new Set<string>();
  const extraImports: string[] = [];
  const componentImports: string[] = [];

  // Örnekteki import satırlarını ayıkla
  const bodyLines: string[] = [];
  for (const line of ts.split('\n')) {
    const m = /^\s*import\s*\{([^}]+)\}\s*from\s*'([^']+)';?\s*$/.exec(line);
    if (!m) {
      bodyLines.push(line);
      continue;
    }
    const names = m[1].split(',').map((n) => n.trim()).filter(Boolean);
    const target =
      m[2] === '@ucme-ui/angular' ? lib : m[2] === '@angular/core' ? core : m[2] === '@angular/forms' ? forms : m[2] === 'rxjs' ? rxjs : null;
    if (target) names.forEach((n) => target.add(n));
    else extraImports.push(line.trim());
  }
  let body = toClassBody(bodyLines.join('\n').trim());
  // Ad taraması için: yorumlar ve metin değişmezleri çıkarılır ('Sil' tip, yorumdaki Hu… import sanılmasın)
  const code = body
    .replace(/'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`/g, "''")
    .replace(/\/\/[^\n]*/g, '');

  for (const [re, name] of TEMPLATE_IMPORTS) {
    if (re.test(html) && !componentImports.includes(name)) componentImports.push(name);
  }
  componentImports.forEach((n) => lib.add(n));
  for (const name of code.match(/\b(Hu[A-Z]\w*|HU_[A-Z_]+|provideHu\w+|hu[A-Z]\w+)\b/g) ?? []) {
    if (/^(Hu|HU_|provideHu)/.test(name) || /^hu(Sanitize|IsSafe|UniqueId)/.test(name)) lib.add(name);
  }
  for (const fn of CORE_FNS) if (new RegExp(`\\b${fn}\\s*[<(]`).test(code)) core.add(fn);
  for (const name of FORMS_NAMES) if (new RegExp(`\\b${name}\\b`).test(code)) forms.add(name);
  if (/\btoSignal\s*\(/.test(code)) interop.add('toSignal');
  if (/\.pipe\s*\(/.test(code)) for (const op of RXJS_OPS) if (new RegExp(`\\b${op}\\s*\\(`).test(code)) rxjs.add(op);

  const reactive = /formControlName|\[formGroup\]|\[formControl\]/.test(html);
  const ngModel = /\[\(ngModel\)\]/.test(html);
  if (reactive) {
    forms.add('ReactiveFormsModule');
    componentImports.unshift('ReactiveFormsModule');
  }
  if (ngModel) {
    forms.add('FormsModule');
    componentImports.unshift('FormsModule');
  }
  for (const m of html.matchAll(/(?<!\|)\|\s*(\w+)/g)) {
    const pipe = PIPES[m[1]];
    if (pipe && !common.has(pipe)) {
      common.add(pipe);
      componentImports.push(pipe);
    }
  }

  // Örnekte tanımsız bırakılan fb için inject satırı
  if (/\bthis\.fb\b/.test(code) && !/\bfb\s*=/.test(code)) {
    body = `private readonly fb = inject(NonNullableFormBuilder);\n\n${body}`;
    core.add('inject');
    forms.add('NonNullableFormBuilder');
  }

  // Şablonda / this.x ile kullanılıp tanımlanmamış alanlar için yer tutucu
  const declared = declaredMembers(body);
  const stubs: string[] = [];
  const stubbed = new Set<string>();
  for (const ref of templateRefs(html).values()) {
    if (declared.has(ref.name) || stubbed.has(ref.name)) continue;
    stubbed.add(ref.name);
    if (ref.formGroup) {
      const controls = [...new Set([...html.matchAll(/formControlName="([\w-]+)"/g)].map((m) => m[1]))];
      forms.add('FormGroup');
      if (controls.length) forms.add('FormControl');
      stubs.push(`${ref.name} = new FormGroup({ ${controls.map((c) => `${c}: new FormControl<any>(null)`).join(', ')} });`);
    } else if (ref.read || (ref.written && !ref.member)) {
      // api.update(…) gibi: başka alanları da kullanılıyorsa sinyal değil düz nesne
      core.add('signal');
      stubs.push(`${ref.name} = signal<any>(${ref.list ? '[]' : 'undefined'});`);
    } else if (ref.handler) stubs.push(`${ref.name}(...args: any[]): void {}`);
    else stubs.push(`${ref.name}: any${ref.list ? ' = []' : ref.member ? ' = {}' : ''};`);
  }
  for (const m of code.matchAll(/\bthis\.([A-Za-z_$][\w$]*)/g)) {
    if (declared.has(m[1]) || stubbed.has(m[1])) continue;
    stubbed.add(m[1]);
    stubs.push(`${m[1]}: any;`);
  }
  if (stubs.length) {
    body = ['// Örnekte kullanılan ama burada tanımlı olmayan alanlar: kendi verinizle değiştirin', ...stubs, '', body]
      .join('\n')
      .trim();
  }

  // Bilinmeyen tip adları (örneğe özgü arayüzler: Course, User…)
  const fromExtra = extraImports.flatMap((l) => (/\{([^}]+)\}/.exec(l)?.[1] ?? '').split(',').map((n) => n.trim()));
  const known = new Set([...lib, ...core, ...forms, ...common, ...rxjs, ...interop, ...fromExtra]);
  const typeStubs = new Set<string>();
  for (const m of code.matchAll(/(?<![.\w$])([A-Z][A-Za-z0-9]*)\b/g)) {
    const name = m[1];
    if (known.has(name) || GLOBAL_TYPES.has(name) || /^(Hu|HU_)/.test(name) || /^[A-Z0-9_]+$/.test(name)) continue;
    if (new RegExp(`\\b(interface|class|type|enum)\\s+${name}\\b`).test(code)) continue;
    typeStubs.add(name);
  }

  const sorted = (s: Set<string>) => [...s].sort((a, b) => a.localeCompare(b));
  const imp = (names: Set<string>, from: string) => (names.size ? [`import { ${sorted(names).join(', ')} } from '${from}';`] : []);
  const lines = [
    ...imp(core, '@angular/core'),
    ...imp(interop, '@angular/core/rxjs-interop'),
    ...imp(common, '@angular/common'),
    ...imp(forms, '@angular/forms'),
    ...imp(rxjs, 'rxjs'),
    ...extraImports,
    ...imp(lib, '@ucme-ui/angular'),
    ...(typeStubs.size ? ['', '// Örneğe özgü tipler', ...[...typeStubs].map((t) => `type ${t} = any;`)] : []),
    '',
    '@Component({',
    `  selector: 'app-example',`,
    `  imports: [${componentImports.join(', ')}],`,
    `  templateUrl: './example.component.html',`,
    '})',
    'export class ExampleComponent {',
    ...(body ? body.split('\n').map((l) => (l ? `  ${l}` : '')) : []),
    '}',
  ];
  return lines.join('\n');
}

// --- StackBlitz ----------------------------------------------------------------------------
const ANGULAR = '^22.2.0';

/** StackBlitz projesinin giriş dosyası: örnek + bildirimler; router ve HTTP hazır. */
export const STACKBLITZ_MAIN = `import { Component } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { HuToaster } from '@ucme-ui/angular';
import { ExampleComponent } from './app/example.component';

@Component({
  selector: 'app-root',
  imports: [ExampleComponent, HuToaster],
  template: '<app-example /><hu-toaster />',
})
class App {}

bootstrapApplication(App, {
  providers: [provideRouter([]), provideHttpClient()],
}).catch((err) => console.error(err));
`;

/** Örneği StackBlitz'te, kütüphanenin npm sürümüyle çalışan bir Angular projesi olarak açar. */
export function openInStackBlitz(title: string, html: string, componentTs: string): void {
  const files: Record<string, string> = {
    'package.json': JSON.stringify(
      {
        name: 'ucme-ui-ornek',
        private: true,
        scripts: { start: 'ng serve', build: 'ng build' },
        dependencies: {
          '@angular/common': ANGULAR,
          '@angular/compiler': ANGULAR,
          '@angular/core': ANGULAR,
          '@angular/forms': ANGULAR,
          '@angular/platform-browser': ANGULAR,
          '@angular/router': ANGULAR,
          '@ucme-ui/angular': 'latest',
          rxjs: '~7.8.0',
          tslib: '^2.3.0',
        },
        devDependencies: {
          '@angular/build': ANGULAR,
          '@angular/cli': ANGULAR,
          '@angular/compiler-cli': ANGULAR,
          typescript: '~6.0.3',
        },
      },
      null,
      2,
    ),
    'angular.json': JSON.stringify(
      {
        $schema: './node_modules/@angular/cli/lib/config/schema.json',
        version: 1,
        newProjectRoot: 'projects',
        cli: { analytics: false },
        projects: {
          demo: {
            projectType: 'application',
            root: '',
            sourceRoot: 'src',
            architect: {
              build: {
                builder: '@angular/build:application',
                options: {
                  browser: 'src/main.ts',
                  index: 'src/index.html',
                  tsConfig: 'tsconfig.json',
                  styles: ['src/styles.scss'],
                },
              },
              serve: { builder: '@angular/build:dev-server', options: { buildTarget: 'demo:build' } },
            },
          },
        },
      },
      null,
      2,
    ),
    // Örnekler kısaltılmış olabilir (eksik alanlar vb.); sıkı tip kontrolü kapalı ki yine de çalışsın.
    'tsconfig.json': JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          module: 'ES2022',
          moduleResolution: 'bundler',
          strict: false,
          skipLibCheck: true,
          experimentalDecorators: true,
          isolatedModules: true,
        },
        angularCompilerOptions: { strictTemplates: false },
        files: ['src/main.ts'],
      },
      null,
      2,
    ),
    'src/index.html': `<!doctype html>
<html lang="tr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escape(title)} · @ucme-ui/angular</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <app-root></app-root>
  </body>
</html>
`,
    'src/styles.scss': `@use '@ucme-ui/angular/styles';

body {
  padding: 2rem;
}
`,
    'src/main.ts': STACKBLITZ_MAIN,
    'src/app/example.component.ts': componentTs + '\n',
    'src/app/example.component.html': html + '\n',
  };

  // StackBlitz'in "POST ile proje aç" yöntemi (SDK da bunu kullanır); ek paket gerekmez
  const form = document.createElement('form');
  form.method = 'POST';
  form.target = '_blank';
  form.action = 'https://stackblitz.com/run?file=src%2Fapp%2Fexample.component.html';
  form.style.display = 'none';
  const field = (name: string, value: string) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  };
  field('project[title]', `${title} · @ucme-ui/angular`);
  field('project[description]', 'ucme-ui Angular component örneği');
  field('project[template]', 'node');
  for (const [path, content] of Object.entries(files)) field(`project[files][${path}]`, content);
  document.body.appendChild(form);
  form.submit();
  form.remove();
}
