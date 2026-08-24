import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// 🧑‍🍳 A kitchen stock row (shared kitchenstocks table with Chef)
export interface KitchenStock {
  id?: number;
  eid: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  minimum_stock_alert: number;
  request_item?: number;
  request_to_admin?: string;
  status: string;
  user: string;
}

@Injectable({
  providedIn: 'root'
})
export class KitchenAssistantService {
  private http = inject(HttpClient);

  private apiUrl = 'http://192.168.0.101:1234/api/kitchen-assistant';

  // 🎯 ngrok warning page bypass headers
  private ngrokHeaders = new HttpHeaders({
    'ngrok-skip-browser-warning': 'true',
    'Bypass-Tunnel-Reminder': 'true',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });

  // 1. View all kitchen stock
  getStocks(): Observable<KitchenStock[]> {
    return this.http.get<KitchenStock[]>(`${this.apiUrl}/stocks`, { headers: this.ngrokHeaders });
  }

  // 2. Deduct used stock (quantity = amount to remove)
  deductStock(id: number, payload: { quantity: number; eid?: string; user?: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/deduct/${id}`, payload, { headers: this.ngrokHeaders });
  }

  // 3. Send restock request to admin
  requestRestock(id: number, payload: { request_item: number; eid?: string; user?: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/request/${id}`, payload, { headers: this.ngrokHeaders });
  }
}
