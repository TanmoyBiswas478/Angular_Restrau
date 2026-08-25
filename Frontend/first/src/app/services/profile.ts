import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfile {
  id?: number;
  customer_id?: string;
  eid?: string; // 👈 Staff ID support ke liye
  name: string;
  email: string;
  phone?: string;
  address?: string;
  membership?: string;
  avatar_url?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private http = inject(HttpClient);

  private baseUrl = 'http://192.168.1.117:1234/api';
  private serverOrigin = this.baseUrl.replace(/\/api\/?$/, '');

  private ngrokHeaders = new HttpHeaders({
    'ngrok-skip-browser-warning': 'true',
    'Accept': 'application/json'
  });

  // Helper: Pata lagana ki user Customer hai ya Employee (Staff)
  private getEndpoint(id: string | number): string {
    const idStr = String(id);
    
    // 🛑 Agar ID 'EID' se shuru hoti hai YA agar user staff hai (Aap yahan role check ya localStorage use kar sakte hain)
    // Lekin sabse aasan tareeka hai ki hum AuthService ya current user se role dekhein, 
    // ya phir agar ID number choti hai aur wo customer nahi hai toh employee endpoint check ho.
    
    if (idStr.toUpperCase().startsWith('EID')) {
      return `${this.baseUrl}/employees/${id}`;
    }
    
    // ⚠️ Agar aap Admin/Chef login hain aur ID '1' ya kuch aur number hai jo ki Employee table mein hai:
    // Hum check kar sakte hain ki current logged-in user ka role customer nahi hai.
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser && currentUser.role && currentUser.role.toLowerCase() !== 'customer') {
      return `${this.baseUrl}/employees/${id}`;
    }

    return `${this.baseUrl}/customers/${id}`;
  }

  // 1. Fetch Profile Details
  getProfile(id: string | number): Observable<UserProfile> {
    const idStr = String(id);
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isStaff = idStr.toUpperCase().startsWith('EID') || (currentUser.role && currentUser.role.toLowerCase() !== 'customer');

    const url = this.getEndpoint(id);
    
    return isStaff
      ? this.http.get<UserProfile>(`${this.baseUrl}/employees/${id}/profile`, { headers: this.ngrokHeaders })
      : this.http.get<UserProfile>(url, { headers: this.ngrokHeaders });
  }

  // 2. Update Profile Info
  updateProfile(id: string | number, data: Partial<UserProfile>): Observable<any> {
    const headers = new HttpHeaders({
      'ngrok-skip-browser-warning': 'true',
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
    const url = this.getEndpoint(id);
    return this.http.put<any>(url, data, { headers });
  }

  // 3. Upload Profile Photo
  uploadAvatar(id: string | number, formData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      'ngrok-skip-browser-warning': 'true'
    });
    const idStr = String(id);
    const uploadUrl = idStr.toUpperCase().startsWith('EID')
      ? `${this.baseUrl}/employees/${id}/avatar`
      : `${this.baseUrl}/uploadcustomerimage/${id}`;

    return this.http.post<any>(uploadUrl, formData, { headers });
  }

  // 4. Change Password
  changePassword(id: string | number, passwords: { current_password?: string; new_password: string }): Observable<any> {
    const idStr = String(id);
    const passUrl = idStr.toUpperCase().startsWith('EID')
      ? `${this.baseUrl}/employees/${id}/change-password`
      : `${this.baseUrl}/customers/${id}/change-password`;

    return this.http.post<any>(passUrl, passwords, { headers: this.ngrokHeaders });
  }

  // 5. Delete Account
  deleteAccount(id: string | number): Observable<any> {
    const url = this.getEndpoint(id);
    return this.http.delete<any>(url, { headers: this.ngrokHeaders });
  }

  resolveImageUrl(raw?: string | null): string {
    if (!raw) return '';
    let val = String(raw).trim();
    if (!val) return '';

    // 🛑 Agar yeh pehle se hi external URL hai (jaise Google Drive, Facebook, ya koi aur link), toh ise bina kisi badlaav ke return karo!
    if (/^(https?:)?\/\//i.test(val) || val.startsWith('data:') || val.startsWith('blob:')) {
      return val;
    }

    // Agar local file path hai toh storage link banayein
    val = val.replace(/^\/+/, '');        
    val = val.replace(/^public\//i, '');  
    val = val.replace(/^storage\//i, ''); 

    if (!val.includes('/')) {
      val = `employees/${val}`; // Staff/Employees ke liye 'employees/' folder
    }

    return `${this.serverOrigin}/storage/${val}`;
  }
}