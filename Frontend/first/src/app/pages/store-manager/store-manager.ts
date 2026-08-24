import { Component, OnInit, inject, ChangeDetectorRef, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StoreManagerService, StoreSummary } from '../../services/store-manager';

@Component({
  selector: 'app-store-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './store-manager.html',
  styleUrl: './store-manager.css'
})
export class StoreManagerComponent implements OnInit {
  private storeService = inject(StoreManagerService);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);
  private zone = inject(NgZone);
  private router = inject(Router);

  managerName = 'Store Manager';
  managerEid = '';

  summary: StoreSummary | null = null;
  isLoading = false;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.extractManager();
      this.loadSummary();
    }
  }

  private extractManager() {
    const stored = sessionStorage.getItem('currentUser');
    if (stored) {
      try {
        const m = JSON.parse(stored);
        this.managerName = String(m.name || m.email || 'Store Manager');
        this.managerEid = String(m.eid || m.id || '');
      } catch (e) {
        console.error('Error reading manager credentials:', e);
      }
    }
  }

  loadSummary() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.isLoading = true;
    this.cdr.detectChanges();

    this.storeService.getSummary().subscribe({
      next: (res: StoreSummary) => {
        this.zone.run(() => {
          this.summary = res;
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err: any) => {
        this.zone.run(() => {
          console.error('Summary fetch error:', err);
          this.summary = null;
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  // 🔗 Quick links reuse the existing admin-grade pages
  goToInventory() {
    this.router.navigate(['/inventory']);
  }
  goToStaff() {
    this.router.navigate(['/employees']);
  }
  goToDeliveries() {
    this.router.navigate(['/deliveries']);
  }

  formatMoney(v: number | undefined): string {
    const n = Number(v || 0);
    return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  }

  statusClass(status: string): string {
    const s = (status || '').toLowerCase();
    if (s.includes('out of')) return 'out';
    if (s.includes('low')) return 'low';
    if (s.includes('deliver') && !s.includes('out')) return 'ok';
    return 'neutral';
  }
}
