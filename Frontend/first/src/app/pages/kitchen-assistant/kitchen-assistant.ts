import { Component, OnInit, inject, ChangeDetectorRef, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KitchenAssistantService, KitchenStock } from '../../services/kitchen-assistant';

interface StockRow extends KitchenStock {
  deduct_qty?: number;
  request_qty?: number;
  _busy?: boolean;
}

@Component({
  selector: 'app-kitchen-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kitchen-assistant.html',
  styleUrl: './kitchen-assistant.css'
})
export class KitchenAssistantComponent implements OnInit {
  private kaService = inject(KitchenAssistantService);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);
  private zone = inject(NgZone);

  currentEid = 'EID1';
  currentName = 'Kitchen Assistant';

  stocks: StockRow[] = [];
  isLoading = false;
  searchQuery = '';

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.extractAssistant();
      this.fetchStock();
    }
  }

  private extractAssistant() {
    const stored = sessionStorage.getItem('currentUser');
    if (stored) {
      try {
        const p = JSON.parse(stored);
        this.currentEid = String(p.eid || p.id || 'EID1');
        this.currentName = String(p.name || p.email || 'Kitchen Assistant');
      } catch (e) {
        console.error('Error reading assistant credentials:', e);
      }
    }
  }

  fetchStock() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.isLoading = true;
    this.cdr.detectChanges();

    this.kaService.getStocks().subscribe({
      next: (res: any) => {
        this.zone.run(() => {
          const rawList = Array.isArray(res) ? res : (res?.data || []);
          this.stocks = rawList.map((item: any) => {
            const qty = Number(item.quantity || 0);
            const minAlert = Number(item.minimum_stock_alert || 0);
            return {
              ...item,
              quantity: qty,
              minimum_stock_alert: minAlert,
              status: qty <= 0 ? 'Out of Stock' : (qty <= minAlert ? 'Low Stock' : 'In Stock'),
              request_item: Number(item.request_item || 0),
              request_to_admin: item.request_to_admin || 'None',
              deduct_qty: 0,
              request_qty: 0
            };
          });
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err: any) => {
        this.zone.run(() => {
          console.error('Kitchen stock fetch error:', err);
          this.stocks = [];
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  // ➖ Deduct used stock
  deductStock(item: StockRow) {
    if (!item.id || item._busy) return;

    const amount = Number(item.deduct_qty || 0);
    if (amount <= 0) {
      alert('Please enter a quantity greater than 0 to deduct!');
      return;
    }
    if (amount > item.quantity) {
      alert(`⚠️ Only ${item.quantity} ${item.unit} available. You cannot deduct ${amount} ${item.unit}.`);
      return;
    }

    item._busy = true;
    this.kaService.deductStock(item.id, {
      quantity: amount,
      eid: this.currentEid,
      user: this.currentName
    }).subscribe({
      next: () => {
        this.zone.run(() => {
          item.deduct_qty = 0;
          item._busy = false;
          this.fetchStock();
        });
      },
      error: (err: any) => {
        this.zone.run(() => {
          item._busy = false;
          const msg = err?.error?.message || 'Failed to deduct stock.';
          alert(`❌ ${msg}`);
          this.cdr.detectChanges();
        });
      }
    });
  }

  // 📩 Send restock request to admin
  sendRestockRequest(item: StockRow) {
    if (!item.id || item._busy) return;

    const reqQty = Number(item.request_qty || 0);
    if (reqQty <= 0) {
      alert('Please enter a valid quantity to request!');
      return;
    }

    item._busy = true;
    this.kaService.requestRestock(item.id, {
      request_item: reqQty,
      eid: this.currentEid,
      user: this.currentName
    }).subscribe({
      next: () => {
        this.zone.run(() => {
          alert(`📩 Restock request sent! Admin will see a request for ${reqQty} ${item.unit} of ${item.ingredient_name}.`);
          item.request_qty = 0;
          item._busy = false;
          this.fetchStock();
        });
      },
      error: (err: any) => {
        this.zone.run(() => {
          item._busy = false;
          console.error('Request failed:', err);
          alert('❌ Failed to send restock request.');
          this.cdr.detectChanges();
        });
      }
    });
  }

  get filteredStocks(): StockRow[] {
    if (!this.searchQuery) return this.stocks;
    const q = this.searchQuery.toLowerCase();
    return this.stocks.filter(i => (i.ingredient_name || '').toLowerCase().includes(q));
  }

  get lowStockItems(): StockRow[] {
    return this.stocks.filter(i => i.quantity <= i.minimum_stock_alert);
  }

  statusClass(status: string): string {
    if (status === 'Out of Stock') return 'out';
    if (status === 'Low Stock') return 'low';
    if (status === 'Already Requested') return 'requested';
    return 'ok';
  }

  trackById(_: number, item: StockRow) {
    return item.id;
  }
}
