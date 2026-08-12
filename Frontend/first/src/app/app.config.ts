import { 
  ApplicationConfig, 
  provideZonelessChangeDetection, // 🌟 Renamed in latest Angular versions
  provideBrowserGlobalErrorListeners 
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(), // 🌟 Zone.js dependency removed cleanly
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withFetch()) // 🌟 Enables HttpClient for Laravel API
  ]
};