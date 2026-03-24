import { Component, OnInit } from '@angular/core';
import { ServicioCompartido } from '../../Servicios/ServicioCompartido';

@Component({
  selector: 'app-svg-decorador',
  imports: [],
  templateUrl: './svg-decorador.component.html',
  styleUrl: './svg-decorador.component.css'
})
export class SvgDecoradorComponent implements OnInit {
  primaryColor: string = '';  // Color inicial del degradado
  secondaryColor: string = '#262119'; // Segundo color del degradado

    constructor(
      private servicioCompartido: ServicioCompartido
    ) {}

    ngOnInit(): void {
      this.servicioCompartido.colorFooter$.subscribe(color => {
        this.primaryColor = color;
      });
    }
  // Método para abrir el color picker
  openColorPicker(): void {
    const colorInput = document.getElementById('colorPicker') as HTMLInputElement;
    colorInput.click();
  }

  // Método para cambiar el color del SVG
  changeColor(event: Event): void {
    const color = (event.target as HTMLInputElement).value;
    this.primaryColor = color;  // Cambia el primer color del degradado
  }
}
