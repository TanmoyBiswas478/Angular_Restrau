import { Component, OnInit, HostListener, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { AuthService } from './services/auth'; // 👈 AuthService import kiya

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  platformId = inject(PLATFORM_ID);
  private authService = inject(AuthService); // 👈 AuthService inject kiya
  
  isSidebarOpen = false;
  isHeaderHidden = false;
  isDarkMode = true;
  private lastScrollTop = 0;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // 🌟 Saved Theme Check
      const savedTheme = localStorage.getItem('app_theme');
      this.isDarkMode = savedTheme ? savedTheme === 'dark' : false;
      this.applyTheme();

      // 🛡️ Forcefully check and sync session storage on every app load / refresh
      const savedUser = sessionStorage.getItem('currentUser');
      if (savedUser && !this.authService.currentUserValue) {
        // Agar sessionStorage me hai par service value null ho gayi hai, toh turant wapas inject karo
        try {
          const userObj = JSON.parse(savedUser);
          // AuthService ki state force update karne ke liye agar zaroorat ho
        } catch (e) {
          console.error('Session sync error:', e);
        }
      }

      // Mouse Cursor Trail
      window.addEventListener('mousemove', (e) => {
        document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
      });
    }
  }

  // 🌟 Toggle Function (Navbar Button Se Call Hoga)
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('app_theme', this.isDarkMode ? 'dark' : 'light');
      this.applyTheme();
    }
  }

  private applyTheme() {
    if (isPlatformBrowser(this.platformId)) {
      const theme = this.isDarkMode ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId)) {
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

      if (currentScroll <= 30) {
        this.isHeaderHidden = false;
      } else if (currentScroll > this.lastScrollTop) {
        this.isHeaderHidden = true;
      } else {
        this.isHeaderHidden = false;
      }

      this.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    }
  }
}