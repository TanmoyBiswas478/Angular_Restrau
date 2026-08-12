import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardMetrics {
  total_revenue: number;
  total_orders: number;
  active_staff: number;
  pending_deliveries: number;
}

export interface RecentActivity {
  id: number;
  title: string;
  time: string;
  type: 'order' | 'staff' | 'delivery';
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  
  // 🟢 Base API URL (Route correctly points to /api base)
  private apiUrl = 'http://192.168.1.117:1234/api';
  

  // 🎯 ngrok warning page bypass headers
  private ngrokHeaders = new HttpHeaders({
    'ngrok-skip-browser-warning': 'true',
    'Accept': 'application/json'
  });

  // 1. Fetch Dashboard Metrics
  getMetrics(): Observable<DashboardMetrics> {
    return this.http.get<DashboardMetrics>(`${this.apiUrl}/dashboard/metrics`, { headers: this.ngrokHeaders });
  }

  // 2. Fetch Recent Activities
  getRecentActivities(): Observable<RecentActivity[]> {
    return this.http.get<RecentActivity[]>(`${this.apiUrl}/dashboard/activities`, { headers: this.ngrokHeaders });
  }
}