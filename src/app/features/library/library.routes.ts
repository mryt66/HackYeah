import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const LIBRARY_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./library-list.component').then(m => m.LibraryListComponent)
  },
  {
    path: 'add',
    canActivate: [authGuard],
    loadComponent: () => import('./library-add.component').then(m => m.LibraryAddComponent)
  },
  {
    path: ':id',
    canActivate: [authGuard],
    loadComponent: () => import('./library-detail.component').then(m => m.LibraryDetailComponent)
  },
  {
    path: ':id/history',
    canActivate: [authGuard],
    loadComponent: () => import('./library-history.component').then(m => m.LibraryHistoryComponent)
  }
];
