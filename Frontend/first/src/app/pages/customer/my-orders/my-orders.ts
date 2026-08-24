import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { DeliveryService, DeliveryOrder } from '../../../services/delivery';
import { AuthService } from '../../../services/auth';

// View model = the shared DeliveryOrder + a display-only order date.
// (Kept local so we don't have to touch the DeliveryOrder interface.)
type MyOrderView = DeliveryOrder & { orderDate?: string };

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.css'
})
export class MyOrdersComponent implements OnInit, OnDestroy {
  private deliveryService = inject(DeliveryService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  myOrders: MyOrderView[] = [];
  isLoading = true;
  currentCustomerId: string = '';
  private pollingTimer: any;
  private userSub?: Subscription;

  ngOnInit() {
    // 🛑 NO localStorage. The logged-in customer comes from AuthService, which is
    //    backed by sessionStorage and exposed as the currentUser$ observable
    //    (same pattern the Profile page uses). It emits immediately with the
    //    current user, and again on login/logout.
    this.userSub = this.authService.currentUser$.subscribe((user: any) => {
      const rawId = user ? (user.customer_id || user.cid || user.id || '') : '';
      this.currentCustomerId = rawId ? String(rawId) : '';
      console.log('🎯 Active Customer ID used for API:', this.currentCustomerId);

      // Clear any previous polling before (re)starting, so we never stack timers.
      this.stopPolling();

      if (this.currentCustomerId) {
        this.loadMyOrders();

        // 🟢 Real-time Live Tracking Polling (every 8s) — browser only.
        if (isPlatformBrowser(this.platformId)) {
          this.pollingTimer = setInterval(() => {
            this.loadMyOrders(true);
          }, 8000);
        }
      } else {
        console.warn('⚠️ No active Customer ID found (user not logged in).');
        this.myOrders = [];
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    this.stopPolling();
    this.userSub?.unsubscribe();
  }

  private stopPolling() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  // Turn whatever the backend stores (MySQL "2026-08-12 09:15:29", ISO, etc.)
  // into a friendly, India-locale string. Shows the time only if the source had one.
  private formatOrderDate(raw: any): string {
    if (!raw) return '';
    const s = String(raw).trim();
    if (!s) return '';

    // MySQL uses a space between date & time; make it ISO so Date parses everywhere.
    const d = new Date(s.replace(' ', 'T'));
    if (isNaN(d.getTime())) return s; // unparseable → show the raw value as-is

    const hasTime = /\d{1,2}:\d{2}/.test(s);
    const opts: Intl.DateTimeFormatOptions = hasTime
      ? { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
      : { day: '2-digit', month: 'short', year: 'numeric' };

    return d.toLocaleString('en-IN', opts);
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
      // 🔍 If the date doesn't show, check this log for the real date field name.
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
        this.myOrders = rawData.map((item: any) => {
          // Pull the date out no matter what the backend named the column.
          const rawDate =
            item.created_at || item.order_date || item.date || item.placed_at ||
            item.ordered_at || item.createdAt || item.orderDate || item.order_placed_at ||
            item.datetime || item.timestamp || '';

          return {
            id: item.id,
            customerId: String(item.customer_id || item.cid || this.currentCustomerId),
            orderNumber: item.order_number || item.orderNumber || `ORD-${item.id}`,
            customerName: item.customer_name || item.customerName || 'Customer',
            address: item.delivery_address || item.address || 'Standard Location',
            items: item.items || 'Standard Package',
            total: Number(item.total || item.amount || item.total_amount || 0),
            status: item.status || 'Preparing',
            orderDate: this.formatOrderDate(rawDate)
          };
        });

        this.myOrders.reverse();
        
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