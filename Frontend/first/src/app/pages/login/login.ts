import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);

  credentials = {
    email: '',
    password: ''
  };

  errorMessage = '';
  isLoading = false;

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

        // 🛑 STRICT ADMIN RESTRICTION: Admins are not allowed to log in via Customer Portal
        if (userRole === 'admin') {
          this.authService.logout(); // Immediate Session Clear
          const errorMsg = '⛔ Access Denied! Admin accounts must log in via the Super Admin Portal.';
          this.errorMessage = errorMsg;
          alert(errorMsg);
          this.router.navigate(['/admin/login']); // Redirect to Admin Portal
          return;
        }

        // 🟢 Successful Customer / Staff Login
        alert(`🎉 Welcome back, ${user?.name || 'User'}! Login Successful.`);
        
        if (userRole.includes('manager') || userRole.includes('delivery')) {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/home']);
        }
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