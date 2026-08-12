import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService, UserProfile } from '../../../services/profile';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  profile: UserProfile = {
    name: '',
    email: '',
    phone: '',
    address: '',
    membership: 'Standard',
    avatar_url: ''
  };

  userId: string | number = '';
  isLoading = true;
  isSavingInfo = false;
  isChangingPass = false;

  passwordData = {
    current_password: '',
    new_password: '',
    confirm_password: ''
  };

  previewAvatar: string | null = null;
  selectedFile: File | null = null;

  ngOnInit() {
    // 🛑 No LocalStorage: Strictly using AuthService Observable
    this.authService.currentUser$.subscribe((user: any) => {
      if (user) {
        this.userId = user.customer_id || user.cid || user.id || '';
        if (this.userId) {
          this.loadProfile();
        } else {
          this.isLoading = false;
        }
      } else {
        this.isLoading = false;
        this.router.navigate(['/login']);
      }
    });
  }

  loadProfile() {
    this.isLoading = true;
    if (!this.userId) return;

    this.profileService.getProfile(this.userId).subscribe({
      next: (res: UserProfile) => {
        this.profile = { ...res };
        if (res.avatar_url) {
          this.previewAvatar = res.avatar_url;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch profile from server:', err);
        alert('❌ Failed to load profile from database.');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const MAX_SIZE_BYTES = 1024 * 1024; 
    if (file.size > MAX_SIZE_BYTES) {
      alert(`⚠️ File size exceeds 1MB limit! Selected file is ${(file.size / 1024).toFixed(2)}KB.`);
      event.target.value = '';
      return;
    }

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const aspect = img.width / img.height;
      if (aspect < 0.6 || aspect > 1.4) {
        alert('⚠️ Please upload a passport-size photograph (close to 1:1 aspect ratio).');
        event.target.value = '';
        return;
      }

      this.selectedFile = file;
      this.previewAvatar = img.src;
      this.uploadPhoto();
    };
  }

  uploadPhoto() {
    if (!this.selectedFile || !this.userId) return;

    const formData = new FormData();
    formData.append('avatar', this.selectedFile);

    this.profileService.uploadAvatar(this.userId, formData).subscribe({
      next: (res: any) => {
        alert('✅ Profile photograph updated successfully!');
        if (res.avatar_url) {
          this.profile.avatar_url = res.avatar_url;
          this.previewAvatar = res.avatar_url; 
          this.cdr.detectChanges(); 
        }
      },
      error: (err) => {
        console.error('Avatar upload failed:', err);
        alert('❌ Failed to upload photo.');
        this.cdr.detectChanges();
      }
    });
  }

  saveProfileInfo() {
    if (!this.profile.email || !this.profile.name) {
      alert('⚠️ Name and Email are required.');
      return;
    }

    this.isSavingInfo = true;
    
    const payload = {
      name: this.profile.name,
      email: this.profile.email,
      phone: this.profile.phone || '',
      address: this.profile.address || '',
      membership: this.profile.membership || 'Standard'
    };

    if (!this.userId) {
      alert('⚠️ User ID is missing!');
      this.isSavingInfo = false;
      return;
    }

    this.profileService.updateProfile(this.userId, payload).subscribe({
      next: () => {
        alert('✅ Profile updated directly in Database successfully!');
        this.isSavingInfo = false;
        this.loadProfile(); // Database se fresh data reload karega
      },
      error: (err) => {
        console.error('Profile update failed:', err);
        alert('❌ Failed to update profile in database.');
        this.isSavingInfo = false;
        this.cdr.detectChanges();
      }
    });
  }

  updatePassword() {
    if (!this.passwordData.new_password) {
      alert('⚠️ Please enter a new password.');
      return;
    }

    if (this.passwordData.new_password !== this.passwordData.confirm_password) {
      alert('⚠️ New Password and Confirm Password do not match.');
      return;
    }

    this.isChangingPass = true;
    this.profileService.changePassword(this.userId, {
      current_password: this.passwordData.current_password,
      new_password: this.passwordData.new_password
    }).subscribe({
      next: () => {
        alert('🔒 Password changed successfully!');
        this.passwordData = { current_password: '', new_password: '', confirm_password: '' };
        this.isChangingPass = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Password change failed:', err);
        alert('❌ Password change failed. Verify your current password.');
        this.isChangingPass = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmDeleteAccount() {
    const confirmed = confirm('⚠️ ARE YOU SURE? This action is permanent and will delete your account history.');
    if (!confirmed) return;

    const doubleCheck = prompt('Type "DELETE" to permanently erase your profile:');
    if (doubleCheck !== 'DELETE') {
      alert('Account deletion cancelled.');
      return;
    }

    this.profileService.deleteAccount(this.userId).subscribe({
      next: () => {
        alert('Account deleted successfully.');
        this.authService.logout();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Delete account failed:', err);
        alert('❌ Failed to delete account.');
      }
    });
  }
}