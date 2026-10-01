import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HuAvatar } from '@ucme-ui/angular';
import { DocExample } from '../doc-example.component';
import { DocPage } from '../doc-page.component';

@Component({
  selector: 'app-avatar-doc',
  imports: [DocPage, DocExample, HuAvatar],
  template: `
    <app-doc-page slug="avatar">
      <app-doc-example title="Baş harfler ve boyutlar" description="Türkçe büyük harf kuralları: İrem Şahin → İŞ." [code]="basicCode">
        <div class="row">
          <hu-avatar name="Ayşe Yılmaz" size="sm" />
          <hu-avatar name="Mehmet Öztürk" />
          <hu-avatar name="İrem Şahin" size="lg" />
        </div>
      </app-doc-example>
      <app-doc-example title="Görsel yüklenemezse" description="src hatalıysa baş harflere düşer." [code]="fallbackCode">
        <hu-avatar name="Kırık Görsel" src="/olmayan-gorsel.png" size="lg" />
      </app-doc-example>
    </app-doc-page>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarDoc {
  protected readonly basicCode = `
<hu-avatar name="Ayşe Yılmaz" size="sm" />
<hu-avatar name="Mehmet Öztürk" />
<hu-avatar name="İrem Şahin" size="lg" />`;
  protected readonly fallbackCode = `<hu-avatar [name]="user.name" [src]="user.photoUrl" />`;
}
