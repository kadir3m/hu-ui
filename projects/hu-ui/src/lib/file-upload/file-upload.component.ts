import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  DoCheck,
  ElementRef,
  Injector,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl, ValidationErrors } from '@angular/forms';
import { HuButton } from '../button/button.component';
import { HuIcon } from '../icon/icon.component';
import { huUniqueId } from '../core/unique-id';
import { HU_FORM_FIELD, HuFormFieldControl } from '../form-field/form-field.tokens';

export type HuFileRejectReason = 'type' | 'size' | 'count';

export interface HuFileRejection {
  file: File;
  reason: HuFileRejectReason;
  message: string;
}

/**
 * Dosyayı sunucuya yükleyen fonksiyon. `progress(0-100)` çağırarak ilerleme çubuğunu
 * güncelleyebilirsiniz. Promise'in döndürdüğü değer `(uploaded)` ile gelir.
 */
export type HuFileUploader = (file: File, progress: (percent: number) => void) => Promise<unknown>;

export type HuFileStatus = 'idle' | 'uploading' | 'done' | 'error';

interface Meta {
  preview: string | null;
  status: HuFileStatus;
  progress: number;
}

interface Entry extends Meta {
  file: File;
}

const EMPTY_META: Meta = { preview: null, status: 'idle', progress: 0 };

/**
 * Dosya seçme ve sürükle-bırak alanı. Değer `File[]`'dir; formlarla
 * (`formControlName`) veya `[(files)]` ile çalışır.
 *
 * @example
 * <hu-form-field label="Ekler">
 *   <hu-file-upload formControlName="attachments" accept=".pdf" multiple [maxFileSize]="5 * 1024 * 1024" />
 * </hu-form-field>
 *
 * <!-- Seçilince sunucuya yükle (ilerleme çubuğu ile) -->
 * <hu-file-upload multiple [uploader]="upload" (uploaded)="onUploaded($event)" />
 */
