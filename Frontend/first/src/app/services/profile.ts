import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfile {
  id?: number;
  customer_id?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string; // 👈 Address bhi add kar diya
  membership?: string;
  avatar_url?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private http = inject(HttpClient);

  // 👇 1. Aapka Local Backend IP
  private baseUrl = 'http://192.168.1.117:1234/api';

  // 👇 2. Customers API URL (Pehle /profile tha, ab /customers hai)
  private apiUrl = `${this.baseUrl}/customers`;

  // 👇 3. Backend ORIGIN (without /api). Laravel serves uploaded files from
  //    http://192.168.1.117:1234/storage/... (via the public/storage symlink),
  //    NOT from under /api and NOT from the Angular dev server on :4200.
  private serverOrigin = this.baseUrl.replace(/\/api\/?$/, '');

  private ngrokHeaders = new HttpHeaders({
    'ngrok-skip-browser-warning': 'true',
    'Accept': 'application/json'
  });

  // 1. Fetch Profile Details
  getProfile(id: string | number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/${id}`, { headers: this.ngrokHeaders });
  }

  // 2. Update Profile Info (Email/Name/Phone/Address)
  // services/profile.ts
updateProfile(id: string | number, data: Partial<UserProfile>): Observable<any> {
  const headers = new HttpHeaders({
    'ngrok-skip-browser-warning': 'true',
    'Accept': 'application/json',
    'Content-Type': 'application/json' // 👈 YEH SABSE ZAROORI HAI
  });
  return this.http.put<any>(`${this.apiUrl}/${id}`, data, { headers });
}

  // 3. Upload Profile Photo
  uploadAvatar(id: string | number, formData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      'ngrok-skip-browser-warning': 'true'
    });
    // 👇 Exact Upload API Route
    return this.http.post<any>(`${this.baseUrl}/uploadcustomerimage/${id}`, formData, { headers });
  }

  // 4. Change Password
  changePassword(id: string | number, passwords: { current_password?: string; new_password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/change-password`, passwords, { headers: this.ngrokHeaders });
  }

  // 5. Delete Account
  deleteAccount(id: string | number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.ngrokHeaders });
  }

  /**
   * Build a browser-loadable URL for a Laravel "public disk" avatar.
   *
   * Your file lives at:  storage/app/public/customers/<file>.png
   * Laravel serves it at: http://192.168.1.117:1234/storage/customers/<file>.png
   * (requires `php artisan storage:link` — see note below).
   *
   * The DB might store the path in several shapes; this normalises all of them
   * to  {serverOrigin}/storage/customers/<file>:
   *   "customers/x.png"           -> http://192.168.1.117:1234/storage/customers/x.png
   *   "/storage/customers/x.png"  -> http://192.168.1.117:1234/storage/customers/x.png
   *   "storage/customers/x.png"   -> http://192.168.1.117:1234/storage/customers/x.png
   *   "public/customers/x.png"    -> http://192.168.1.117:1234/storage/customers/x.png
   *   "x.png" (bare filename)     -> http://192.168.1.117:1234/storage/customers/x.png
   *   "http://.../x.png"          -> used as-is (already absolute)
   *   "" / null / undefined       -> "" (component shows the default avatar)
   */
  resolveImageUrl(raw?: string | null): string {
    if (!raw) return '';
    let val = String(raw).trim();
    if (!val) return '';

    // Already usable as-is: absolute http(s), protocol-relative, data: or blob:
    if (/^(https?:)?\/\//i.test(val) || val.startsWith('data:') || val.startsWith('blob:')) {
      return val;
    }

    // Normalise a Laravel storage path into the public /storage/... web path
    val = val.replace(/^\/+/, '');        // drop any leading slashes
    val = val.replace(/^public\//i, '');  // "public/customers/x.png" -> "customers/x.png"
    val = val.replace(/^storage\//i, ''); // "storage/customers/x.png" -> "customers/x.png"

    // Bare filename with no folder → it lives in the customers/ folder
    if (!val.includes('/')) {
      val = `customers/${val}`;
    }

    return `${this.serverOrigin}/storage/${val}`;
  }
}