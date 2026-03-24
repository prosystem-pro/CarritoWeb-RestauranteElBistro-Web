import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Entorno } from '../Entornos/Entorno';
import { map } from 'rxjs/operators'; 

@Injectable({
  providedIn: 'root'
})
export class EmpresaServicio {
  private Url = `${Entorno.ApiUrl}empresa`; 

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
    return this.http.put(`${this.Url}/editar/${Datos.CodigoEmpresa}`, Datos);
  }

  Eliminar(Codigo: number): Observable<any> {
    return this.http.delete(`${this.Url}/eliminar/${Codigo}`);
  }
  ConseguirPrimeraEmpresa(): Observable<any | null> {
    return this.Listado().pipe(
      map(empresas => (empresas.data && empresas.data.length > 0 ? empresas.data[0] : null))
    );
  }
}
