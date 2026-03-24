import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './Componentes/header/header.component';
import { NgIf } from '@angular/common';
import { FooterComponent } from './Componentes/footer/footer.component';
import { ReporteVistaServicio } from './Servicios/ReporteVistaServicio';
import { ReporteTiempoPaginaServicio } from './Servicios/ReporteTiempoPaginaServicio';
import { Entorno } from './Entornos/Entorno';
import { SidebarRedSocialComponent } from './Componentes/sidebar-red-social/sidebar-red-social.component';
import { CarritoEstadoService } from './Servicios/CarritoEstadoServicio';
import { PermisoServicio } from './Autorizacion/AutorizacionPermiso';
import { LoginServicio } from './Servicios/LoginServicio';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, NgIf, FooterComponent, SidebarRedSocialComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'CarritoWeb-Web';
  private horaEntrada: number = 0;
  private temporizadorInactividad: any;
  private tiempoMaxInactividadMs = 15 * 60 * 1000;
  private codigoReporteTiempoPagina: number | null = null;
  private intervaloActualizacion: any;
  carritoAbierto = false;

  constructor(
    private router: Router,
    private ReporteVistaServicio: ReporteVistaServicio,
    private ReporteTiempoPaginaServicio: ReporteTiempoPaginaServicio,
    private carritoEstadoService: CarritoEstadoService,
    public Permiso: PermisoServicio,
    private loginServicio: LoginServicio
  ) {
    this.carritoEstadoService.carritoAbierto$.subscribe(
      estado => this.carritoAbierto = estado
    );
  }

  ngOnInit(): void {
    this.horaEntrada = Date.now();
    this.reiniciarTemporizadorInactividad();
    this.ReportarVista();
    const tokenValido = this.loginServicio.ValidarToken();
    if (!tokenValido) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('colorClasificacion');
      localStorage.removeItem('colorClasificacionTexto');
    }


    setTimeout(() => {
      const datos = {
        TiempoPromedio: '00:00:00',
        Navegador: this.ObtenerNavegador()
      };
      this.ReporteTiempoPaginaServicio.Crear(datos).subscribe({
        next: (respuesta) => {
          this.codigoReporteTiempoPagina = respuesta.data.CodigoReporteTiempoPagina;
          this.iniciarActualizacionTiempo();
        },
        error: (err) => console.error('Error creando reporte inicial:', err)
      });
    }, 5000);
  }

  iniciarActualizacionTiempo(): void {
    this.intervaloActualizacion = setInterval(() => {
      if (!this.codigoReporteTiempoPagina) return;

      const tiempoMs = Date.now() - this.horaEntrada;
      const tiempoFormateado = this.formatearTiempo(tiempoMs);

      const datos = {
        CodigoReporteTiempoPagina: this.codigoReporteTiempoPagina,
        TiempoPromedio: tiempoFormateado,
        Navegador: this.ObtenerNavegador()
      };

      this.ReporteTiempoPaginaServicio.Editar(datos).subscribe({
        next: () => { },
        error: () => { }
      });
    }, 10000);
  }


  @HostListener('window:mousemove')
  @HostListener('window:keydown')
  @HostListener('window:click')
  reiniciarInactividad(): void {
    this.reiniciarTemporizadorInactividad();
  }

  reiniciarTemporizadorInactividad(): void {
    const token = localStorage.getItem('authToken');

    if (!token) {
      // Usuario público, no iniciar temporizador
      return;
    }

    clearTimeout(this.temporizadorInactividad);
    this.temporizadorInactividad = setTimeout(() => {
      console.warn('Usuario inactivo. Cerrando sesión automáticamente...');
      this.cerrarSesion();
    }, this.tiempoMaxInactividadMs);
  }

  // reiniciarTemporizadorInactividad(): void {
  //   clearTimeout(this.temporizadorInactividad);
  //   this.temporizadorInactividad = setTimeout(() => {
  //     console.warn('Usuario inactivo. Cerrando sesión automáticamente...');
  //     this.cerrarSesion();
  //   }, this.tiempoMaxInactividadMs);
  // }

  cerrarSesion(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('colorClasificacion');
    localStorage.removeItem('colorClasificacionTexto');
    this.router.navigate(['/login']);
  }

  @HostListener('window:beforeunload', ['$event'])
  @HostListener('window:pagehide', ['$event'])
  onUnload(event: Event) {
    console.log('cerrando ventana');
  }
  registrarSalida(): void {
    clearInterval(this.intervaloActualizacion);
    if (this.codigoReporteTiempoPagina == null) return;

    const tiempoFinalMs = Date.now() - this.horaEntrada;
    const tiempoFormateado = this.formatearTiempo(tiempoFinalMs);

    const datos = {
      CodigoReporteTiempoPagina: this.codigoReporteTiempoPagina,
      TiempoPromedio: tiempoFormateado,
      Navegador: this.ObtenerNavegador()
    };

    const blob = new Blob([JSON.stringify(datos)], { type: 'application/json' });
    const exito = navigator.sendBeacon(
      Entorno.ApiUrl + 'reportetiempopagina/editar',
      blob
    );

  }

  formatearTiempo(ms: number): string {
    const totalSegundos = Math.floor(ms / 1000);
    const horas = Math.floor(totalSegundos / 3600).toString().padStart(2, '0');
    const minutos = Math.floor((totalSegundos % 3600) / 60).toString().padStart(2, '0');
    const segundos = (totalSegundos % 60).toString().padStart(2, '0');
    return `${horas}:${minutos}:${segundos}`;
  }

  ReportarVista(): void {
    const Datos = {
      Navegador: this.ObtenerNavegador()
    };

    this.ReporteVistaServicio.Crear(Datos).subscribe({
      next: (Respuesta) => console.log('Vista reportada con éxito:', Respuesta),
      error: (Error) => console.error('Error al reportar vista:', Error)
    });
  }

  ObtenerNavegador(): string {
    const AgenteUsuario = navigator.userAgent;
    if (AgenteUsuario.includes('Chrome') && !AgenteUsuario.includes('Edg')) return 'Chrome';
    if (AgenteUsuario.includes('Firefox')) return 'Firefox';
    if (AgenteUsuario.includes('Safari') && !AgenteUsuario.includes('Chrome')) return 'Safari';
    if (AgenteUsuario.includes('Edg')) return 'Edge';
    return 'Desconocido';
  }

  // Rutas auxiliares
  esLogin(): boolean {
    return this.router.url === '/login';
  }
  esProductos(): boolean {
    return this.router.url.startsWith('/productos');
  }
  esContacto(): boolean {
    return this.router.url === '/contacto';
  }
  esOtro(): boolean {
    return this.router.url === '/otro';
  }
  esReporteProducto(): boolean {
    return this.router.url === '/reporte-producto';
  }
  esReporteVista(): boolean {
    return this.router.url === '/reporte-vista';
  }
  esReporteRedSocial(): boolean {
    return this.router.url === '/reporte-red-social';
  }
  esReporteTiempoPagina(): boolean {
    return this.router.url === '/reporte-tiempo-pagina';
  }

  mostrarSidebar(): boolean {
    return !(
      this.Permiso.TienePermiso('RedSocial', 'VerUnidad') &&
      this.router.url.startsWith('/reporte')
    );
  }
}