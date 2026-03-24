import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RedSocialImagenServicio } from '../../Servicios/RedSocialImagenServicio';
import { RedSocialServicio } from '../../Servicios/RedSocialServicio';
import { PermisoServicio } from '../../Autorizacion/AutorizacionPermiso';
import { AlertaServicio } from '../../Servicios/Alerta-Servicio';
import { Entorno } from '../../Entornos/Entorno';
import { ReporteRedSocialServicio } from '../../Servicios/ReporteRedSocialServicio';
import { SpinnerGlobalComponent } from '../spinner-global/spinner-global.component';

@Component({
  selector: 'app-sidebar-red-social',
  imports: [CommonModule, SpinnerGlobalComponent],
  templateUrl: './sidebar-red-social.component.html',
  styleUrl: './sidebar-red-social.component.css',
})
export class SidebarRedSocialComponent implements OnInit {
  private Url = `${Entorno.ApiUrl}`;
  private NombreEmpresa = `${Entorno.NombreEmpresa}`;
  RedeSocial: any = [];
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private redSocialImagenServicio: RedSocialImagenServicio,
    private redSocialServicio: RedSocialServicio,
    public Permiso: PermisoServicio,
    private http: HttpClient,
    private AlertaServicio: AlertaServicio,
    private ReporteRedSocialServicio: ReporteRedSocialServicio
  ) { }

  ngOnInit(): void {
    this.cargarRedesSociales();
  }

  ReportarRedSocial(codigo: number | undefined): void {
    if (codigo === undefined) {
      console.warn('⚠️ Código de red social no definido, no se reporta');
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
    this.redSocialServicio.Listado('SocialSidebar').subscribe({
      next: (Respuesta) => {
        this.RedeSocial = Respuesta.data.filter((red: any) => red.Estatus === 1);
      },
      error: (error) => { },
    });
  }

  // Método para actualizar imagen de red social
  actualizarImagenRedSocial(event: any, codigoRedSocial: number): void {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    if (!codigoRedSocial) {
      this.AlertaServicio.MostrarError('No se pudo identificar la red social');
      return;
    }

    // Buscar la red social específica
    const redSocial = this.RedeSocial.find(
      (red: any) => red.CodigoRedSocial === codigoRedSocial
    );
    if (!redSocial) {
      this.AlertaServicio.MostrarError('Red social no encontrada');
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
        redSocial.Imagenes = [
          {
            CodigoRedSocialImagen: null,
            UrlImagen: e.target.result,
            Ubicacion: 'SocialSidebar',
          },
        ];
      }
    };
    reader.readAsDataURL(file);

    // Subir la imagen al servidor
    this.subirImagenRedSocial(file, codigoRedSocial, redSocial);
  }

  subirImagenRedSocial(
    file: File,
    codigoRedSocial: number,
    redSocial: any
  ): void {
    this.isLoading = true;
    const formData = new FormData();
    formData.append('Imagen', file);
    formData.append('CarpetaPrincipal', this.NombreEmpresa);
    formData.append('SubCarpeta', 'RedSocialImagen');
    formData.append('CodigoVinculado', codigoRedSocial.toString());

    // Verificar si ya existe una imagen para esta red social en SocialSidebar
    const imagenExistente = redSocial.Imagenes?.find(
      (img: any) => img.Ubicacion === 'SocialSidebar'
    );
    const tieneImagenValida =
      imagenExistente && imagenExistente.CodigoRedSocialImagen;

    if (tieneImagenValida) {
      // Si ya existe con código válido, usar para actualización
      formData.append(
        'CodigoPropio',
        imagenExistente.CodigoRedSocialImagen.toString()
      );
    } else {
      // Si no existe o no tiene código, dejar vacío para creación
      formData.append('CodigoPropio', '');
    }

    formData.append('CampoVinculado', 'CodigoRedSocial');
    formData.append('CampoPropio', 'CodigoRedSocialImagen');
    formData.append('NombreCampoImagen', 'UrlImagen');

    this.redSocialImagenServicio.SubirImagen(formData).subscribe({
      next: (response) => {

        if (response && response.data.Entidad && response.data.Entidad.UrlImagen) {
          this.procesarRespuestaImagen(codigoRedSocial, response, redSocial);
        } else {
          const imageUrl =
            response.data.UrlImagenPortada ||
            response.data.url ||
            (response.data.Entidad ? response.data.Entidad.UrlImagenPortada : null);

          if (imageUrl) {
            this.procesarRespuestaImagen(
              codigoRedSocial,
              { Entidad: { UrlImagen: imageUrl } },
              redSocial
            );
          } else {
            this.AlertaServicio.MostrarError('Error al obtener la URL de la imagen');
          }
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

        this.cargarRedesSociales();
      },
    });
  }

  procesarRespuestaImagen(
    codigoRedSocial: number,
    response: any,
    redSocial: any
  ): void {
    const urlImagen = response.data.Entidad.UrlImagen;

    // Verificar si ya existe una imagen para esta red social en SocialSidebar
    const imagenExistente = redSocial.Imagenes?.find(
      (img: any) => img.Ubicacion === 'SocialSidebar'
    );

    if (imagenExistente && imagenExistente.CodigoRedSocialImagen) {
      // ACTUALIZAR: Ya existe una imagen con código válido en SocialSidebar
      this.actualizarRegistroRedSocialImagen(
        imagenExistente.CodigoRedSocialImagen,
        urlImagen
      );
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

  crearRegistroRedSocialImagen(
    codigoRedSocial: number,
    urlImagen: string
  ): void {
    const datosNuevos = {
      CodigoRedSocial: codigoRedSocial,
      Ubicacion: 'SocialSidebar', // Valor quemado como solicitaste
      Estatus: 1, // Agregar estatus activo
    };

    this.redSocialImagenServicio.Crear(datosNuevos).subscribe({
      next: (response) => {
        if (response?.tipo === 'Éxito') {
          this.AlertaServicio.MostrarExito(response.message);

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
          this.AlertaServicio.MostrarAlerta(mensaje);
        } else {
          this.AlertaServicio.MostrarError({ error: { message: mensaje } });
        }
        this.errorMessage = mensaje;
        // Recargar las redes sociales para revertir cambios
        this.cargarRedesSociales();
      },
    });
  }

  actualizarRegistroRedSocialImagen(
    codigoRedSocialImagen: number,
    urlImagen: string
  ): void {
    const datosActualizados = {
      CodigoRedSocialImagen: codigoRedSocialImagen,
      Ubicacion: 'SocialSidebar', // Valor quemado como solicitaste
      Estatus: 1, // Mantener estatus activo
    };

    this.redSocialImagenServicio.Editar(datosActualizados).subscribe({
      next: (response) => {
        if (response?.tipo === 'Éxito') {
          this.AlertaServicio.MostrarExito(response.message);
        }
        this.isLoading = false;
        // Recargar las redes sociales para obtener los datos actualizados
        setTimeout(() => this.cargarRedesSociales(), 500);
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
        // Recargar las redes sociales para revertir cambios
        this.cargarRedesSociales();
      },
    });
  }
}
