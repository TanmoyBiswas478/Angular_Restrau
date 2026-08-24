import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InventoryItem {
  id?: number;
  item_name: string;
  category: string;
  quantity: number;
  unit: string; // e.g., 'kg', 'liters', 'packets'
  image_url?: string;
  min_stock_level: number;
  price_per_unit: number;
  status?: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private http = inject(HttpClient);
  private apiUrl = `http://192.168.0.101:1234/api/inventory`;

  // 🎯 ngrok warning page ko bypass karne ke liye headers
  private ngrokHeaders = new HttpHeaders({
    'ngrok-skip-browser-warning': 'true',
    'Accept': 'application/json'
  });

  // 1. Fetch All Inventory Items
  getInventory(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(this.apiUrl, { headers: this.ngrokHeaders });
  }

  // 2. Add New Inventory Item
  addInventoryItem(item: InventoryItem): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(this.apiUrl, item, { headers: this.ngrokHeaders });
  }

  // 3. Update Inventory Item
  updateInventoryItem(id: number, item: Partial<InventoryItem>): Observable<InventoryItem> {
    return this.http.put<InventoryItem>(`${this.apiUrl}/${id}`, item, { headers: this.ngrokHeaders });
  }

  // 4. Delete Inventory Item
  deleteInventoryItem(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.ngrokHeaders });
  }
}