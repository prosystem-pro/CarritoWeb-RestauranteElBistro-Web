import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertaServicio {

  constructor() {}



MostrarExito(mensaje: string, titulo: string = 'Éxito'): void {
  Swal.fire({
    icon: 'success',
    title: titulo,
    text: mensaje,
    confirmButtonColor: '#3085d6',
    showConfirmButton: false,
    timer: 3000, // 3 segundos
    timerProgressBar: true
  });
}

MostrarAlerta(mensaje: string, titulo: string = 'Atención'): void {
  Swal.fire({
    icon: 'warning',
    title: titulo,
    text: mensaje,
    confirmButtonColor: '#f0ad4e',
    showConfirmButton: false,
    timer: 3000, 
    timerProgressBar: true
  });
}

MostrarError(error: any, titulo: string = 'Error'): void {
  const mensaje = error?.error?.message || 'Ocurrió un error inesperado.';
  Swal.fire({
    icon: 'error',
    title: titulo,
    text: mensaje,
    confirmButtonColor: '#d33',
    showConfirmButton: false,
    timer: 3000, 
    timerProgressBar: true
  });

  console.error('🔴 Error detallado:', error);
}


  Confirmacion(titulo: string, texto: string = '', confirmText: string = 'Confirmar', cancelText: string = 'Cancelar'): Promise<boolean> {
  return Swal.fire({
    title: titulo,
    text: texto,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6c757d',
    confirmButtonText: confirmText,
    cancelButtonText: cancelText
  }).then(result => result.isConfirmed);
}

  MostrarToast(mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info' = 'success', posicion: 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start' = 'top-end'): void {
    const Toast = Swal.mixin({
      toast: true,
      position: posicion,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    Toast.fire({
      icon: tipo,
      title: mensaje
    });
  }

}
