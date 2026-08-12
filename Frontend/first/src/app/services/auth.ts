import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface UserPayload {
  id?: number;
  customer_id?: string;
  cid?: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: string;
  membership?: string;
  address?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  private apiUrl = 'http://192.168.1.117:1234/api';

  // 🎯 ngrok warning page bypass headers
  private ngrokHeaders = new HttpHeaders({
    'ngrok-skip-browser-warning': 'true',
    'Accept': 'application/json'
  });

  // Active User State (Synchronously loaded from sessionStorage immediately)
  private currentUserSubject = new BehaviorSubject<UserPayload | null>(this.getUser());
  currentUser$ = this.currentUserSubject.asObservable();

  // 🎯 Getter to access current value synchronously inside Guards
  get currentUserValue(): UserPayload | null {
    return this.currentUserSubject.value;
  }

  private idleTimeout: any;
  private readonly IDLE_TIME_LIMIT = 5 * 60 * 1000; // 🌟 5 Minutes Inactivity Limit

  constructor() {
    if (this.isBrowser() && this.getUser()) {
      this.initIdleTimer();
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // Helper to fetch user from SessionStorage safely
  private getUser(): UserPayload | null {
    if (this.isBrowser()) {
      try {
        const user = sessionStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
      } catch (e) {
        console.error('Error reading session storage:', e);
        return null;
      }
    }
    return null;
  }

  // 🌟 CRITICAL FIX: Method for Auth Guard to sync state back on refresh
  restoreSession(user: UserPayload) {
    if (!this.currentUserSubject.value) {
      this.currentUserSubject.next(user);
      this.initIdleTimer();
    }
  }

  // 1. REGISTER USER VIA API
  register(userData: UserPayload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData, { headers: this.ngrokHeaders });
  }

  // 2. LOGIN USER VIA API (Stored in SessionStorage)
  login(credentials: { email: string; password?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials, { headers: this.ngrokHeaders }).pipe(
      tap((response: any) => {
        console.log('🔍 Full Login Response:', response);
        
        const user = response.user || response;
        if (this.isBrowser()) {
          sessionStorage.setItem('currentUser', JSON.stringify(user));
          if (response.token) {
            sessionStorage.setItem('authToken', response.token);
          }
        }
        this.currentUserSubject.next(user);
        this.initIdleTimer();
      })
    );
  }

  // 3. LOGOUT USER (Clears SessionStorage)
  logout() {
    if (this.isBrowser()) {
      sessionStorage.removeItem('currentUser');
      sessionStorage.removeItem('authToken');
    }
    this.currentUserSubject.next(null);
    this.clearIdleTimer();
    this.router.navigate(['/login']);
  }

  // 🌟 5-Minute Inactivity Tracker
  initIdleTimer() {
    if (!this.isBrowser()) return;

    this.resetTimer();

    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, () => this.resetTimer());
    });
  }

  resetTimer() {
    if (!this.isBrowser()) return;
    if (!this.currentUserSubject.value) return;

    clearTimeout(this.idleTimeout);
    this.idleTimeout = setTimeout(() => {
      this.triggerAutoLogout();
    }, this.IDLE_TIME_LIMIT);
  }

  triggerAutoLogout() {
    if (this.currentUserSubject.value) {
      alert('⏰ Session expired due to 5 minutes of inactivity. Please log in again.');
      this.logout();
    }
  }

  clearIdleTimer() {
    if (this.isBrowser()) {
      clearTimeout(this.idleTimeout);
    }
  }
}