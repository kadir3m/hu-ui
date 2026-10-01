import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HuSpinner } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

@Component({
  selector: 'app-spinner-doc',
  imports: [DocPage, DocExample, HuSpinner],
  template: `
    <app-doc-page slug="spinner">
      <app-doc-example title="Boyutlar" description="Rengini üst elementin color değerinden alır." [code]="code">
        <div class="row">
          <hu-spinner size="sm" />
          <hu-spinner />
          <hu-spinner size="lg" />
          <span class="muted"><hu-spinner label="Kaydediliyor" /></span>
        </div>
      </app-doc-example>
    </app-doc-page>
  `,
  styles: `.muted .hu-spinner { color: var(--hu-text-subtle); }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerDoc {
  protected readonly code = `
<hu-spinner size="sm" />
<hu-spinner />
<hu-spinner size="lg" label="Veriler yükleniyor" />`;
}
