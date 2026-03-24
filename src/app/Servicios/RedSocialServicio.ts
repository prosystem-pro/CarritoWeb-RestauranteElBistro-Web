import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Entorno } from '../Entornos/Entorno';

@Injectable({
  providedIn: 'root'
})
export class RedSocialServicio {
  private Url = `${Entorno.ApiUrl}redsocial`;

  constructor(private http: HttpClient) { }

  Listado(filtro: string = ''): Observable<any> {
    const url = filtro ? `${this.Url}/listado/${filtro}` : `${this.Url}/listado`;
    return this.http.get(url);
  }

  Crear(Datos: any): Observable<any> {
    return this.http.post(`${this.Url}/crear`, Datos);
  }

  ObtenerPorCodigo(Codigo: string): Observable<any> {
    return this.http.get(`${this.Url}/${Codigo}`);
  }

  Editar(Datos: any): Observable<any> {
    return this.http.put(`${this.Url}/editar/${Datos.CodigoRedSocial}`, Datos);
  }

  Eliminar(Codigo: number): Observable<any> {
    return this.http.delete(`${this.Url}/eliminar/${Codigo}`);
  }
}
