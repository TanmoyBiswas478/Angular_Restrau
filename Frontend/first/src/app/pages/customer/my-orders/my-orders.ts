import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DeliveryService, DeliveryOrder } from '../../../services/delivery';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.css'
})
export class MyOrdersComponent implements OnInit, OnDestroy {
  private deliveryService = inject(DeliveryService);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  myOrders: DeliveryOrder[] = [];
  isLoading = true;
  currentCustomerId: string = '';
  private pollingTimer: any;

  ngOnInit() {
    this.extractCustomerId();
    
    if (this.currentCustomerId) {
      this.loadMyOrders();

      // 🟢 Real-time Live Tracking Polling (Har 8 seconds me status update check karega)
      if (isPlatformBrowser(this.platformId)) {
        this.pollingTimer = setInterval(() => {
          this.loadMyOrders(true);
        }, 8000);
      }
    } else {
      console.warn('⚠️ No active Customer ID found in localStorage.');
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
    }
  }

  private extractCustomerId() {
    if (isPlatformBrowser(this.platformId)) {
      const storedUser = localStorage.getItem('currentUser');
      console.log('🔍 Raw LocalStorage User:', storedUser);

      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser) as Record<string, any>;
          // Active customer id extraction with safe fallback
          const rawId = parsed['customer_id'] || parsed['cid'] || parsed['id'] || 
                        (parsed['user'] ? parsed['user']['customer_id'] || parsed['user']['cid'] || parsed['user']['id'] : '');
          
          if (rawId && rawId !== 'undefined' && rawId !== 'null') {
            this.currentCustomerId = String(rawId);
          }
        } catch (e: unknown) {
          console.error('Error parsing stored user:', e);
        }
      }
    }
    console.log('🎯 Active Customer ID used for API:', this.currentCustomerId);
  }

  loadMyOrders(isSilent: boolean = false) {
  if (!this.currentCustomerId) {
    this.isLoading = false;
    return;
  }

  if (!isSilent) this.isLoading = true;

  // ⚡ Direct backend API endpoint hit: /api/orderhistory/{customer_id}
  this.deliveryService.getOrderHistoryByCustomerId(this.currentCustomerId).subscribe({
    next: (res: any) => {
      console.log('📦 Raw API Payload Received:', res);

      let rawData: any[] = [];

      // 🎯 1. Agar backend Single Object `{...}` bhej raha hai
      if (res && typeof res === 'object' && !Array.isArray(res) && res.id) {
        rawData = [res]; // Single object ko Array me wrap kar do
      } 
      // 🎯 2. Agar Direct Array `[...]` hai
      else if (Array.isArray(res)) {
        rawData = res;
      } 
      // 🎯 3. Agar Nested Wrapper `{ data: [...] }` hai
      else if (res && typeof res === 'object') {
        const nestedData = res.data || res.orders || res.result || res.deliveries || res.history;
        if (Array.isArray(nestedData)) {
          rawData = nestedData;
        } else if (nestedData && typeof nestedData === 'object' && nestedData.id) {
          rawData = [nestedData];
        }
      }

      // 🎯 Data Mapping
      if (rawData.length > 0) {
        this.myOrders = rawData.map((item: any) => ({
          id: item.id,
          customerId: String(item.customer_id || item.cid || this.currentCustomerId),
          orderNumber: item.order_number || item.orderNumber || `ORD-${item.id}`,
          customerName: item.customer_name || item.customerName || 'Customer',
          address: item.delivery_address || item.address || 'Standard Location',
          items: item.items || 'Standard Package',
          total: Number(item.total || item.amount || item.total_amount || 0),
          status: item.status || 'Preparing'
        }));
      } else {
        this.myOrders = [];
      }

      this.isLoading = false;
      this.cdr.detectChanges();
    },
    error: (err: any) => {
      console.error('Failed to fetch order history from backend:', err);
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  });
}
}