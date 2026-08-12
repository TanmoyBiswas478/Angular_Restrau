import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RegisterService } from '../../services/register';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  registerService = inject(RegisterService);
  router = inject(Router);

  // Form Models
  newName = '';
  selectedCountryCode = '+91';
  newPhone = '';
  isLoading = false;

  user = {
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'Customer',
  };

  // Error Messages
  nameError = '';
  phoneError = '';
  errorMessage = '';

  blockNumbers(event: KeyboardEvent) {
    const key = event.key;
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', ' '];
    if (allowedKeys.includes(key) || event.ctrlKey || event.metaKey) return;

    if (!/^[a-zA-Z]$/.test(key)) {
      event.preventDefault();
    }
  }

  blockLetters(event: KeyboardEvent) {
    const key = event.key;
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
    if (allowedKeys.includes(key) || event.ctrlKey || event.metaKey) return;

    if (!/^[0-9]$/.test(key)) {
      event.preventDefault();
    }
  }

  onNameInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let cleaned = input.value.replace(/[^a-zA-Z\s]/g, '');

    this.newName = cleaned
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    this.validateForm();
  }

  validatePhoneInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.newPhone = input.value.replace(/\D/g, '');
    this.validateForm();
  }

  validateForm(): boolean {
    let isValid = true;

    const nameTrimmed = this.newName.trim();
    if (!nameTrimmed) {
      this.nameError = 'Full name is required.';
      isValid = false;
    } else if (nameTrimmed.length < 2) {
      this.nameError = 'Name must be at least 2 characters long.';
      isValid = false;
    } else {
      this.nameError = '';
    }

    const phoneTrimmed = this.newPhone.trim();
    if (!phoneTrimmed) {
      this.phoneError = 'Phone number is required.';
      isValid = false;
    } else if (phoneTrimmed.length !== 10) {
      this.phoneError = 'Phone number must be exactly 10 digits.';
      isValid = false;
    } else {
      this.phoneError = '';
    }

    return isValid;
  }

  onRegister() {
    this.errorMessage = '';

    if (!this.validateForm()) {
      const msg = '⚠️ Please fix the form validation errors before submitting.';
      this.errorMessage = msg;
      alert(msg);
      return;
    }

    if (!this.user.email || !this.user.password) {
      const msg = '⚠️ Please fill all required fields (Email & Password).';
      this.errorMessage = msg;
      alert(msg);
      return;
    }

    this.isLoading = true;

    const payload = {
      customer_name: this.newName.trim(),
      customer_email: this.user.email.trim(),
      phone: `${this.selectedCountryCode} ${this.newPhone.trim()}`,
      role: this.user.role || 'Customer',
      password: this.user.password,
    };

    this.registerService.registerUser(payload).subscribe({
      next: () => {
        this.isLoading = false;
        alert('🎉 Registration Successful! Click OK to proceed to login.');
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.isLoading = false;
        let userFriendlyMsg = '❌ Registration failed. Please try again.';

        // 🔍 Handle Specific Validation Errors from Backend (e.g. Email Already Exists)
        if (err?.status === 422 && err?.error?.errors) {
          const errorsObj = err.error.errors;
          
          if (errorsObj.customer_email || errorsObj.email) {
            userFriendlyMsg = '⚠️ This email address is already registered! Please use a different email or sign in.';
          } else if (errorsObj.password) {
            userFriendlyMsg = '⚠️ Password must be at least 4 characters long.';
          } else if (errorsObj.phone) {
            userFriendlyMsg = '⚠️ Invalid or duplicate phone number.';
          } else {
            const firstKey = Object.keys(errorsObj)[0];
            userFriendlyMsg = `⚠️ ${errorsObj[firstKey][0]}`;
          }
        } else if (err?.status === 500) {
          userFriendlyMsg = '❌ Server internal error. Please contact support or try later.';
        } else if (err?.error?.message) {
          userFriendlyMsg = `❌ ${err.error.message}`;
        }

        // 🔔 Alert Pop-up for Instant Feedback
        this.errorMessage = userFriendlyMsg;
        alert(userFriendlyMsg);
      }
    });
  }
}