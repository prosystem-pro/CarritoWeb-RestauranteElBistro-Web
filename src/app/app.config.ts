import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom  } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AutorizacionInterceptor } from './Servicios/AutorizacionInterceptorServicio'; 
import { provideCharts } from 'ng2-charts';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([AutorizacionInterceptor])),
    provideCharts() ,
    importProvidersFrom(
      MatDatepickerModule,
      MatFormFieldModule,
      MatInputModule,
      MatNativeDateModule
    ),
  ]
};
