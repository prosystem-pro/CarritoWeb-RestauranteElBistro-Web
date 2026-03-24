import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

interface DatosHeader {
  urlImagenCarrito: string;
  textoBuscador: string;
  urlImagenLupa: string;
}

interface DatosClasificacion {
  colorClasificacionFondo: string;
  colorClasificacionTexto: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServicioCompartido {
  private colorFooterSubject = new BehaviorSubject<string>('#ffffff'); // Valor por defecto
  colorFooter$ = this.colorFooterSubject.asObservable();

  private textoBusquedaSubject = new BehaviorSubject<string>('');
  textoBusqueda$ = this.textoBusquedaSubject.asObservable();

  private datosHeaderSubject = new BehaviorSubject<DatosHeader>({
    urlImagenCarrito: '',
    textoBuscador: '',
    urlImagenLupa: ''
  });
  
  datosHeader$ = this.datosHeaderSubject.asObservable();

  private datosClasificacionSubject = new BehaviorSubject<DatosClasificacion>({
    colorClasificacionFondo: '',
    colorClasificacionTexto: ''
  });

  datosClasificacion$ = this.datosClasificacionSubject.asObservable();

  private carritoVaciadoSource = new Subject<void>();
  carritoVaciado$ = this.carritoVaciadoSource.asObservable();

  private totalItemsCarritoSource = new BehaviorSubject<number>(0);
  totalItemsCarrito$ = this.totalItemsCarritoSource.asObservable();

  setColorFooter(color: string) {
    this.colorFooterSubject.next(color);
  }

  setDatosClasificacion(data: DatosClasificacion) {
    this.datosClasificacionSubject.next(data);
    localStorage.setItem('colorClasificacion', data.colorClasificacionFondo);
    localStorage.setItem('colorClasificacionTexto', data.colorClasificacionTexto);
  }

  setDatosHeader(data: DatosHeader) {
    this.datosHeaderSubject.next(data);
  }

  setTextoBusqueda(texto: string) {
    this.textoBusquedaSubject.next(texto);
  }

  notificarCarritoVaciado() {
    this.carritoVaciadoSource.next();
  }

  actualizarContadorCarrito(total: number) {
    this.totalItemsCarritoSource.next(total);
  }
}
