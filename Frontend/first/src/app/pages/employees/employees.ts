import { Component, OnInit, inject, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService, Employee, EmployeeStatus } from '../../services/employee';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employees.html',
  styleUrl: './employees.css',
})
export class EmployeesComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  statusList: EmployeeStatus[] = ['Active', 'On Leave', 'Resigned', 'Suspended'];

  employees: any[] = [];
  totalEmployees: number = 0;
  isLoading: boolean = false;

  // Form Models
  newName = '';
  newRole = 'Delivery Executive';
  newEmail = '';
  selectedCountryCode = '+91';
  newPhone = '';
  newAvatarUrl = '';
  newStatus: EmployeeStatus = 'Active';

  // Error Messages
  nameError = '';
  emailError = '';
  phoneError = '';

  // Edit Tracker (Real Numeric ID)
  editingEmployeeId: number | null = null;

  get avatarUrl(): string {
    return this.newAvatarUrl;
  }
  set avatarUrl(val: string) {
    this.newAvatarUrl = val;
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.fetchEmployees();
    }
  }

  fetchEmployees() {
    this.isLoading = true;
    this.employeeService.getEmployees().subscribe({
      next: (data: any) => {
        const rawList = Array.isArray(data) ? data : (data.data || []);
        
        // 🎯 FIX: id ko ensure kar rahe hain ki woh numeric ho ya string eid
        this.employees = rawList.map((emp: any) => ({
          ...emp,
          id: emp.id || emp.eid // Agar id nahi mili toh eid ko id bana lo
        }));

        this.totalEmployees = this.employees.length;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Database fetch error:', err);
        this.employees = [];
        this.totalEmployees = 0;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

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

    const emailTrimmed = this.newEmail.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailTrimmed) {
      this.emailError = 'Email address is required.';
      isValid = false;
    } else if (!emailRegex.test(emailTrimmed)) {
      this.emailError = 'Please enter a valid email address.';
      isValid = false;
    } else {
      this.emailError = '';
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

  private processAvatarUrl(url: string, name: string): string {
    const trimmed = url.trim();
    if (!trimmed) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E11D48&color=fff`;
    }
    if (trimmed.includes('drive.google.com')) {
      const match = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://lh3.googleusercontent.com/d/${match[1]}`;
      }
    }
    return trimmed;
  }

  addEmployee() {
    this.saveEmployee();
  }

  saveEmployee() {
    if (!this.validateForm()) {
      alert('⚠️ Please fix the errors in the form before submitting.');
      return;
    }

    const formattedPhone = `${this.selectedCountryCode} ${this.newPhone.trim()}`;
    const avatar = this.processAvatarUrl(this.newAvatarUrl, this.newName);

    const payload: any = {
      name: this.newName.trim(),
      role: this.newRole,
      email: this.newEmail.trim(),
      phone: formattedPhone,
      avatar_url: avatar,
      status: this.newStatus,
    };

    if (this.editingEmployeeId !== null) {
      this.employeeService.updateEmployee(this.editingEmployeeId, payload).subscribe({
        next: () => {
          alert('✏️ Staff details updated in Database!');
          this.fetchEmployees();
          this.resetForm();
        },
        error: (err: any) => {
          console.error('Update failed:', err);
          const errorMsg = err.error?.errors
            ? JSON.stringify(err.error.errors)
            : 'Validation failed.';
          alert('❌ Failed to update employee: ' + errorMsg);
        },
      });
    } else {
      this.employeeService.addEmployee(payload).subscribe({
        next: () => {
          alert('👤 Employee registered in Database!');
          this.fetchEmployees();
          this.resetForm();
        },
        error: (err: any) => {
          console.error('Create failed:', err);
          const errorMsg = err.error?.errors
            ? JSON.stringify(err.error.errors)
            : 'Validation failed.';
          alert('❌ Registration failed: ' + errorMsg);
        },
      });
    }
  }

  // ⚡ FIXED START EDIT (Uses numeric ID)
  startEdit(emp: any) {
    const numericId = Number(emp.id);
    if (!numericId) {
      alert('❌ Error: Employee ID is missing!');
      return;
    }

    this.editingEmployeeId = numericId;
    this.newName = emp.name;
    this.newRole = emp.role;
    this.newEmail = emp.email;

    const imgUrl = emp.avatar_url || emp.avatarUrl || '';
    this.newAvatarUrl = imgUrl.includes('ui-avatars.com') ? '' : imgUrl;
    this.newStatus = emp.status || 'Active';

    const safePhone = emp.phone || '';
    const phoneParts = safePhone.split(' ');

    if (phoneParts.length > 1 && phoneParts[0].startsWith('+')) {
      this.selectedCountryCode = phoneParts[0];
      this.newPhone = phoneParts.slice(1).join('');
    } else {
      this.selectedCountryCode = '+91';
      this.newPhone = safePhone;
    }

    this.validateForm();
    this.cdr.detectChanges();
  }

  resetForm() {
    this.editingEmployeeId = null;
    this.newName = '';
    this.newRole = 'Delivery Executive';
    this.newEmail = '';
    this.selectedCountryCode = '+91';
    this.newPhone = '';
    this.newAvatarUrl = '';
    this.newStatus = 'Active';

    this.nameError = '';
    this.emailError = '';
    this.phoneError = '';

    this.cdr.detectChanges();
  }

  // ⚡ FIXED STATUS UPDATE (Uses numeric ID)
  updateStatus(emp: any, newStatus: string) {
    const numericId = Number(emp.id);
    if (!numericId) return;

    const oldStatus = emp.status;
    emp.status = newStatus as EmployeeStatus;
    this.cdr.detectChanges();

    this.employeeService
      .updateEmployee(numericId, { status: newStatus as EmployeeStatus })
      .subscribe({
        next: () => console.log('Status updated successfully in DB!'),
        error: (err: any) => {
          console.error('Failed to update status:', err);
          alert('❌ Server error while updating status.');
          emp.status = oldStatus;
          this.cdr.detectChanges();
        },
      });
  }

  // ⚡ FIXED DELETE (Uses numeric ID)
  deleteEmployee(emp: any) {
    const numericId = Number(emp.id);
    if (!numericId) {
      alert('❌ Error: Delete karne ke liye valid ID nahi mili.');
      return;
    }

    if (confirm('Are you sure you want to remove this staff member?')) {
      this.employeeService.deleteEmployee(numericId).subscribe({
        next: () => {
          alert('🗑️ Employee deleted from Database.');
          this.fetchEmployees();
          if (this.editingEmployeeId === numericId) {
            this.resetForm();
          }
        },
        error: (err: any) => {
          console.error('Delete failed:', err);
          alert('❌ Failed to delete employee from database.');
        },
      });
    }
  }

  onImageError(event: Event, name: string) {
    const target = event.target as HTMLImageElement;
    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E11D48&color=fff`;
  }
}
