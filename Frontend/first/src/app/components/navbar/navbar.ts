import { Component, inject, Output, EventEmitter, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth';
import { MenuService } from '../../services/menu';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit {
  authService = inject(AuthService);
  menuService = inject(MenuService);
  router = inject(Router);
  platformId = inject(PLATFORM_ID);

  isOpen = false;
  isDarkMode = true;
  @Output() sidebarToggled = new EventEmitter<boolean>();

  menuItems: any[] = [];

  ngOnInit() {
    this.menuService.currentMenu$.subscribe(menu => {
      this.menuItems = menu || [];
    });

    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('app_theme');
      this.isDarkMode = savedTheme ? savedTheme === 'dark' : true;
      this.applyTheme();
    }
  }

  toggleSidebar() {
    this.isOpen = !this.isOpen;
    this.sidebarToggled.emit(this.isOpen);
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('app_theme', this.isDarkMode ? 'dark' : 'light');
      this.applyTheme();
    }
  }

  private applyTheme() {
    if (isPlatformBrowser(this.platformId)) {
      const theme = this.isDarkMode ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
    }
  }

  getAllowedLinks(userRole: string) {
    if (!userRole) return [];
    
    let formattedRole = userRole.toLowerCase().trim();

    // 🎯 ROLE NORMALIZER
    if (formattedRole === 'customer' || formattedRole === 'user') {
      formattedRole = 'customer';
    } else if (formattedRole.includes('assistant')) {
      formattedRole = 'kitchen-assistant';
    } else if (formattedRole.includes('chef') || formattedRole.includes('kitchen')) {
      formattedRole = 'chef';
    } else if (formattedRole.includes('deliver') || formattedRole.includes('rider')) {
      formattedRole = 'delivery';
    } else if (formattedRole.includes('manage')) {
      formattedRole = 'manager';
    } else if (formattedRole.includes('admin') || formattedRole.includes('super')) {
      formattedRole = 'admin';
    }

    // 🍔 CUSTOMER — Added Profile Link here
    if (formattedRole === 'customer') {
      return [
        { label: '🏠 Home', path: '/home' },
        { label: '🍔 Order Food', path: '/dashboard' },
        { label: '🛍️ My Orders', path: '/my-orders' },
        { label: '👤 Profile', path: '/profile' } // 👈 Yeh raha profile
      ];
    }

    // 🚚 DELIVERY EXECUTIVE — Added Profile Link
    if (formattedRole === 'delivery') {
      return [
        { label: '🏠 Home', path: '/home' },
        { label: '🚚 My Deliveries', path: '/delivery/dashboard' },
        { label: '👤 Profile', path: '/profile' } // 👈 Added
      ];
    }

    // 🏪 STORE MANAGER — Added Profile Link
    if (formattedRole === 'manager') {
      return [
        { label: '🏪 Dashboard', path: '/store-manager/dashboard' },
        { label: '📦 Inventory', path: '/inventory' },
        { label: '👥 Staff', path: '/employees' },
        { label: '🚚 Deliveries', path: '/deliveries' },
        { label: '👤 Profile', path: '/profile' } // 👈 Added
      ];
    }

    // 🧑‍🍳 KITCHEN ASSISTANT — Added Profile Link
    if (formattedRole === 'kitchen-assistant') {
      return [
        { label: '🏠 Home', path: '/home' },
        { label: '🧑‍🍳 Kitchen Stock', path: '/kitchen-assistant/dashboard' },
        { label: '👤 Profile', path: '/profile' } // 👈 Added
      ];
    }

    // ----------------------------------------------------
    // 👇 STAFF (Admin, Chef, etc.) dynamic logic
    // ----------------------------------------------------
    if (this.menuItems.length === 0) {
      // Agar menu items load nahi bhi hue, tab bhi Admin/Chef ko Profile dikhane ke liye fallback:
      return [
        { label: '👤 Profile', path: '/profile' }
      ];
    }

    const filteredLinks = this.menuItems
      .filter(item => {
        if (!item || !Array.isArray(item.roles)) return false;
        const lowerCaseRoles = item.roles.map((r: string) => r.toLowerCase().trim());
        return lowerCaseRoles.includes(formattedRole);
      })
      .map(item => {
        let newLabel = item.label;

        if (newLabel.includes('Order') && !newLabel.includes('🍔')) newLabel = '🍔 Order Food';
        else if ((newLabel.includes('Stock') || newLabel.includes('Inventory')) && !newLabel.includes('Kitchen') && !newLabel.includes('📦')) newLabel = '📦 Manage Stock';
        else if (newLabel.includes('Deliver') && !newLabel.includes('🚚')) newLabel = '🚚 Pending Deliveries';
        else if (newLabel.includes('Employee') && !newLabel.includes('👥')) newLabel = '👥 Employee Details';
        else if (newLabel.includes('Settings') && !newLabel.includes('⚙️')) newLabel = '⚙️ Settings';

        if (formattedRole === 'admin' && (item.path === '/home' || newLabel.includes('Admin'))) {
          return { ...item, label: '👑 Admin Dashboard', path: '/admin/dashboard' };
        }
        
        return { ...item, label: newLabel };
      });

    // 🎯 Admin Guard: Ensure Admin always sees Kitchen Stock & Profile
    if (formattedRole === 'admin') {
      if (!filteredLinks.some((link: any) => link.path === '/chef/dashboard')) {
        filteredLinks.splice(1, 0, { label: '👨‍🍳 Kitchen Stock', path: '/chef/dashboard' });
      }
    }

    // 👤 Sabhi dynamic staff ke links mein Profile ensure karna
    if (!filteredLinks.some((link: any) => link.path === '/profile')) {
      filteredLinks.push({ label: '👤 Profile', path: '/profile' });
    }

    return filteredLinks;
  }

  logout() {
    this.authService.logout();
    this.isOpen = false;
    this.sidebarToggled.emit(this.isOpen);
    this.router.navigate(['/login']);
  }
}