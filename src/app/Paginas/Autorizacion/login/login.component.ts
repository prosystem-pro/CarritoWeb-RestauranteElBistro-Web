import { Component, OnInit } from '@angular/core';
import { LoginServicio } from '../../../Servicios/LoginServicio';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LoginPortadaServicio } from '../../../Servicios/LoginPortada';
import { PermisoServicio } from '../../../Autorizacion/AutorizacionPermiso';
import { Entorno } from '../../../Entornos/Entorno';
import { AlertaServicio } from '../../../Servicios/Alerta-Servicio';
import { SpinnerGlobalComponent } from '../../../Componentes/spinner-global/spinner-global.component';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, SpinnerGlobalComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})

export class LoginComponent implements OnInit {

  private NombreEmpresa = `${Entorno.NombreEmpresa}`;
  NombreUsuario: string = '';
  Clave: string = '';
  // recordarUsuario: boolean = false;
  errorMessage: string = '';
  isLoading: boolean = false;
  modoEdicion = false;
  datosOriginales: any = null;

  // Propiedad para almacenar la portada de login
  portadaLogin: any = null;

  constructor(
    private LoginServicio: LoginServicio,
    private router: Router,
    private loginPortadaServicio: LoginPortadaServicio,
    public Permiso: PermisoServicio,
    private http: HttpClient,
    private alertaServicio: AlertaServicio
  ) { }

  ngOnInit(): void {
    this.obtenerPortadaLogin();
    // this.cargarUsuarioRecordado();
  }

  obtenerPortadaLogin(): void {
    this.isLoading = true;
    this.loginPortadaServicio.Listado().subscribe({
      next: (Respuesta) => {
        const lista = Respuesta?.data;
        if (lista && lista.length > 0) {
          this.portadaLogin = lista[0];
        } else {
          this.crearLoginPortadaPorDefecto();
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        const tipo = error?.error?.tipo;
        const mensaje =
          error?.error?.error?.message ||
          error?.error?.message ||
          'Ocurrió un error inesperado.';

        if (tipo === 'Alerta') {
          this.alertaServicio.MostrarAlerta(mensaje);
        } else {
          this.alertaServicio.MostrarError({ error: { message: mensaje } });
        }

        this.errorMessage = mensaje;
      }
    });
  }

  private crearLoginPortadaPorDefecto(): void {
    this.isLoading = true;
    const portadaDefecto = {
      UrlImagenPortada: '',
      UrlImagenDecorativaIzquierda: '',
      UrlImagenDecorativaDerecha: '',
      Color: '#44261B',
      Estatus: 1
    };

    this.loginPortadaServicio.Crear(portadaDefecto).subscribe({
      next: (response) => {
        if (response?.tipo === 'Éxito') {
          this.alertaServicio.MostrarExito(response.message);
        }
        this.obtenerPortadaLogin();
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        const tipo = error?.error?.tipo;
        const mensaje =
          error?.error?.error?.message ||
          error?.error?.message ||
          'Ocurrió un error inesperado.';

        if (tipo === 'Alerta') {
          this.alertaServicio.MostrarAlerta(mensaje);
        } else {
          this.alertaServicio.MostrarError({ error: { message: mensaje } });
        }

        this.errorMessage = mensaje;
      }
    });
  }

  // Método para activar/desactivar el modo edición
toggleModoEdicion(): void {
  if (!this.modoEdicion) {
    // Copia de seguridad antes de edición
    this.datosOriginales = JSON.parse(JSON.stringify(this.portadaLogin));
    this.modoEdicion = true;
    document.body.classList.add('modoEdicion');
  } else {
    this.alertaServicio
      .Confirmacion('¿Desea guardar los cambios?')
      .then((confirmado) => {
        if (confirmado) {
          this.guardarCambios();
        } else {
          // Restaurar datos si se cancela
          this.portadaLogin = JSON.parse(
            JSON.stringify(this.datosOriginales)
          );
        }

        this.modoEdicion = false;
        document.body.classList.remove('modoEdicion');
      });
  }
}


  // Método para guardar los cambios
  guardarCambios(): void {
    this.isLoading = true;
    if (!this.portadaLogin) {

      this.alertaServicio.MostrarAlerta(
        'No hay datos disponibles para actualizar',
        'Atención'
      );
      return;
    }

    const datosActualizados = { ...this.portadaLogin };

    delete datosActualizados.UrlImagenPortada;
    delete datosActualizados.UrlImagenDecorativaIzquierda;
    delete datosActualizados.UrlImagenDecorativaDerecha;

    this.loginPortadaServicio.Editar(datosActualizados).subscribe({
      next: (response) => {
        if (response?.tipo === 'Éxito') {
          this.alertaServicio.MostrarExito(response.message);
        }
        if (response.success) {
          this.modoEdicion = false;
          document.body.classList.remove('modoEdicion');
          this.datosOriginales = null;
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        const tipo = error?.error?.tipo;
        const mensaje =
          error?.error?.error?.message ||
          error?.error?.message ||
          'Ocurrió un error inesperado.';

        if (tipo === 'Alerta') {
          this.alertaServicio.MostrarAlerta(mensaje);
        } else {
          this.alertaServicio.MostrarError({ error: { message: mensaje } });
        }

        this.errorMessage = mensaje;
      }
    });
  }


  login(): void {
    this.errorMessage = '';
    this.isLoading = true;

    this.LoginServicio.Login(this.NombreUsuario, this.Clave).subscribe({
      next: (response) => {
        if (response?.tipo === 'Éxito') {
          this.alertaServicio.MostrarExito(response.message);
        }
        if (response?.data?.Token) {
          this.router.navigate(['/nosotros']);
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;

        const tipo = error?.error?.tipo;
        const mensaje =
          error?.error?.error?.message ||
          error?.error?.message ||
          'Ocurrió un error inesperado.';

        if (tipo === 'Alerta') {
          this.alertaServicio.MostrarAlerta(mensaje);
        } else {
          this.alertaServicio.MostrarError({ error: { message: mensaje } });
        }

        this.errorMessage = mensaje;
      }
    });
  }

  actualizarImagenPortada(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.subirImagen(file, 'UrlImagenPortada');
    }
  }

  actualizarImagenPortadaIzquierda(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.subirImagen(file, 'UrlImagenDecorativaIzquierda');
    }
  }

  actualizarImagenPortadaDerecha(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.subirImagen(file, 'UrlImagenDecorativaDerecha');
    }
  }

