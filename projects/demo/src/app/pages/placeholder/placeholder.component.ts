import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HuCard, HuIcon } from '@kadirucme/hu-ui';

/** Henüz geliştirilmemiş sayfalar için yer tutucu. */
@Component({
  selector: 'app-placeholder',
  imports: [HuCard, HuIcon],
  template: `
    <header class="page-header">
      <div>
        <h1>{{ title }}</h1>
        <p>Bu sayfa layout ve navigasyonu göstermek için eklendi.</p>
      </div>
    </header>
    <hu-card>
      <div class="placeholder">
        <hu-icon name="layers" [size]="28" />
        <p><strong>Yapım aşamasında</strong></p>
        <p class="hu-text-muted">Sayfa içeriğini HU UI componentleriyle oluşturabilirsiniz.</p>
      </div>
    </hu-card>
  `,
  styles: `
    .placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--hu-space-1);
      padding: var(--hu-space-10) 0;
      text-align: center;
    }
    hu-icon { margin-bottom: var(--hu-space-2); color: var(--hu-text-subtle); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaceholderComponent {
  protected readonly title: string = inject(ActivatedRoute).snapshot.data['breadcrumb'] ?? '';
}
