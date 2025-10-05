import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

/**
 * Interceptor zarządzający stanem ładowania (spinner)
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Rozpocznij ładowanie
  loadingService.show();

  return next(req).pipe(
    finalize(() => {
      // Zakończ ładowanie po otrzymaniu odpowiedzi lub błędu
      loadingService.hide();
    })
  );
};
