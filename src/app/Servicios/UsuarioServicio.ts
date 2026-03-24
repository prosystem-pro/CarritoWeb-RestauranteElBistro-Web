import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Entorno } from '../Entornos/Entorno';

@Injectable({
  providedIn: 'root'
})
export class UsuarioServicio {
  private Url = `${Entorno.ApiUrl}usuario`; 

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
    return this.http.put(`${this.Url}/editar/${Datos.CodigoUsuario}`, Datos);
  }

  Eliminar(Codigo: number): Observable<any> {
    return this.http.delete(`${this.Url}/eliminar/${Codigo}`);
  }
}
