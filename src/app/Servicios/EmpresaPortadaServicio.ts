import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Entorno } from '../Entornos/Entorno';

@Injectable({
  providedIn: 'root'
})
export class EmpresaPortadaServicio {
  private Url = `${Entorno.ApiUrl}empresaportada`;

  constructor(private http: HttpClient) { }

  Listado(): Observable<any> {
    return this.http.get(`${this.Url}/listado`);
  }

  Crear(Datos: any): Observable<any> {
    return this.http.post(`${this.Url}/crear`, Datos);
  }

  ObtenerPorCodigo(Codigo: number): Observable<any> {
    return this.http.get(`${this.Url}/${Codigo}`);
  }

  Buscar(TipoBusqueda: string, ValorBusqueda: string): Observable<any> {
    return this.http.get(`${this.Url}/buscar/${TipoBusqueda}/${ValorBusqueda}`);
  }

  Editar(Datos: any): Observable<any> {
    return this.http.put(`${this.Url}/editar/${Datos.CodigoEmpresaPortada}`, Datos);
  }

  Eliminar(Codigo: number): Observable<any> {
    return this.http.delete(`${this.Url}/eliminar/${Codigo}`);
  }

  SubirImagen(formData: FormData): Observable<any> {
    return this.http.post(`${this.Url}/subir-imagen`, formData);
  }
}
