import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HuThemeService, HuToaster } from '@kadirucme/hu-ui';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HuToaster],
  template: `
    <router-outlet />
    <hu-toaster />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  // Tema servisini uygulama açılışında başlat.
  private readonly theme = inject(HuThemeService);
}
