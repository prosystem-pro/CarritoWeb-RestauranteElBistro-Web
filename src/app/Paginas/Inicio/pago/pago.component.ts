import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PagoServicio } from '../../../Servicios/PagoServicio';
import { CommonModule } from '@angular/common';
import { Entorno } from '../../../Entornos/Entorno';
import { AlertaServicio } from '../../../Servicios/Alerta-Servicio';
import { EmpresaServicio } from '../../../Servicios/EmpresaServicio';
import { HttpClient } from '@angular/common/http';
import { PermisoServicio } from '../../../Autorizacion/AutorizacionPermiso';
import { SpinnerGlobalComponent } from '../../../Componentes/spinner-global/spinner-global.component';


@Component({
  selector: 'app-pago',
  imports: [FormsModule, CommonModule, ReactiveFormsModule, SpinnerGlobalComponent],
  templateUrl: './pago.component.html',
  styleUrl: './pago.component.css'
})
export class PagoComponent implements OnInit {
  Pagos: any[] = [];
  AnioSeleccionado: number = new Date().getFullYear();
  private NombreEmpresa = `${Entorno.NombreEmpresa}`;
  private Url = `${Entorno.ApiUrl}`;
  Cargando: boolean = false;
  MostrarModal: boolean = false;
  ComprobanteSeleccionado: string | null = null;
  errorMessage: string = '';
  isLoading: boolean = false;


  constructor(
    private Servicio: PagoServicio,
    private AlertaServicio: AlertaServicio,
    private EmpresaServicio: EmpresaServicio,
    private http: HttpClient,
    public Permiso: PermisoServicio,
  ) { }

  ngOnInit(): void {
    this.Listado();
  }

  Listado() {
    this.Servicio.Listado(this.AnioSeleccionado).subscribe({
      next: (res) => {
        this.Pagos = res.data;
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
      },
    });
  }
  DiasRestantes(fecha: string): number {
    const hoy = new Date();
    const vencimiento = new Date(fecha);

    const diff = vencimiento.getTime() - hoy.getTime();

    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  AbrirSelectorArchivo(codigoPago: number): void {
    const inputFile = document.getElementById('fileInput-' + codigoPago) as HTMLInputElement | null;
    if (inputFile) {
      inputFile.click();
    }
  }

  ArchivoSeleccionado(event: Event, codigoPago: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.SubirImagen(file, codigoPago);
    } else {
      this.AlertaServicio.MostrarAlerta('No se seleccionó ningún archivo.');
    }
  }

  SubirImagen(file: File, codigoPago: number): void {
    const NombreEmpresa = this.NombreEmpresa ?? 'defaultCompanyName';
    this.isLoading = true;

    this.EmpresaServicio.ConseguirPrimeraEmpresa().subscribe({
      next: (empresa) => {
        if (!empresa) {
          this.isLoading = false;
          this.AlertaServicio.MostrarAlerta('No se encontró ninguna empresa.');
          return;
        }

        const formData = new FormData();
        formData.append('Imagen', file);
        formData.append('CarpetaPrincipal', NombreEmpresa);
        formData.append('SubCarpeta', 'Pago');
        formData.append('CodigoVinculado', empresa.CodigoEmpresa.toString());
        formData.append('CodigoPropio', codigoPago.toString());
        formData.append('CampoVinculado', 'CodigoEmpresa');
        formData.append('CampoPropio', 'CodigoPago');
        formData.append('NombreCampoImagen', 'UrlComprobante');

        this.Servicio.SubirImagen(formData).subscribe({
          next: (response: any) => {

            const CodigoPago = response?.data.CodigoPago ?? codigoPago;
            const Datos = { CodigoPago: CodigoPago, Estatus: 2 };

            this.Servicio.Editar(Datos).subscribe({
              next: (Respuesta) => {

                if (Respuesta?.tipo === 'Éxito') {
                  this.AlertaServicio.MostrarExito(Respuesta.message);
                }
                this.isLoading = false;
                this.Listado();
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
          },
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
      },
    });
  }

  VerComprobante(url: string) {
    this.ComprobanteSeleccionado = url;
    this.MostrarModal = true;
  }

}
