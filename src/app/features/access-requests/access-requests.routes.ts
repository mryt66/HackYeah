import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const ACCESS_REQUESTS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./access-requests.component').then(m => m.AccessRequestsComponent)
  }
];
