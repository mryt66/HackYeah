import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { MockAuthService } from '../services/mock-auth.service';

/**
 * Guard sprawdzający czy użytkownik jest zalogowany
 * Używany do ochrony prywatnych tras
 * Używa MockAuthService (bez backendu)
 */
export const authGuard: CanActivateFn = (route, state) => {
  const mockAuthService = inject(MockAuthService);
  const router = inject(Router);

  if (mockAuthService.isAuthenticated()) {
    return true;
  }

  // Przekieruj do strony logowania z parametrem returnUrl
  router.navigate(['/login'], { 
    queryParams: { returnUrl: state.url } 
  });
  return false;
};
