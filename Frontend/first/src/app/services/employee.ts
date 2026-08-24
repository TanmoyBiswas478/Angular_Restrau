import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export type EmployeeStatus = 'Active' | 'On Leave' | 'Resigned' | 'Suspended';

export interface Employee {
  id?: number;
  eid?: string;          // Employee ID (e.g. EMP1, EMP2)
  name: string;
  role: string;          // e.g. Store Manager, Delivery Executive, Chef, Kitchen Assistant
  email: string;
  phone?: string;
  password?: string;     // Added for Admin when creating new staff account
  avatar_url?: string;
  avatarUrl?: string;
  status?: EmployeeStatus;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private http = inject(HttpClient);
  
  private apiUrl = 'http://192.168.0.101:1234/api/employees';

  // 🎯 ngrok warning page ko bypass karne ke liye headers
  private ngrokHeaders = new HttpHeaders({
    'ngrok-skip-browser-warning': 'true',
    'Accept': 'application/json'
  });

  // 1. Fetch All Staff Members
  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl, { headers: this.ngrokHeaders });
  }

  // 2. Add/Create New Staff (Admin Panel)
  addEmployee(emp: Employee): Observable<any> {
    return this.http.post<any>(this.apiUrl, emp, { headers: this.ngrokHeaders });
  }

  // 3. Create Staff Alias (Compatibility method)
  createEmployee(emp: Employee): Observable<any> {
    return this.addEmployee(emp);
  }

  // 4. Update Staff Details
  updateEmployee(id: number, emp: Partial<Employee>): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}`, emp, { headers: this.ngrokHeaders });
  }

  // 5. Delete Staff Member
  deleteEmployee(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.ngrokHeaders });
  }
}