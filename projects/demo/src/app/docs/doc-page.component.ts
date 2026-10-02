import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { HuBadge, HuIcon } from '@ucme-ui/angular';
import { ApiRow, findDoc } from './doc-registry';
import { DocCode } from './doc-code.component';

/**
 * Bir component dokümantasyon sayfasının iskeleti: başlık, import satırı,
 * örnekler (içerik olarak) ve kayıttaki API tabloları.
 *
 * @example <app-doc-page slug="button"> <app-doc-example …>…</app-doc-example> </app-doc-page>
 */
@Component({
  selector: 'app-doc-page',
  imports: [HuBadge, HuIcon, DocCode],
  template: `
    @if (doc(); as d) {
      <header class="doc-header">
        <p class="doc-header__category">{{ d.category }}</p>
        <h1>
          {{ d.name }}
          @if (d.isNew) {
            <hu-badge variant="info">Yeni</hu-badge>
          }
        </h1>
        <p class="doc-header__desc">{{ d.description }}</p>
        <p class="doc-header__selector"><hu-icon name="layers" [size]="14" /> <code>{{ d.selector }}</code></p>
      </header>

      <section class="doc-section">
        <h2>Import</h2>
        <app-doc-code [code]="importLine()" />
      </section>

      <section class="doc-section">
        <h2>Örnekler</h2>
        <div class="doc-examples"><ng-content /></div>
      </section>

      <section class="doc-section">
        <h2>API</h2>
        @for (t of tables(); track t.title) {
          <h3>{{ t.title }}</h3>
          <div class="api-table">
            <table>
              <thead>
                <tr>
                  @for (h of t.headers; track h) {
                    <th scope="col">{{ h }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (row of t.rows; track row[0]) {
                  <tr>
                    <td><code class="api-name">{{ row[0] }}</code></td>
                    @if (t.headers.length > 2) {
                      <td><code class="api-type">{{ row[1] }}</code></td>
                    }
                    @if (t.headers.length > 3) {
                      <td><code>{{ row[2] }}</code></td>
                    }
                    <td>{{ row[3] }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
        <p class="hu-text-muted doc-more">
          Ayrıntılı referans:
          <a href="https://github.com/kadir3m/hu-ui/blob/main/projects/hu-ui/API.md" target="_blank" rel="noopener">API.md</a>
        </p>
      </section>
    }
  `,
  styleUrl: './doc-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocPage {
  readonly slug = input.required<string>();

  protected readonly doc = computed(() => findDoc(this.slug()));

  protected readonly importLine = computed(() =>
    this.doc()?.imports
      ? `import { ${this.doc()?.imports} } from '@ucme-ui/angular';`
      : `// TypeScript import'u gerekmez: sınıflar global stillerle gelir.\n// src/styles.scss\n@use '@ucme-ui/angular/styles';`,
  );

  protected readonly tables = computed(() => {
    const api = this.doc()?.api ?? {};
    const tables: { title: string; headers: string[]; rows: readonly ApiRow[] }[] = [];
    if (api.inputs?.length) tables.push({ title: 'Input', headers: ['Ad', 'Tip', 'Varsayılan', 'Açıklama'], rows: api.inputs });
    if (api.models?.length)
      tables.push({ title: 'Model (iki yönlü: [(ad)])', headers: ['Ad', 'Tip', 'Varsayılan', 'Açıklama'], rows: api.models });
    if (api.outputs?.length) tables.push({ title: 'Output', headers: ['Ad', 'Değer', 'Ne zaman'], rows: api.outputs });
    if (api.methods?.length) tables.push({ title: 'Servis', headers: ['Üye', 'Tip', 'Varsayılan', 'Açıklama'], rows: api.methods });
    if (api.slots?.length) tables.push({ title: 'Slot', headers: ['Öznitelik', 'Nereye yerleşir'], rows: api.slots });
    if (api.classes?.length) tables.push({ title: 'CSS sınıfları', headers: ['Sınıf', 'Açıklama'], rows: api.classes });
    if (api.cssVars?.length)
      tables.push({ title: 'CSS değişkenleri', headers: ['Değişken', 'Varsayılan', 'Açıklama'], rows: api.cssVars });
    return tables;
  });
}
