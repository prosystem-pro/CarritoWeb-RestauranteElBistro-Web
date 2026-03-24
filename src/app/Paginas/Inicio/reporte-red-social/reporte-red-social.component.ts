import { Component, ViewChild, ElementRef } from '@angular/core';
import { ReporteRedSocialServicio } from '../../../Servicios/ReporteRedSocialServicio';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { FormsModule } from '@angular/forms';
import { HeaderReporteComponent } from '../../../Componentes/header-reporte/header-reporte.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { AlertaServicio } from '../../../Servicios/Alerta-Servicio';
import { SpinnerGlobalComponent } from '../../../Componentes/spinner-global/spinner-global.component';


@Component({
  selector: 'app-reporte-red-social',
  imports: [HeaderReporteComponent, BaseChartDirective, FormsModule, CommonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    SpinnerGlobalComponent],
  templateUrl: './reporte-red-social.component.html',
  styleUrl: './reporte-red-social.component.css'
})
export class ReporteRedSocialComponent {
  errorMessage: string = '';
  isLoading: boolean = false;
  TopRedesSociales: any[] = [];
  TotalSolicitudMes: number = 0;
  TopProductos: any[] = [];
  ConseguirAnio = new Date().getFullYear();
  AnioTemporal: number = this.ConseguirAnio;
  MesTemporal: number = new Date().getMonth() + 1;

  Meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Ma\u200Byo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  GraficoLineal: any = 'line';
  ConfiguracionGraficoLineal: any = {
    labels: [],
    datasets: [{
      data: [],
      borderColor: '',
      backgroundColor: '',
      fill: false,
      tension: 0.3,
      pointRadius: 5,
      pointHoverRadius: 7,
      borderWidth: 2
    }]
  };
  GraficoRadar: any = 'polarArea';
  ConfiguracionGraficoRadar: any = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [] }]
  };

  GraficoBarra: any = 'bar';
  ConfiguracionGraficoBarra: any = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [] }]
  };

  constructor(private Servicio: ReporteRedSocialServicio, private AlertaServicio: AlertaServicio) {
    this.ObtenerDatos();
  }

  ObtenerDatos() {

    const Anio = this.AnioTemporal;
    const Mes = this.MesTemporal;

    this.Servicio.ObtenerResumen(Anio, Mes).subscribe({
      next: (res) => {
        this.TotalSolicitudMes = 0;
        // Guardamos total solicitudes por mes
        if (res.data.SolicitudTotalMes && typeof res.data.SolicitudTotalMes === 'number') {
          this.TotalSolicitudMes = res.data.SolicitudTotalMes;
        }

        // Línea - ResumenPorDiaMes
        if (res.data.SolicitudesDiaMes && Array.isArray(res.data.SolicitudesDiaMes)) {
          const labelsLine = res.data.SolicitudesDiaMes.map((item: any) => item.dia);
          const dataLine = res.data.SolicitudesDiaMes.map((item: any) => item.total); // << CORREGIDO

          const colorHue = Math.floor(Math.random() * 360);
          const borderColorLine = `hsl(${colorHue}, 70%, 50%)`;
          const backgroundColorLine = `hsla(${colorHue}, 70%, 60%, 0.3)`;

          this.ConfiguracionGraficoLineal = {
            labels: labelsLine,
            datasets: [{
              data: dataLine,
              borderColor: borderColorLine,
              backgroundColor: backgroundColorLine,
              fill: false,
              tension: 0.3,
              pointRadius: 5,
              pointHoverRadius: 7,
              borderWidth: 2
            }]
          };
        }
        // Tarjetas - Top Redes Sociales
        if (res.data.TopRedesSociales && Array.isArray(res.data.TopRedesSociales)) {
          this.TopRedesSociales = res.data.TopRedesSociales.map((item: any) => ({
            Nombre: item.nombre,
            Total: item.total,
            UrlImagen: item.urlImagen
          }));
        }
        // Radar - ResumenRedesSociales
        if (res.data.ResumenRedesSociales && Array.isArray(res.data.ResumenRedesSociales)) {
          const labels = res.data.ResumenRedesSociales.map((item: any) => item.nombre);
          const data = res.data.ResumenRedesSociales.map((item: any) => item.total);
          const backgroundColor = this.GenerarColoresAleatorios(labels.length);

          this.ConfiguracionGraficoRadar = {
            labels,
            datasets: [{
              data,
              backgroundColor
            }]
          };
        }
        // Barra - SolicitudesAño
        if (res.data.SolicitudesPorMes && res.data.SolicitudesPorMes && Array.isArray(res.data.SolicitudesPorMes)) {
          const labelsBar = res.data.SolicitudesPorMes.map((item: any) => item.nombre);
          const dataBar = res.data.SolicitudesPorMes.map((item: any) => item.total);
          const backgroundColorBar = this.GenerarColoresAleatorios(labelsBar.length);

          this.ConfiguracionGraficoBarra = {
            labels: labelsBar,
            datasets: [{
              data: dataBar,
              backgroundColor: backgroundColorBar
            }]
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

  GenerarColoresAleatorios(cantidad: number): string[] {
    const colores: string[] = [];
    for (let i = 0; i < cantidad; i++) {
      const hue = Math.floor(Math.random() * 360);
      colores.push(`hsl(${hue}, 70%, 60%)`);
    }
    return colores;
  }
  DetectarCambiosAnio(event: any) {
    this.AnioTemporal = +event.target.value;
    this.ObtenerDatos();
  }

  DetectarCambiosMes(event: any) {
    this.MesTemporal = +event.target.value;
    this.ObtenerDatos();
  }

}
