import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.currentUserValue) {
    return true;
  }

  if (typeof sessionStorage !== 'undefined') {
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
  }

  router.navigate(['/login']);
  return false;
};