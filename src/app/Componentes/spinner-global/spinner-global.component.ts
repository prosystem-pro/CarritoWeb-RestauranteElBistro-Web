import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-spinner-global',
  imports: [FormsModule, CommonModule],
  templateUrl: './spinner-global.component.html',
  styleUrl: './spinner-global.component.css'
})
export class SpinnerGlobalComponent {
  @Input() visible: boolean = false;
}
