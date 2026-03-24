import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { ReporteTiempoPaginaServicio } from '../../../Servicios/ReporteTiempoPaginaServicio';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderReporteComponent } from '../../../Componentes/header-reporte/header-reporte.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { SpinnerGlobalComponent } from '../../../Componentes/spinner-global/spinner-global.component';
import { AlertaServicio } from '../../../Servicios/Alerta-Servicio';

@Component({
  selector: 'app-reporte-tiempo-pagina',
  imports: [HeaderReporteComponent, FormsModule, CommonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    SpinnerGlobalComponent
  ],
  templateUrl: './reporte-tiempo-pagina.component.html',
  styleUrl: './reporte-tiempo-pagina.component.css'
})
export class ReporteTiempoPaginaComponent implements OnInit, OnDestroy {
  @ViewChild('selectorFecha') selectorFecha!: ElementRef<HTMLInputElement>;
  TotalTiempo: { dias: number, horas: number, minutos: number, segundos: number } = {
    dias: 0,
    horas: 0,
    minutos: 0,
    segundos: 0
  };
  segmentos = 12;
  espacioEntreSegmentos = 3;
  errorMessage: string = '';
  isLoading: boolean = false;

  IntervaloActualizacion: any;

  TotalSolicitudMes: number = 0;
  TopProductos: any[] = [];
  ConseguirAnio = new Date().getFullYear();
  AnioTemporal: number = this.ConseguirAnio;
  MesTemporal: number = new Date().getMonth() + 1;
  DiaSeleccionado: string = String(new Date().getDate()).padStart(2, '0');
  FechaSeleccionada: Date = new Date(this.AnioTemporal, this.MesTemporal - 1, parseInt(this.DiaSeleccionado));

  ngOnInit(): void {
    this.ObtenerDatos();
    this.IntervaloActualizacion = setInterval(() => {
      this.ObtenerDatos();
    }, 10000); // cada 10 segundos
  }
  ngOnDestroy(): void {
    clearInterval(this.IntervaloActualizacion);
  }

  CalcularDashArray(porcentaje: number): string {
    const radio = 10;
    const perimetro = 2 * Math.PI * radio;

    if (porcentaje <= 0) {
      return `0 ${perimetro.toFixed(2)}`;
    }

    if (porcentaje >= 100) {
      return `${perimetro.toFixed(2)} 0`;
    }

    const segmento = 5;
    const espacio = 0.5;

    const longitudTotal = (porcentaje / 100) * perimetro;
    const numeroSegmentos = Math.floor(longitudTotal / (segmento + espacio));
    const resto = longitudTotal - numeroSegmentos * (segmento + espacio);

    let dashArray = '';
    for (let i = 0; i < numeroSegmentos; i++) {
      dashArray += `${segmento} ${espacio} `;
    }

    if (resto > 0) {
      dashArray += `${resto} `;
    }

    const gapFinal = perimetro - longitudTotal;
    dashArray += `${gapFinal.toFixed(2)}`;

    return dashArray.trim();
  }



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

  constructor(private Servicio: ReporteTiempoPaginaServicio, private AlertaServicio: AlertaServicio) {
    this.ObtenerDatos();
  }

  ObtenerDatos() {
    const Anio = this.AnioTemporal;
    const Mes = this.MesTemporal;

    this.Servicio.ObtenerResumen(Anio, Mes).subscribe({
      next: (res) => {
        if (res.data.TotalTiempo) {
          this.TotalTiempo = res.data.TotalTiempo;
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
  get tiemposCirculos() {
    const maxDias = 30;
    const maxHoras = 24;
    const maxMinutos = 60;
    const maxSegundos = 60;

    return [
      {
        valor: this.TotalTiempo.dias,
        etiqueta: 'Días',
        porcentaje: Math.min(100, (this.TotalTiempo.dias / maxDias) * 100)
      },
      {
        valor: this.TotalTiempo.horas,
        etiqueta: 'Horas',
        porcentaje: Math.min(100, (this.TotalTiempo.horas / maxHoras) * 100)
      },
      {
        valor: this.TotalTiempo.minutos,
        etiqueta: 'Minutos',
        porcentaje: Math.min(100, (this.TotalTiempo.minutos / maxMinutos) * 100)
      },
      {
        valor: this.TotalTiempo.segundos,
        etiqueta: 'Segundos',
        porcentaje: Math.min(100, (this.TotalTiempo.segundos / maxSegundos) * 100)
      }
    ];
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

  ActualizarFechaSeleccionada() {
    this.FechaSeleccionada = new Date(this.AnioTemporal, this.MesTemporal - 1, parseInt(this.DiaSeleccionado));
  }
}
