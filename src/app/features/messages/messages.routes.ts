import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const MESSAGES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./messages-list.component').then(m => m.MessagesListComponent)
  },
  {
    path: 'new',
    canActivate: [authGuard],
    loadComponent: () => import('./new-message.component').then(m => m.NewMessageComponent)
  },
  {
    path: 'bulk',
    canActivate: [authGuard],
    loadComponent: () => import('./bulk-message.component').then(m => m.BulkMessageComponent)
  },
  {
    path: 'sent',
    canActivate: [authGuard],
    loadComponent: () => import('./messages-list.component').then(m => m.MessagesListComponent)
  },
  {
    path: ':id',
    canActivate: [authGuard],
    loadComponent: () => import('./messages-detail.component').then(m => m.MessagesDetailComponent)
  }
];
