import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    importProvidersFrom(CommonModule, FormsModule),
    {
      provide: 'ErrorHandler',
      useValue: (error: any) => {
        console.error('Global error:', error);
      }
    }
  ]
};
