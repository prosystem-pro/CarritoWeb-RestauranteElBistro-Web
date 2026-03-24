import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoginServicio } from './LoginServicio';
import { catchError } from 'rxjs';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';

export const AutorizacionInterceptor: HttpInterceptorFn = (Solicitud, Siguiente) => {
  const Servicio = inject(LoginServicio);
  const router = inject(Router);

  const Token = Servicio.ObtenerToken();

  if (Token) {

    Solicitud = Solicitud.clone({
      setHeaders: {
        Authorization: `Bearer ${Token}`
      }
    });
  }

  return Siguiente(Solicitud).pipe(
    catchError(Error => {
      if (Error.status === 401) {
        console.warn('Token expirado o no válido');
        Servicio.EliminarToken();
        router.navigate(['/login']);
      }
      return throwError(() => Error);
    })
  );
};
