import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CarritoEstadoService {
  private carritoAbiertoSubject = new BehaviorSubject<boolean>(false);
  public carritoAbierto$ = this.carritoAbiertoSubject.asObservable();

  abrirCarrito() {
    this.carritoAbiertoSubject.next(true);
  }

  cerrarCarrito() {
    this.carritoAbiertoSubject.next(false);
  }
}