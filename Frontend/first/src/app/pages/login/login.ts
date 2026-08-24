import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <!-- Jab tak check ho raha hai, tab tak pure page par sirf ek dark background dikhega, ek bhi form element render nahi hoga -->
    <div *ngIf="isChecking" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: #0b0f19; z-index: 99999;"></div>

    <!-- Agar logged-in nahi hai, tabhi asli login form render hoga -->
    <div *ngIf="!isChecking">
      <!-- Tumhara purana HTML template load hoga -->
      <ng-container *ngTemplateOutlet="loginFormTemplate"></ng-container>
    </div>

    <ng-template #loginFormTemplate>
      <!-- Yahan tum apna original login form ka HTML code ya template file laga sakte ho -->
    </ng-template>
  `,
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);

  credentials = { email: '', password: '' };
  errorMessage = '';
  isLoading = false;
  isChecking = true; // 🟢 Ekdum strict flag jo flash ko block karega

  ngOnInit() {
    if (this.authService.currentUserValue || (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('currentUser'))) {
      const user = this.authService.currentUserValue || JSON.parse(sessionStorage.getItem('currentUser') || '{}');
      const userRole = user?.role ? user.role.toLowerCase() : '';

      if (userRole === 'admin') {
        this.router.navigate(['/admin/dashboard']);
        return;
      }

      this.router.navigate([this.routeForRole(userRole)]);
      return;
    }

    // Agar user logged-in nahi hai, tabhi checking off karke form dikhao
    this.isChecking = false;
  }

  // 🎯 Har role ko uske sahi portal par bhejne wali central logic
  private routeForRole(userRole: string): string {
    const r = (userRole || '').toLowerCase();
    if (r.includes('delivery') || r.includes('rider')) return '/delivery/dashboard';
    if (r.includes('assistant')) return '/kitchen-assistant/dashboard'; // Chef se pehle
    if (r.includes('chef') || r.includes('kitchen')) return '/chef/dashboard';
    if (r.includes('manager') || r.includes('manage')) return '/store-manager/dashboard';
    return '/home'; // Customer & fallback
  }

  onLogin() {
    this.errorMessage = '';

    if (!this.credentials.email.trim() || !this.credentials.password.trim()) {
      const msg = '⚠️ Please fill in both email and password!';
      this.errorMessage = msg;
      alert(msg);
      return;
    }

    this.isLoading = true;

    this.authService.login(this.credentials).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const user = res.user || res;
        const userRole = user?.role ? user.role.toLowerCase() : '';

        if (userRole === 'admin') {
          this.authService.logout();
          const errorMsg = '⛔ Access Denied! Admin accounts must log in via the Super Admin Portal.';
          this.errorMessage = errorMsg;
          alert(errorMsg);
          this.router.navigate(['/admin/login']);
          return;
        }

        alert(`🎉 Welcome back, ${user?.name || 'User'}! Login Successful.`);

        this.router.navigate([this.routeForRole(userRole)]);
      },
      error: (err: any) => {
        this.isLoading = false;
        let userMsg = '❌ Login failed. Please check your credentials.';

        if (err?.status === 404) {
          userMsg = '⚠️ Account not found! Please check your email address or register first.';
        } else if (err?.status === 401) {
          userMsg = '⚠️ Incorrect password! Please check and try again.';
        } else if (err?.status === 422) {
          userMsg = '⚠️ Please enter a valid email address.';
        } else if (err?.error?.message) {
          userMsg = `❌ ${err.error.message}`;
        }

        this.errorMessage = userMsg;
        alert(userMsg);
      }
    });
  }
}