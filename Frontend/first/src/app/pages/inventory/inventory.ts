import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService, InventoryItem } from '../../services/inventory';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css',
})
export class InventoryComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private cdr = inject(ChangeDetectorRef);

  inventoryItems: InventoryItem[] = [];
  availableCategories: string[] = [];
  isLoading = false;

  // New Item Form State
  newItemName = '';
  newItemCategory = '';
  newItemPrice: number | null = null;
  newItemStock: number | null = null;
  newItemUnit = 'pcs';
  newItemImageUrl = '';

  // Validation Error Messages
  itemNameError = '';
  categoryError = '';
  priceError = '';
  stockError = '';

  ngOnInit() {
    this.fetchInventory();
  }

  fetchInventory() {
    this.isLoading = true;
    this.inventoryService.getInventory().subscribe({
      next: (data) => {
        this.inventoryItems = data || [];
        this.updateCategoriesList();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Fetch Error:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateCategoriesList() {
    if (this.inventoryItems && this.inventoryItems.length > 0) {
      const unique: string[] = Array.from(
        new Set(this.inventoryItems.map(item => String(item.category).trim()))
      );
      this.availableCategories = unique;
    } else {
      this.availableCategories = [];
    }
  }

  // 🚫 1. BLOCK NUMBERS & SYMBOLS IN DISH NAME (Keyboard Level)
  blockNumbersAndSymbols(event: KeyboardEvent) {
    const key = event.key;
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', ' '];
    if (allowedKeys.includes(key) || event.ctrlKey || event.metaKey) return;

    if (!/^[a-zA-Z]$/.test(key)) {
      event.preventDefault();
    }
  }

  // 🚫 2. BLOCK NUMBERS IN CATEGORY (Allows letters, spaces, and hyphens)
  blockNumbersForCategory(event: KeyboardEvent) {
    const key = event.key;
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', ' ', '-'];
    if (allowedKeys.includes(key) || event.ctrlKey || event.metaKey) return;

    if (!/^[a-zA-Z]$/.test(key)) {
      event.preventDefault();
    }
  }

  // 🔤 3. DISH NAME INPUT HANDLER (Auto Title-Case)
  onItemNameInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let cleaned = input.value.replace(/[^a-zA-Z\s]/g, '');

    this.newItemName = cleaned
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    this.validateItemForm();
  }

  // 🔤 4. CATEGORY INPUT HANDLER (Auto Title-Case)
  onCategoryInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let cleaned = input.value.replace(/[^a-zA-Z\s-]/g, '');

    this.newItemCategory = cleaned
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    this.validateItemForm();
  }

  normalizeCategory(input: string): string {
    if (!input) return 'General';
    let cleanedInput = input.trim().toLowerCase();

    const typoMap: { [key: string]: string } = {
      'stadar': 'Starter',
      'stater': 'Starter',
      'strater': 'Starter',
      'starer': 'Starter',
      'main corse': 'Main Course',
      'mian course': 'Main Course',
      'dessert': 'Desserts',
      'snak': 'Snacks'
    };

    if (typoMap[cleanedInput]) return typoMap[cleanedInput];

    return cleanedInput
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // 🔍 5. FORM VALIDATION LOGIC
  validateItemForm(): boolean {
    let isValid = true;

    // Item Name Validation
    const nameTrimmed = (this.newItemName || '').trim();
    if (!nameTrimmed) {
      this.itemNameError = 'Item / Dish name is required.';
      isValid = false;
    } else if (nameTrimmed.length < 2) {
      this.itemNameError = 'Name must be at least 2 characters long.';
      isValid = false;
    } else {
      this.itemNameError = '';
    }

    // Category Validation
    const categoryTrimmed = (this.newItemCategory || '').trim();
    if (!categoryTrimmed) {
      this.categoryError = 'Category is required.';
      isValid = false;
    } else if (categoryTrimmed.length < 2) {
      this.categoryError = 'Category must be at least 2 characters long.';
      isValid = false;
    } else {
      this.categoryError = '';
    }

    // Price Validation
    if (this.newItemPrice === null || this.newItemPrice <= 0) {
      this.priceError = 'Please enter a valid price greater than 0.';
      isValid = false;
    } else {
      this.priceError = '';
    }

    // Stock Validation
    if (this.newItemStock === null || this.newItemStock < 0) {
      this.stockError = 'Stock quantity cannot be empty or negative.';
      isValid = false;
    } else {
      this.stockError = '';
    }

    return isValid;
  }

  private processImageUrl(url: string, name: string): string {
    const trimmed = url.trim();
    if (!trimmed) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10B981&color=fff`;
    }

    if (trimmed.includes('drive.google.com')) {
      const match = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://lh3.googleusercontent.com/d/${match[1]}`;
      }
    }
    return trimmed;
  }

  addItem() {
    if (!this.validateItemForm()) {
      alert('⚠️ Please fix the errors in the form before submitting.');
      return;
    }

    const correctedCategory = this.normalizeCategory(this.newItemCategory);
    const finalImage = this.processImageUrl(this.newItemImageUrl, this.newItemName);

    const payload: InventoryItem = {
      item_name: this.newItemName.trim(),
      category: correctedCategory,
      quantity: Number(this.newItemStock),
      unit: this.newItemUnit,
      image_url: finalImage,
      min_stock_level: 10,
      price_per_unit: Number(this.newItemPrice),
      status: Number(this.newItemStock) <= 10 ? 'Low Stock' : 'In Stock'
    };

    const tempId = Date.now();
    const tempItem = { ...payload, id: tempId };
    this.inventoryItems.unshift(tempItem);
    this.updateCategoriesList();
    this.resetForm();
    this.cdr.detectChanges();

    this.inventoryService.addInventoryItem(payload).subscribe({
      next: (resItem) => {
        const index = this.inventoryItems.findIndex(i => i.id === tempId);
        if (index !== -1) {
          this.inventoryItems[index] = resItem;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Save Error:', err);
        this.inventoryItems = this.inventoryItems.filter(i => i.id !== tempId);
        this.cdr.detectChanges();
        alert('❌ Database save failed.');
      }
    });
  }

  updateStock(item: InventoryItem, amount: number) {
    if (!item.id) return;

    const previousQuantity = item.quantity || 0;
    const newQuantity = Math.max(0, previousQuantity + amount);

    item.quantity = newQuantity;
    item.status = newQuantity <= (item.min_stock_level || 10) ? 'Low Stock' : 'In Stock';
    this.cdr.detectChanges();

    this.inventoryService.updateInventoryItem(item.id, {
      quantity: newQuantity,
      status: item.status
    }).subscribe({
      error: () => {
        item.quantity = previousQuantity;
        item.status = previousQuantity <= (item.min_stock_level || 10) ? 'Low Stock' : 'In Stock';
        this.cdr.detectChanges();
      }
    });
  }

  onStockInputChange(item: InventoryItem) {
    if (!item.id) return;
    if (item.quantity < 0 || item.quantity === null) item.quantity = 0;

    item.status = item.quantity <= (item.min_stock_level || 10) ? 'Low Stock' : 'In Stock';
    this.cdr.detectChanges();

    this.inventoryService.updateInventoryItem(item.id, {
      quantity: item.quantity,
      status: item.status
    }).subscribe();
  }

  onCategoryChange(item: InventoryItem) {
    if (!item.id) return;
    const cat = item.category?.trim() || 'General';

    this.updateCategoriesList();
    this.inventoryService.updateInventoryItem(item.id, { category: cat }).subscribe();
  }

  deleteItem(id?: number) {
    if (!id) return;

    if (confirm('Are you sure you want to delete this inventory item?')) {
      const backupList = [...this.inventoryItems];

      this.inventoryItems = this.inventoryItems.filter(item => item.id !== id);
      this.updateCategoriesList();
      this.cdr.detectChanges();

      this.inventoryService.deleteInventoryItem(id).subscribe({
        error: () => {
          this.inventoryItems = backupList;
          this.updateCategoriesList();
          this.cdr.detectChanges();
          alert('❌ Could not delete item from server.');
        }
      });
    }
  }

  onImageError(event: Event, name: string) {
    const target = event.target as HTMLImageElement;
    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10B981&color=fff`;
  }

  resetForm() {
    this.newItemName = '';
    this.newItemCategory = '';
    this.newItemPrice = null;
    this.newItemStock = null;
    this.newItemImageUrl = '';
    this.itemNameError = '';
    this.categoryError = '';
    this.priceError = '';
    this.stockError = '';
  }
}