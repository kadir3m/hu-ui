import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DoCheck,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  model,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl, ValidationErrors } from '@angular/forms';
import { HuButton } from '../button/button.component';
import { HuIcon } from '../icon/icon.component';
import { HuSpinner } from '../spinner/spinner.component';
import { huUniqueId } from '../core/unique-id';
import { HU_FORM_FIELD, HuFormFieldControl } from '../form-field/form-field.tokens';
import {
  HU_EDITOR_BLOCKS,
  HU_EDITOR_BUTTONS,
  HU_EDITOR_DEFAULT_TOOLBAR,
  HU_EDITOR_HIGHLIGHT_COLORS,
  HU_EDITOR_TEXT_COLORS,
  HuEditorBlock,
  HuEditorButton,
  HuEditorColor,
  HuEditorImageUpload,
  HuEditorTool,
} from './editor.tools';
import { huIsSafeImageSrc, huIsSafeUrl, huSanitizeHtml } from './sanitize-html';

type ToggleTool = HuEditorButton['tool'];
type Panel = 'link' | 'image' | 'textColor' | 'highlight';

/**
 * Zengin metin editörü. Değer HTML metnidir; formlarla (`formControlName`) veya
 * `[(value)]` ile çalışır. Yapıştırılan ve dışarıdan verilen HTML izin listesiyle
 * temizlenir (script, stil, `javascript:` linkleri atılır).
 *
 * Bağımlılık yoktur: tarayıcının `contenteditable` alanı üzerine kuruludur.
 *
 * @example
 * <hu-form-field label="Açıklama" required>
 *   <hu-editor formControlName="description" placeholder="Duyuru metnini yazın…" />
 * </hu-form-field>
 *
 * <hu-editor [(value)]="html" [imageUpload]="uploadToServer" />
 */
