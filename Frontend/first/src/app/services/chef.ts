import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface KitchenRawMaterial {
  id?: number;
  eid: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  minimum_stock_alert: number;
  request_item?: number;       // 🎯 ADDED
  request_to_admin?: string;   // 🎯 ADDED
  status: string;
  user: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChefService {
  private http = inject(HttpClient);
  
  private apiUrl = 'http://192.168.1.117:1234/api/kitchenstocks';

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'ngrok-skip-browser-warning': 'true',
      'Bypass-Tunnel-Reminder': 'true', 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  getKitchenStock(): Observable<any> {
    return this.http.get<any>(this.apiUrl, { headers: this.getHeaders() });
  }

  addRawMaterial(item: KitchenRawMaterial): Observable<any> {
    return this.http.post<any>(this.apiUrl, item, { headers: this.getHeaders() });
  }

  updateRawMaterial(id: number, data: Partial<KitchenRawMaterial>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders() });
  }
}