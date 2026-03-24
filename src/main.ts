import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { Chart, ArcElement, Tooltip, Legend, PieController, PolarAreaController, 
RadialLinearScale, CategoryScale, BarController, LinearScale, BarElement, RadarController, LineController, 
LineElement, PointElement} from 'chart.js';
Chart.register(PieController, ArcElement, Tooltip, Legend, PolarAreaController, RadialLinearScale, 
  CategoryScale, BarController, LinearScale, BarElement,   RadarController, LineElement, PointElement, LineController);


bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
