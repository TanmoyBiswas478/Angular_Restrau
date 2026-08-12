import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AdminSettings {
  restaurant_name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  opening_time: string;
  closing_time: string;
  currency: string;
  tax_percentage: number;
  delivery_charge: number;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/settings`;

  getSettings(): Observable<AdminSettings> {
    return this.http.get<AdminSettings>(this.apiUrl);
  }

  updateSettings(settings: Partial<AdminSettings>): Observable<AdminSettings> {
    return this.http.put<AdminSettings>(this.apiUrl, settings);
  }
}