import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth';

export const loginGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Agar user pehle se logged-in hai, toh login page mat kholne do, seedha dashboard bhejo
  if (authService.currentUserValue || (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('currentUser'))) {
    const user = authService.currentUserValue || JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    const role = user?.role ? user.role.toLowerCase() : '';

    if (role === 'admin') {
      router.navigate(['/admin/dashboard']);
    } else if (role.includes('manager') || role.includes('delivery')) {
      router.navigate(['/dashboard']);
    } else {
      router.navigate(['/home']);
    }
    return false; // Login page par jane se rok diya
  }

  return true; // Agar logged-in nahi hai, toh login page khulne do
};