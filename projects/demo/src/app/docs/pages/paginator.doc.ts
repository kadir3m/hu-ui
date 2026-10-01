import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HuPaginator } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

@Component({
  selector: 'app-paginator-doc',
  imports: [DocPage, DocExample, HuPaginator],
  template: `
    <app-doc-page slug="paginator">
      <app-doc-example title="Temel" description="pageIndex 0'dan başlar." [code]="basicCode">
        <div class="box"><hu-paginator [length]="248" [(pageIndex)]="page" [(pageSize)]="size" /></div>
        <p class="demo-label">pageIndex: {{ page() }} · pageSize: {{ size() }}</p>
      </app-doc-example>

      <app-doc-example title="Sabit sayfa boyutu" description="Tek seçenek verilirse 'Sayfa başına' seçicisi gizlenir." [code]="fixedCode">
        <div class="box"><hu-paginator [length]="57" [(pageIndex)]="page2" [pageSizeOptions]="[10]" /></div>
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `
    .box { border: 1px solid var(--hu-border); border-radius: var(--hu-radius-md); }
    .demo-label { margin-top: var(--hu-space-3); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorDoc {
  protected readonly page = signal(0);
  protected readonly size = signal(10);
  protected readonly page2 = signal(2);

  protected readonly basicCode = `
<hu-paginator [length]="total()" [(pageIndex)]="page" [(pageSize)]="size" />

// İstemci tarafı sayfalama:
pageRows = computed(() => rows().slice(page() * size(), (page() + 1) * size()));`;

  protected readonly fixedCode = `<hu-paginator [length]="57" [(pageIndex)]="page" [pageSizeOptions]="[10]" />`;
}
