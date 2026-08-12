import { Routes } from '@angular/router';

// Pages & Components Imports
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
import { ChefDashboardComponent } from './pages/chef-dashboard/chef-dashboard/chef-dashboard'; // 👈 Added Chef Dashboard Component

// 👑 Admin Components Imports
import { AdminLoginComponent } from './pages/admin-login/admin-login';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  
  // Public & Customer Routes
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },            // Public Login
  { path: 'register', component: RegisterComponent },        // Customer Sign Up
  { path: 'dashboard', component: DashboardComponent },      // Portal
  { path: 'my-orders', component: MyOrdersComponent },      // Customer Orders
  { path: 'profile', component: ProfileComponent },

  // 👨‍🍳 Chef Dedicated Route
  { path: 'chef/dashboard', component: ChefDashboardComponent }, // 🟢 Kitchen Inventory & Stock Alerts

  // 👑 Dedicated Admin Routes
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent },

  // Internal Management Routes
  { path: 'inventory', component: InventoryComponent },
  { path: 'deliveries', component: DeliveriesComponent },     // Shared Deliveries Page for Admin & Chef
  { path: 'employees', component: EmployeesComponent },
  { path: 'admin-settings', component: AdminSettingsComponent },
  { path: 'membership', component: MembershipComponent },

  // Wildcard Route
  { path: '**', redirectTo: 'home' }
];