  // Método general para subir imágenes
  subirImagen(file: File, campoDestino: string): void {
    this.isLoading = true;
    const formData = new FormData();
    formData.append('Imagen', file);
    formData.append('CarpetaPrincipal', this.NombreEmpresa);
    formData.append('SubCarpeta', 'LoginPortada');
    formData.append('CodigoPropio', this.portadaLogin.CodigoLoginPortada);
    formData.append('CampoPropio', 'CodigoLoginPortada');
    formData.append('NombreCampoImagen', campoDestino);
    // Mostrar en consola los datos del FormData
    this.loginPortadaServicio.SubirImagen(formData).subscribe({
      next: (response: any) => {
        if (response && response.data.Entidad && response.data.Entidad[campoDestino]) {

          this.portadaLogin[campoDestino] = response.data.Entidad[campoDestino];

          const datosActualizados = { ...this.portadaLogin };

          delete datosActualizados.UrlImagenPortada;
          delete datosActualizados.UrlImagenDecorativaIzquierda;
          delete datosActualizados.UrlImagenDecorativaDerecha;

          this.loginPortadaServicio.Editar(datosActualizados).subscribe({
            next: (updateResponse) => {
              if (updateResponse?.tipo === 'Éxito') {
                this.alertaServicio.MostrarExito(updateResponse.message);
              }
              this.obtenerPortadaLogin();
              this.modoEdicion = false;
              this.isLoading = false;
            },
            error: (error) => {
              this.isLoading = false;
              const tipo = error?.error?.tipo;
              const mensaje =
                error?.error?.error?.message ||
                error?.error?.message ||
                'Ocurrió un error inesperado.';

              if (tipo === 'Alerta') {
                this.alertaServicio.MostrarAlerta(mensaje);
              } else {
                this.alertaServicio.MostrarError({ error: { message: mensaje } });
              }
              this.errorMessage = mensaje;
            }
          });
        }
      },
      error: (error) => {
        this.isLoading = false;
        const tipo = error?.error?.tipo;
        const mensaje =
          error?.error?.error?.message ||
          error?.error?.message ||
          'Ocurrió un error inesperado.';

        if (tipo === 'Alerta') {
          this.alertaServicio.MostrarAlerta(mensaje);
        } else {
          this.alertaServicio.MostrarError({ error: { message: mensaje } });
        }

        this.errorMessage = mensaje;
      }
    });
  }
}