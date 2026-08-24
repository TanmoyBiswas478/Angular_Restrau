import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// 🚚 A delivery row as returned by the backend `deliverys` table
export interface PartnerDelivery {
  id: number;
  customer_id?: string;
  order_number?: string;
  customer_name?: string;
  delivery_address?: string;
  driver_name?: string;
  driver_phone?: string;
  driver_eid?: string | null;
  items?: string;
  total?: number;
  status: string;
  created_at?: string;
}

export interface PartnerSummary {
  eid: string;
  name: string;
  availability: 'Online' | 'Offline' | string;
  stats: {
    assigned: number;
    active: number;
    delivered: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryPartnerService {
  private http = inject(HttpClient);

  private apiUrl = 'http://192.168.0.101:1234/api/delivery-partner';

  // 🎯 ngrok warning page bypass headers (same pattern as other services)
  private ngrokHeaders = new HttpHeaders({
    'ngrok-skip-browser-warning': 'true',
    'Bypass-Tunnel-Reminder': 'true',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });

  // 1. Available (unassigned) deliveries
  getAvailable(): Observable<PartnerDelivery[]> {
    return this.http.get<PartnerDelivery[]>(`${this.apiUrl}/available`, { headers: this.ngrokHeaders });
  }

  // 2. Deliveries assigned to this partner (by EID)
  getAssigned(eid: string): Observable<PartnerDelivery[]> {
    return this.http.get<PartnerDelivery[]>(`${this.apiUrl}/${eid}/assigned`, { headers: this.ngrokHeaders });
  }

  // 3. Partner self summary (availability + counts)
  getMe(eid: string): Observable<PartnerSummary> {
    return this.http.get<PartnerSummary>(`${this.apiUrl}/${eid}/me`, { headers: this.ngrokHeaders });
  }

  // 4. Accept / self-assign an available order
  acceptDelivery(id: number, payload: { driver_eid: string; driver_name?: string; driver_phone?: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/accept/${id}`, payload, { headers: this.ngrokHeaders });
  }

  // 5. Update delivery status (Out for Delivery / Delivered)
  updateStatus(id: number, status: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/status/${id}`, { status }, { headers: this.ngrokHeaders });
  }

  // 6. Toggle Online/Offline availability
  setAvailability(eid: string, availability: 'Online' | 'Offline'): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${eid}/availability`, { availability }, { headers: this.ngrokHeaders });
  }
}
