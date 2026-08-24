import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CustomerUser {
  id?: number;
  customer_id?: string;
  customer_name: string;
  customer_email: string;
  phone: string;
  password?: string;
  role: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private http = inject(HttpClient);
  
  // Laravel API Endpoint for Customers / User Registration
  private apiUrl = 'http://192.168.0.101:1234/api/customers';

  // 1. Fetch All Registered Customers
  getRegisteredUsers(): Observable<CustomerUser[]> {
    return this.http.get<CustomerUser[]>(this.apiUrl);
  }

  // 2. Register New Customer / User in Database
  registerUser(userData: CustomerUser): Observable<CustomerUser> {
    return this.http.post<CustomerUser>(this.apiUrl, userData);
  }

  // 3. Update Customer Details
  updateUser(id: number, userData: Partial<CustomerUser>): Observable<CustomerUser> {
    return this.http.put<CustomerUser>(`${this.apiUrl}/${id}`, userData);
  }

  // 4. Delete Registered Customer
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}