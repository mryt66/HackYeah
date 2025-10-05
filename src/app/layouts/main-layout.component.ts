import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MockAuthService } from '../core/services/mock-auth.service';
import { User, UserRole } from '../core/models/user.model';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-uknf-page">
      <header class="bg-white shadow-sm border-b border-uknf sticky top-0 z-50">
        <div class="px-4 lg:px-6">
          <div class="relative flex justify-between items-center h-16">
            <div class="flex items-center space-x-4">
              <button 
                (click)="toggleSidebar()" 
                class="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </button>
              <div class="flex items-center">
                <div class="flex flex-col text-xs leading-tight border-r border-gray-300 pr-3">
                  <span class="font-bold text-uknf-primary">URZD</span>
                  <span class="font-bold text-uknf-primary">KOMISJI</span>
                  <span class="font-bold text-uknf-primary">NADZORU</span>
                  <span class="font-bold text-uknf-primary">FINANSOWEGO</span>
                </div>
                <div class="ml-3">
                  <h1 class="text-base font-medium text-gray-900">System Komunikacji z Podmiotami</h1>
                </div>
              </div>
            </div>
            <div class="hidden md:flex items-center space-x-2 text-sm text-gray-600 absolute left-1/2 transform -translate-x-1/2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Koniec sesji za:</span>
              <span class="font-semibold text-uknf-primary">{{ sessionTimer }}</span>
            </div>
            <div class="flex items-center space-x-6">
              <div class="hidden md:flex items-center space-x-2">
                <button 
                  (click)="changeFontSize('small')"
                  [class.font-bold]="fontSize === 'small'"
                  class="text-sm hover:text-uknf-primary transition-colors"
                  title="Maa czcionka">A</button>
                <button 
                  (click)="changeFontSize('medium')"
                  [class.font-bold]="fontSize === 'medium'"
                  class="text-base hover:text-uknf-primary transition-colors"
                  title="rednia czcionka">A</button>
                <button 
                  (click)="changeFontSize('large')"
                  [class.font-bold]="fontSize === 'large'"
                  class="text-lg hover:text-uknf-primary transition-colors"
                  title="Dua czcionka">A</button>
                <button 
                  (click)="toggleHighContrast()"
                  class="p-1 ml-2 rounded hover:bg-gray-100"
                  title="Wysoki kontrast">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
              </div>
              <div class="flex items-center space-x-3 text-sm">
                <div class="hidden lg:block text-right">
                  <p class="font-medium text-gray-900">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</p>
                  <p class="text-xs text-gray-500">{{ userRoleLabel }}</p>
                </div>
                <button 
                  (click)="logout()"
                  class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors">Wyloguj</button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div class="flex">
        <aside 
          [class.hidden]="!sidebarOpen"
          class="lg:block w-64 bg-white border-r border-uknf min-h-[calc(100vh-4rem)] fixed lg:sticky top-16 left-0 z-40 overflow-y-auto">
          <nav class="py-4">
            <div class="px-4 mb-2">
              <h2 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">MENU</h2>
            </div>
            <a routerLink="/dashboard" routerLinkActive="bg-uknf-primary text-white" [routerLinkActiveOptions]="{exact: true}" class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors border-l-4 border-transparent hover:border-uknf-primary">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
              <span>Pulpit użytkownika</span>
            </a>
            <a routerLink="/library" routerLinkActive="bg-uknf-primary text-white" class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors border-l-4 border-transparent hover:border-uknf-primary">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
              <span>Biblioteka - repozytorium plików</span>
            </a>
            <a routerLink="/access-requests" routerLinkActive="bg-uknf-primary text-white" class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors border-l-4 border-transparent hover:border-uknf-primary">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <span>Wnioski o dostęp</span>
            </a>
            <a routerLink="/cases" routerLinkActive="bg-uknf-primary text-white" class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors border-l-4 border-transparent hover:border-uknf-primary">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
              <span>Sprawy</span>
            </a>
            <a routerLink="/reports" routerLinkActive="bg-uknf-primary text-white" class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors border-l-4 border-transparent hover:border-uknf-primary">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <span>Sprawozdawczość</span>
            </a>
            <a routerLink="/messages" routerLinkActive="bg-uknf-primary text-white" class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors border-l-4 border-transparent hover:border-uknf-primary">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              <span>Moje pytania</span>
            </a>
            <a routerLink="/faq" routerLinkActive="bg-uknf-primary text-white" class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors border-l-4 border-transparent hover:border-uknf-primary">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
              <span>Baza wiedzy</span>
            </a>
            <div *ngIf="isAdmin" class="mt-6 pt-6 border-t border-gray-200">
              <div class="px-4 mb-2">
                <h2 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">ADMINISTRACJA</h2>
              </div>
              <a routerLink="/admin" routerLinkActive="bg-uknf-primary text-white" class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors border-l-4 border-transparent hover:border-uknf-primary">
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                <span>Panel administracyjny</span>
              </a>
            </div>
          </nav>
        </aside>
        <main class="flex-1 lg:ml-0">
          <div class="bg-white border-b border-uknf">
            <div class="px-6 py-3">
              <div class="flex items-center text-sm text-gray-600 mb-2">
                <span class="font-medium">System:</span>
                <span class="mx-2">/</span>
                <span class="font-medium">Podmiot:</span>
                <span class="ml-2 text-gray-900">Instytucja Testowa</span>
              </div>
              <ng-content select="[breadcrumbTabs]"></ng-content>
            </div>
          </div>
          <div class="p-6">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
      <button *ngIf="sidebarOpen" (click)="toggleSidebar()" class="lg:hidden fixed bottom-4 left-4 z-50 p-3 bg-uknf-primary text-white rounded-full shadow-lg">
        <span class="text-xs">Zwiń menu</span>
      </button>
    </div>
  `,
  styles: [`
    :host ::ng-deep .router-link-active {
      background-color: #003d82 !important;
      color: white !important;
      border-left-color: #002d5f !important;
    }
    .timer-warning {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .5; }
    }
  `]
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  sidebarOpen = true;
  currentUser: User | null = null;
  sessionTimer = '45:00';
  sessionSeconds = 2700; // 45 minut (2700 sekund)
  fontSize: 'small' | 'medium' | 'large' = 'medium';
  highContrastMode = false;
  private timerSubscription?: Subscription;

  constructor(private mockAuthService: MockAuthService, private router: Router) {
    this.mockAuthService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
    });
  }

  ngOnInit(): void {
    this.startSessionTimer();
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  startSessionTimer(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      // Odliczaj w dół co sekundę
      this.sessionSeconds--;
      
      if (this.sessionSeconds <= 0) {
        // Zatrzymaj timer
        if (this.timerSubscription) {
          this.timerSubscription.unsubscribe();
        }
        // Wyloguj automatycznie
        alert('Sesja wygasła. Zostaniesz automatycznie wylogowany.');
        this.logout();
        return;
      }
      
      const minutes = Math.floor(this.sessionSeconds / 60);
      const seconds = this.sessionSeconds % 60;
      this.sessionTimer = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    });
  }

  get userInitials(): string {
    if (!this.currentUser) return '?';
    return `${this.currentUser.firstName?.charAt(0) || ''}${this.currentUser.lastName?.charAt(0) || ''}`.toUpperCase();
  }

  get userRoleLabel(): string {
    if (!this.currentUser) return '';
    switch (this.currentUser.role) {
      case UserRole.SUBJECT: return 'Uytkownik podmiotu';
      case UserRole.UKNF_EMPLOYEE: return 'Pracownik UKNF';
      case UserRole.ADMIN: return 'Administrator';
      default: return 'Uytkownik';
    }
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === UserRole.ADMIN;
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  changeFontSize(size: 'small' | 'medium' | 'large'): void {
    this.fontSize = size;
    document.body.classList.remove('font-small', 'font-large', 'font-extra-large');
    if (size === 'small') {
      document.body.classList.add('font-small');
    } else if (size === 'large') {
      document.body.classList.add('font-large');
    }
  }

  toggleHighContrast(): void {
    this.highContrastMode = !this.highContrastMode;
    if (this.highContrastMode) {
      document.body.classList.add('high-contrast-mode');
    } else {
      document.body.classList.remove('high-contrast-mode');
    }
  }

  logout(): void {
    this.mockAuthService.logout();
  }
}
