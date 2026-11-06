import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'gallery',
    loadComponent: () =>
      import('./features/gallery/gallery.page').then((m) => m.GalleryPage),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/admin.page').then((m) => m.AdminPage),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
