import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { MockAuthService } from '../services/mock-auth.service';
import { UserRole } from '../models/user.model';

/**
 * Guard sprawdzający czy użytkownik ma odpowiednią rolę
 * Używany do ochrony tras wymagających specyficznych uprawnień
 * Używa MockAuthService (bez backendu)
 * 
 * Użycie w routingu:
 * {
 *   path: 'admin',
 *   canActivate: [authGuard, roleGuard],
 *   data: { roles: [UserRole.ADMIN] }
 * }
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const mockAuthService = inject(MockAuthService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as UserRole[];

  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  if (mockAuthService.hasAnyRole(requiredRoles)) {
    return true;
  }

  // Brak uprawnień - przekieruj do dashboard lub 403
  console.warn('Access denied: insufficient permissions');
  router.navigate(['/dashboard']);
  return false;
};