@Component({
  selector: 'hu-file-upload',
  imports: [HuButton, HuIcon],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HuFileUpload), multi: true },
    { provide: HuFormFieldControl, useExisting: forwardRef(() => HuFileUpload) },
  ],
  host: {
    class: 'hu-file-upload',
    '[class.hu-file-upload--disabled]': 'isDisabled()',
    '[class.hu-file-upload--invalid]': 'isInvalid()',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuFileUpload implements ControlValueAccessor, HuFormFieldControl, DoCheck {
  private readonly injector = inject(Injector);
  protected readonly field = inject(HU_FORM_FIELD, { optional: true, host: true });

  /** Seçilen dosyalar. */
  readonly files = model<File[]>([]);
  /** null/undefined verilirse boş liste. */
  protected readonly fileList = computed(() => this.files() ?? []);
  /** Kabul edilen türler, `<input accept>` biçiminde: `'image/*,.pdf'`. */
  readonly accept = input('');
  readonly multiple = input(false, { transform: booleanAttribute });
  /** Dosya başına en büyük boyut (bayt). */
  readonly maxFileSize = input<number | null>(null);
  /** En fazla dosya sayısı (`multiple` ile). */
  readonly maxFiles = input<number | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Sürükleme alanındaki ana metin. */
  readonly label = input('Dosyaları buraya sürükleyin veya');
  /** Alanın altındaki kısa bilgi. Verilmezse kabul edilen tür ve boyuttan üretilir. */
  readonly hint = input<string>();
  /** Görseller için küçük önizleme. */
  readonly preview = input(true, { transform: booleanAttribute });
  /** Verilirse eklenen dosyalar hemen yüklenir; satırda ilerleme gösterilir. */
  readonly uploader = input<HuFileUploader | null>(null);
  readonly id = input(huUniqueId('hu-file-upload'));

  /** Kurallara uymayan dosyalar (tür, boyut, adet). */
  readonly rejected = output<HuFileRejection[]>();
  /** Bir dosya `uploader` ile başarıyla yüklendiğinde. */
  readonly uploaded = output<{ file: File; result: unknown }>();
  /** Yükleme hata verdiğinde. */
  readonly uploadError = output<{ file: File; error: unknown }>();
  /** Kullanıcı bir dosyayı listeden kaldırdığında. */
  readonly removed = output<File>();

  protected readonly dragging = signal(false);
  /** Son eklemede reddedilen dosyaların mesajları. */
  protected readonly messages = signal<string[]>([]);
  /** Dosya başına önizleme adresi ve yükleme durumu. */
  private readonly meta = signal<ReadonlyMap<File, Meta>>(new Map());
  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  protected readonly items = computed<Entry[]>(() => {
    const meta = this.meta();
    return this.fileList().map((file) => ({ file, ...(meta.get(file) ?? EMPTY_META) }));
  });

  protected readonly hintText = computed(() => {
    const hint = this.hint();
    if (hint !== undefined) return hint;
    const parts: string[] = [];
    const accept = this.accept()
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean)
      .map((a) => (a.startsWith('.') ? a.slice(1).toUpperCase() : a === 'image/*' ? 'Görseller' : a));
    if (accept.length) parts.push(accept.join(', '));
    const max = this.maxFileSize();
    if (max) parts.push(`en fazla ${formatFileSize(max)}`);
    if (this.multiple() && this.maxFiles()) parts.push(`en fazla ${this.maxFiles()} dosya`);
    return parts.join(' · ');
  });

  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');
  private dragDepth = 0;
  private onChange: (value: File[]) => void = () => {};
  private onTouched: () => void = () => {};

  // --- HuFormFieldControl ------------------------------------------------------------
  private ngControl: NgControl | null | undefined;
  get hasControl(): boolean {
    return !!this.resolveControl();
  }
  readonly controlErrorVisible = signal(false);
  readonly errors = signal<ValidationErrors | null>(null);
  protected readonly isInvalid = computed(
    () => this.controlErrorVisible() || (this.field?.showError() ?? false) || this.messages().length > 0,
  );

  constructor() {
    // files dışarıdan da ([(files)], form) değişebilir: önizlemeleri eşitle
    effect(() => {
      const files = this.fileList();
      untracked(() => this.syncMeta(files));
    });
    inject(DestroyRef).onDestroy(() => this.meta().forEach((m) => m.preview && URL.revokeObjectURL(m.preview)));
  }

  ngDoCheck(): void {
    const c = this.resolveControl();
    if (!c) return;
    this.controlErrorVisible.set(!!c.invalid && !!(c.touched || c.dirty));
    this.errors.set(c.errors);
  }

  /** Dosya seçme penceresini açar. */
  browse(): void {
    if (!this.isDisabled()) this.input().nativeElement.click();
  }

  /** Tüm dosyaları kaldırır. */
  clear(): void {
    this.setFiles([]);
    this.messages.set([]);
  }

  // --- Olaylar -----------------------------------------------------------------------
  protected onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.add(Array.from(input.files ?? []));
    input.value = ''; // aynı dosya tekrar seçilebilsin
  }

  protected onDragEnter(event: DragEvent): void {
    if (this.isDisabled() || !hasFiles(event)) return;
    event.preventDefault();
    this.dragDepth++;
    this.dragging.set(true);
  }

  protected onDragOver(event: DragEvent): void {
    if (this.isDisabled() || !hasFiles(event)) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
  }

  protected onDragLeave(): void {
    this.dragDepth = Math.max(0, this.dragDepth - 1);
    if (!this.dragDepth) this.dragging.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragDepth = 0;
    this.dragging.set(false);
    if (this.isDisabled()) return;
    this.add(Array.from(event.dataTransfer?.files ?? []));
  }

  protected remove(entry: Entry): void {
    if (this.isDisabled()) return;
    this.setFiles(this.fileList().filter((f) => f !== entry.file));
    this.removed.emit(entry.file);
  }

  protected retry(entry: Entry): void {
    void this.upload(entry.file);
  }

  // --- ControlValueAccessor --------------------------------------------------------------
  writeValue(value: unknown): void {
    const files = Array.isArray(value) ? value.filter((f) => f instanceof File) : value instanceof File ? [value] : [];
    this.files.set(files);
    this.syncMeta(files);
    this.messages.set([]);
  }
  registerOnChange(fn: (value: File[]) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }

  // --- Yardımcılar ---------------------------------------------------------------------
  protected readonly formatSize = formatFileSize;

  protected iconFor(file: File): string {
    if (file.type.startsWith('image/')) return 'file-image';
    if (/zip|rar|7z|tar|gzip/.test(file.type) || /\.(zip|rar|7z|tar|gz)$/i.test(file.name)) return 'file-archive';
    if (/pdf|word|document|text|sheet|excel|presentation/.test(file.type)) return 'file-text';
    return 'file';
  }

  private add(incoming: File[]): void {
    if (!incoming.length) return;
    this.onTouched();
    const rejections: HuFileRejection[] = [];
    const accepted: File[] = [];
    const max = this.maxFileSize();

    for (const file of incoming) {
      if (!matchesAccept(file, this.accept())) {
        rejections.push({ file, reason: 'type', message: `${file.name}: bu dosya türü kabul edilmiyor.` });
      } else if (max && file.size > max) {
        rejections.push({ file, reason: 'size', message: `${file.name}: en fazla ${formatFileSize(max)} olabilir.` });
      } else {
        accepted.push(file);
      }
    }

    let next: File[];
    if (!this.multiple()) {
      // Tekli modda yeni dosya eskisinin yerine geçer
      next = accepted.length ? accepted.slice(-1) : this.fileList();
    } else {
      // Aynı dosya iki kez eklenmesin (ad + boyut + tarih)
      const key = (f: File) => `${f.name}|${f.size}|${f.lastModified}`;
      const existing = new Set(this.fileList().map(key));
      next = [...this.fileList(), ...accepted.filter((f) => !existing.has(key(f)))];
      const limit = this.maxFiles();
      if (limit && next.length > limit) {
        next.slice(limit).forEach((file) =>
          rejections.push({ file, reason: 'count', message: `${file.name}: en fazla ${limit} dosya eklenebilir.` }),
        );
        next = next.slice(0, limit);
      }
    }

    this.messages.set(rejections.map((r) => r.message));
    if (rejections.length) this.rejected.emit(rejections);

    const before = new Set(this.fileList());
    this.setFiles(next);
    if (this.uploader()) next.filter((f) => !before.has(f)).forEach((file) => void this.upload(file));
  }

  private async upload(file: File): Promise<void> {
    const uploader = this.uploader();
    if (!uploader) return;
    this.patch(file, { status: 'uploading', progress: 0 });
    try {
      const result = await uploader(file, (p) => this.patch(file, { progress: Math.max(0, Math.min(100, Math.round(p))) }));
      this.patch(file, { status: 'done', progress: 100 });
      this.uploaded.emit({ file, result });
    } catch (error) {
      this.patch(file, { status: 'error' });
      this.uploadError.emit({ file, error });
    }
  }

  private patch(file: File, changes: Partial<Meta>): void {
    const current = this.meta().get(file);
    if (!current) return; // bu arada kaldırıldı
    this.meta.update((map) => new Map(map).set(file, { ...current, ...changes }));
  }

  private setFiles(files: File[]): void {
    this.files.set(files);
    this.syncMeta(files);
    this.onChange(files);
  }

  /** Yeni dosyalara kayıt (görselse önizleme) aç, kaldırılanların önizlemesini serbest bırak. */
  private syncMeta(files: File[]): void {
    const current = this.meta();
    if (current.size === files.length && files.every((f) => current.has(f))) return;
    const keep = new Set(files);
    const next = new Map<File, Meta>();
    current.forEach((m, f) => {
      if (keep.has(f)) next.set(f, m);
      else if (m.preview) URL.revokeObjectURL(m.preview);
    });
    for (const file of files) {
      if (next.has(file)) continue;
      const image = this.preview() && /^image\/(png|jpe?g|gif|webp|avif)$/.test(file.type);
      next.set(file, { ...EMPTY_META, preview: image ? URL.createObjectURL(file) : null });
    }
    this.meta.set(next);
  }

  private resolveControl(): NgControl | null {
    if (this.ngControl === undefined) {
      this.ngControl = this.injector.get(NgControl, null, { self: true, optional: true });
    }
    return this.ngControl;
  }
}

/** `1536` → `"1,5 KB"` */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toLocaleString('tr-TR', { maximumFractionDigits: value < 10 ? 1 : 0 })} ${units[unit]}`;
}

function matchesAccept(file: File, accept: string): boolean {
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

function hasFiles(event: DragEvent): boolean {
  return !!event.dataTransfer?.types.includes('Files');
}
