import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HU_FORM_FIELD_IMPORTS, HuBadge, HuIcon } from '@ucme-ui/angular';
import { DOCS, DOC_CATEGORIES } from './doc-registry';

/** /componentler: tüm component'ler kategorilere göre. */
@Component({
  selector: 'app-docs-overview',
  imports: [RouterLink, HU_FORM_FIELD_IMPORTS, HuBadge, HuIcon],
  template: `
    <header class="page-header">
      <div>
        <h1>Componentler</h1>
        <p>{{ total }} component · <code>npm install &#64;ucme-ui/angular</code></p>
      </div>
      <hu-form-field class="search">
        <hu-icon huPrefix name="search" [size]="16" />
        <input huInput type="search" placeholder="Component ara…" aria-label="Component ara" [value]="query()" (input)="onSearch($event)" />
      </hu-form-field>
    </header>

    @for (group of groups(); track group.category) {
      <section class="category">
        <h2>{{ group.category }}</h2>
        <div class="cards">
          @for (doc of group.docs; track doc.slug) {
            <a class="doc-card" [routerLink]="['/componentler', doc.slug]">
              <span class="doc-card__icon"><hu-icon [name]="doc.icon" [size]="18" /></span>
              <span class="doc-card__body">
                <span class="doc-card__name">
                  {{ doc.name }}
                  @if (doc.isNew) {
                    <hu-badge variant="info">Yeni</hu-badge>
                  }
                </span>
                <span class="doc-card__desc">{{ doc.description }}</span>
              </span>
            </a>
          }
        </div>
      </section>
    } @empty {
      <p class="hu-text-muted">"{{ query() }}" için sonuç yok.</p>
    }
  `,
  styles: `
    .search { width: min(20rem, 100%); }
    .page-header code { font-family: var(--hu-font-mono); font-size: var(--hu-text-xs); }
    .category { margin-bottom: var(--hu-space-8); }
    .category h2 {
      margin-bottom: var(--hu-space-3);
      font-size: var(--hu-text-xs);
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--hu-text-muted);
    }
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 17rem), 1fr));
      gap: var(--hu-space-3);
    }
    .doc-card {
      display: flex;
      gap: var(--hu-space-3);
      padding: var(--hu-space-4);
      color: inherit;
      text-decoration: none;
      background: var(--hu-surface);
      border: 1px solid var(--hu-border);
      border-radius: var(--hu-radius-lg);
      transition: border-color var(--hu-transition), box-shadow var(--hu-transition);
    }
    .doc-card:hover { border-color: var(--hu-primary); box-shadow: var(--hu-shadow-md); }
    .doc-card:focus-visible { outline: none; box-shadow: var(--hu-ring); }
    .doc-card__icon {
      display: inline-flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: 2.25rem;
      height: 2.25rem;
      color: var(--hu-primary);
      background: var(--hu-primary-soft);
      border-radius: var(--hu-radius-md);
    }
    .doc-card__body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .doc-card__name { display: flex; align-items: center; gap: var(--hu-space-2); font-weight: 600; }
    .doc-card__desc {
      display: -webkit-box;
      overflow: hidden;
      font-size: var(--hu-text-xs);
      color: var(--hu-text-muted);
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocsOverview {
  protected readonly total = DOCS.length;
  protected readonly query = signal('');

  protected readonly groups = computed(() => {
    const q = this.query().trim().toLocaleLowerCase('tr-TR');
    return DOC_CATEGORIES.map((category) => ({
      category,
      docs: DOCS.filter(
        (d) =>
          d.category === category &&
          (!q || d.name.toLocaleLowerCase('tr-TR').includes(q) || d.description.toLocaleLowerCase('tr-TR').includes(q)),
      ),
    })).filter((g) => g.docs.length);
  });

  protected onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }
}
