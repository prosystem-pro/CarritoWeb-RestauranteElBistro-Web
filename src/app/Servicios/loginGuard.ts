import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const hasQueryParams = Object.keys(route.queryParams).length > 0;

    if (hasQueryParams) {
      this.router.navigate(['/login']); // limpia la URL
      return false; // cancela navegación actual
    }

    return true; // permite acceso normal si no hay parámetros
  }
}