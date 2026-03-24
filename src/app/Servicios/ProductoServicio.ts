import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Entorno } from '../Entornos/Entorno';
import { Producto } from '../Modelos/Producto';

@Injectable({
  providedIn: 'root'
})
export class ProductoServicio {
  private Url = `${Entorno.ApiUrl}producto`;

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

  ListadoProductos(Codigo: number): Observable<any> {
    return this.http.get(`${this.Url}/listado/${Codigo}`, { headers: this.obtenerHeaders() });
  }

  Crear(Datos: Producto): Observable<any> {
    return this.http.post(`${this.Url}/crear`, Datos, { headers: this.obtenerHeaders() });
  }

  ObtenerPorCodigo(Codigo: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.Url}/${Codigo}`, { headers: this.obtenerHeaders() });
  }

  Editar(Datos: Producto): Observable<any> {
    return this.http.put(`${this.Url}/editar/${Datos.CodigoProducto}`, Datos, { headers: this.obtenerHeaders() });
  }

  Eliminar(Codigo: number): Observable<any> {
    return this.http.delete(`${this.Url}/eliminar/${Codigo}`, { headers: this.obtenerHeaders() });
  }

  CrearEditar(Datos: Producto): Observable<any> {
    return this.http.post(`${this.Url}/creareditar`, Datos, { headers: this.obtenerHeaders() });
  }

  // Nuevo método para buscar productos
  BuscarProductos(tipoBusqueda: number, valorBusqueda: string): Observable<any> {
    return this.http.get(`${this.Url}/buscar/${tipoBusqueda}/${valorBusqueda}`, { headers: this.obtenerHeaders() });
  }
  SubirImagen(formData: FormData): Observable<any> {
    return this.http.post(`${this.Url}/subir-imagen`, formData);
  }
}
