import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  HuAlert,
  HuAvatar,
  HuBadge,
  HuBadgeVariant,
  HuButton,
  HuCard,
  HuCardActions,
  HuCellDef,
  HuColumn,
  HuIcon,
  HuTable,
} from 'hu-ui';
import { STATUS_LABELS, User, UserStatus, createUsers } from '../../data/users';

interface Stat {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, RouterLink, HuAlert, HuAvatar, HuBadge, HuButton, HuCard, HuCardActions, HuCellDef, HuIcon, HuTable],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  protected readonly stats: Stat[] = [
    { label: 'Toplam öğrenci', value: '38.214', change: '%4,2', trend: 'up', icon: 'graduation-cap' },
    { label: 'Akademik personel', value: '3.912', change: '%1,1', trend: 'up', icon: 'book-open' },
    { label: 'Açık başvuru', value: '1.284', change: '%8,6', trend: 'down', icon: 'file-text' },
    { label: 'Aktif oturum', value: '642', change: '%12,4', trend: 'up', icon: 'users' },
  ];

  protected readonly recentUsers = createUsers(6);
  protected readonly columns: HuColumn<User>[] = [
    { key: 'name', header: 'Kullanıcı' },
    { key: 'department', header: 'Birim', hideOnMobile: true },
    { key: 'status', header: 'Durum' },
    { key: 'createdAt', header: 'Kayıt', align: 'end', hideOnMobile: true },
  ];
  protected readonly statusLabels = STATUS_LABELS;
  protected readonly statusVariants: Record<UserStatus, HuBadgeVariant> = {
    aktif: 'success',
    pasif: 'neutral',
    beklemede: 'warning',
  };

  protected readonly activities = [
    { icon: 'user', text: 'Elif Şahin, Hukuk Fakültesi\'ne akademisyen olarak eklendi.', time: '10 dk önce' },
    { icon: 'edit', text: 'BBM 101 dersinin kontenjanı 120 olarak güncellendi.', time: '42 dk önce' },
    { icon: 'calendar', text: 'Bahar dönemi akademik takvimi yayınlandı.', time: '2 saat önce' },
    { icon: 'lock', text: '3 hesap başarısız giriş denemesi nedeniyle kilitlendi.', time: 'Dün' },
  ];
}
