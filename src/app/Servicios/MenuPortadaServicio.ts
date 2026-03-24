import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Entorno } from '../Entornos/Entorno';
import { MenuPortada } from '../Modelos/MenuPortada';

@Injectable({
  providedIn: 'root'
})
export class MenuPortadaServicio {
  private Url = `${Entorno.ApiUrl}menuportada`;

  constructor(private http: HttpClient) { }

  private obtenerHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  Listado(): Observable<any> {
    return this.http.get(`${this.Url}/listado`, { headers: this.obtenerHeaders() });
  }

  Crear(Datos: MenuPortada): Observable<any> {
    return this.http.post(`${this.Url}/crear`, Datos, { headers: this.obtenerHeaders() });
  }

  ObtenerPorCodigo(Codigo: number): Observable<MenuPortada> {
    return this.http.get<MenuPortada>(`${this.Url}/${Codigo}`, { headers: this.obtenerHeaders() });
  }

  Editar(Datos: MenuPortada): Observable<any> {
    return this.http.put(`${this.Url}/editar/${Datos.CodigoMenuPortada}`, Datos, { headers: this.obtenerHeaders() });
  }

  Eliminar(Codigo: number): Observable<any> {
    return this.http.delete(`${this.Url}/eliminar/${Codigo}`, { headers: this.obtenerHeaders() });
  }

  CrearEditar(Datos: MenuPortada): Observable<any> {
    return this.http.post(`${this.Url}/creareditar`, Datos, { headers: this.obtenerHeaders() });
  }
  
  SubirImagen(formData: FormData): Observable<any> {
    return this.http.post(`${this.Url}/subir-imagen`, formData);
  }
}
