import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Entorno } from '../Entornos/Entorno';
import { LoginPortada } from '../Modelos/LoginPortada';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoginPortadaServicio {
  private Url = `${Entorno.ApiUrl}loginportada`;

  constructor(private http: HttpClient) { }

  Listado(): Observable<{ data: LoginPortada[] }> {
    return this.http.get<{ data: LoginPortada[] }>(`${this.Url}/listado`);
  }


  Crear(Datos: LoginPortada): Observable<any> {
    return this.http.post(`${this.Url}/crear`, Datos);
  }

  ObtenerPorCodigo(Codigo: number): Observable<LoginPortada> {
    return this.http.get<LoginPortada>(`${this.Url}/${Codigo}`);
  }

  Editar(Datos: LoginPortada): Observable<any> {
    return this.http.put(`${this.Url}/editar/${Datos.CodigoLoginPortada}`, Datos);
  }

  Eliminar(Codigo: number): Observable<any> {
    return this.http.delete(`${this.Url}/eliminar/${Codigo}`);
  }

  SubirImagen(formData: FormData): Observable<any> {
    return this.http.post(`${this.Url}/subir-imagen`, formData);
  }
}
