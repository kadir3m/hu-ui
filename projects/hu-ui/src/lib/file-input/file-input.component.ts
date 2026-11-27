import {
  ChangeDetectionStrategy,
  Component,
  DoCheck,
  ElementRef,
  Injector,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl, ValidationErrors } from '@angular/forms';
import { HuButton } from '../button/button.component';
import { HuIcon } from '../icon/icon.component';
import { huAcceptLabel, huDragHasFiles, huFileIcon, huMatchesAccept } from '../core/file';
import { huUniqueId } from '../core/unique-id';
import { HU_FORM_FIELD, HuFormFieldControl } from '../form-field/form-field.tokens';
import { HuFileRejection, HuFileStatus, HuFileUploader, formatFileSize } from '../file-upload/file-upload.component';

/**
 * Sunucuda zaten kayıtlı bir dosya (düzenleme ekranlarında). `url` verilirse
 * dosya adı indirme bağlantısı olur.
 */
export interface HuStoredFile {
  name: string;
  size?: number;
  url?: string;
}

export type HuFileInputValue = File | HuStoredFile | null;

/**
 * Tek dosyalık, satır biçiminde dosya alanı: etiket, seçilen dosya, "Dosya seç"
 * ve "Kaldır". Belge listeleri (başvuru evrakı vb.) için; satıra dosya
 * sürükleyip bırakmak da çalışır. Değer `File`, sunucudaki dosya için
 * `HuStoredFile` veya `null`'dır.
 *
 * @example
 * <!-- Kendi etiketiyle, liste satırı -->
 * <hu-file-input label="Başvuru formu" required accept=".pdf,.docx" formControlName="summary" />
 *
 * <!-- hu-form-field içinde, input gibi -->
 * <hu-form-field label="Destek mektubu">
 *   <hu-file-input [(value)]="decision" />
 * </hu-form-field>
 */
