import { Component, inject, OnInit, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { InventoryService, InventoryItem } from '../../services/inventory';
import { DeliveryService } from '../../services/delivery';

interface FoodItem {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  image: string;
  description: string;
  stock: number;
  unit: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  inventoryService = inject(InventoryService);
  deliveryService = inject(DeliveryService);
  router = inject(Router);
  platformId = inject(PLATFORM_ID);
  cdr = inject(ChangeDetectorRef);

  selectedCategory: string = 'All';
  categories: string[] = ['All', 'Gourmet', 'Sushi', 'Steaks', 'Desserts', 'Snacks'];

  foodItems: FoodItem[] = [];
  cart: { item: FoodItem; quantity: number }[] = [];

  currentUser: any = null;
  isEliteUser: boolean = false;
  userTier: string = '';
  isLoading: boolean = false;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.authService.currentUser$.subscribe((user) => {
        this.currentUser = user;
        if (user) {
          const eliteStatus = localStorage.getItem(`elite_member_${user.email}`);
          const tier = localStorage.getItem(`elite_tier_${user.email}`);
          this.isEliteUser = eliteStatus === 'true';
          if (tier) this.userTier = tier;
        } else {
          this.isEliteUser = false;
          this.userTier = '';
        }
      });

      this.loadLiveInventoryFromDB();

      const savedCart = localStorage.getItem('foodie_cart');
      if (savedCart) {
        this.cart = JSON.parse(savedCart);
      }
    }
  }

  loadLiveInventoryFromDB() {
    this.isLoading = true;
    this.inventoryService.getInventory().subscribe({
      next: (data: InventoryItem[]) => {
        this.foodItems = data.map((inv: InventoryItem) => ({
          id: inv.id || Date.now(),
          name: inv.item_name,
          category: inv.category,
          price: inv.price_per_unit,
          rating: 4.8,
          image:
            inv.image_url ||
            'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
          description: 'Freshly prepared signature luxury dish.',
          stock: inv.quantity,
          unit: inv.unit || 'pcs',
        }));
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to load inventory from DB:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  get filteredItems() {
    if (this.selectedCategory === 'All') {
      return this.foodItems;
    }
    return this.foodItems.filter((item) => item.category === this.selectedCategory);
  }

  filterCategory(cat: string) {
    this.selectedCategory = cat;
  }

  addToCart(item: FoodItem) {
    if (item.stock <= 0) {
      alert(`❌ Sorry, "${item.name}" is currently Out of Stock!`);
      return;
    }

    const existing = this.cart.find((c) => c.item.id === item.id);
    const currentQtyInCart = existing ? existing.quantity : 0;

    if (currentQtyInCart + 1 > item.stock) {
      alert(`⚠️ Only ${item.stock} ${item.unit} of "${item.name}" are available in stock!`);
      return;
    }

    if (existing) {
      existing.quantity++;
    } else {
      this.cart.push({ item, quantity: 1 });
    }
    this.saveCartToStorage();
  }

  increaseQty(cartItem: { item: FoodItem; quantity: number }) {
    const liveItem = this.foodItems.find((f) => f.id === cartItem.item.id);
    const maxStock = liveItem ? liveItem.stock : cartItem.item.stock;

    if (cartItem.quantity + 1 > maxStock) {
      alert(`⚠️ Only ${maxStock} units of "${cartItem.item.name}" are available in stock!`);
      return;
    }
    cartItem.quantity++;
    this.saveCartToStorage();
  }

  decreaseQty(cartItem: { item: FoodItem; quantity: number }) {
    if (cartItem.quantity > 1) {
      cartItem.quantity--;
    } else {
      const index = this.cart.indexOf(cartItem);
      if (index > -1) {
        this.cart.splice(index, 1);
      }
    }
    this.saveCartToStorage();
  }

  onQuantityInputChange(cartItem: { item: FoodItem; quantity: number }, event: any) {
    let newVal = Number(event.target.value);
    const liveItem = this.foodItems.find((f) => f.id === cartItem.item.id);
    const maxStock = liveItem ? liveItem.stock : cartItem.item.stock;

    if (newVal < 1) {
      newVal = 1;
    } else if (newVal > maxStock) {
      alert(`⚠️ You cannot exceed the available stock limit of ${maxStock} units!`);
      newVal = maxStock;
      event.target.value = maxStock;
    }

    cartItem.quantity = newVal;
    this.saveCartToStorage();
  }

  removeFromCart(index: number) {
    this.cart.splice(index, 1);
    this.saveCartToStorage();
  }

  saveCartToStorage() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('foodie_cart', JSON.stringify(this.cart));
    }
  }

  get totalPrice() {
    return this.cart.reduce((sum, cartItem) => sum + cartItem.item.price * cartItem.quantity, 0);
  }

  // 💳 Fixed Live Checkout Logic
  // 💳 Live Checkout Logic (Fixed Order Number Requirement)
  // 💳 Live Checkout Logic (Fully Driven by Backend Logic & Dynamic User Object)
  checkout() {
    if (this.cart.length === 0) return;

    let user: any = this.currentUser;
    if (!user && isPlatformBrowser(this.platformId)) {
      const storedUser = localStorage.getItem('foodie_user') || localStorage.getItem('user');
      if (storedUser) {
        try {
          user = JSON.parse(storedUser);
        } catch (e) {
          console.error('Error parsing stored user:', e);
        }
      }
    }

    if (!user) {
      this.saveCartToStorage();
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('pending_cart', 'true');
      }

      const wantToRegister = confirm('You need to be registered or logged in to place a secure order. Click OK to go to Register.');
      if (wantToRegister) {
        this.router.navigate(['/register']);
      }
      return;
    }

    // 🎯 1. CUSTOMER NAME & CUSTOMER ID dynamically fetched from logged-in User State
    const customerName = user.name || user.customer_name || user.email || 'Valued Customer';
    
    // Logged-in user ke profile se dynamic Customer ID fetch ho rahi hai (No static/hardcoded values)
    const customerId = user.customer_id || user.cid;

    const itemsSummary = this.cart.map(c => `${c.item.name} (x${c.quantity})`).join(', ');

    // 🎯 2. PAYLOAD: No hardcoded IDs, No frontend-generated Order Numbers
    const deliveryPayload: any = {
      customer_id: customerId, // 👈 Dynamically fetched from user session/object
      customer_name: customerName, // 👈 Dynamically fetched customer name
      delivery_address: user.address || 'Standard Delivery Location',
      items: itemsSummary,
      total: this.totalPrice,
      status: 'Preparing',
      driver_name: 'Unassigned'
    };

    console.log('🚀 Final Payload sent to Backend API:', deliveryPayload);

    // 3. Post to Deliveries API
    this.deliveryService.addDelivery(deliveryPayload).subscribe({
      next: (res: any) => {
        let updatesCompleted = 0;
        
        // 4. Reduce Stock for each item
        this.cart.forEach(cartItem => {
          const newQty = Math.max(0, cartItem.item.stock - cartItem.quantity);

          this.inventoryService.updateInventoryItem(cartItem.item.id, {
            quantity: newQty,
            status: newQty <= 0 ? 'Out of Stock' : (newQty <= 10 ? 'Low Stock' : 'In Stock')
          }).subscribe({
            next: () => {
              updatesCompleted++;
              if (updatesCompleted === this.cart.length) {
                // 🟢 Backend Auto-Generated Response Fields Receive Kar Rahe Hain
                const createdOrderNo = res?.order_number || res?.orderNumber || 'Auto-Generated by DB';
                const createdCid = res?.customer_id || res?.cid || customerId || 'Fetched from Backend';

                alert(`🎉 Order Placed Successfully!\n\n📋 Order No: ${createdOrderNo}\n👤 Customer ID: ${createdCid}`);
                
                this.cart = [];
                if (isPlatformBrowser(this.platformId)) {
                  localStorage.removeItem('foodie_cart');
                  localStorage.removeItem('pending_cart');
                }
                this.loadLiveInventoryFromDB();
              }
            },
            error: (err: any) => console.error('Error updating inventory stock:', err)
          });
        });
      },
      error: (err: any) => {
        console.error('Failed to create delivery record:', err);
        alert('❌ Failed to place order: ' + (err.error?.message || 'Server error'));
      }
    });
  }
}