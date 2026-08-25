import { Component, OnInit, inject, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth';

export interface DashboardAnalytics {
  totalRevenue: number;
  todaysRevenue: number;
  totalOrders: number;
  todaysOrders: number;
  activeCustomers: number;
  totalStaff: number;
  recentOrders: Array<{ id: string; customer: string; amount: number; status: string; date: string }>;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);
  authService = inject(AuthService);

  isLoading = true;
  totalEmployees: number = 0;

  analytics: DashboardAnalytics = {
    totalRevenue: 0,
    todaysRevenue: 0,
    totalOrders: 0,
    todaysOrders: 0,
    activeCustomers: 0,
    totalStaff: 0,
    recentOrders: []
  };

  restockRequests: any[] = [];

  private deliveryApiUrl = 'http://192.168.1.117:1234/api/dashboard/analytics';
  private customerApiUrl = 'http://192.168.1.117:1234/api/customers'; 
  private kitchenApiUrl = 'http://192.168.1.117:1234/api/kitchenstocks';
  private employeeApiUrl = 'http://192.168.1.117:1234/api/employees';

  // 🎯 Strong Dynamic Header Generator
  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'ngrok-skip-browser-warning': 'true',
      'Accept': 'application/json'
    });

    if (isPlatformBrowser(this.platformId)) {
      const token = sessionStorage.getItem('authToken');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return headers;
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Direct load to eliminate delay flickering
      this.loadAllDashboardData();
    }
  }

  loadAllDashboardData() {
    this.isLoading = true;
    this.fetchAnalytics();
    this.fetchTotalEmployees();
    this.fetchTotalCustomers();
    this.fetchRestockRequests();
  }

  fetchAnalytics() {
    this.http.get<any>(this.deliveryApiUrl, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        console.log('👑 Admin Analytics Response:', res);
        if (res) {
          const recent = res.recentOrders || [];
          this.analytics = {
            ...this.analytics,
            totalRevenue: Number(res.totalRevenue || 0),
            todaysRevenue: Number(res.todaysRevenue || 0),
            totalOrders: Number(res.totalOrders || 0),
            todaysOrders: Number(res.todaysOrders || 0),
            activeCustomers: Number(res.activeCustomers || res.totalCustomers || this.analytics.activeCustomers),
            totalStaff: Number(res.totalStaff || this.analytics.totalStaff),
            recentOrders: recent
          };
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Failed to fetch analytics:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  fetchTotalEmployees() {
    // Direct HTTP call with Auth token headers to avoid EmployeeService token drops
    this.http.get<any>(this.employeeApiUrl, { headers: this.getHeaders() }).subscribe({
      next: (res: any) => {
        const employeesList = Array.isArray(res) ? res : (res?.data || res?.employees || []);
        const count = employeesList.length || 0;
        this.totalEmployees = count;
        this.analytics.totalStaff = count;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Employee fetch error:', err);
        this.cdr.detectChanges();
      }
    });
  }

  fetchTotalCustomers() {
    this.http.get<any>(this.customerApiUrl, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        let count = 0;
        if (Array.isArray(res)) {
          count = res.length;
        } else if (res && typeof res === 'object') {
          const list = res.customers || res.data || res.result || [];
          count = Array.isArray(list) ? list.length : (res.count || res.total || 0);
        }

        this.analytics.activeCustomers = count;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Customer fetch error:', err);
        this.cdr.detectChanges();
      }
    });
  }

  fetchRestockRequests() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.http.get<any>(this.kitchenApiUrl, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        const rawList = Array.isArray(res) ? res : (res?.data || res?.items || []);
        this.restockRequests = rawList.filter((item: any) => {
          const isPending = item.request_to_admin === 'Pending';
          const hasQty = Number(item.request_item) > 0;
          return isPending && hasQty;
        });
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to fetch restock requests', err)
    });
  }

  approveRestock(item: any) {
    const currentQty = Number(item.quantity || 0);
    const requestedQty = Number(item.request_item || 0);
    const newQty = currentQty + requestedQty;
    const minAlertVal = Number(item.minimum_stock_alert ?? item.min_stock ?? 0);
    const newStatus = newQty <= 0 ? 'Out of Stock' : (newQty <= minAlertVal ? 'Low Stock' : 'In Stock');

    const payload = {
      eid: String(item.eid),
      ingredient_name: String(item.ingredient_name || item.item_name),
      quantity: newQty,
      unit: String(item.unit || 'kg'),
      minimum_stock_alert: minAlertVal,
      request_item: 0, 
      request_to_admin: 'Approved',
      status: newStatus,
      user: String(item.user || 'Chef')
    };

    this.http.put(`${this.kitchenApiUrl}/${item.id}`, payload, { headers: this.getHeaders() }).subscribe({
      next: () => {
        alert(`✅ Approved! ${item.ingredient_name} updated by +${requestedQty} ${item.unit}.`);
        this.fetchRestockRequests();
      },
      error: (err) => {
        console.error('Approve failed:', err);
        alert(`❌ Failed to approve request`);
      }
    });
  }

  rejectRestock(item: any) {
    const currentQty = Number(item.quantity || 0);
    const minAlertVal = Number(item.minimum_stock_alert ?? item.min_stock ?? 0);

    const payload = {
      eid: String(item.eid),
      ingredient_name: String(item.ingredient_name || item.item_name),
      quantity: currentQty,
      unit: String(item.unit || 'kg'),
      minimum_stock_alert: minAlertVal,
      request_item: 0, 
      request_to_admin: 'Rejected',
      status: String(item.status),
      user: String(item.user || 'Chef')
    };

    this.http.put(`${this.kitchenApiUrl}/${item.id}`, payload, { headers: this.getHeaders() }).subscribe({
      next: () => {
        alert(`❌ Request Rejected for ${item.ingredient_name}.`);
        this.fetchRestockRequests(); 
      },
      error: (err) => {
        console.error('Reject failed:', err);
        alert(`❌ Failed to reject request`);
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}