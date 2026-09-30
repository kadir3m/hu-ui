import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';

export const routes: Routes = [
  {
    path: 'giris',
    title: 'Giriş · Yönetim Paneli',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        title: 'Genel Bakış · Yönetim Paneli',
        data: { breadcrumb: 'Genel Bakış' },
        loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'kullanicilar',
        title: 'Kullanıcılar · Yönetim Paneli',
        data: { breadcrumb: 'Kullanıcılar', section: 'Yönetim' },
        loadComponent: () => import('./pages/users/users.component').then((m) => m.UsersComponent),
      },
      {
        path: 'akademik/bolumler',
        title: 'Bölümler · Yönetim Paneli',
        data: { breadcrumb: 'Bölümler', section: 'Akademik' },
        loadComponent: () => import('./pages/placeholder/placeholder.component').then((m) => m.PlaceholderComponent),
      },
      {
        path: 'akademik/dersler',
        title: 'Dersler · Yönetim Paneli',
        data: { breadcrumb: 'Dersler', section: 'Akademik' },
        loadComponent: () => import('./pages/placeholder/placeholder.component').then((m) => m.PlaceholderComponent),
      },
      {
        path: 'akademik/takvim',
        title: 'Akademik Takvim · Yönetim Paneli',
        data: { breadcrumb: 'Akademik Takvim', section: 'Akademik' },
        loadComponent: () =>
          import('./pages/academic-calendar/academic-calendar.component').then((m) => m.AcademicCalendarComponent),
      },
      {
        path: 'raporlar',
        title: 'Raporlar · Yönetim Paneli',
        data: { breadcrumb: 'Raporlar' },
        loadComponent: () => import('./pages/placeholder/placeholder.component').then((m) => m.PlaceholderComponent),
      },
      {
        path: 'componentler',
        title: 'Componentler · Yönetim Paneli',
        data: { breadcrumb: 'Component Kataloğu', section: 'Geliştirici' },
        loadComponent: () => import('./pages/components/components.component').then((m) => m.ComponentsComponent),
      },
      {
        path: 'ayarlar',
        title: 'Ayarlar · Yönetim Paneli',
        data: { breadcrumb: 'Ayarlar' },
        loadComponent: () => import('./pages/settings/settings.component').then((m) => m.SettingsComponent),
      },
      {
        path: '**',
        title: 'Sayfa bulunamadı · Yönetim Paneli',
        data: { breadcrumb: 'Sayfa bulunamadı' },
        loadComponent: () => import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
      },
    ],
  },
];
