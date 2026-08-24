import { Component, OnInit, inject, ChangeDetectorRef, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeliveryPartnerService, PartnerDelivery } from '../../services/delivery-partner';

interface DeliveryRow extends PartnerDelivery {
  _busy?: boolean;
}

@Component({
  selector: 'app-delivery-executive',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delivery-executive.html',
  styleUrl: './delivery-executive.css'
})
export class DeliveryExecutiveComponent implements OnInit {
  private partnerService = inject(DeliveryPartnerService);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);
  private zone = inject(NgZone);

  // 👤 Current partner (from session)
  currentEid = 'EID1';
  currentName = 'Delivery Partner';
  currentPhone = '';
  availability: 'Online' | 'Offline' = 'Offline';

  // 📦 Data
  assigned: DeliveryRow[] = [];
  available: DeliveryRow[] = [];

  isLoading = false;
  activeTab: 'assigned' | 'available' = 'assigned';

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.extractPartner();
      this.loadAll();
    }
  }

  private extractPartner() {
    const stored = sessionStorage.getItem('currentUser');
    if (stored) {
      try {
        const p = JSON.parse(stored);
        this.currentEid = String(p.eid || p.id || 'EID1');
        this.currentName = String(p.name || p.email || 'Delivery Partner');
        this.currentPhone = String(p.phone || '');
        this.availability = (p.availability === 'Online') ? 'Online' : 'Offline';
      } catch (e) {
        console.error('Error reading partner credentials:', e);
      }
    }
  }

  loadAll() {
    this.loadAssigned();
    this.loadAvailable();
  }

  loadAssigned() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.isLoading = true;
    this.cdr.detectChanges();

    this.partnerService.getAssigned(this.currentEid).subscribe({
      next: (res: any) => {
        this.zone.run(() => {
          this.assigned = Array.isArray(res) ? res : (res?.data || []);
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err: any) => {
        this.zone.run(() => {
          console.error('Assigned fetch error:', err);
          this.assigned = [];
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  loadAvailable() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.partnerService.getAvailable().subscribe({
      next: (res: any) => {
        this.zone.run(() => {
          this.available = Array.isArray(res) ? res : (res?.data || []);
          this.cdr.detectChanges();
        });
      },
      error: (err: any) => {
        this.zone.run(() => {
          console.error('Available fetch error:', err);
          this.available = [];
          this.cdr.detectChanges();
        });
      }
    });
  }

  // 🔄 Online / Offline toggle
  toggleAvailability() {
    const next = this.availability === 'Online' ? 'Offline' : 'Online';

    this.partnerService.setAvailability(this.currentEid, next).subscribe({
      next: () => {
        this.zone.run(() => {
          this.availability = next;
          // keep session copy in sync so navbar/other pages agree
          try {
            const stored = sessionStorage.getItem('currentUser');
            if (stored) {
              const p = JSON.parse(stored);
              p.availability = next;
              sessionStorage.setItem('currentUser', JSON.stringify(p));
            }
          } catch {}
          this.cdr.detectChanges();
        });
      },
      error: (err: any) => {
        console.error('Availability update failed:', err);
        alert('❌ Could not update availability. Please try again.');
      }
    });
  }

  // ✅ Accept an available order
  acceptOrder(order: DeliveryRow) {
    if (this.availability !== 'Online') {
      alert('🔴 You are Offline. Go Online to accept deliveries.');
      return;
    }
    if (!order.id || order._busy) return;

    order._busy = true;
    this.partnerService.acceptDelivery(order.id, {
      driver_eid: this.currentEid,
      driver_name: this.currentName,
      driver_phone: this.currentPhone
    }).subscribe({
      next: () => {
        this.zone.run(() => {
          alert(`✅ Order ${order.order_number || order.id} accepted! It's now in your deliveries.`);
          this.loadAll();
        });
      },
      error: (err: any) => {
        this.zone.run(() => {
          order._busy = false;
          const msg = err?.error?.message || 'Failed to accept order.';
          alert(`❌ ${msg}`);
          this.cdr.detectChanges();
        });
      }
    });
  }

  // 🚚 Move an assigned order along its lifecycle
  updateStatus(order: DeliveryRow, newStatus: string) {
    if (!order.id || order._busy) return;

    order._busy = true;
    this.partnerService.updateStatus(order.id, newStatus).subscribe({
      next: () => {
        this.zone.run(() => {
          order.status = newStatus;
          order._busy = false;
          if (newStatus === 'Delivered') {
            alert(`🎉 Order ${order.order_number || order.id} marked as Delivered!`);
          }
          this.loadAll();
        });
      },
      error: (err: any) => {
        this.zone.run(() => {
          order._busy = false;
          console.error('Status update failed:', err);
          alert('❌ Could not update status.');
          this.cdr.detectChanges();
        });
      }
    });
  }

  // ── Derived counts for the stat cards ──
  get activeCount(): number {
    return this.assigned.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  }
  get deliveredCount(): number {
    return this.assigned.filter(o => o.status === 'Delivered').length;
  }
  get availableCount(): number {
    return this.available.length;
  }

  // Helper for status badge class
  statusClass(status: string): string {
    const s = (status || '').toLowerCase();
    if (s.includes('deliver') && !s.includes('out')) return 'delivered';
    if (s.includes('out')) return 'out';
    if (s.includes('cancel')) return 'cancelled';
    return 'preparing';
  }

  trackById(_: number, item: DeliveryRow) {
    return item.id;
  }
}
