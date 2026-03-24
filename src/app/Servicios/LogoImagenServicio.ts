import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Entorno } from '../Entornos/Entorno';

@Injectable({
  providedIn: 'root'
})
export class LogoImagenServicio {
  private Url = `${Entorno.ApiUrl}logoimagen`; 

  constructor(private http: HttpClient) {}

  Listado(): Observable<any> {
    return this.http.get(`${this.Url}/listado`);
  }
  
  Crear(Datos: any): Observable<any> {
    return this.http.post(`${this.Url}/crear`, Datos);
  }

  ObtenerPorCodigo(Codigo: string): Observable<any> {
    return this.http.get(`${this.Url}/${Codigo}`);
  }

  Editar(Datos: any): Observable<any> {
    return this.http.put(`${this.Url}/editar/${Datos.CodigoNavbar}`, Datos);
  }

  Eliminar(Codigo: number): Observable<any> {
    return this.http.delete(`${this.Url}/eliminar/${Codigo}`);
  }
  CrearEditar(Datos: any): Observable<any> {
    return this.http.post(`${this.Url}/creareditar`, Datos);
  }
}
