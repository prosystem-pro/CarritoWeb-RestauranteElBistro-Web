import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Entorno } from '../Entornos/Entorno';
import { Carrusel } from '../Modelos/Carrusel';

@Injectable({
  providedIn: 'root'
})
export class CarruselServicio {
  private Url = `${Entorno.ApiUrl}carrusel`;

  constructor(private http: HttpClient) { }

  private obtenerHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  Listado(): Observable<any> {
    return this.http.get(`${this.Url}/listado`);
  }


  Crear(Datos: Carrusel): Observable<any> {
    return this.http.post(`${this.Url}/crear`, Datos, { headers: this.obtenerHeaders() });
  }

  // ObtenerPorCodigo(Codigo: number): Observable<Carrusel> {
  //   return this.http.get<Carrusel>(`${this.Url}/${Codigo}`, { headers: this.obtenerHeaders() });
  // }
  ObtenerPorCodigo(Codigo: number): Observable<any> {
    return this.http.get(`${this.Url}/${Codigo}`);
  }
  Editar(Datos: Carrusel): Observable<any> {
    return this.http.put(`${this.Url}/editar/${Datos.CodigoCarrusel}`, Datos, { headers: this.obtenerHeaders() });
  }

  Eliminar(Codigo: number): Observable<any> {
    return this.http.delete(`${this.Url}/eliminar/${Codigo}`, { headers: this.obtenerHeaders() });
  }

  CrearEditar(Datos: Carrusel): Observable<any> {
    return this.http.post(`${this.Url}/creareditar`, Datos, { headers: this.obtenerHeaders() });
  }
}