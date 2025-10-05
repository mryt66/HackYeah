import { Routes } from '@angular/router';
import { AdminUsersComponent } from './admin-users.component';
import { AdminUserFormComponent } from './admin-user-form.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full'
  },
  {
    path: 'users',
    component: AdminUsersComponent
  },
  {
    path: 'users/new',
    component: AdminUserFormComponent
  },
  {
    path: 'users/:id',
    component: AdminUserFormComponent
  },
  {
    path: 'users/:id/edit',
    component: AdminUserFormComponent
  }
];
