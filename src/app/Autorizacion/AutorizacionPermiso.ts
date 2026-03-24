import { Injectable } from '@angular/core';
import { LoginServicio } from '../Servicios/LoginServicio';

@Injectable({
  providedIn: 'root',
})
export class PermisoServicio {
  constructor(private loginServicio: LoginServicio) { }

  TienePermiso(recurso?: string, permiso?: string): boolean {
    if (!this.loginServicio.ValidarToken()) {
      this.LimpiarDatos();
      return false;
    }

    const usuario = this.loginServicio.ObtenerUsuario();

    if (!usuario) {
      return false;
    }

    // Acceso libre si es SuperAdmin con acceso completo
    if (usuario.SuperAdmin === 1 && usuario.AccesoCompleto === true) {
      return true;
    }

    // Si no mandan recurso/permiso -> validar por rol
    const recursoVacio = !recurso || recurso.trim() === '';
    const permisoVacio = !permiso || permiso.trim() === '';

    if (recursoVacio && permisoVacio) {
      // Si tiene un rol asignado
      if (usuario.CodigoRol || usuario.NombreRol) {
        return true;
      }

      // Si no tiene rol pero es SuperAdmin
      if (usuario.SuperAdmin === 1) {
        return true;
      }

      return false;
    }

    // Validación normal por recurso/permiso
    const permisos: any[] = usuario.Permisos || [];
    const recursoEncontrado = permisos.find((r: any) => r.NombreRecurso === recurso);

    if (!recursoEncontrado) {
      return false;
    }

    const permisoEncontrado = recursoEncontrado.Permisos.find(
      (p: any) => p.NombrePermiso === permiso
    );

    return !!permisoEncontrado;
  }

  LimpiarDatos(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('colorClasificacion');
    localStorage.removeItem('colorClasificacionTexto');
  }
}
