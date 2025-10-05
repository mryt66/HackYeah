import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const FAQ_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./faq-list.component').then(m => m.FaqListComponent)
  }
];
