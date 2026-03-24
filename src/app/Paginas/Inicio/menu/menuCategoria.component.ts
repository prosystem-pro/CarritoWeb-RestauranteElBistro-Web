import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClasificacionProductoServicio } from '../../../Servicios/ClasificacionProductoServicio';
import { MenuPortadaServicio } from '../../../Servicios/MenuPortadaServicio';
import { HttpClient } from '@angular/common/http';
import { Entorno } from '../../../Entornos/Entorno';
import { Subscription } from 'rxjs';
import { CarruselImagenServicio } from '../../../Servicios/CarruselImagnServicio';
import { CarruselComponent } from '../../../Componentes/carrusel/carrusel.component';
import { CarruselServicio } from '../../../Servicios/CarruselServicio';
import { SvgDecoradorComponent } from '../../../Componentes/svg-decorador/svg-decorador.component';
import { Router } from '@angular/router';
import { ServicioCompartido } from '../../../Servicios/ServicioCompartido';
import { EmpresaServicio } from '../../../Servicios/EmpresaServicio';
import { AlertaServicio } from '../../../Servicios/Alerta-Servicio';
import { PermisoServicio } from '../../../Autorizacion/AutorizacionPermiso';
import { SpinnerGlobalComponent } from '../../../Componentes/spinner-global/spinner-global.component';

@Component({
  selector: 'app-menuCategoria',
  imports: [NgFor, NgIf, FormsModule, CommonModule, CarruselComponent, SvgDecoradorComponent, SpinnerGlobalComponent],
  templateUrl: './menuCategoria.component.html',
  styleUrl: './menuCategoria.component.css',
})
export class MenuCategoriaComponent implements OnInit {
  private NombreEmpresa = `${Entorno.NombreEmpresa}`;
  private textoBusquedaSubscription!: Subscription;

  errorMessage: string = '';
  isLoading: boolean = false;
  modoEdicion = false;
  mostrarPanelColor = false;
  menuPortada: any = null;
  clasificaciones: any[] = [];
  clasificacionesOriginales: any[] = [];
  tituloPrincipal: string = '';
  editandoTituloPrincipal: boolean = false;
  tituloPrincipalOriginal: string = '';
  tituloPrincipalTemporal: string = '';
  editandoTitulo: number | null = null;
  tituloOriginal: string = '';
  tituloTemporal: string = '';
  carruselData: any = null;
  detallesCarrusel: any = null;
  titulo: string = ''
  codigoCarrusel: number = 0;
  datosListos: boolean = false;
  empresaData: any = null;
  codigoEmpresa: number = 0;
  isLoadingCrear: boolean = false;

  nuevaCategoria = {
    titulo: '',
    imagenFile: null as File | null,
    imagenPreview: null,
  };
  error = false;

  coloresPredefinidos = [
    '#ff9500', //Default
    '#3498db', // Azul cielo
    '#2ecc71', // Verde esmeralda
    '#e74c3c', // Rojo coral
    '#f39c12', // Naranja ámbar
    '#9b59b6', // Púrpura amatista
    '#34495e', // Azul oscuro grisáceo
    '#ffffff', // Blanco
  ];

  constructor(
    private clasificacionProductoServicio: ClasificacionProductoServicio,
    private carruselServicio: CarruselServicio,
    private carruselImagenServicio: CarruselImagenServicio,
    private menuPortadaServicio: MenuPortadaServicio,
    private router: Router,
    private servicioCompartido: ServicioCompartido,
    private empresaServicio: EmpresaServicio,
    private alertaServicio: AlertaServicio,
    public Permiso: PermisoServicio,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.cargarDataEmpresa();
    this.cargarMenuPortada();
    this.cargarClasificaciones();
    this.cargarDatosCarrusel();
  }

  ngOnDestroy(): void {
    if (this.textoBusquedaSubscription) {
      this.textoBusquedaSubscription.unsubscribe();
    }
  }

