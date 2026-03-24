import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { ContactanosPortada } from '../../../Modelos/ContactanosPortada';
import { RedSocial } from '../../../Modelos/RedSocial';
import { RedSocialImagen } from '../../../Modelos/RedSocialImagen';
import { Entorno } from '../../../Entornos/Entorno';

import { PermisoServicio } from '../../../Autorizacion/AutorizacionPermiso';
import { RedSocialServicio } from '../../../Servicios/RedSocialServicio'
import { ReporteRedSocialServicio } from '../../../Servicios/ReporteRedSocialServicio';
import { RedSocialImagenServicio } from '../../../Servicios/RedSocialImagenServicio';
import { EmpresaServicio } from '../../../Servicios/EmpresaServicio';
import { ContactanosPortadaServicio } from '../../../Servicios/ContactanosPortadaServicio';
import { AlertaServicio } from '../../../Servicios/Alerta-Servicio';
import { SpinnerGlobalComponent } from '../../../Componentes/spinner-global/spinner-global.component';

@Component({
  selector: 'app-contacto',
  imports: [CommonModule, FormsModule, SpinnerGlobalComponent],
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.css']
})

export class ContactoComponent implements OnInit {
  private Url = `${Entorno.ApiUrl}`;
  private NombreEmpresa = `${Entorno.NombreEmpresa}`;

  ContactanosPortada!: ContactanosPortada;
  MapaSeguro!: SafeResourceUrl;
  RedSocial: any[] = [];
  errorMessage: string = '';
  isLoading: boolean = false;


  RedeSocialImagen: RedSocialImagen[] = [];

  MostrarTitulo: boolean = false;
  MostrarListado: boolean[] = [];
  MostrarCrearRedSocial: boolean = false;
  MostrarMapa: boolean = false;

  CodigoTemporal: string | null = null;
  ImagenTemporal: string | null = null;
  MapaTemporal: string = '';
  imagenTemporalArchivo: File | null = null;



  constructor(
    private ServicioContactanosPortada: ContactanosPortadaServicio,
    public Permiso: PermisoServicio,
    private http: HttpClient,
    private EmpresaServicio: EmpresaServicio,
    private RedSocialServicio: RedSocialServicio,
    private RedSocialImagenServicio: RedSocialImagenServicio,
    private ReporteRedSocialServicio: ReporteRedSocialServicio,

    private sanitizer: DomSanitizer,
    private AlertaServicio: AlertaServicio
  ) { }

