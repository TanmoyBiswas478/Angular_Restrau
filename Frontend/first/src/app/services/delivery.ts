import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DeliveryOrder {
  id?: number;
  customerId: string;
  orderNumber: string;
  customerName?: string;
  customer_name?: string;
  address?: string;
  delivery_address?: string;
  items: string;
  total: number;
  status: 'Preparing' | 'Out for Delivery' | 'Delivered' | string;
  driver_name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  private http = inject(HttpClient);
  
  // 🟢 Base URLs
  private apiUrl = `http://192.168.0.101:1234/api/delivery`;
  private orderHistoryBaseUrl = `http://192.168.0.101:1234/api/orderhistory`;

  // 🎯 ngrok warning page bypass headers
  private ngrokHeaders = new HttpHeaders({
    'ngrok-skip-browser-warning': 'true',
    'Accept': 'application/json'
  });

  // 1. Fetch All Deliveries (For Admin/Manager)
  getDeliveries(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.ngrokHeaders });
  }

  // 2. ⚡ Direct Backend Filtered Order History by Customer ID (No Frontend Load)
  getOrderHistoryByCustomerId(customerId: string): Observable<any> {
    return this.http.get<any>(`${this.orderHistoryBaseUrl}/${customerId}`, { headers: this.ngrokHeaders });
  }

  // 3. Add New Delivery Order
  addDelivery(order: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, order, { headers: this.ngrokHeaders });
  }

  // 4. Update Delivery Status
  updateStatus(id: number, status: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, { status }, { headers: this.ngrokHeaders });
  }
}