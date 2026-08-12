import { Component, OnInit, inject, ChangeDetectorRef, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChefService, KitchenRawMaterial } from '../../../services/chef';

export interface KitchenIngredient extends KitchenRawMaterial {
  temp_adjust_qty?: number;
  request_qty?: number; 
  displayName?: string;
}

@Component({
  selector: 'app-chef-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chef-dashboard.html',
  styleUrl: './chef-dashboard.css'
})
export class ChefDashboardComponent implements OnInit {
  private chefService = inject(ChefService);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);
  private zone = inject(NgZone);

  ingredients: KitchenIngredient[] = [];
  isLoading = false; 
  searchQuery = '';
  showAddModal = false;

  currentChefId: string = 'EID1';
  currentChefName: string = 'Chef Name';

  newItem = {
    ingredient_name: '',
    quantity: 1,
    unit: 'kg',
    minimum_stock_alert: 2
  };

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.extractChefDetails();
      this.fetchStockFromApi();
    }
  }

  private extractChefDetails() {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.currentChefId = String(parsed.eid || parsed.id || parsed.customer_id || parsed.employee_id || 'EID1');
        // Saari possible name keys check kar rahe hain
        this.currentChefName = String(parsed.name || parsed.customer_name || parsed.full_name || parsed.username || parsed.email || 'Chef User');
      } catch (e) {
        console.error('Error reading chef credentials:', e);
      }
    }
  }

  fetchStockFromApi() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.isLoading = true;
    this.cdr.detectChanges();

    this.chefService.getKitchenStock().subscribe({
      next: (res: any) => {
        this.zone.run(() => {
          console.log('📦 Live Database Response:', res);
          
          const rawList = Array.isArray(res) ? res : (res?.data || res?.items || res?.result || []);

          if (Array.isArray(rawList) && rawList.length > 0) {
            this.ingredients = rawList.map((item: any) => {
              const resolvedName = item.ingredient_name || item.item_name || item.name || 'Raw Ingredient';
              const quantityVal = Number(item.quantity || 0);
              const minAlertVal = Number(item.minimum_stock_alert || item.min_stock || 0);

              return {
                ...item,
                ingredient_name: resolvedName,
                displayName: resolvedName,
                quantity: quantityVal,
                minimum_stock_alert: minAlertVal,
                status: quantityVal <= 0 ? 'Out of Stock' : (quantityVal <= minAlertVal ? 'Low Stock' : 'In Stock'),
                user: item.user || this.currentChefName,
                eid: item.eid || this.currentChefId,
                request_item: Number(item.request_item || 0),         
                request_to_admin: item.request_to_admin || 'None',    
                temp_adjust_qty: 0,
                request_qty: 0 
              };
            });
          } else {
            this.ingredients = [];
          }
          
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err: any) => {
        this.zone.run(() => {
          console.error('API Fetch Error:', err);
          this.ingredients = [];
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  addKitchenItem() {
    if (!this.newItem.ingredient_name.trim()) {
      alert('Please enter an ingredient name!');
      return;
    }

    const payload: KitchenRawMaterial = {
      eid: this.currentChefId,
      ingredient_name: this.newItem.ingredient_name.trim(),
      quantity: Number(this.newItem.quantity),
      unit: this.newItem.unit,
      minimum_stock_alert: Number(this.newItem.minimum_stock_alert),
      request_item: 0,            
      request_to_admin: 'None',   
      status: Number(this.newItem.quantity) <= Number(this.newItem.minimum_stock_alert) ? 'Low Stock' : 'In Stock',
      user: this.currentChefName
    };

    this.chefService.addRawMaterial(payload).subscribe({
      next: (res: any) => {
        this.zone.run(() => {
          alert('✅ New Raw Ingredient Saved Successfully to Database!');
          this.showAddModal = false;
          this.newItem = { ingredient_name: '', quantity: 1, unit: 'kg', minimum_stock_alert: 2 };
          this.fetchStockFromApi();
        });
      },
      error: (err: any) => {
        const backendMsg = err?.error?.errors ? JSON.stringify(err.error.errors) : err?.error?.message;
        alert(`❌ Failed to add ingredient: ${backendMsg || 'Validation Error'}`);
      }
    });
  }

  // ⚡ Bulk Quantity Update
  updateBulkStock(item: KitchenIngredient, mode: 'REMOVE') { // Mode ADD removed/ignored
    if (!item.id) return;

    const inputValue = Number(item.temp_adjust_qty || 0);
    if (inputValue <= 0) {
      alert('Please enter a quantity greater than 0!');
      return;
    }

    let finalQty = Number(item.quantity);
    
    // 🎯 (+ADD) Logic Commented Out!
    /*
    if (mode === 'ADD') {
      finalQty += inputValue;
    } 
    */
    
    if (mode === 'REMOVE') {
      if (inputValue > finalQty) {
        alert(`⚠️ Error: Stock mein sirf ${finalQty} ${item.unit} available hain. Aap ${inputValue} ${item.unit} deduct nahi kar sakte!`);
        return; 
      }
      finalQty -= inputValue;
    }

    const updatedStatus = finalQty <= 0 ? 'Out of Stock' : (finalQty <= item.minimum_stock_alert ? 'Low Stock' : 'In Stock');

    const updatePayload: KitchenRawMaterial = {
      eid: item.eid,
      ingredient_name: item.ingredient_name,
      quantity: finalQty,
      unit: item.unit,
      minimum_stock_alert: item.minimum_stock_alert,
      request_item: item.request_item,         
      request_to_admin: item.request_to_admin, 
      status: updatedStatus,
      user: this.currentChefName
    };

    this.chefService.updateRawMaterial(item.id, updatePayload as any).subscribe({
      next: () => {
        this.zone.run(() => {
          item.temp_adjust_qty = 0;
          this.fetchStockFromApi();
        });
      },
      error: (err: any) => {
        console.error('Failed to update stock:', err);
        this.fetchStockFromApi();
      }
    });
  }

  sendRestockRequest(item: KitchenIngredient) {
    const reqQty = Number(item.request_qty || 0);
    
    if (reqQty <= 0) {
      alert('Please enter a valid quantity to request!');
      return;
    }

    const payload = {
      eid: item.eid,
      ingredient_name: item.ingredient_name,
      quantity: item.quantity,
      unit: item.unit,
      minimum_stock_alert: item.minimum_stock_alert,
      request_item: reqQty,             
      request_to_admin: 'Pending',      
      status: item.status,
      user: this.currentChefName
    };

    this.chefService.updateRawMaterial(item.id!, payload as any).subscribe({
      next: () => {
        this.zone.run(() => {
          alert(`📩 Request Sent! Admin panel par ${item.displayName} ke ${reqQty} ${item.unit} ka restock request chala gaya hai.`);
          item.request_qty = 0;
          this.fetchStockFromApi(); 
        });
      },
      error: (err: any) => {
        console.error('Request failed:', err);
        alert('❌ Failed to send request.');
      }
    });
  }

  get filteredIngredients() {
    if (!this.searchQuery) return this.ingredients;
    const q = this.searchQuery.toLowerCase();
    return this.ingredients.filter(i => (i.displayName || i.ingredient_name || '').toLowerCase().includes(q));
  }

  get lowStockItems() {
    return this.ingredients.filter(i => i.quantity <= i.minimum_stock_alert);
  }
}