@Component({
  selector: 'hu-file-input',
  imports: [HuButton, HuIcon],
  templateUrl: './file-input.component.html',
  styleUrl: './file-input.component.scss',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HuFileInput), multi: true },
    { provide: HuFormFieldControl, useExisting: forwardRef(() => HuFileInput) },
  ],
  host: {
    class: 'hu-file-input',
    '[class.hu-file-input--labelled]': '!!label()',
    '[class.hu-file-input--filled]': '!!value()',
    '[class.hu-file-input--stored]': '!!display()?.stored',
    '[class.hu-file-input--dragging]': 'dragging()',
    '[class.hu-file-input--disabled]': 'isDisabled()',
    '[class.hu-file-input--invalid]': 'isInvalid()',
    '[attr.data-status]': 'status()',
    '(dragenter)': 'onDragEnter($event)',
    '(dragover)': 'onDragOver($event)',
    '(dragleave)': 'onDragLeave()',
    '(drop)': 'onDrop($event)',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuFileInput implements ControlValueAccessor, HuFormFieldControl, DoCheck {
  private readonly injector = inject(Injector);
  protected readonly field = inject(HU_FORM_FIELD, { optional: true, host: true });

  /** Seçilen dosya; sunucudaki dosya için `HuStoredFile`. */
  readonly valueInput = input<HuFileInputValue>(null, { alias: 'value' });
  /** Yalnızca kullanıcı değiştirince yayılır; form (writeValue) güncellemeleri yaymaz. */
  readonly valueChange = output<HuFileInputValue>();
  /** Geçerli değer: bağlamadan, formdan veya kullanıcıdan gelir. */
  readonly value = linkedSignal(() => this.valueInput());
  /** Satırın kendi etiketi. hu-form-field içinde kullanırken vermeyin. */
  readonly label = input<string>();
  /** Etiketin yanında yıldız gösterir (doğrulama için `Validators.required` kullanın). */
  readonly required = input(false, { transform: booleanAttribute });
  /** Etiketin altındaki kısa bilgi. Verilmezse kabul edilen tür ve boyuttan üretilir. */
  readonly hint = input<string>();
  /** Dosya yokken görünen metin. */
  readonly placeholder = input('Dosya seçilmedi');
  /** Kabul edilen türler, `<input accept>` biçiminde: `'.pdf,.docx'`. */
  readonly accept = input('');
  /** En büyük boyut (bayt). */
  readonly maxFileSize = input<number | null>(null);
  /** Verilirse dosya seçilince hemen yüklenir; satırda ilerleme gösterilir. */
  readonly uploader = input<HuFileUploader | null>(null);
  /** Silme düğmesi. Kapatılırsa dosya yalnızca değiştirilebilir. */
  readonly removable = input(true, { transform: booleanAttribute });
  readonly browseLabel = input('Dosya seç');
  readonly changeLabel = input('Değiştir');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly id = input(huUniqueId('hu-file-input'));

  /** Kurala uymayan dosya (tür, boyut). */
  readonly rejected = output<HuFileRejection>();
  /** `uploader` başarıyla bitince. */
  readonly uploaded = output<{ file: File; result: unknown }>();
  readonly uploadError = output<{ file: File; error: unknown }>();
  /** Kullanıcı dosyayı kaldırınca; kaldırılan değer gelir. */
  readonly removed = output<File | HuStoredFile>();

  protected readonly dragging = signal(false);
  protected readonly message = signal<string | null>(null);
  protected readonly status = signal<HuFileStatus>('idle');
  protected readonly progress = signal(0);
  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  protected readonly labelId = computed(() => `${this.id()}-label`);
  protected readonly hintId = computed(() => `${this.id()}-hint`);
  protected readonly messageId = computed(() => `${this.id()}-message`);

  /** Ekranda gösterilecek dosya bilgisi. */
  protected readonly display = computed(() => {
    const v = this.value();
    if (!v) return null;
    const local = v instanceof File;
    return {
      name: v.name,
      size: v.size ?? null,
      url: local ? null : (v.url ?? null),
      icon: huFileIcon(v.name, local ? v.type : ''),
      stored: !local,
    };
  });

  protected readonly hintText = computed(() => {
    const hint = this.hint();
    if (hint !== undefined) return hint;
    const parts: string[] = [];
    const accept = huAcceptLabel(this.accept());
    if (accept) parts.push(accept);
    const max = this.maxFileSize();
    if (max) parts.push(`en fazla ${formatFileSize(max)}`);
    return parts.join(' · ');
  });

  protected readonly describedBy = computed(() => {
    const ids = [this.field?.describedBy(), this.hintText() ? this.hintId() : null, this.message() ? this.messageId() : null];
    return ids.filter(Boolean).join(' ') || null;
  });

  protected readonly formatSize = formatFileSize;

  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');
  private readonly browseButton = viewChild('browseButton', { read: ElementRef<HTMLButtonElement> });
  private dragDepth = 0;
  /** Sürmekte olan yüklemeyi tanımak için; dosya değişince eski sonuç yok sayılır. */
  private uploading: File | null = null;
  private onChange: (value: HuFileInputValue) => void = () => {};
  private onTouched: () => void = () => {};

  // --- HuFormFieldControl ------------------------------------------------------------
  private ngControl: NgControl | null | undefined;
  get hasControl(): boolean {
    return !!this.resolveControl();
  }
  readonly controlErrorVisible = signal(false);
  readonly errors = signal<ValidationErrors | null>(null);
  protected readonly isInvalid = computed(
    () => this.controlErrorVisible() || (this.field?.showError() ?? false) || !!this.message() || this.status() === 'error',
  );

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

  /** Dosyayı kaldırır. */
  clear(): void {
    this.setValue(null);
    this.message.set(null);
  }

  // --- Olaylar -----------------------------------------------------------------------
  protected onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // aynı dosya tekrar seçilebilsin
    if (file) this.pick(file);
  }

  protected onDragEnter(event: DragEvent): void {
    if (this.isDisabled() || !huDragHasFiles(event)) return;
    event.preventDefault();
    this.dragDepth++;
    this.dragging.set(true);
  }

  protected onDragOver(event: DragEvent): void {
    if (this.isDisabled() || !huDragHasFiles(event)) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
  }

  protected onDragLeave(): void {
    this.dragDepth = Math.max(0, this.dragDepth - 1);
    if (!this.dragDepth) this.dragging.set(false);
  }

  protected onDrop(event: DragEvent): void {
    if (!huDragHasFiles(event)) return;
    event.preventDefault();
    this.dragDepth = 0;
    this.dragging.set(false);
    if (this.isDisabled()) return;
    const file = event.dataTransfer?.files[0];
    if (file) this.pick(file);
  }

  protected remove(): void {
    const current = this.value();
    if (this.isDisabled() || !current) return;
    this.onTouched();
    this.clear();
    this.removed.emit(current);
    // Kaldırılan düğme DOM'dan çıkınca odak kaybolmasın
    queueMicrotask(() => this.browseButton()?.nativeElement.focus());
  }

  protected retry(): void {
    const v = this.value();
    if (v instanceof File) void this.upload(v);
  }

  /** Satırın boş yerine tıklamak da dosya seçtirir (düğme ve bağlantılar hariç). */
  protected onBoxClick(event: MouseEvent): void {
    if (!(event.target as HTMLElement).closest('button, a')) this.browse();
  }

  protected onBlur(event: FocusEvent): void {
    const host = (event.currentTarget as HTMLElement).closest('.hu-file-input');
    if (!host?.contains(event.relatedTarget as Node | null)) this.onTouched();
  }

  // --- ControlValueAccessor --------------------------------------------------------------
  writeValue(value: unknown): void {
    this.value.set(isFileValue(value) ? value : null);
    this.resetStatus();
    this.message.set(null);
  }
  registerOnChange(fn: (value: HuFileInputValue) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }

  // --- Yardımcılar ---------------------------------------------------------------------
  private pick(file: File): void {
    this.onTouched();
    const max = this.maxFileSize();
    let rejection: HuFileRejection | null = null;
    if (!huMatchesAccept(file, this.accept())) {
      const accept = huAcceptLabel(this.accept());
      rejection = { file, reason: 'type', message: `${file.name}: bu dosya türü kabul edilmiyor${accept ? ` (${accept})` : ''}.` };
    } else if (max && file.size > max) {
      rejection = { file, reason: 'size', message: `${file.name}: en fazla ${formatFileSize(max)} olabilir.` };
    }
    if (rejection) {
      this.message.set(rejection.message);
      this.rejected.emit(rejection);
      return;
    }
    this.message.set(null);
    this.setValue(file);
    if (this.uploader()) void this.upload(file);
  }

  private async upload(file: File): Promise<void> {
    const uploader = this.uploader();
    if (!uploader) return;
    this.uploading = file;
    this.status.set('uploading');
    this.progress.set(0);
    try {
      const result = await uploader(file, (p) => {
        if (this.uploading === file) this.progress.set(Math.max(0, Math.min(100, Math.round(p))));
      });
      if (this.uploading !== file) return;
      this.status.set('done');
      this.progress.set(100);
      this.uploaded.emit({ file, result });
    } catch (error) {
      if (this.uploading !== file) return;
      this.status.set('error');
      this.uploadError.emit({ file, error });
    }
  }

  private setValue(value: HuFileInputValue): void {
    this.resetStatus();
    if (!Object.is(this.value(), value)) this.valueChange.emit(value);
    this.value.set(value);
    this.onChange(value);
  }

  private resetStatus(): void {
    this.uploading = null;
    this.status.set('idle');
    this.progress.set(0);
  }

  private resolveControl(): NgControl | null {
    if (this.ngControl === undefined) {
      this.ngControl = this.injector.get(NgControl, null, { self: true, optional: true });
    }
    return this.ngControl;
  }
}

function isFileValue(value: unknown): value is File | HuStoredFile {
  return value instanceof File || (!!value && typeof value === 'object' && typeof (value as HuStoredFile).name === 'string');
}
