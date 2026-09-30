import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HuButton, HuIcon } from '@ucme-ui/angular';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, HuButton, HuIcon],
  template: `
    <div class="not-found">
      <p class="not-found__code">404</p>
      <h1>Sayfa bulunamadı</h1>
      <p class="hu-text-muted">Aradığınız sayfa taşınmış veya kaldırılmış olabilir.</p>
      <a hu-button routerLink="/"><hu-icon name="home" [size]="16" /> Ana sayfaya dön</a>
    </div>
  `,
  styles: `
    .not-found {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--hu-space-3);
      padding: 6rem 0;
      text-align: center;
    }
    .not-found__code {
      font-size: 4rem;
      font-weight: 800;
      line-height: 1;
      color: var(--hu-primary);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {}
