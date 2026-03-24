import { Component, ViewChild, ElementRef } from '@angular/core';
import { ReporteVistaServicio } from '../../../Servicios/ReporteVistaServicio';
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
  selector: 'app-reporte-vista',
  imports: [HeaderReporteComponent, BaseChartDirective, FormsModule, CommonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    SpinnerGlobalComponent
  ],
  templateUrl: './reporte-vista.component.html',
  styleUrl: './reporte-vista.component.css'
})
export class ReporteVistaComponent {
  @ViewChild('selectorFecha') selectorFecha!: ElementRef<HTMLInputElement>;
  errorMessage: string = '';
  isLoading: boolean = false;
  TotalSolicitudMes: number = 0;
  TopProductos: any[] = [];
  ConseguirAnio = new Date().getFullYear();
  AnioTemporal: number = this.ConseguirAnio;
  MesTemporal: number = new Date().getMonth() + 1;
  DiaSeleccionado: string = String(new Date().getDate()).padStart(2, '0');
  FechaSeleccionada: Date = new Date(this.AnioTemporal, this.MesTemporal - 1, parseInt(this.DiaSeleccionado));


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

  constructor(private Servicio: ReporteVistaServicio, private AlertaServicio: AlertaServicio) {
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



        // PolarArea - SolicitudesDiaMes con selección de día
        if (res.data.SolicitudesDiaMes && Array.isArray(res.data.SolicitudesDiaMes)) {
          const totalMes = res.data.SolicitudesDiaMes.reduce((sum: number, item: { total: number }) => sum + item.total, 0);
          const diaObj = res.data.SolicitudesDiaMes.find((item: { dia: string }) => item.dia === this.DiaSeleccionado);
          const totalDia = diaObj ? diaObj.total : 0;
          const totalResto = totalMes - totalDia;

          const labels = [`Resto del mes`, `Día ${this.DiaSeleccionado}`];
          const data = [totalResto, totalDia];
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
    this.FechaSeleccionada = new Date(this.AnioTemporal, this.MesTemporal - 1, parseInt(this.DiaSeleccionado) || 1);
    this.ObtenerDatos();
  }

  DetectarCambiosMes(event: any) {
    this.MesTemporal = +event.target.value;
    this.FechaSeleccionada = new Date(this.AnioTemporal, this.MesTemporal - 1, parseInt(this.DiaSeleccionado) || 1);
    this.ObtenerDatos();
  }

  CambiarDiaSeleccionado(fecha: Date | null) {
    if (!fecha) return;

    this.DiaSeleccionado = String(fecha.getDate()).padStart(2, '0');
    this.MesTemporal = fecha.getMonth() + 1;
    this.AnioTemporal = fecha.getFullYear();

    this.FechaSeleccionada = new Date(this.AnioTemporal, this.MesTemporal - 1, parseInt(this.DiaSeleccionado));

    this.ObtenerDatos();
  }

  // Si actualizas MesTemporal o AnioTemporal en otro lugar, sincroniza también:
  ActualizarFechaSeleccionada() {
    this.FechaSeleccionada = new Date(this.AnioTemporal, this.MesTemporal - 1, parseInt(this.DiaSeleccionado));
  }
}
