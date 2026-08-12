import { Component, inject, OnInit, OnDestroy, PLATFORM_ID, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
// 👇 1. Database se data laane ke liye Inventory Service import ki gayi
import { InventoryService } from '../../services/inventory'; 

interface FoodItem {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  image: string;
  description: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  inventoryService = inject(InventoryService); // 👇 2. Service Inject ki gayi
  router = inject(Router);
  platformId = inject(PLATFORM_ID);
  cdr = inject(ChangeDetectorRef);

  currentUser: any = null;
  isEliteMember: boolean = false;
  eliteTier: string = ''; 

  categories: string[] = ['All'];
  selectedCategory: string = 'All';
  allDishes: FoodItem[] = [];

  @ViewChild('dishSlider') dishSlider!: ElementRef;
  private autoSlideInterval: any;

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user && isPlatformBrowser(this.platformId)) {
        const eliteStatus = localStorage.getItem(`elite_member_${user.email}`);
        const tier = localStorage.getItem(`elite_tier_${user.email}`);
        this.isEliteMember = eliteStatus === 'true';
        if (tier) {
          this.eliteTier = tier;
        }
      } else {
        this.isEliteMember = false;
        this.eliteTier = '';
      }
    });

    if (isPlatformBrowser(this.platformId)) {
      // 👇 3. LocalStorage hata kar seedha live API call lagayi gayi
      this.fetchLiveMenu(); 
    }
  }

  // ==========================================
  // 🔴 API: FETCH LIVE MENU FROM DATABASE
  // ==========================================
  fetchLiveMenu() {
    this.inventoryService.getInventory().subscribe({
      next: (inventory: any[]) => {
        if (inventory && inventory.length > 0) {
          // Database ke names (item_name, price_per_unit) ko front-end format mein map kar rahe hain
          this.allDishes = inventory.map((inv: any) => ({
            id: inv.id,
            name: inv.item_name || inv.name || 'Special Dish',
            category: inv.category || 'General',
            price: Number(inv.price_per_unit || inv.price || 0),
            rating: 4.8, // Static rating for now
            image: inv.image_url || inv.image || 'https://ui-avatars.com/api/?name=Food&background=10B981&color=fff',
            description: inv.description || 'Freshly prepared signature luxury dish.'
          }));

          const uniqueCategories: string[] = Array.from(new Set(this.allDishes.map(dish => String(dish.category))));
          this.categories = ['All', ...uniqueCategories];
          this.selectedCategory = 'All';
        } else {
          this.allDishes = [];
          this.categories = ['All'];
        }
        this.cdr.detectChanges(); // UI Update Trigger
        this.startAutoSlide();
      },
      error: (err) => {
        console.error('❌ Failed to load menu from Database:', err);
        this.allDishes = [];
        this.categories = ['All'];
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  selectCategory(cat: string) {
    this.selectedCategory = cat;
  }

  get filteredDishes() {
    if (this.selectedCategory === 'All') {
      return this.allDishes;
    }
    return this.allDishes.filter(dish => dish.category.toLowerCase() === this.selectedCategory.toLowerCase());
  }

  navigateToMembership() {
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate(['/membership']);
  }

  scrollMenu(direction: 'left' | 'right') {
    this.stopAutoSlide();
    if (this.dishSlider && this.dishSlider.nativeElement) {
      const slider = this.dishSlider.nativeElement;
      const scrollAmount = 350;
      if (direction === 'left') {
        slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
    this.startAutoSlide();
  }

  startAutoSlide() {
    if (isPlatformBrowser(this.platformId)) {
      this.autoSlideInterval = setInterval(() => {
        if (this.dishSlider && this.dishSlider.nativeElement) {
          const slider = this.dishSlider.nativeElement;
          const maxScrollLeft = slider.scrollWidth - slider.clientWidth;
          
          if (slider.scrollLeft >= maxScrollLeft - 10) {
            slider.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            slider.scrollBy({ left: 350, behavior: 'smooth' });
          }
        }
      }, 1500);
    }
  }

  stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }
}