  ngOnInit(): void {
    this.ObtenerContactanosPortada();
    this.ObtenerRedesSociales();
  }
  MostrarImagenTemporal(): void {
    if (!this.imagenTemporalArchivo) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.ImagenTemporal = e.target.result;
    };
    reader.readAsDataURL(this.imagenTemporalArchivo);
  }

  ObtenerContactanosPortada(): void {
    this.ServicioContactanosPortada.Listado().subscribe({
      next: (data) => {
        if (data && data.data.length > 0) {
          this.ContactanosPortada = data.data[0];
          this.ContactanosPortada.NombreContactanosPortada = this.ContactanosPortada.NombreContactanosPortada || 'Nombre por defecto';
          this.ContactanosPortada.ColorFondoNombreContactanosPortada = this.ContactanosPortada.ColorFondoNombreContactanosPortada || '#f0f0f0';
          this.ContactanosPortada.ColorContornoNombreContactanosPortada = this.ContactanosPortada.ColorContornoNombreContactanosPortada || '#cccccc';
          this.ContactanosPortada.ColorNombreContactanosPortada = this.ContactanosPortada.ColorNombreContactanosPortada || '#000000';
          this.MapaSeguro = this.sanitizer.bypassSecurityTrustResourceUrl(
            this.ContactanosPortada.UrlMapa || 'https://www.google.com/maps/embed?...'
          );

          if (this.ContactanosPortada?.UrlImagenContactanosPortada) {
            this.ContactanosPortada.UrlImagenContactanosPortada = encodeURI(this.ContactanosPortada.UrlImagenContactanosPortada);
          }

          this.ContactanosPortada.TextoComoLlegar = this.ContactanosPortada.TextoComoLlegar || 'COMO LLEGAR';
          this.ContactanosPortada.ColorTextoComoLlegar = this.ContactanosPortada.ColorTextoComoLlegar || '#ffffff';
          this.ContactanosPortada.ColorBotonComoLlegar = this.ContactanosPortada.ColorBotonComoLlegar || '#007bff';
          this.ContactanosPortada.UrlMapaComoLlegar = this.ContactanosPortada.UrlMapaComoLlegar || 'https://maps.google.com';
          this.ContactanosPortada.UrlImagenHorario = this.ContactanosPortada.UrlImagenHorario || 'http://neni2048.com.ar/alumnos/horarios/';
        } else {
          this.ContactanosPortada = {
            NombreContactanosPortada: 'Nombre por defecto',
            ColorFondoNombreContactanosPortada: '#f0f0f0',
            ColorContornoNombreContactanosPortada: '#cccccc',
            ColorNombreContactanosPortada: '#000000',
            UrlImagenContactanosPortada: '',
            UrlMapa: '',
            TextoComoLlegar: 'COMO LLEGAR',
            ColorTextoComoLlegar: '#ffffff',
            ColorBotonComoLlegar: '#007bff',
            UrlMapaComoLlegar: 'https://maps.google.com',
            UrlImagenHorario: 'http://neni2048.com.ar/alumnos/horarios/'
          };
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
          this.AlertaServicio.MostrarAlerta(mensaje);
        } else {
          this.AlertaServicio.MostrarError({ error: { message: mensaje } });
        }

        this.errorMessage = mensaje;
      }
    });
  }

  GuardarContactanosPortada(): void {
    this.isLoading = true;
    const textoMapa = this.ContactanosPortada.UrlMapa || '';

    if (textoMapa) {
      if (!textoMapa.startsWith('https://')) {
        this.AlertaServicio.MostrarAlerta('Por favor, introduce una URL válida que comience con "https://".');
        return;
      }

      const urlBase = textoMapa.split('"')[0];
      const terminaMal = /[>'"iframe\s]$/.test(urlBase);

      if (terminaMal) {
        this.AlertaServicio.MostrarAlerta('La URL no debe terminar con >, comillas o "iframe".');
        return;
      }

      this.ContactanosPortada.UrlMapa = textoMapa.trim();
    } else {
      delete this.ContactanosPortada.UrlMapa;
    }

    delete this.ContactanosPortada.UrlImagenContactanosPortada;
    delete this.ContactanosPortada.UrlImagenHorario;

    Object.keys(this.ContactanosPortada).forEach(key => {
      const valor = (this.ContactanosPortada as any)[key];
      if (valor === '' || valor === null || valor === undefined) {
        delete (this.ContactanosPortada as any)[key];
      }
    });

    const esEdicion = this.ContactanosPortada.CodigoContactanosPortada;
    if (esEdicion) {
      this.ServicioContactanosPortada.Editar(this.ContactanosPortada).subscribe({
        next: (Respuesta) => {
          this.MostrarTitulo = false;
          if (Respuesta?.tipo === 'Éxito') {
            this.AlertaServicio.MostrarExito(Respuesta.message);
          }
          this.isLoading = false;
          this.ObtenerContactanosPortada();
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
    } else {
      this.ServicioContactanosPortada.Crear(this.ContactanosPortada).subscribe({
        next: (Respuesta) => {
          this.MostrarTitulo = false;
          if (Respuesta?.tipo === 'Éxito') {
            this.AlertaServicio.MostrarExito(Respuesta.message);
          }
          this.isLoading = false;
          this.ObtenerContactanosPortada();
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
  }

  ActualizarImagenContactanosPortada(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.subirImagen(file, 'UrlImagenContactanosPortada');
    } else {
      this.AlertaServicio.MostrarAlerta('No se seleccionó ningún archivo.');
    }
  }
  ActualizarImagenHorario(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.subirImagen(file, 'UrlImagenHorario');
    } else {
      this.AlertaServicio.MostrarAlerta('No se seleccionó ningún archivo.');
    }
  }

  subirImagen(file: File, CampoDestino: string): void {
    this.isLoading = true;
    const nombreEmpresa = this.NombreEmpresa ?? 'defaultCompanyName';
    this.EmpresaServicio.ConseguirPrimeraEmpresa().subscribe({
      next: (empresa) => {
        if (!empresa) {
          this.AlertaServicio.MostrarAlerta('No se encontró ninguna empresa.');
          return;
        }

        const formData = new FormData();
        const CodigoContactanosPortada = (this.ContactanosPortada?.CodigoContactanosPortada ?? '').toString();

        formData.append('Imagen', file);
        formData.append('CarpetaPrincipal', nombreEmpresa);
        formData.append('SubCarpeta', 'ContactanosPortada');
        formData.append('CodigoVinculado', empresa.CodigoEmpresa.toString());
        formData.append('CodigoPropio', CodigoContactanosPortada);
        formData.append('CampoVinculado', 'CodigoEmpresa');
        formData.append('CampoPropio', 'CodigoContactanosPortada');
        formData.append('NombreCampoImagen', CampoDestino);

        this.ServicioContactanosPortada.SubirImagen(formData).subscribe({
          next: (Respuesta: any) => {
            if (Respuesta?.tipo === 'Éxito') {
              this.AlertaServicio.MostrarExito(Respuesta.message);
            }
            this.isLoading = false;
            this.ObtenerContactanosPortada();
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
      },
      error: (err) => {
        if (err?.error?.Alerta) {
          this.AlertaServicio.MostrarAlerta(err.error.Alerta, 'Atención');
        } else {
          this.AlertaServicio.MostrarError(err, 'No se pudo obtener la empresa');
        }
      }
    });
  }

  //Código relacionado a Redes Sociales
  ObtenerRedesSociales(): void {
    this.RedSocialServicio.Listado('Contacto').subscribe({
      next: (Respuesta: any) => {
        this.RedSocial = Respuesta.data;
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

  DesactivarRedSocial(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const estaActivo = input.checked; // true si activado, false si desactivado
    const Estatus = estaActivo ? 1 : 2;

    const red = this.RedSocial[index] || { CodigoRedSocial: '', Imagenes: [] };

    const CodigoRedSocial = red.CodigoRedSocial?.toString() || '';

    const datosEditar = {
      CodigoRedSocial,
      Estatus
    };

    this.RedSocialServicio.Editar(datosEditar).subscribe({
      next: (Respuesta) => {
        // Opcional: actualizar UI, mostrar alerta, etc.
        if (Respuesta?.tipo === 'Éxito') {
          this.AlertaServicio.MostrarExito(Respuesta.message);
        }
        this.ObtenerRedesSociales();
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

  EditarRedSocial(index: number): void {
    this.isLoading = true;
    const redEditada = this.RedSocial[index];

    if (!redEditada || !redEditada.NombreRedSocial || !redEditada.Link) {
      this.AlertaServicio.MostrarAlerta('Debe completar todos los campos antes de guardar.');
      return;
    }

    delete redEditada.UrlImagen;

    this.RedSocialServicio.Editar(redEditada).subscribe({
      next: (Respuesta) => {
        if (Respuesta?.tipo === 'Éxito') {
          this.AlertaServicio.MostrarExito(Respuesta.message);
        }
        this.MostrarListado[index] = false;
        this.isLoading = false;
        this.ObtenerRedesSociales();
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

  CrearRedSocial(nombre: string, link: string) {
    if (!nombre.trim() || !link.trim()) {
      this.AlertaServicio.MostrarAlerta('Debe completar todos los campos antes de guardar.');
      return;
    }
    if (this.RedSocial.length >= 8) {
      this.AlertaServicio.MostrarAlerta('Ya existen 8 registros en BD, no está permitido superar esa cantidad.');
      return;
    }
    this.isLoading = true;
    // Paso 1: Obtener empresa primero
    this.EmpresaServicio.Listado().subscribe({
      next: (empresas) => {
        if (!empresas || empresas.data.length === 0) {
          this.AlertaServicio.MostrarAlerta('No se encontró ninguna empresa.');
          this.isLoading = false;
          return;
        }

        const empresa = empresas.data[0];
        const CodigoEmpresa = empresa.CodigoEmpresa;

        const Datos = {
          NombreRedSocial: nombre,
          Link: link,
          CodigoEmpresa: CodigoEmpresa
        };

        this.RedSocialServicio.Crear(Datos).subscribe({
          next: (Respuesta) => {
            this.CodigoTemporal = Respuesta?.data?.CodigoRedSocial || null;

            if (this.imagenTemporalArchivo) {
              this.subirImagenRedSocial(this.imagenTemporalArchivo, null);
              this.imagenTemporalArchivo = null;
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
              this.AlertaServicio.MostrarAlerta(mensaje);
            } else {
              this.AlertaServicio.MostrarError({ error: { message: mensaje } });
            }
            this.errorMessage = mensaje;
          }
        });
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

  ActualizarImagenRedSocial(event: any, index: number | null): void {
    const file = event.target.files[0];
    if (!file) return;
    if (this.RedSocial.length >= 8) {
      this.AlertaServicio.MostrarAlerta('Ya existen 8 registros en BD, no está permitido superar esa cantidad.');
      return;
    }

    if (index !== null && this.RedSocial[index]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.RedSocial[index].UrlImagen = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    this.subirImagenRedSocial(file, index);
  }

  ActualizarImagenRedSocialTemporal(event: any, index: number | null): void {
    const file = event.target.files[0];
    if (!file) return;
    this.imagenTemporalArchivo = file;
    this.MostrarImagenTemporal()

    if (index !== null && this.RedSocial[index]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.RedSocial[index].UrlImagen = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  subirImagenRedSocial(file: File, index: number | null): void {
    this.isLoading = true;
    this.EmpresaServicio.ConseguirPrimeraEmpresa().subscribe({
      next: (empresa) => {
        if (!empresa) {
          this.AlertaServicio.MostrarAlerta('No se encontró ninguna empresa.');
          return;
        }

        const red = index !== null && this.RedSocial[index]
          ? this.RedSocial[index]
          : { CodigoRedSocial: '' };

        const CodigoRedSocial = red.CodigoRedSocial?.toString() || '';
        const CodigoRedSocialImagen = red?.Imagenes?.[0]?.CodigoRedSocialImagen?.toString() || '';

        const formData = new FormData();
        formData.append('Imagen', file);
        formData.append('CarpetaPrincipal', this.NombreEmpresa);
        formData.append('SubCarpeta', 'RedSocialImagen');
        formData.append('CodigoVinculado', this.CodigoTemporal?.toString() || CodigoRedSocial || '');
        formData.append('CodigoPropio', CodigoRedSocialImagen);
        formData.append('CampoVinculado', 'CodigoRedSocial');
        formData.append('CampoPropio', 'CodigoRedSocialImagen');
        formData.append('NombreCampoImagen', 'UrlImagen');

        this.RedSocialImagenServicio.SubirImagen(formData).subscribe({
          next: (res: any) => {

            const entidad = res?.data.Entidad;

            if (entidad?.UrlImagen) {
              this.ImagenTemporal = entidad.UrlImagen;
            }

            const codigoImagen = entidad?.CodigoRedSocialImagen;
            const codigoVinculo = entidad?.CodigoRedSocial;

            if (codigoImagen) {
              const datosEditar = {
                CodigoRedSocialImagen: codigoImagen,
                CodigoRedSocial: codigoVinculo,
                Ubicacion: 'Contacto'
              };
              this.RedSocialImagenServicio.Editar(datosEditar).subscribe({
                next: (Respuesta) => {
                  if (Respuesta?.tipo === 'Éxito') {
                    this.AlertaServicio.MostrarExito(Respuesta.message);
                  }
                  this.isLoading = false;
                  this.ObtenerRedesSociales();
                  this.imagenTemporalArchivo = null;
                  this.ImagenTemporal = '';
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

  EliminarRedSocial(index: number): void {
    const red = this.RedSocial[index];
    const codigo = red?.CodigoRedSocial;

    if (codigo === undefined) return;

    this.AlertaServicio.Confirmacion(
      '¿Estás seguro?',
      'Esta acción eliminará el registro de forma permanente.',
      'Sí, eliminar',
      'Cancelar'
    ).then(confirmado => {
      if (confirmado) {
        this.isLoading = true;
        this.RedSocialServicio.Eliminar(codigo).subscribe({
          next: (Respuesta) => {
            this.RedSocial.splice(index, 1);
            if (Respuesta?.tipo === 'Éxito') {
              this.AlertaServicio.MostrarExito(Respuesta.message);
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
              this.AlertaServicio.MostrarAlerta(mensaje);
            } else {
              this.AlertaServicio.MostrarError({ error: { message: mensaje } });
            }
            this.errorMessage = mensaje;
          }
        });
      }
    });
  }

  CrearReporteRedSocial(CodigoRedSocial: string): void {
    const DatosReporte = {
      CodigoRedSocial: CodigoRedSocial,
      Navegador: this.ObtenerNavegador()
    };

    this.ReporteRedSocialServicio.Crear(DatosReporte).subscribe({
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
  OcultarRedSocialInactivos() {
    if (this.Permiso.TienePermiso('RedSocial', 'VerUnidad')) {
      return this.RedSocial;
    } else {
      return this.RedSocial.filter(red => red.Estatus === 1);
    }
  }

}

