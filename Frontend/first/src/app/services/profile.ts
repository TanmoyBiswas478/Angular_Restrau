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
    // 👇 3. Exact Upload API Route
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
}