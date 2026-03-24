import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PermisoServicio } from '../../../app/Autorizacion/AutorizacionPermiso';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header-reporte',
  imports: [FormsModule, CommonModule],
  templateUrl: './header-reporte.component.html',
  styleUrl: './header-reporte.component.css'
})
export class HeaderReporteComponent {

  constructor(public router: Router, public Permiso: PermisoServicio,) {}
}
