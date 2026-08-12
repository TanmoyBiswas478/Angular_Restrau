import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MenuService {
  // Default links aur roles
  private defaultMenu = [
    { path: '/home', label: '🏠 Home', roles: ['admin', 'shopkeeper', 'delivery', 'customer'] },
    { path: '/dashboard', label: '🍽️ Order Food', roles: ['customer', 'admin'] },
    { path: '/inventory', label: '📦 Manage Stock', roles: ['admin', 'shopkeeper'] },
    { path: '/chef/dashboard', label: '👨‍🍳 Kitchen Stock', roles: ['admin', 'chef'] },
    { path: '/deliveries', label: '🚚 Pending Deliveries', roles: ['admin', 'delivery'] },
    { path: '/employees', label: '👥 Employee Details', roles: ['admin'] },
    { path: '/admin-settings', label: '⚙️ Settings', roles: ['admin'] },
  ];

  private menuSubject = new BehaviorSubject(this.loadMenu());
  currentMenu$ = this.menuSubject.asObservable();

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  private loadMenu() {
    if (!this.isBrowser()) return this.defaultMenu;
    const savedMenu = localStorage.getItem('app_menu');
    if (savedMenu) return JSON.parse(savedMenu);
    
    // Agar pehli baar app khul raha hai, toh default save kar do
    localStorage.setItem('app_menu', JSON.stringify(this.defaultMenu));
    return this.defaultMenu;
  }

  // Admin jab changes save karega toh yeh function chalega
  updateMenu(newMenu: any[]) {
    if (this.isBrowser()) {
      localStorage.setItem('app_menu', JSON.stringify(newMenu));
      this.menuSubject.next(newMenu); // Navbar ko turant update karne ka signal
    }
  }
}