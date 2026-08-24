import { Routes } from '@angular/router';

// Pages & Components Imports
import { authGuard } from './auth.guard'; 
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { AdminSettingsComponent } from './pages/admin-settings/admin-settings';
import { InventoryComponent } from './pages/inventory/inventory';
import { DeliveriesComponent } from './pages/deliveries/deliveries';
import { EmployeesComponent } from './pages/employees/employees';
import { MembershipComponent } from './pages/membership/membership';
import { MyOrdersComponent } from './pages/customer/my-orders/my-orders';
import { ProfileComponent } from './pages/customer/profile/profile';
import { ChefDashboardComponent } from './pages/chef-dashboard/chef-dashboard/chef-dashboard';
import { loginGuard } from './login.guard';

// 🆕 New Role Portals
import { DeliveryExecutiveComponent } from './pages/delivery-executive/delivery-executive';
import { StoreManagerComponent } from './pages/store-manager/store-manager';
import { KitchenAssistantComponent } from './pages/kitchen-assistant/kitchen-assistant';

// 👑 Admin Components Imports
import { AdminLoginComponent } from './pages/admin-login/admin-login';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'home', 
    pathMatch: 'full' 
  },
  
  // Public Routes
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },           
  { path: 'register', component: RegisterComponent },        
  { path: 'admin/login', component: AdminLoginComponent },

  // Protected Routes
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },      
  { path: 'my-orders', component: MyOrdersComponent, canActivate: [authGuard] },      
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'chef/dashboard', component: ChefDashboardComponent, canActivate: [authGuard] },
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [authGuard] },
  { path: 'inventory', component: InventoryComponent, canActivate: [authGuard] },
  { path: 'deliveries', component: DeliveriesComponent, canActivate: [authGuard] },
  { path: 'employees', component: EmployeesComponent, canActivate: [authGuard] },
  { path: 'admin-settings', component: AdminSettingsComponent, canActivate: [authGuard] },
  { path: 'membership', component: MembershipComponent, canActivate: [authGuard] },

  // 🆕 New Role Portals
  { path: 'delivery/dashboard', component: DeliveryExecutiveComponent, canActivate: [authGuard] },
  { path: 'store-manager/dashboard', component: StoreManagerComponent, canActivate: [authGuard] },
  { path: 'kitchen-assistant/dashboard', component: KitchenAssistantComponent, canActivate: [authGuard] },

  // Wildcard Route
  { path: '**', redirectTo: 'home' }
];