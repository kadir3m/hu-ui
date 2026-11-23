import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HuButton, HuContextMenu, HuContextMenuService, HuDropdownEntry, HuDropdownOption, HuIcon, HuToastService } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

interface Note {
  id: number;
  title: string;
  color: string;
  pinned: boolean;
}

@Component({
  selector: 'app-context-menu-doc',
  imports: [DocPage, DocExample, HuButton, HuContextMenu, HuIcon],
  template: `
    <app-doc-page slug="context-menu">
      <app-doc-example
        title="Temel"
        description="Alana sağ tıklayın. Klavyede: alanı Tab ile seçip menü tuşuna veya Shift+F10'a basın. Menüde ↑/↓, harfle atlama, Enter ve Esc çalışır."
        [code]="basicCode"
      >
        <div
          class="area"
          tabindex="0"
          [huContextMenu]="editActions"
          huContextMenuLabel="Düzenleme"
          (contextMenuSelect)="last.set($event.label)"
        >
          <hu-icon name="edit" [size]="20" />
          <span>Buraya sağ tıklayın</span>
          <span class="hu-text-muted">Son seçim: {{ last() }}</span>
        </div>
      </app-doc-example>

      <app-doc-example
        title="Öğe başına menü"
        description="Menü içeriği öğeye göre değişebilir (sabitle / sabitlemeyi kaldır). Her kart kendi menüsünü açar."
        [code]="itemsCode"
      >
        <div class="notes">
          @for (n of notes(); track n.id) {
            <article
              class="note"
              tabindex="0"
              [style.--note]="n.color"
              [huContextMenu]="noteMenu(n)"
              [huContextMenuLabel]="n.title + ' işlemleri'"
              (contextMenuSelect)="onNote($event, n)"
            >
              @if (n.pinned) {
                <span class="note__pin" aria-label="Sabitlendi">📌</span>
              }
              <h4>{{ n.title }}</h4>
              <p class="hu-text-muted">Sağ tıklayın</p>
            </article>
          }
        </div>
      </app-doc-example>

      <app-doc-example
        title="Servis ile"
        description="HuContextMenuService.open() menüyü istediğiniz konumda açar ve seçilen öğeyi döndürür. Örneğin bir butonun altında ya da kendi çizdiğiniz bir alanda."
        [code]="serviceCode"
      >
        <div class="row">
          <button hu-button variant="outline" (click)="openBelow($event)">
            <hu-icon name="more-vertical" [size]="16" /> Butonun altında aç
          </button>
          <span class="hu-text-muted">Seçilen: {{ serviceLast() }}</span>
        </div>
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `
    .area {
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--hu-space-2);
      min-height: 10rem; color: var(--hu-text-muted);
      border: 2px dashed var(--hu-border-strong); border-radius: var(--hu-radius-lg);
      user-select: none;
    }
    .area:focus-visible { outline: none; border-color: var(--hu-primary); box-shadow: var(--hu-ring); }
    .notes { display: grid; grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr)); gap: var(--hu-space-3); }
    .note {
      position: relative; padding: var(--hu-space-4); min-height: 6.5rem;
      background: color-mix(in srgb, var(--note) 18%, var(--hu-surface));
      border: 1px solid color-mix(in srgb, var(--note) 45%, var(--hu-border)); border-radius: var(--hu-radius-md);
      cursor: context-menu; user-select: none;
    }
    .note:focus-visible { outline: none; box-shadow: var(--hu-ring); }
    .note h4 { margin: 0 0 var(--hu-space-1); font-size: var(--hu-text-sm); }
    .note p { margin: 0; font-size: var(--hu-text-xs); }
    .note__pin { position: absolute; top: var(--hu-space-2); right: var(--hu-space-2); font-size: var(--hu-text-sm); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContextMenuDoc {
  private readonly toast = inject(HuToastService);
  private readonly menu = inject(HuContextMenuService);

  protected readonly last = signal('—');
  protected readonly editActions: HuDropdownEntry[] = [
    { label: 'Kes', value: 'cut', icon: 'minus', shortcut: 'Ctrl+X' },
    { label: 'Kopyala', value: 'copy', icon: 'copy', shortcut: 'Ctrl+C' },
    { label: 'Yapıştır', value: 'paste', icon: 'file-text', shortcut: 'Ctrl+V', disabled: true },
    { divider: true },
    { header: 'Biçim' },
    { label: 'Kalın', value: 'bold', icon: 'bold', shortcut: 'Ctrl+B' },
    { label: 'İtalik', value: 'italic', icon: 'italic', shortcut: 'Ctrl+I' },
    { divider: true },
    { label: 'Sil', value: 'delete', icon: 'trash', danger: true, shortcut: 'Del' },
  ];

  protected readonly notes = signal<Note[]>([
    { id: 1, title: 'Sınav takvimi', color: '#3b82f6', pinned: true },
    { id: 2, title: 'Toplantı notları', color: '#22c55e', pinned: false },
    { id: 3, title: 'Bütçe taslağı', color: '#f59e0b', pinned: false },
    { id: 4, title: 'Duyuru metni', color: '#ec4899', pinned: false },
  ]);

  protected noteMenu(note: Note): HuDropdownEntry[] {
    return [
      { label: note.pinned ? 'Sabitlemeyi kaldır' : 'Sabitle', value: 'pin', icon: 'check-circle' },
      { label: 'Kopyasını oluştur', value: 'duplicate', icon: 'copy' },
      { divider: true },
      { label: 'Sil', value: 'delete', icon: 'trash', danger: true },
    ];
  }

  protected onNote(option: HuDropdownOption, note: Note): void {
    if (option.value === 'pin') {
      this.notes.update((list) => list.map((n) => (n.id === note.id ? { ...n, pinned: !n.pinned } : n)));
    } else if (option.value === 'duplicate') {
      this.notes.update((list) => [...list, { ...note, id: Date.now(), title: `${note.title} (kopya)`, pinned: false }]);
    } else if (option.value === 'delete') {
      this.notes.update((list) => list.filter((n) => n.id !== note.id));
      this.toast.success(`${note.title} silindi.`);
    }
  }

  protected readonly serviceLast = signal('—');

  protected async openBelow(event: MouseEvent): Promise<void> {
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const option = await this.menu.open({
      entries: [
        { label: 'Yeni klasör', value: 'folder', icon: 'folder' },
        { label: 'Dosya yükle', value: 'upload', icon: 'upload' },
        { divider: true },
        { label: 'Ayarlar', value: 'settings', icon: 'settings' },
      ],
      x: rect.left,
      y: rect.bottom + 4,
      returnFocus: button,
    });
    this.serviceLast.set(option?.label ?? 'vazgeçildi');
  }

  protected readonly basicCode = `
import { HuContextMenu, HuDropdownEntry } from '@ucme-ui/angular';

actions: HuDropdownEntry[] = [
  { label: 'Kopyala', value: 'copy', icon: 'copy', shortcut: 'Ctrl+C' },
  { label: 'Yapıştır', value: 'paste', disabled: true },
  { divider: true },
  { header: 'Biçim' },
  { label: 'Kalın', value: 'bold', icon: 'bold' },
  { divider: true },
  { label: 'Sil', value: 'delete', icon: 'trash', danger: true },
];

<div tabindex="0" [huContextMenu]="actions" (contextMenuSelect)="run($event.value)">
  Buraya sağ tıklayın
</div>`;

  protected readonly itemsCode = `
notes = signal([
  { id: 1, title: 'Sınav takvimi', pinned: true },
  { id: 2, title: 'Toplantı notları', pinned: false },
]);

noteMenu(note: Note): HuDropdownEntry[] {
  return [
    { label: note.pinned ? 'Sabitlemeyi kaldır' : 'Sabitle', value: 'pin' },
    { label: 'Sil', value: 'delete', danger: true },
  ];
}

@for (n of notes(); track n.id) {
  <article tabindex="0" [huContextMenu]="noteMenu(n)" (contextMenuSelect)="onNote($event, n)">
    {{ n.title }}
  </article>
}

<!-- Koşula göre kapatmak için: [huContextMenuDisabled]="readonly" -->`;

  protected readonly serviceCode = `
private readonly menu = inject(HuContextMenuService);

async openBelow(event: MouseEvent) {
  const button = event.currentTarget as HTMLElement;
  const rect = button.getBoundingClientRect();
  const option = await this.menu.open({
    entries: [{ label: 'Yeni klasör', value: 'folder' }, { label: 'Dosya yükle', value: 'upload' }],
    x: rect.left,
    y: rect.bottom + 4,
    returnFocus: button,
  });
  if (option) this.run(option.value);
}

<button hu-button (click)="openBelow($event)">Menü</button>`;
}
