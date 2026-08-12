import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css'
})
export class AdminLoginComponent {
  authService = inject(AuthService);
  router = inject(Router);

  credentials = { email: '', password: '' };
  errorMessage = '';
  isLoading = false;

  onAdminLogin() {
    this.errorMessage = '';

    if (!this.credentials.email.trim() || !this.credentials.password.trim()) {
      alert('⚠️ Please fill in both Admin Email and Password.');
      return;
    }

    this.isLoading = true;

    this.authService.login(this.credentials).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const user = res.user || res;
        const userRole = user?.role ? user.role.toLowerCase() : '';

        // 🔒 STRICT ADMIN ROLE SECURITY CHECK
        if (userRole === 'admin') {
          alert(`👑 Welcome Super Admin, ${user.name || 'Admin'}!`);
          this.router.navigate(['/admin/dashboard']);
        } else {
          alert('⛔ Access Denied! This portal is strictly restricted for Super Admins.');
          this.authService.logout();
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        const msg = err?.error?.message || '❌ Admin Login Failed!';
        this.errorMessage = msg;
        alert(msg);
      }
    });
  }
}