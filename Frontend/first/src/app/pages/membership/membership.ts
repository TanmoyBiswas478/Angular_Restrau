import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ProfileService } from '../../services/profile'; // 👈 Database update ke liye ProfileService import kiya

@Component({
  selector: 'app-membership',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './membership.html',
  styleUrl: './membership.css'
})
export class MembershipComponent implements OnInit {
  authService = inject(AuthService);
  profileService = inject(ProfileService); // 👈 Inject kiya gaya hai
  router = inject(Router);
  platformId = inject(PLATFORM_ID);

  currentUser: any = null;
  showPaymentModal: boolean = false;
  selectedPlanName: string = '';
  selectedPlanPrice: number = 0;
  isProcessing: boolean = false;

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  // Payment Modal Open Karne Ka Function
  openPaymentModal(planName: string, price: number) {
    if (!this.currentUser) {
      alert('Please sign in first to purchase a membership!');
      this.router.navigate(['/login']);
      return;
    }
    this.selectedPlanName = planName;
    this.selectedPlanPrice = price;
    this.showPaymentModal = true;
  }

  // Modal Close Function
  closePaymentModal() {
    if (!this.isProcessing) {
      this.showPaymentModal = false;
    }
  }

  // 🌟 Payment Gateway Process & Database Sync Logic
  processPayment() {
    this.isProcessing = true;
    
    // Simulate Payment Delay (2 seconds)
    setTimeout(() => {
      if (isPlatformBrowser(this.platformId) && this.currentUser) {
        
        // 1. LocalStorage par backup ke liye save rakha hai
        localStorage.setItem(`elite_member_${this.currentUser.email}`, 'true');
        localStorage.setItem(`elite_tier_${this.currentUser.email}`, this.selectedPlanName);

        // 2. 🚀 SABSE ZAROORI: Seedha Database mein Membership Update bhej rahe hain
        const userId = this.currentUser.customer_id || this.currentUser.cid || this.currentUser.id;
        
        if (userId) {
          const payload = {
            name: this.currentUser.name,
            email: this.currentUser.email,
            phone: this.currentUser.phone || '',
            membership: this.selectedPlanName // 👈 Yahan naya plan database mein jayega
          };

          this.profileService.updateProfile(userId, payload).subscribe({
            next: () => {
              console.log('✅ Membership successfully updated in Database!');
            },
            error: (err) => {
              console.error('❌ Failed to sync membership with database:', err);
            }
          });
        }
      }
      
      this.isProcessing = false;
      this.showPaymentModal = false;
      
      alert(`🎉 Payment Successful! Welcome to ${this.selectedPlanName}. Redirecting to your Dashboard...`);
      
      // Direct redirect to Dashboard
      this.router.navigate(['/dashboard']);
    }, 2000);
  }
}