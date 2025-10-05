import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const CASES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./cases-list.component').then(m => m.CasesListComponent)
  },
  {
    path: 'new',
    canActivate: [authGuard],
    loadComponent: () => import('./case-form.component').then(m => m.CaseFormComponent)
  },
  {
    path: ':id',
    canActivate: [authGuard],
    loadComponent: () => import('./case-detail.component').then(m => m.CaseDetailComponent)
  },
  {
    path: ':id/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./case-form.component').then(m => m.CaseFormComponent)
  }
];
