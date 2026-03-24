import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicioCompartido } from '../../Servicios/ServicioCompartido';
import { EmpresaServicio } from '../../Servicios/EmpresaServicio';
import { RedSocialServicio } from '../../Servicios/RedSocialServicio';
import { ReporteProductoServicio } from '../../Servicios/ReporteProductoServicio';
import { AlertaServicio } from '../../Servicios/Alerta-Servicio';

interface ProductoConCantidad {
  CodigoProducto: number;
  NombreProducto: string;
  Precio: number;
  Moneda: string;
  UrlImagen: string;
  cantidad: number;
}

@Component({
  selector: 'app-carrito',
  imports: [CommonModule],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent implements OnInit {
  @Output() cerrarCarrito = new EventEmitter<void>();
  @Input() colorNavbarEIcono: string = '';
  @Input() colorTextoNavbar: string = '';
  datosEmpresa: any = null;
  errorMessage: string = '';
  isLoading: boolean = false;
  productosCarrito: ProductoConCantidad[] = [];
  total: number = 0;

  constructor(private carritoService: ServicioCompartido, private empresaServicio: EmpresaServicio, private RedSocialServicio: RedSocialServicio,
    private ReporteProductoServicio: ReporteProductoServicio, private AlertaServicio: AlertaServicio
  ) { }

  ngOnInit(): void {
    this.cargarProductosCarrito();
    this.calcularTotal();
  }

  cargarProductosCarrito(): void {
    const datosCarrito = localStorage.getItem('carrito');
    if (datosCarrito) {
      this.productosCarrito = JSON.parse(datosCarrito);
    }
  }

  calcularTotal(): void {
    this.total = this.productosCarrito.reduce((suma, producto) =>
      suma + (producto.Precio * producto.cantidad), 0);
  }

  aumentarCantidad(producto: ProductoConCantidad): void {
    producto.cantidad += 1;
    this.actualizarCarrito();
    this.carritoService.notificarCarritoVaciado();
  }

  disminuirCantidad(producto: ProductoConCantidad): void {
    if (producto.cantidad > 1) {
      producto.cantidad -= 1;
      this.actualizarCarrito();
    }
    this.carritoService.notificarCarritoVaciado();
  }

  eliminarProducto(indice: number): void {
    this.productosCarrito.splice(indice, 1);
    this.actualizarCarrito();
    this.carritoService.notificarCarritoVaciado();
  }

  vaciarCarrito(): void {
    this.productosCarrito = [];
    localStorage.removeItem('carrito');
    this.calcularTotal();
    this.carritoService.notificarCarritoVaciado();
    this.carritoService.actualizarContadorCarrito(0);
  }

  actualizarCarrito(): void {
    localStorage.setItem('carrito', JSON.stringify(this.productosCarrito));
    this.calcularTotal();
  }

  cerrar(): void {
    this.cerrarCarrito.emit();
  }
  ReportarProductosVendidos(): void {
    const productosValidos = this.productosCarrito
      .filter(producto => producto.CodigoProducto && producto.cantidad)
      .map(producto => ({
        CodigoProducto: producto.CodigoProducto,
        CantidadVendida: producto.cantidad,
        Navegador: this.ObtenerNavegador()
      }));

    if (productosValidos.length === 0) {
      console.warn('No hay productos válidos para reportar.');
      return;
    }

    this.ReporteProductoServicio.Crear(productosValidos).subscribe({
      next: (respuesta) => {
      },
      error: (error) => {
        this.isLoading = false;
        const tipo = error?.error?.tipo;
        const mensaje =
          error?.error?.error?.message ||
          error?.error?.message ||
          'Ocurrió un error inesperado.';

        if (tipo === 'Alerta') {
          this.AlertaServicio.MostrarAlerta(mensaje);
        } else {
          this.AlertaServicio.MostrarError({ error: { message: mensaje } });
        }
        this.errorMessage = mensaje;
      }
    });
  }

  ObtenerNavegador(): string {
    const AgenteUsuario = navigator.userAgent;

    if (AgenteUsuario.includes('Chrome') && !AgenteUsuario.includes('Edg')) {
      return 'Chrome';
    } else if (AgenteUsuario.includes('Firefox')) {
      return 'Firefox';
    } else if (AgenteUsuario.includes('Safari') && !AgenteUsuario.includes('Chrome')) {
      return 'Safari';
    } else if (AgenteUsuario.includes('Edg')) {
      return 'Edge';
    } else {
      return 'Desconocido';
    }
  }

  isIOS(): boolean {
    return /iPhone|iPad|iPod/.test(navigator.userAgent);
  }

  isSafari(): boolean {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  }

  isAndroid(): boolean {
    return /Android/i.test(navigator.userAgent);
  }

  // realizarPedido(): void {
  //   this.ReportarProductosVendidos();

  //   const esIOS = this.isIOS() && this.isSafari();
  //   const esAndroid = this.isAndroid();

  //   let nuevaVentana: Window | null = null;

  //   if (esIOS) {
  //     nuevaVentana = window.open('', '_blank');
  //     if (!nuevaVentana) {
  //       console.error('El navegador bloqueó la ventana emergente.');
  //       return;
  //     }
  //   }

  //   this.empresaServicio.Listado().subscribe({
  //     next: (data: any) => {
  //       this.datosEmpresa = data[0];

  //       const numTelefono = this.datosEmpresa?.Celular;
  //       if (!numTelefono) {
  //         if (esIOS && nuevaVentana) nuevaVentana.close();
  //         return;
  //       }

  //       const mensaje = `Hola, me gustaría ordenar:\n${this.productosCarrito.map(producto =>
  //         `- ${producto.cantidad}x ${producto.NombreProducto} (${producto.Moneda} ${producto.Precio} c/u)`).join('\n')}\n\nTotal: ${this.productosCarrito[0].Moneda} ${this.total}`;

  //       const mensajeCodificado = encodeURIComponent(mensaje);
  //       const url = `https://wa.me/${numTelefono}?text=${mensajeCodificado}`;

  //       if (esIOS && nuevaVentana) {
  //         nuevaVentana.location.href = url; // Safari
  //       } else {
  //         window.open(url, '_blank'); // Android y demás
  //       }

  //       this.vaciarCarrito();
  //     },
  //     error: (error: any) => {
  //       if (esIOS && nuevaVentana) nuevaVentana.close();
  //     }
  //   });
  // }

  realizarPedido(): void {
    this.ReportarProductosVendidos();

    const esIOS = this.isIOS() && this.isSafari();
    const esAndroid = this.isAndroid();

    let nuevaVentana: Window | null = null;

    if (esIOS) {
      nuevaVentana = window.open('', '_blank');
      if (!nuevaVentana) {
        console.error('El navegador bloqueó la ventana emergente.');
        return;
      }
    }

    this.RedSocialServicio.Listado().subscribe({
      next: (resp: any) => {
        // Buscar el link que sea de WhatsApp y tenga número válido
        // const redWhatsapp = data.find(red =>
        //   typeof red.Link === 'string' && /https:\/\/wa\.me\/\d{8}/.test(red.Link)
        // );
        const redWhatsapp = resp.data.find((red: any) =>
          typeof red.Link === 'string' && /https:\/\/wa\.me\/\d{8}/.test(red.Link)
        );

        if (!redWhatsapp) {
          if (esIOS && nuevaVentana) nuevaVentana.close();
          this.AlertaServicio.MostrarAlerta('No se encontró un número de WhatsApp válido.');
          return;
        }

        // Extraer la URL o el número directamente
        const urlBase = redWhatsapp.Link.match(/https:\/\/wa\.me\/(\d{8})/)?.[0];
        const numTelefono = redWhatsapp.Link.match(/wa\.me\/(\d{8})/)?.[1];

        if (!urlBase || !numTelefono) {
          if (esIOS && nuevaVentana) nuevaVentana.close();
          this.AlertaServicio.MostrarAlerta('El formato del número de WhatsApp no es válido.');
          return;
        }

        const mensaje = `Hola, me gustaría ordenar:\n${this.productosCarrito.map(producto =>
          `- ${producto.cantidad}x ${producto.NombreProducto} (${producto.Moneda} ${producto.Precio} c/u)`).join('\n')}\n\nTotal: ${this.productosCarrito[0].Moneda} ${this.total}`;

        const mensajeCodificado = encodeURIComponent(mensaje);
        const url = `${urlBase}?text=${mensajeCodificado}`;

        if (esIOS && nuevaVentana) {
          nuevaVentana.location.href = url; // Safari
        } else {
          window.open(url, '_blank'); // Android y demás
        }

        this.vaciarCarrito();
      },
      error: (error: any) => {
        if (esIOS && nuevaVentana) nuevaVentana.close();
        this.AlertaServicio.MostrarError(error, 'Error al obtener el número de WhatsApp');
      }
    });
  }

}
