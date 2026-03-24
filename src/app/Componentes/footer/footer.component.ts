import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FooterServicio } from '../../Servicios/FooterServicio';
import { HttpClient } from '@angular/common/http';
import { Entorno } from '../../Entornos/Entorno';
import { ServicioCompartido } from '../../Servicios/ServicioCompartido';
import { RedSocialServicio } from '../../Servicios/RedSocialServicio';
import { AlertaServicio } from '../../Servicios/Alerta-Servicio';
import { ReporteRedSocialServicio } from '../../Servicios/ReporteRedSocialServicio';
import { RedSocialImagenServicio } from '../../Servicios/RedSocialImagenServicio';
import { EmpresaServicio } from '../../Servicios/EmpresaServicio';
import { PermisoServicio } from '../../Autorizacion/AutorizacionPermiso';
import { SpinnerGlobalComponent } from '../../../app/Componentes/spinner-global/spinner-global.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, SpinnerGlobalComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit {
  private Url = `${Entorno.ApiUrl}`;
  private NombreEmpresa = `${Entorno.NombreEmpresa}`;
  footerData: any = null;
  isLoading = true;
  error = false;
  modoEdicion: boolean = false;
  datosOriginales: any = null;
  RedSocial: any = [];
  errorMessage: string = '';
  codigoEmpresa: number | null = null;

  constructor(
    private footerServicio: FooterServicio,
    private http: HttpClient,
    private servicioCompartido: ServicioCompartido,
    private redSocialServicio: RedSocialServicio,
    public Permiso: PermisoServicio,
    private alertaServicio: AlertaServicio,
    private redSocialImagenServicio: RedSocialImagenServicio,
    private ReporteRedSocialServicio: ReporteRedSocialServicio,
    private EmpresaServicio: EmpresaServicio
  ) { }

  ngOnInit(): void {
    this.obtenerCodigoEmpresa().then(() => {
      this.cargarDatosFooter();
      this.cargarRedesSociales();
    });
  }

  // Nuevo método para obtener el código de empresa
  private async obtenerCodigoEmpresa(): Promise<void> {
    try {
      const empresa = await this.EmpresaServicio.ConseguirPrimeraEmpresa().toPromise();
      if (empresa && empresa.CodigoEmpresa) {
        this.codigoEmpresa = empresa.CodigoEmpresa;
      } else {
        console.warn('No se encontró información de empresa');
        this.alertaServicio.MostrarError('No se pudo obtener la información de la empresa');
      }
    } catch (error) {
      console.error('Error al obtener código de empresa:', error);
      this.alertaServicio.MostrarError('Error al cargar información de empresa');
    }
  }

  ReportarRedSocial(codigo: number | undefined): void {
    if (codigo === undefined) {
      console.warn('Código de red social no definido, no se reporta');
      return;
    }

    const Datos = {
      CodigoRedSocial: codigo.toString(),
      Navegador: this.ObtenerNavegador()
    };

    this.ReporteRedSocialServicio.Crear(Datos).subscribe({
      next: (respuesta) => console.log('Red social reportada:', respuesta),
      error: (error) => console.error('Error al reportar red social:', error)
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

  cargarRedesSociales(): void {
    this.redSocialServicio.Listado('Footer').subscribe({
      next: (Respuesta) => {
        this.RedSocial = Respuesta.data.filter((red: any) => red.Estatus === 1);

      },
      error: (error) => {
      }
    });
  }

  // Modificar el método cargarDatosFooter para crear footer si no existe
  cargarDatosFooter(): void {
    this.footerServicio.Listado().subscribe({
      next: (Respuesta) => {
        if (Respuesta && Respuesta.data && Respuesta.data.length > 0) {
          // Existe el footer, usar datos existentes
          this.footerData = Respuesta.data[0];
          this.servicioCompartido.setColorFooter(this.footerData?.ColorFooter);
          this.isLoading = false;
        } else {
          // No existe footer, crear uno nuevo con valores por defecto
          this.crearFooterPorDefecto();
        }
      },
      error: (err) => {
        console.error('Error al obtener datos del footer:', err);
        // En caso de error, intentar crear footer por defecto
        // this.crearFooterPorDefecto();
      }
    });
  }

  // Nuevo método para crear footer con valores por defecto
  private crearFooterPorDefecto(): void {
    if (!this.codigoEmpresa) {
      this.alertaServicio.MostrarError('No se puede crear el footer sin información de empresa');
      this.error = true;
      this.isLoading = false;
      return;
    }

    const footerDefecto = {
      CodigoEmpresa: this.codigoEmpresa,
      TextoInicio: 'Nosotros',
      ColorTextoInicio: '#000000',
      TextoMenu: 'Menú',
      ColorTextoMenu: '#000000',
      TextoContacto: 'Contacto',
      ColorTextoContacto: '#000000',
      TextoOtro: 'Otro',
      ColorTextoOtro: '#000000',
      TextoTelefonoOficina: 'Teléfono de Oficina 54545454',
      ColorTextoTelefonoOficina: '#000000',
      ColorNoCelular: '#000000',
      TextoSuscripcion: 'Suscríbete...',
      ColorTextoSuscripcion: '#000000',
      TextoRedesSociales: 'Síguenos en redes sociales',
      ColorTextoRedesSociales: '#000000',
      TextoCorreo: 'Correo electrónico',
      ColorTextoCorreo: '#000000',
      TextoBotonSuscribirte: 'Suscribirse',
      ColorTextoBotonSuscribirte: '#ffffff',
      ColorBotonSuscribirte: '#007bff',
      DerechoDeAutor: '© 2024 Todos los derechos reservados',
      ColorDerechosDeAutor: '#666666',
      ColorFooter: '#f8f9fa',
      UrlLogo: '',
      Estatus: 1
    };

    this.footerServicio.Crear(footerDefecto).subscribe({
      next: (response) => {
        if (response?.tipo === 'Éxito') {
          this.alertaServicio.MostrarExito(response.message);
        }
        this.cargarDatosFooter()
        // Asignar los datos del footer creado
        this.footerData = response.Entidad || response;
        this.servicioCompartido.setColorFooter(this.footerData?.ColorFooter);
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

        // Como fallback, usar datos temporales para que la interfaz no se rompa
        this.footerData = footerDefecto;
        this.servicioCompartido.setColorFooter(this.footerData?.ColorFooter);
        this.error = true;
        this.isLoading = false;
      }
    });
  }

  toggleModoEdicion(): void {
    if (!this.modoEdicion) {
      this.datosOriginales = JSON.parse(JSON.stringify(this.footerData));
      this.modoEdicion = true;
      document.body.classList.add('modoEdicion');
    } else {
      this.alertaServicio.Confirmacion('¿Desea guardar los cambios?').then((confirmado) => {
        if (confirmado) {
          this.guardarCambios();
        } else {
          this.footerData = JSON.parse(JSON.stringify(this.datosOriginales));
          this.servicioCompartido.setColorFooter(this.footerData?.ColorFooter);
        }
      });
      this.modoEdicion = false;
      document.body.classList.remove('modoEdicion');
    }
  }

  guardarCambios(): void {
    this.isLoading = true;
    if (this.footerData) {
      const datosActualizados = { ...this.footerData };

      // EXCLUIR la URL del logo para evitar problemas en el backend
      delete datosActualizados.UrlLogo;

      this.footerServicio.Editar(datosActualizados).subscribe({
        next: (response) => {
          this.alertaServicio.MostrarExito('Cambios guardados correctamente');
          this.modoEdicion = false;
          document.body.classList.remove('modoEdicion');
          this.datosOriginales = null;
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error al guardar los cambios:', error);
          this.alertaServicio.MostrarError('Error al guardar los cambios');
        }
      });
    } else {
      this.isLoading = false;
      this.alertaServicio.MostrarAlerta('No hay datos disponibles para actualizar');
    }
  }

  actualizarLogo(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.footerData.UrlLogo = e.target.result;
      };
      reader.readAsDataURL(file);

      this.subirImagen(file, 'UrlLogo');
    }
  }

  // Modificar el método subirImagen para manejar la creación si no existe CodigoFooter
  subirImagen(file: File, campoDestino: string): void {
    if (!this.footerData) {
      this.alertaServicio.MostrarError('No hay datos de footer disponibles');
      return;
    }

    // Si no existe CodigoFooter, primero crear el footer
    if (!this.footerData.CodigoFooter) {
      this.alertaServicio.MostrarAlerta('Creando configuración de footer...', 'Por favor, espere');

      // Crear el footer primero y luego subir la imagen
      this.footerServicio.Crear(this.footerData).subscribe({
        next: (response) => {
          this.footerData = response.Entidad || response;
          // Ahora que tenemos el CodigoFooter, proceder a subir la imagen
          this.ejecutarSubidaImagen(file, campoDestino);
        },
        error: (error) => {
          console.error('Error al crear footer antes de subir imagen:', error);
          this.alertaServicio.MostrarError('Error al crear la configuración del footer');
        }
      });
    } else {
      // Ya existe el footer, proceder directamente a subir la imagen
      this.ejecutarSubidaImagen(file, campoDestino);
    }
  }

  // Nuevo método para ejecutar la subida de imagen
  private ejecutarSubidaImagen(file: File, campoDestino: string): void {
    this.isLoading = true;
    const formData = new FormData();
    formData.append('Imagen', file);
    formData.append('CarpetaPrincipal', this.NombreEmpresa);
    formData.append('SubCarpeta', 'Footer');
    formData.append('CodigoVinculado', this.footerData.CodigoEmpresa);
    formData.append('CodigoPropio', this.footerData.CodigoFooter);
    formData.append('CampoVinculado', 'CodigoEmpresa');
    formData.append('CampoPropio', 'CodigoFooter');
    formData.append('NombreCampoImagen', campoDestino);

    // this.http.post(`${this.Url}subir-imagen`, formData)
    this.footerServicio.SubirImagen(formData)
      .subscribe({
        next: (response: any) => {
          if (response?.data.Entidad?.[campoDestino]) {
            this.footerData[campoDestino] = response.data.Entidad[campoDestino];
            const { UrlLogo, ...datosActualizados } = { ...this.footerData };
            this.footerServicio.Editar(datosActualizados).subscribe({

              next: (Respuesta) => {
                if (Respuesta?.tipo === 'Éxito') {
                  this.alertaServicio.MostrarExito(Respuesta.message);

                }
                this.cargarDatosFooter();
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
          } else {
            this.isLoading = false;
            this.alertaServicio.MostrarAlerta('No se encontró la URL en el campo "' + campoDestino + '".');
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

  // Método para actualizar imagen de red social
  actualizarImagenRedSocial(event: any, codigoRedSocial: number): void {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    if (!codigoRedSocial) {
      this.alertaServicio.MostrarError('No se pudo identificar la red social');
      return;
    }

    // Buscar la red social específica
    const redSocial = this.RedSocial.find((red: any) => red.CodigoRedSocial === codigoRedSocial);
    if (!redSocial) {
      this.alertaServicio.MostrarError('Red social no encontrada');
      return;
    }

    // Mostrar preview inmediato
    const reader = new FileReader();
    reader.onload = (e: any) => {
      // Si ya tiene imágenes, actualizar la primera
      if (redSocial.Imagenes && redSocial.Imagenes.length > 0) {
        redSocial.Imagenes[0].UrlImagen = e.target.result;
      } else {
        // Si no tiene imágenes, crear el array y agregar una imagen temporal
        redSocial.Imagenes = [{
          CodigoRedSocialImagen: null,
          UrlImagen: e.target.result,
          Ubicacion: 'Footer'
        }];
      }
    };
    reader.readAsDataURL(file);

    // Subir la imagen al servidor
    this.subirImagenRedSocial(file, codigoRedSocial, redSocial);
  }

  subirImagenRedSocial(file: File, codigoRedSocial: number, redSocial: any): void {
    this.isLoading = true;
    const formData = new FormData();
    formData.append('Imagen', file);
    formData.append('CarpetaPrincipal', this.NombreEmpresa);
    formData.append('SubCarpeta', 'RedSocialImagen');
    formData.append('CodigoVinculado', codigoRedSocial.toString());

    // Verificar si ya existe una imagen para esta red social en Footer
    const imagenExistente = redSocial.Imagenes?.find((img: any) => img.Ubicacion === 'Footer');
    const tieneImagenValida = imagenExistente && imagenExistente.CodigoRedSocialImagen;

    if (tieneImagenValida) {
      // Si ya existe con código válido, usar para actualización
      formData.append('CodigoPropio', imagenExistente.CodigoRedSocialImagen.toString());
    } else {
      // Si no existe o no tiene código, dejar vacío para creación
      formData.append('CodigoPropio', '');
    }

    formData.append('CampoVinculado', 'CodigoRedSocial');
    formData.append('CampoPropio', 'CodigoRedSocialImagen');
    formData.append('NombreCampoImagen', 'UrlImagen');

    this.redSocialImagenServicio.SubirImagen(formData)
      .subscribe({
        next: (response: any) => {
          if (response?.data.Entidad?.UrlImagen) {
            this.procesarRespuestaImagen(codigoRedSocial, response, redSocial);
          } else {
            this.alertaServicio.MostrarError('Error al obtener la URL de la imagen');
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

  procesarRespuestaImagen(codigoRedSocial: number, response: any, redSocial: any): void {
    const urlImagen = response.data.Entidad.UrlImagen;

    // Verificar si ya existe una imagen para esta red social en Footer
    const imagenExistente = redSocial.Imagenes?.find((img: any) => img.Ubicacion === 'Footer');

    if (imagenExistente && imagenExistente.CodigoRedSocialImagen) {
      // ACTUALIZAR: Ya existe una imagen con código válido en Footer
      this.actualizarRegistroRedSocialImagen(imagenExistente.CodigoRedSocialImagen, urlImagen);
    } else {
      // ACTUALIZAR EL REGISTRO CREADO AUTOMÁTICAMENTE: 
      // El endpoint subir-imagen ya creó un registro, solo necesitamos actualizarlo con la Ubicacion
      const codigoImagenCreada = response.data.Entidad.CodigoRedSocialImagen;

      if (codigoImagenCreada) {
        this.actualizarRegistroRedSocialImagen(codigoImagenCreada, urlImagen);
      } else {
        // Fallback: crear manualmente solo si no se creó automáticamente
        this.crearRegistroRedSocialImagen(codigoRedSocial, urlImagen);
      }
    }
  }

  crearRegistroRedSocialImagen(codigoRedSocial: number, urlImagen: string): void {

    this.isLoading = true;
    const datosNuevos = {
      CodigoRedSocial: codigoRedSocial,
      Ubicacion: 'Footer', // Valor quemado como solicitaste
      Estatus: 1 // Agregar estatus activo
    };

    this.redSocialImagenServicio.Crear(datosNuevos).subscribe({
      next: (response) => {
        if (response?.tipo === 'Éxito') {
          this.alertaServicio.MostrarExito(response.message);
        }
        // Recargar las redes sociales para obtener los datos actualizados
        this.isLoading = false;
        this.cargarRedesSociales();
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
        // Recargar las redes sociales para revertir cambios
        this.cargarRedesSociales();
      }
    });
  }


  actualizarRegistroRedSocialImagen(codigoRedSocialImagen: number, urlImagen: string): void {
    this.isLoading = true;
    const datosActualizados = {
      CodigoRedSocialImagen: codigoRedSocialImagen,
      Ubicacion: 'Footer', // Valor quemado como solicitaste
      Estatus: 1 // Mantener estatus activo
    };

    this.redSocialImagenServicio.Editar(datosActualizados).subscribe({
      next: (response) => {
        if (response?.tipo === 'Éxito') {
          this.alertaServicio.MostrarExito(response.message);
        }
        // Recargar las redes sociales para obtener los datos actualizados
        setTimeout(() => this.cargarRedesSociales(), 500);
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
        // Recargar las redes sociales para revertir cambios
        this.cargarRedesSociales();
      }
    });
  }
  sincronizarColoresTexto(): void {
    if (this.footerData) {
      const colorSeleccionado = this.footerData.ColorTextoInicio;
      this.footerData.ColorTextoMenu = colorSeleccionado;
      this.footerData.ColorTextoContacto = colorSeleccionado;
      this.footerData.ColorTextoOtro = colorSeleccionado;
    }
  }

  onColorChange(color: string) {
    this.footerData.ColorFooter = color;
    this.servicioCompartido.setColorFooter(color);

    // Enviar solo el cambio de color, sin las URLs de imágenes
    if (this.footerData && this.footerData.CodigoFooter) {
      const actualizacionColor = {
        CodigoFooter: this.footerData.CodigoFooter,
        CodigoEmpresa: this.footerData.CodigoEmpresa,
        ColorFooter: color
      };

      this.footerServicio.Editar(actualizacionColor).subscribe({
        next: (response) => {
        },
        error: (error) => {
        }
      });
    }
  }
}