  toggleColorPanel(): void {
    this.mostrarPanelColor = !this.mostrarPanelColor;
  }

  cargarMenuPortada(): void {
    this.isLoading = true;
    this.menuPortadaServicio.Listado().subscribe({
      next: (Respuesta) => {
        if (Respuesta && Respuesta.data.length > 0) {
          this.menuPortada = Respuesta.data[0];
          // Actualizar el título principal
          this.tituloPrincipal =
            this.menuPortada.TituloMenu || '';
          this.servicioCompartido.setDatosClasificacion({
            colorClasificacionFondo: this.menuPortada?.ColorFondoNombreClasificacion || '',
            colorClasificacionTexto: this.menuPortada?.ColorNombreClasificacion || '',
          });
          this.isLoading = false;
        } else {
          this.crearMenuPortadaPorDefecto();
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
      },
    });
  }

  // Crear MenuPortada si no existe
  private crearMenuPortadaPorDefecto(): void {
    this.empresaServicio.Listado().subscribe({
      next: (Respuesta) => {
        if (!Respuesta || Respuesta.data.length === 0) {
          console.error('No hay empresas disponibles');
          return;
        }
        const primeraEmpresa = Respuesta.data[0];
        const codigoEmpresa = primeraEmpresa.CodigoEmpresa;

        const menuPortadaDefecto = {
          CodigoEmpresa: codigoEmpresa,
          UrlImagenNavbar: '',
          UrlImagenPortadaIzquierdo: '',
          UrlImagenPortadaDerecho: '',
          TituloMenu: 'Nuestro Menú',
          ColorTituloMenu: '#ff9500',
          UrlImagenMenu: '',
          ColorContornoImagenClasificacion: '#ff9500',
          ColorNombreClasificacion: '#000000',
          ColorFondoNombreClasificacion: '#ff9500',
          UrlImagenPresentacion: '',
          Estatus: 1,
        };

        this.menuPortadaServicio.Crear(menuPortadaDefecto).subscribe({
          next: (response) => {
            if (response?.tipo === 'Éxito') {
              this.alertaServicio.MostrarExito(response.message);
            }
            this.menuPortada = response.data?.Entidad || response;
            this.tituloPrincipal = this.menuPortada.TituloMenu || '';
            this.servicioCompartido.setDatosClasificacion({
              colorClasificacionFondo: this.menuPortada?.ColorFondoNombreClasificacion || '',
              colorClasificacionTexto: this.menuPortada?.ColorNombreClasificacion || '',
            });
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
            this.menuPortada = menuPortadaDefecto;
            this.tituloPrincipal = menuPortadaDefecto.TituloMenu;
          }
        });
      },
      error: (err) => {
        console.error('Error al obtener empresas', err);
        // manejar error de listado de empresas si es necesario
      }
    });
  }


  cargarClasificaciones(): void {
    this.isLoading = true;
    this.clasificacionProductoServicio.Listado().subscribe({
      next: (Respuesta: any) => {
        // Asegurarte de que lo que llegue sea un array
        const arreglo = Array.isArray(Respuesta) ? Respuesta : Respuesta.data || [];

        this.clasificaciones = arreglo.filter(
          (item: any) =>
            item.NombreClasificacionProducto &&
            item.NombreClasificacionProducto.trim() !== '' &&
            item.CodigoClasificacionProducto !== 0
        );

        this.clasificacionesOriginales = [...this.clasificaciones];
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
      },
    });
  }


  cargarDatosCarrusel(): void {
    this.isLoading = true;
    this.carruselServicio.Listado().subscribe({
      next: (Respuesta) => {
        // Buscar carrusel únicamente por ubicación 'MenuCategoria'
        let carruselMenuCategoria = null;
        if (Respuesta && Respuesta.data.length > 0) {
          carruselMenuCategoria = Respuesta.data.find(
            (c: any) => c.Ubicacion === 'MenuCategoria'
          );
        }

        if (carruselMenuCategoria) {
          this.carruselData = carruselMenuCategoria;
          this.codigoCarrusel = this.carruselData.CodigoCarrusel;
          this.titulo = this.carruselData.NombreCarrusel;
          this.cargarImagenesCarrusel();
        } else {
          this.crearCarruselPorDefecto();
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

  // Crear Carrusel si no existe
  private crearCarruselPorDefecto(): void {
    this.isLoading = true;
    const carruselDefecto = {
      CodigoEmpresa: this.codigoEmpresa,
      NombreCarrusel: 'Galería de Menú',
      Descripcion: 'Carrusel de imágenes para la sección de categorías de menú',
      Ubicacion: 'MenuCategoria',
      Estatus: 1
    };

    this.carruselServicio.Crear(carruselDefecto).subscribe({
      next: (response) => {
        if (response?.tipo === 'Éxito') {
          this.alertaServicio.MostrarExito(response.message);
        }
        this.carruselData = response.data.Entidad || response;
        this.codigoCarrusel = this.carruselData.CodigoCarrusel;
        this.titulo = this.carruselData.NombreCarrusel;
        this.cargarImagenesCarrusel();
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
        // Usar datos por defecto para que la interfaz no se rompa
        this.carruselData = carruselDefecto;
        this.detallesCarrusel = [];
        this.datosListos = true;
      }
    });
  }

  private cargarImagenesCarrusel(): void {
    if (this.carruselData?.CodigoCarrusel) {
      this.carruselImagenServicio.ListadoCarrusel(this.carruselData.CodigoCarrusel).subscribe({
        next: (data) => {
          this.detallesCarrusel = data.data;
          this.datosListos = true;
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
          this.detallesCarrusel = [];
          this.datosListos = true;
        }
      });
    }
  }

  cargarDataEmpresa(): void {
    this.empresaServicio.Listado().subscribe({
      next: (Respuesta) => {
        this.empresaData = Respuesta.data[0];
        this.codigoEmpresa = this.empresaData.CodigoEmpresa;
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

  toggleModoEdicion() {
    this.modoEdicion = !this.modoEdicion;
    document.body.classList.toggle('modoEdicion', this.modoEdicion);

    if (!this.modoEdicion) {
      this.mostrarPanelColor = false;
      this.resetNuevaCategoria();
    }
  }

  iniciarEdicionTituloPrincipal() {
    this.tituloPrincipalOriginal = this.tituloPrincipal;
    this.editandoTituloPrincipal = true;
    this.tituloPrincipalTemporal = this.tituloPrincipal;
  }

  onTituloPrincipalInput(evento: any) {
    this.tituloPrincipalTemporal = evento.target.textContent;
  }

  guardarTituloPrincipal() {
    this.tituloPrincipal = this.tituloPrincipalTemporal.trim();

    if (this.menuPortada) {
      this.menuPortada.TituloMenu = this.tituloPrincipal;
      this.actualizarMenuPortada();
    }

    this.editandoTituloPrincipal = false;
  }

  cancelarEdicionTituloPrincipal() {
    this.tituloPrincipal = this.tituloPrincipalOriginal;
    this.editandoTituloPrincipal = false;
  }

  iniciarEdicionTitulo(clasificacion: any) {
    this.tituloOriginal = clasificacion.NombreClasificacionProducto;
    this.editandoTitulo = clasificacion.CodigoClasificacionProducto;
    this.tituloTemporal = clasificacion.NombreClasificacionProducto;
  }

  onTituloInput(evento: any, clasificacion: any) {
    this.tituloTemporal = evento.target.textContent;
  }

  guardarTituloClasificacion(clasificacion: any) {
    clasificacion.NombreClasificacionProducto = this.tituloTemporal.trim();
    this.actualizarClasificacion(clasificacion);
    this.editandoTitulo = null;
    this.alertaServicio.MostrarExito('Título guardado correctamente', 'Éxito');
  }

  cancelarEdicionTitulo(clasificacion: any) {
    clasificacion.NombreClasificacionProducto = this.tituloOriginal;
    const elements = document.querySelectorAll(
      '[data-id="' + clasificacion.CodigoClasificacionProducto + '"]'
    );
    if (elements.length > 0) {
      elements[0].textContent = this.tituloOriginal;
    }
    this.editandoTitulo = null;
  }

  cambiarImagen(evento: any, clasificacion: any) {
    const file = evento.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        clasificacion.imagenPreview = e.target.result;
      };
      reader.readAsDataURL(file);

      this.subirImagen(file, clasificacion);
    }
  }

  seleccionarImagenNuevaCategoria(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.nuevaCategoria.imagenPreview = e.target.result;
      };
      reader.readAsDataURL(file);

      this.nuevaCategoria.imagenFile = file;
    }
  }

  actualizarImagenPortadaIzquierda(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.subirImagenDecorativo(file, 'UrlImagenPortadaIzquierdo');
    }
  }

  actualizarImagenPortadaDerecha(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.subirImagenDecorativo(file, 'UrlImagenPortadaDerecho');
    }
  }

  actualizarImagenTemporada(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.subirImagenDecorativo(file, 'UrlImagenPresentacion');
    }
  }

  subirImagenDecorativo(file: File, campoDestino: string): void {
    this.isLoading = true;
    const formData = new FormData();
    formData.append('Imagen', file);
    formData.append('CarpetaPrincipal', this.NombreEmpresa);
    formData.append('SubCarpeta', 'MenuPortada');
    formData.append('CodigoVinculado', this.menuPortada.CodigoEmpresa);
    formData.append('CodigoPropio', this.menuPortada.CodigoMenuPortada);
    formData.append('CampoVinculado', 'CodigoEmpresa');
    formData.append('CampoPropio', 'CodigoMenuPortada');
    formData.append('NombreCampoImagen', campoDestino);

    this.menuPortadaServicio.SubirImagen(formData).subscribe({
      next: (response: any) => {
        if (response && response.data.Entidad && response.data.Entidad[campoDestino]) {
          this.menuPortada[campoDestino] = response.data.Entidad[campoDestino];
          const {
            UrlImagenNavbar,
            UrlImagenPortadaIzquierdo,
            UrlImagenPortadaDerecho,
            UrlImagenMenu,
            UrlImagenPresentacion,
            ...datosActualizados
          } = this.menuPortada;

          this.menuPortadaServicio.Editar(datosActualizados).subscribe({
            next: (Respuesta) => {
              if (Respuesta?.tipo === 'Éxito') {
                this.alertaServicio.MostrarExito(Respuesta.message);
              }
              this.cargarMenuPortada();
              this.isLoading = false;
              this.modoEdicion = false;
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

  subirImagenNuevaCategoria() {
    this.isLoading = true;
    if (this.nuevaCategoria.titulo && this.nuevaCategoria.imagenFile) {
      // Verificar si ya existe una clasificacion con el mismo nombre
      if (
        this.nuevaCategoria.titulo &&
        this.existeClasificacionConMismoNombre(this.nuevaCategoria.titulo)
      ) {
        this.alertaServicio.MostrarAlerta(
          'Ya existe una clasificación con el mismo nombre. Por favor, elija otro nombre.'
        );
        this.isLoading = false;
        return;
      }

      const formData = new FormData();
      formData.append('Imagen', this.nuevaCategoria.imagenFile);
      formData.append('CarpetaPrincipal', this.NombreEmpresa);
      formData.append('SubCarpeta', 'ClasificacionProducto');
      formData.append('CodigoVinculado', this.codigoEmpresa.toString() || '1');
      formData.append('CodigoPropio', ''); // Vacío para que el servidor cree uno nuevo
      formData.append('CampoVinculado', 'CodigoEmpresa');
      formData.append('CampoPropio', 'CodigoClasificacionProducto');
      formData.append('NombreCampoImagen', 'UrlImagen');

      this.clasificacionProductoServicio.SubirImagen(formData).subscribe({
        next: (response: any) => {
          if (response && response.data.Entidad) {
            // Construir objeto con los datos recibidos
            const nuevaClasificacionCompleta = {
              CodigoClasificacionProducto: response.data.Entidad.CodigoClasificacionProducto,
              CodigoEmpresa: this.codigoEmpresa,
              NombreClasificacionProducto: this.nuevaCategoria.titulo,
              UrlImagen: response.data.Entidad.UrlImagen || '',
              Estatus: 1,
            };

            // Excluir UrlImagen para enviar solo datos que deben actualizarse
            const { UrlImagen, ...datosActualizados } = nuevaClasificacionCompleta;

            this.clasificacionProductoServicio.Editar(datosActualizados).subscribe({
              next: (Respuesta) => {
                if (Respuesta?.tipo === 'Éxito') {
                  this.alertaServicio.MostrarExito(Respuesta.message);
                }
                this.isLoading = false;
                this.cargarClasificaciones();
                this.resetNuevaCategoria();
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
                this.cargarClasificaciones();
              },
            });
          } else {
            this.isLoadingCrear = false;
            this.alertaServicio.MostrarError('Error al procesar la respuesta del servidor', 'Error');
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
        },
      });
    }
  }

  existeClasificacionConMismoNombre(nombre: string | undefined): boolean {
    if (!nombre || nombre.trim() === '') return false;

    const nombreNormalizado = nombre.trim().toLowerCase();
    return this.clasificaciones.some(
      (clasificacion) =>
        clasificacion.NombreClasificacionProducto &&
        clasificacion.NombreClasificacionProducto.trim().toLowerCase() === nombreNormalizado
    );
  }

  subirImagen(file: File, clasificacion: any): void {
    this.isLoading = true;
    const formData = new FormData();
    formData.append('Imagen', file);
    formData.append('CarpetaPrincipal', this.NombreEmpresa);
    formData.append('SubCarpeta', 'ClasificacionProducto');
    formData.append('CodigoVinculado', clasificacion.CodigoEmpresa.toString());
    formData.append('CodigoPropio', clasificacion.CodigoClasificacionProducto.toString());
    formData.append('CampoVinculado', 'CodigoEmpresa');
    formData.append('CampoPropio', 'CodigoClasificacionProducto');
    formData.append('NombreCampoImagen', 'UrlImagen');

    this.clasificacionProductoServicio.SubirImagen(formData).subscribe({
      next: (response: any) => {
        if (response && response.data.Entidad && response.data.Entidad.UrlImagen) {
          // Actualizar la imagen localmente
          clasificacion.UrlImagen = response.data.Entidad.UrlImagen;

          // Excluir UrlImagen para la actualización al backend
          const { UrlImagen, ...datosActualizados } = clasificacion;
          this.clasificacionProductoServicio.Editar(datosActualizados).subscribe({
            next: (response) => {
              if (response?.tipo === 'Éxito') {
                this.alertaServicio.MostrarExito(response.message);
              }
              this.isLoading = false;
              this.cargarClasificaciones();
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
          this.alertaServicio.MostrarError('Error al procesar la respuesta del servidor');
          console.warn('No se pudo obtener la URL de la imagen', response);
          this.cargarClasificaciones();
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
      },
    });
  }

  // Actualiza una clasificación en el servidor
  actualizarClasificacion(clasificacion: any): void {
    delete clasificacion.UrlImagen;
    this.clasificacionProductoServicio.Editar(clasificacion).subscribe({
      next: (response) => {
        this.cargarClasificaciones();
      },
      error: (error) => {
        console.error('Error al actualizar clasificación:', error);
      },
    });
  }

  eliminarCategoria(clasificacion: any): void {
    this.alertaServicio.Confirmacion(
      '¿Estás seguro de que deseas eliminar esta categoría?',
      'Esta acción no se puede deshacer.'
    ).then((confirmado) => {
      if (confirmado) {
        this.isLoading = true;
        this.clasificacionProductoServicio
          .Eliminar(clasificacion.CodigoClasificacionProducto)
          .subscribe({
            next: (response) => {
              if (response?.tipo === 'Éxito') {
                this.alertaServicio.MostrarExito(response.message);
              }
              this.isLoading = false;
              const index = this.clasificaciones.findIndex(
                (c) => c.CodigoClasificacionProducto === clasificacion.CodigoClasificacionProducto
              );

              if (index !== -1) {
                this.clasificaciones.splice(index, 1);
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
            },
          });
      }
    });
  }

  resetNuevaCategoria() {
    this.nuevaCategoria = {
      titulo: '',
      imagenFile: null,
      imagenPreview: null,
    };
  }

  // EXCLUIR URLs de imágenes en todas las actualizaciones
  actualizarMenuPortada(): void {
    this.isLoading = true;
    if (this.menuPortada) {
      const {
        UrlImagenNavbar,
        UrlImagenPortadaIzquierdo,
        UrlImagenPortadaDerecho,
        UrlImagenMenu,
        UrlImagenPresentacion,
        ...datosActualizados
      } = this.menuPortada;

      if (this.menuPortada.CodigoMenuPortada === 0) {
        this.menuPortadaServicio.Crear(datosActualizados).subscribe({
          next: (response) => {
            if (response?.tipo === 'Éxito') {
              this.alertaServicio.MostrarExito(response.message);
            }
            if (response && response.Entidad) {
              this.menuPortada.CodigoMenuPortada = response.Entidad.CodigoMenuPortada;
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

          },
        });
      } else {
        this.menuPortadaServicio.Editar(datosActualizados).subscribe({
          next: (response) => {
            if (response?.tipo === 'Éxito') {
              this.alertaServicio.MostrarExito(response.message);
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

          },
        });
      }
    }
  }

  crearEditarMenuPortada(): void {
    if (this.menuPortada) {
      const {
        UrlImagenNavbar,
        UrlImagenPortadaIzquierdo,
        UrlImagenPortadaDerecho,
        UrlImagenMenu,
        UrlImagenPresentacion,
        ...datosActualizados
      } = this.menuPortada;

      this.menuPortadaServicio.CrearEditar(datosActualizados).subscribe({
        next: (response) => {
          if (response && response.data.Entidad) {
            this.menuPortada.CodigoMenuPortada = response.data.Entidad.CodigoMenuPortada;
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
        },
      });
    }
  }

  cambiarColorContorno(color: string): void {
    if (this.menuPortada) {
      this.menuPortada.ColorContornoImagenClasificacion = color;
      this.actualizarMenuPortada();
    }
  }

  cambiarColorFondoBoton(color: string): void {
    if (this.menuPortada) {
      this.menuPortada.ColorFondoNombreClasificacion = color;
      this.actualizarMenuPortada();
    }
  }

  cambiarColorTextoBoton(color: string): void {
    if (this.menuPortada) {
      this.menuPortada.ColorNombreClasificacion = color;
      this.actualizarMenuPortada();
    }
  }

  cambiarColorTitulo(color: string): void {
    if (this.menuPortada) {
      this.menuPortada.ColorTituloMenu = color;
      this.actualizarMenuPortada();
    }
  }

  navegar(ruta: string, codigo: string, nombre: string) {
    this.router.navigate([ruta, codigo, nombre]);
  }

  onColorChange(color: string) {
    this.menuPortada.ColorFondoNombreClasificacion = color;
    this.servicioCompartido.setDatosClasificacion({
      colorClasificacionFondo: color,
      colorClasificacionTexto: this.menuPortada.ColorNombreClasificacion,
    });
  }
}