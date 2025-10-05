import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout.component';
import { LoginComponent } from './features/auth/components/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from './core/models/user.model';

export const routes: Routes = [
  // Redirect root to dashboard
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },

  // Auth routes (public)
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent,
        title: 'Logowanie - UKNF Komunikacja'
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/components/register.component').then(m => m.RegisterComponent),
        title: 'Rejestracja - UKNF Komunikacja'
      },
      {
        path: 'activate',
        loadComponent: () => import('./features/auth/components/activate.component').then(m => m.ActivateComponent),
        title: 'Aktywacja konta - UKNF Komunikacja'
      }
    ]
  },

  // Main app routes (protected)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        title: 'Pulpit - UKNF Komunikacja'
      },
      {
        path: 'reports',
        loadChildren: () => import('./features/reports/reports.routes').then(m => m.REPORTS_ROUTES),
        title: 'Sprawozdania - UKNF Komunikacja'
      },
      {
        path: 'messages',
        loadChildren: () => import('./features/messages/messages.routes').then(m => m.MESSAGES_ROUTES),
        title: 'Wiadomości - UKNF Komunikacja'
      },
      {
        path: 'subjects',
        loadChildren: () => import('./features/subjects/subjects.routes').then(m => m.SUBJECTS_ROUTES),
        title: 'Podmioty - UKNF Komunikacja'
      },
      {
        path: 'cases',
        loadChildren: () => import('./features/cases/cases.routes').then(m => m.CASES_ROUTES),
        title: 'Sprawy - UKNF Komunikacja'
      },
      {
        path: 'access-requests',
        loadChildren: () => import('./features/access-requests/access-requests.routes').then(m => m.ACCESS_REQUESTS_ROUTES),
        title: 'Wnioski o dostęp - UKNF Komunikacja'
      },
      // Temporarily disabled to find problematic component
      // {
      //   path: 'library',
      //   loadChildren: () => import('./features/library/library.routes').then(m => m.LIBRARY_ROUTES),
      //   title: 'Biblioteka - UKNF Komunikacja'
      // },
      // {
      //   path: 'announcements',
      //   loadChildren: () => import('./features/announcements/announcements.routes').then(m => m.ANNOUNCEMENTS_ROUTES),
      //   title: 'Komunikaty - UKNF Komunikacja'
      // },
      // {
      //   path: 'faq',
      //   loadChildren: () => import('./features/faq/faq.routes').then(m => m.FAQ_ROUTES),
      //   title: 'FAQ - UKNF Komunikacja'
      // },
      // {
      //   path: 'admin',
      //   loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
      //   canActivate: [roleGuard],
      //   data: { roles: [UserRole.ADMIN] },
      //   title: 'Administracja - UKNF Komunikacja'
      // }
    ]
  },

  // 404 page
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
