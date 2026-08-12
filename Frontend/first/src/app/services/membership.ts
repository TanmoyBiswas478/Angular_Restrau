import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MembershipPlan {
  id?: number;
  plan_name: string;
  price: number;
  duration_months: number;
  discount_percentage: number;
  benefits: string[];
}

export interface Member {
  id?: number;
  customer_name: string;
  email: string;
  phone: string;
  plan_id: number;
  plan_name?: string;
  start_date: string;
  end_date: string;
  status: 'Active' | 'Expired' | 'Cancelled';
}

@Injectable({
  providedIn: 'root'
})
export class MembershipService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/memberships`;

  getPlans(): Observable<MembershipPlan[]> {
    return this.http.get<MembershipPlan[]>(`${this.apiUrl}/plans`);
  }

  getMembers(): Observable<Member[]> {
    return this.http.get<Member[]>(`${this.apiUrl}/members`);
  }

  addMember(member: Member): Observable<Member> {
    return this.http.post<Member>(`${this.apiUrl}/members`, member);
  }

  updateMemberStatus(id: number, status: string): Observable<Member> {
    return this.http.put<Member>(`${this.apiUrl}/members/${id}/status`, { status });
  }

  cancelMembership(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/members/${id}`);
  }
}