@Component({
  selector: 'hu-editor',
  imports: [NgTemplateOutlet, HuButton, HuIcon, HuSpinner],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HuEditor), multi: true },
    { provide: HuFormFieldControl, useExisting: forwardRef(() => HuEditor) },
  ],
  host: {
    class: 'hu-editor',
    '[class.hu-editor--focused]': 'focused()',
    '[class.hu-editor--disabled]': 'isDisabled()',
    '[class.hu-editor--readonly]': 'readonly()',
    '[class.hu-editor--invalid]': 'isInvalid()',
    '(focusin)': 'focused.set(true)',
    '(focusout)': 'onFocusOut($event)',
    '(document:selectionchange)': 'onSelectionChange()',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuEditor implements ControlValueAccessor, HuFormFieldControl, DoCheck {
  private readonly doc = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly field = inject(HU_FORM_FIELD, { optional: true, host: true });

  /** HTML değer. Boş içerik `''` olarak döner (Validators.required ile uyumlu). */
  readonly value = model('');
  readonly placeholder = input('Yazmaya başlayın…');
  readonly toolbar = input<readonly HuEditorTool[]>(HU_EDITOR_DEFAULT_TOOLBAR);
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Altta kelime ve karakter sayısı. */
  readonly showCount = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string>();
  readonly id = input(huUniqueId('hu-editor'));
  /** Yazı rengi paleti. Yalnızca bu renkler kalıcıdır. */
  readonly textColors = input<readonly HuEditorColor[]>(HU_EDITOR_TEXT_COLORS);
  /** Vurgu (arka plan) paleti. */
  readonly highlightColors = input<readonly HuEditorColor[]>(HU_EDITOR_HIGHLIGHT_COLORS);
  /**
   * Görseli sunucuya yükleyip adresini döndüren fonksiyon. Verilmezse görsel
   * data URL olarak HTML'e gömülür (küçük görseller için uygundur).
   */
  readonly imageUpload = input<HuEditorImageUpload | null>(null);
  /** Kabul edilen en büyük görsel dosyası (bayt). Varsayılan 2 MB. */
  readonly maxImageSize = input(2 * 1024 * 1024);

  protected readonly buttons = HU_EDITOR_BUTTONS;
  protected readonly blocks = HU_EDITOR_BLOCKS;
  protected readonly focused = signal(false);
  protected readonly active = signal<ReadonlySet<ToggleTool>>(new Set());
  protected readonly block = signal<HuEditorBlock>('p');
  protected readonly isEmpty = signal(true);
  protected readonly counts = signal({ words: 0, chars: 0 });

  /** Araç çubuğunun altında açık olan panel (link, görsel, renk). */
  protected readonly panel = signal<Panel | null>(null);
  protected readonly linkUrl = signal('');
  protected readonly hasLink = signal(false);
  protected readonly imageUrl = signal('');
  protected readonly imageAlt = signal('');
  protected readonly uploading = signal(false);
  protected readonly panelError = signal('');
  /** Son kullanılan renkler: butonun altındaki renk şeridi. */
  protected readonly lastTextColor = signal<string | null>(null);
  protected readonly lastHighlight = signal<string | null>(null);

  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected readonly editable = computed(() => !this.isDisabled() && !this.readonly());

  private readonly content = viewChild.required<ElementRef<HTMLElement>>('content');
  private readonly panelInput = viewChild<ElementRef<HTMLInputElement>>('panelInput');
  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');
  private ready = false;
  /** Son yayınlanan değer: dışarıdan gelen yankıyı içeriğe tekrar yazmamak için. */
  private lastEmitted: string | null = null;
  private savedRange: Range | null = null;

  /** Palet renklerinin tarayıcının yazdığı biçimdeki (rgb/rgba) karşılıkları. */
  private readonly allowedText = computed(() => new Set(this.textColors().map((c) => this.normalizeColor(c.value))));
  private readonly allowedHighlight = computed(
    () => new Set(this.highlightColors().map((c) => this.normalizeColor(c.value))),
  );

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  // --- HuFormFieldControl ------------------------------------------------------------
  private ngControl: NgControl | null | undefined;
  get hasControl(): boolean {
    return !!this.resolveControl();
  }
  readonly controlErrorVisible = signal(false);
  readonly errors = signal<ValidationErrors | null>(null);
  protected readonly isInvalid = computed(() => this.controlErrorVisible() || (this.field?.showError() ?? false));

  constructor() {
    afterNextRender(() => {
      this.ready = true;
      // Satır sonu <p> üretsin, biçim <span style> yerine etiketle yazılsın
      this.command('defaultParagraphSeparator', 'p');
      this.command('styleWithCSS', 'false');
      this.applyExternal(this.value());
    });

    // Değer dışarıdan değişince içeriği güncelle (yazarken oluşan yankıyı atla).
    effect(() => {
      const value = this.value();
      untracked(() => {
        if (this.ready) this.applyExternal(value);
      });
    });
  }

  ngDoCheck(): void {
    const c = this.resolveControl();
    if (!c) return;
    this.controlErrorVisible.set(!!c.invalid && !!(c.touched || c.dirty));
    this.errors.set(c.errors);
  }

  // --- Araç çubuğu -------------------------------------------------------------------
  protected run(tool: ToggleTool): void {
    const active = this.active();
    switch (tool) {
      case 'bold':
        return this.exec('bold');
      case 'italic':
        return this.exec('italic');
      case 'underline':
        return this.exec('underline');
      case 'strike':
        return this.exec('strikeThrough');
      case 'bulletList':
        return this.exec('insertUnorderedList');
      case 'orderedList':
        return this.exec('insertOrderedList');
      case 'blockquote':
        return this.exec('formatBlock', active.has('blockquote') ? '<p>' : '<blockquote>');
      case 'codeBlock':
        return this.exec('formatBlock', active.has('codeBlock') ? '<p>' : '<pre>');
      case 'link':
        return this.openLink();
      case 'image':
      case 'textColor':
      case 'highlight':
        return this.togglePanel(tool);
      case 'clear':
        this.exec('removeFormat');
        this.exec('unlink');
        return this.exec('formatBlock', '<p>');
      case 'undo':
        return this.exec('undo');
      case 'redo':
        return this.exec('redo');
    }
  }

  protected setBlock(tag: string): void {
    this.exec('formatBlock', `<${tag}>`);
  }

  protected isToggle(tool: ToggleTool): boolean {
    return !['clear', 'undo', 'redo', 'link', 'image', 'textColor', 'highlight'].includes(tool);
  }

  /** Panel açan butonlar: panel açıkken basılı görünür. */
  protected isPanelTool(tool: ToggleTool): boolean {
    return tool === 'image' || tool === 'textColor' || tool === 'highlight' || tool === 'link';
  }

  private togglePanel(panel: Panel): void {
    if (!this.editable()) return;
    if (this.panel() === panel) return this.closePanel();
    this.captureSelection();
    this.panelError.set('');
    if (panel === 'image') {
      this.imageUrl.set('');
      this.imageAlt.set('');
    }
    this.panel.set(panel);
    if (panel === 'image') this.focusPanelInput();
  }

  protected closePanel(): void {
    this.panel.set(null);
    this.panelError.set('');
    this.restoreSelection();
  }

  private focusPanelInput(): void {
    afterNextRender(() => this.panelInput()?.nativeElement.focus(), { injector: this.injector });
  }

  // --- Renkler ---------------------------------------------------------------------
  /** Renk uygula; `null` rengi kaldırır. */
  protected applyColor(kind: 'textColor' | 'highlight', color: string | null): void {
    if (!this.editable()) return;
    this.restoreSelection();
    let value = color;
    if (!value) {
      // Palette olmayan bir değer yaz: temizlik adımı bunu silerek rengi kaldırır
      value = kind === 'textColor' ? 'rgb(1, 2, 3)' : 'transparent';
    }
    this.command('styleWithCSS', 'true');
    if (kind === 'textColor') {
      this.command('foreColor', value);
    } else if (!this.doc.execCommand('hiliteColor', false, value)) {
      this.command('backColor', value);
    }
    this.command('styleWithCSS', 'false');
    if (kind === 'textColor') this.lastTextColor.set(color);
    else this.lastHighlight.set(color);
    this.panel.set(null);
    this.emit();
  }

  // --- Link --------------------------------------------------------------------------
  protected openLink(): void {
    if (!this.editable()) return;
    if (this.panel() === 'link') return this.closePanel();
    this.captureSelection();
    const anchor = this.selectionAnchor();
    this.hasLink.set(!!anchor);
    this.linkUrl.set(anchor?.getAttribute('href') ?? '');
    this.panelError.set('');
    this.panel.set('link');
    this.focusPanelInput();
  }

  protected applyLink(): void {
    let url = this.linkUrl().trim();
    if (!url) return this.removeLink();
    // "ornek.com" → "https://ornek.com"
    if (!/^[a-z][a-z0-9+.-]*:/i.test(url) && !url.startsWith('/') && !url.startsWith('#')) url = `https://${url}`;
    if (!huIsSafeUrl(url)) {
      this.panelError.set('Geçersiz adres.');
      return;
    }
    this.restoreSelection();
    const selection = this.doc.getSelection();
    if (selection?.isCollapsed && !this.selectionAnchor()) {
      // Seçili metin yoksa adresin kendisini link olarak ekle
      this.command('insertHTML', `<a href="${escapeHtml(url)}">${escapeHtml(url)}</a>`);
    } else {
      this.command('createLink', url);
    }
    this.panel.set(null);
    this.emit();
  }

  protected removeLink(): void {
    this.restoreSelection();
    const anchor = this.selectionAnchor();
    if (anchor) {
      // İmleç linkin içindeyse linkin tamamını kaldır
      const range = this.doc.createRange();
      range.selectNodeContents(anchor);
      const selection = this.doc.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
    this.command('unlink');
    this.panel.set(null);
    this.emit();
  }

  // --- Görsel ----------------------------------------------------------------------
  protected insertImageFromUrl(): void {
    let url = this.imageUrl().trim();
    if (!url) return;
    if (!/^[a-z][a-z0-9+.-]*:/i.test(url) && !url.startsWith('/') && !url.startsWith('.')) url = `https://${url}`;
    if (!huIsSafeImageSrc(url)) {
      this.panelError.set('Geçersiz görsel adresi.');
      return;
    }
    this.insertImage(url, this.imageAlt().trim());
  }

  protected chooseFile(): void {
    this.fileInput()?.nativeElement.click();
  }

  protected async onFileChosen(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // aynı dosya tekrar seçilebilsin
    if (file) await this.uploadImage(file, this.imageAlt().trim());
  }

  private async uploadImage(file: File, alt = ''): Promise<void> {
    if (!/^image\/(png|jpe?g|gif|webp)$/i.test(file.type)) {
      this.showPanelError('Yalnızca PNG, JPEG, GIF veya WebP görseller eklenebilir.');
      return;
    }
    if (file.size > this.maxImageSize()) {
      const mb = (this.maxImageSize() / 1024 / 1024).toLocaleString('tr-TR', { maximumFractionDigits: 1 });
      this.showPanelError(`Görsel en fazla ${mb} MB olabilir.`);
      return;
    }
    this.captureSelection();
    this.uploading.set(true);
    this.panelError.set('');
    try {
      const upload = this.imageUpload();
      const src = upload ? await upload(file) : await readAsDataUrl(file);
      if (!huIsSafeImageSrc(src)) throw new Error('unsafe');
      this.insertImage(src, alt || file.name.replace(/\.[^.]+$/, ''));
    } catch {
      this.showPanelError('Görsel yüklenemedi.');
    } finally {
      this.uploading.set(false);
    }
  }

  private insertImage(src: string, alt: string): void {
    this.restoreSelection();
    this.command('insertHTML', `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}">`);
    this.panel.set(null);
    this.emit();
  }

  private showPanelError(message: string): void {
    if (this.panel() !== 'image') this.panel.set('image');
    this.panelError.set(message);
  }

  // --- İçerik olayları -----------------------------------------------------------------
  protected onInput(): void {
    this.emit();
  }

  protected onFocus(): void {
    // Boş alanda ilk satır da <p> olsun (aksi halde tarayıcı çıplak metin düğümü üretir)
    const el = this.content().nativeElement;
    if (this.editable() && !el.firstElementChild && !el.textContent) {
      el.innerHTML = '<p><br></p>';
      const range = this.doc.createRange();
      range.setStart(el.firstElementChild!, 0);
      range.collapse(true);
      const selection = this.doc.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.openLink();
    }
  }

  protected onContentClick(event: MouseEvent): void {
    // Görsele tıklayınca onu seç: Delete/Backspace ile silinebilsin
    const target = event.target as HTMLElement;
    if (target instanceof HTMLImageElement && this.editable()) {
      const range = this.doc.createRange();
      range.selectNode(target);
      const selection = this.doc.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }

  protected onPaste(event: ClipboardEvent): void {
    if (!event.clipboardData) return;
    event.preventDefault();
    this.insertTransfer(event.clipboardData);
  }

  protected onDrop(event: DragEvent): void {
    if (!event.dataTransfer) return;
    event.preventDefault();
    const range = (this.doc as Document & { caretRangeFromPoint?: (x: number, y: number) => Range | null }).caretRangeFromPoint?.(
      event.clientX,
      event.clientY,
    );
    if (range) {
      const selection = this.doc.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
    this.insertTransfer(event.dataTransfer);
  }

  protected onSelectionChange(): void {
    const selection = this.doc.getSelection();
    const el = this.ready ? this.content().nativeElement : null;
    if (!el || !selection?.rangeCount || !el.contains(selection.anchorNode)) return;
    this.savedRange = selection.getRangeAt(0).cloneRange();
    this.updateState();
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && this.host.nativeElement.contains(next)) return;
    this.focused.set(false);
    this.onTouched();
  }

  // --- ControlValueAccessor --------------------------------------------------------------
  writeValue(value: unknown): void {
    this.value.set(typeof value === 'string' ? value : '');
  }
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }

  // --- Yardımcılar ---------------------------------------------------------------------
  /** Seçimi geri yükle, komutu uygula, değeri yayınla. */
  private exec(command: string, arg?: string): void {
    if (!this.editable()) return;
    this.restoreSelection();
    this.command(command, arg);
    this.emit();
  }

  private command(command: string, arg?: string): void {
    // execCommand eski bir API'dir ama contenteditable için tarayıcıların sunduğu
    // tek yerleşik düzenleme yoludur ve tüm modern tarayıcılarda desteklenir.
    this.doc.execCommand(command, false, arg);
  }

  /**
   * Seçim hâlâ editörün içindeyse onu kaydet. `selectionchange` gecikmeli geldiği
   * için hızlı klavye kullanımında (Shift+ok, hemen Ctrl+K) kayıtlı seçim eski kalabilir.
   */
  private captureSelection(): void {
    const selection = this.doc.getSelection();
    const el = this.content().nativeElement;
    if (selection?.rangeCount && el.contains(selection.anchorNode)) {
      this.savedRange = selection.getRangeAt(0).cloneRange();
    }
  }

  private restoreSelection(): void {
    const el = this.content().nativeElement;
    // Canlı seçim editördeyse onu kullan; değilse (araç çubuğu, panel) kayıtlıyı geri yükle
    this.captureSelection();
    el.focus({ preventScroll: true });
    if (this.savedRange && el.contains(this.savedRange.commonAncestorContainer)) {
      const selection = this.doc.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(this.savedRange);
    }
  }

  /**
   * Tarayıcılar komutlarda (yapıştırma, satır birleştirme) çevredeki stili satır içi
   * `style` olarak ekler. Yalnızca paletteki renkleri koru, gerisini sil; böylece
   * örneğin tarayıcının eklediği koyu metin rengi koyu temada okunmaz hale gelmez.
   * Öznitelik değiştirmek düğümleri taşımadığı için imleç yerinde kalır.
   */
  private cleanInlineStyles(): void {
    const text = this.allowedText();
    const highlight = this.allowedHighlight();
    this.content()
      .nativeElement.querySelectorAll<HTMLElement>('[style]')
      .forEach((el) => {
        const keep: string[] = [];
        if (el.tagName === 'SPAN') {
          const color = el.style.color;
          const background = el.style.backgroundColor;
          if (color && text.has(this.normalizeColor(color))) keep.push(`color: ${color}`);
          if (background && highlight.has(this.normalizeColor(background))) keep.push(`background-color: ${background}`);
        }
        if (keep.length) el.setAttribute('style', keep.join('; '));
        else el.removeAttribute('style');
      });
  }

  /** Renk değerini tarayıcının kullandığı tek biçime çevirir (karşılaştırma için). */
  private normalizeColor(value: string): string {
    const probe = this.doc.createElement('span');
    probe.style.color = value;
    return probe.style.color.replace(/\s+/g, '');
  }

  private insertTransfer(data: DataTransfer): void {
    if (!this.editable()) return;
    const image = Array.from(data.files ?? []).find((f) => f.type.startsWith('image/'));
    if (image) {
      void this.uploadImage(image);
      return;
    }
    const html = data.getData('text/html');
    const clean = html ? huSanitizeHtml(html, this.doc) : textToHtml(data.getData('text/plain'));
    if (clean) this.command('insertHTML', clean);
    this.emit();
  }

  private emit(): void {
    this.cleanInlineStyles();
    const html = this.serialize();
    this.updateDerived();
    this.updateState();
    if (html === this.lastEmitted) return;
    this.lastEmitted = html;
    this.value.set(html);
    this.onChange(html);
  }

  private applyExternal(value: string): void {
    if (value === this.lastEmitted) return;
    const clean = huSanitizeHtml(value ?? '', this.doc);
    this.content().nativeElement.innerHTML = clean;
    this.cleanInlineStyles();
    this.lastEmitted = this.serialize();
    this.updateDerived();
  }

  /** İçeriği temiz HTML'e çevirir; görünür içerik yoksa `''`. */
  private serialize(): string {
    const el = this.content().nativeElement;
    const text = el.textContent?.trim() ?? '';
    if (!text && !el.querySelector('li, img')) return '';
    return huSanitizeHtml(el.innerHTML, this.doc);
  }

  private updateDerived(): void {
    const el = this.content().nativeElement;
    const text = el.textContent ?? '';
    this.isEmpty.set(!text.trim() && !el.querySelector('li, img'));
    this.counts.set({ chars: text.length, words: text.trim() ? text.trim().split(/\s+/).length : 0 });
  }

  private updateState(): void {
    const state = (cmd: string) => {
      try {
        return this.doc.queryCommandState(cmd);
      } catch {
        return false;
      }
    };
    const active = new Set<ToggleTool>();
    if (state('bold')) active.add('bold');
    if (state('italic')) active.add('italic');
    if (state('underline')) active.add('underline');
    if (state('strikeThrough')) active.add('strike');
    if (state('insertUnorderedList')) active.add('bulletList');
    if (state('insertOrderedList')) active.add('orderedList');

    let block: HuEditorBlock = 'p';
    let node: Node | null = this.doc.getSelection()?.anchorNode ?? null;
    const root = this.content().nativeElement;
    while (node && node !== root) {
      if (node instanceof HTMLElement) {
        const tag = node.tagName;
        if (tag === 'BLOCKQUOTE') active.add('blockquote');
        if (tag === 'PRE') active.add('codeBlock');
        if (tag === 'A') active.add('link');
        if ((tag === 'H1' || tag === 'H2' || tag === 'H3') && block === 'p') block = tag.toLowerCase() as HuEditorBlock;
      }
      node = node.parentNode;
    }
    this.active.set(active);
    this.block.set(block);
  }

  private selectionAnchor(): HTMLAnchorElement | null {
    let node: Node | null = this.savedRange?.commonAncestorContainer ?? null;
    const root = this.content().nativeElement;
    while (node && node !== root) {
      if (node instanceof HTMLAnchorElement) return node;
      node = node.parentNode;
    }
    return null;
  }

  private resolveControl(): NgControl | null {
    if (this.ngControl === undefined) {
      this.ngControl = this.injector.get(NgControl, null, { self: true, optional: true });
    }
    return this.ngControl;
  }
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Düz metni paragraflara çevirir: boş satır → yeni paragraf, tek satır sonu → <br>. */
function textToHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/\r\n?/g, '\n')
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
