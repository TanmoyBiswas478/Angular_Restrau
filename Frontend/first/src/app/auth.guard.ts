import { inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth';
import { isPlatformBrowser } from '@angular/common';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // 🛑 SSR Bypass: Agar server par hai, toh allow kar do taaki browser check kar sake
  if (!isPlatformBrowser(platformId)) {
    return true; 
  }

  // 1. In-memory check
  if (authService.currentUserValue) {
    return true;
  }

  // 2. Browser SessionStorage check
  const savedUser = sessionStorage.getItem('currentUser');
  if (savedUser) {
    try {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser) {
        authService.restoreSession(parsedUser);
        return true;
      }
    } catch (e) {
      console.error('Session parse error', e);
    }
  }

  // 3. Agar browser me koi session nai hai tabhi login par bhejo
  router.navigate(['/login']);
  return false;
};