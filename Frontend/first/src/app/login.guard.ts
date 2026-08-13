import { inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth';
import { isPlatformBrowser } from '@angular/common';

export const loginGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // 🛑 SSR Bypass: Agar server par hai, toh koi redirection mat maaro
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // Agar user pehle se logged-in hai (Browser environment me)
  if (authService.currentUserValue || sessionStorage.getItem('currentUser')) {
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