import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// 🏪 Shape of the /store-manager/summary response
export interface StoreSummary {
  sales: {
    totalRevenue: number;
    todaysRevenue: number;
    totalOrders: number;
    todaysOrders: number;
  };
  operations: {
    pendingDeliveries: number;
    deliveredToday: number;
  };
  staff: {
    total: number;
    active: number;
  };
  inventory: {
    total: number;
    lowStock: number;
    outOfStock: number;
  };
  recentOrders: Array<{
    id: string;
    customer: string;
    amount: number;
    status: string;
    date: string;
  }>;
  lowStockList: Array<{
    id: number;
    item_name: string;
    quantity: number;
    unit: string;
    min_level: number;
    status: string;
  }>;
}

export interface Store {
  id?: number;
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  manager_eid?: string;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StoreManagerService {
  private http = inject(HttpClient);

  private apiUrl = 'http://192.168.1.117:1234/api';

  // 🎯 ngrok warning page bypass headers
  private ngrokHeaders = new HttpHeaders({
    'ngrok-skip-browser-warning': 'true',
    'Bypass-Tunnel-Reminder': 'true',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });

  // 1. Full dashboard summary (sales + ops + staff + inventory health)
  getSummary(): Observable<StoreSummary> {
    return this.http.get<StoreSummary>(`${this.apiUrl}/store-manager/summary`, { headers: this.ngrokHeaders });
  }

  // 2. List stores/branches
  getStores(): Observable<Store[]> {
    return this.http.get<Store[]>(`${this.apiUrl}/stores`, { headers: this.ngrokHeaders });
  }

  // 3. Create a store/branch (optional multi-branch support)
  createStore(store: Store): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/stores`, store, { headers: this.ngrokHeaders });
  }
}
