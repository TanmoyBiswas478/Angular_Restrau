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
    this.authService.currentUser$.subscribe((user: any) => {
      if (user) {
        const role = (user.role || '').toLowerCase();
        
        // Agar user customer nahi hai (matlab Admin, Chef, Store Manager, etc.), 
        // toh unki ID ke aage 'EID' check karenge ya unka table employee hai.
        if (role === 'customer' || role === 'user') {
          this.userId = user.customer_id || user.cid || user.id || '';
        } else {
          // Staff ke liye agar user.eid nahi hai toh hum unki numeric id ya eid use karenge
          this.userId = user.eid || (user.id ? `EID${user.id}` : '') || user.id || '';
          
          // Agar database mein staff ki id sirf number (jaise 1, 2) save hai aur route /employees/1 mangta hai:
          // Agar aapka backend numbers ko support karta hai, toh aap direct user.id bhi de sakte hain.
          // Lekin hamare EmployeeController mein humne `orWhere('id', id)->orWhere('eid', id)` likha hai, 
          // toh yeh '1' ya 'EID1' dono ko pehchaan lega!
          if (!user.eid && user.id) {
            this.userId = user.id; 
          }
        }

        // Sabse badiya aur pakka tareeka: Agar role customer nahi hai, toh hum ensure karein ki 
        // service ko pata chale ki yeh employee hai. Hum yahan user.id ya user.eid bhej sakte hain.
        if (role !== 'customer' && role !== 'user' && user.id && !String(this.userId).startsWith('EID')) {
           // Agar aapka employee table auto-increment id use karta hai:
           this.userId = user.id;
        } else if (user.customer_id) {
           this.userId = user.customer_id;
        }

        console.log('[profile init] Resolved User ID:', this.userId, 'Role:', role);

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

  // Pull the avatar out of an API response no matter which key the backend used.
  // (avatar_url is expected, but we fall back to common alternatives just in case.)
  private pickAvatar(obj: any): string {
    return (
      obj?.avatar_url ||
      obj?.avatar ||
      obj?.image ||
      obj?.image_url ||
      obj?.photo ||
      obj?.profile_image ||
      obj?.customer_image ||
      ''
    );
  }

  loadProfile(bustCache = false) {
    this.isLoading = true;
    if (!this.userId) return;

    this.profileService.getProfile(this.userId).subscribe({
      next: (res: UserProfile) => {
        // 🔍 Debug: check what the server actually returns for the avatar.
        // Look here: is the avatar present? Is it "customers/x.png", "/storage/...", etc.?
        console.log('[profile] loaded from server:', res);

        this.profile = { ...res };

        // ✅ Build a FULL Laravel /storage URL. If nothing is returned,
        //    previewAvatar stays null and the default avatar shows.
        const rawAvatar = this.pickAvatar(res);
        if (rawAvatar) {
          let url = this.profileService.resolveImageUrl(rawAvatar);
          if (bustCache) {
            url += `${url.includes('?') ? '&' : '?'}t=${Date.now()}`;
          }
          this.previewAvatar = url;
        } else {
          this.previewAvatar = null;
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
      this.previewAvatar = img.src; // instant local preview (blob: url)
      this.uploadPhoto();
    };
  }

  uploadPhoto() {
    if (!this.selectedFile || !this.userId) return;

    const formData = new FormData();
    formData.append('avatar', this.selectedFile);

    this.profileService.uploadAvatar(this.userId, formData).subscribe({
      next: (res: any) => {
        // 🔍 Debug: does the upload response carry the new avatar path back?
        console.log('[profile] upload response:', res);
        alert('✅ Profile photograph updated successfully!');

        const rawAvatar = this.pickAvatar(res);
        if (rawAvatar) {
          // Response included the new path → show it right away.
          // ?t=... busts the browser cache in case a filename was reused.
          const url = this.profileService.resolveImageUrl(rawAvatar);
          this.profile.avatar_url = rawAvatar;
          this.previewAvatar = `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`;
          this.cdr.detectChanges();
        } else {
          // Response didn't include the path → pull the fresh record from the DB
          // (with cache-busting) so the saved photo shows without a manual reload.
          this.loadProfile(true);
        }
      },
      error: (err) => {
        console.error('Avatar upload failed:', err);
        alert('❌ Failed to upload photo.');
        this.cdr.detectChanges();
      }
    });
  }

  // 🖼️ Fired when the <img> can't load the avatar URL (e.g. 404 / wrong host).
  //    Logs the EXACT url that failed — the single most useful clue if the photo
  //    still doesn't show — then falls back to the default asset.
  onAvatarError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img.src.includes('default-avatar')) return; // stop loop if default is also missing
    console.warn('[profile] avatar failed to load:', img.src);
    this.previewAvatar = null;
    this.cdr.detectChanges();
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