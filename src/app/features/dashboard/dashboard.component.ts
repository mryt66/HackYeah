import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MockAuthService } from '../../core/services/mock-auth.service';
import { User, UserRole } from '../../core/models/user.model';

interface Announcement {
  id: number;
  publicationDate: string;
  subject: string;
  content: string;
  isRead: boolean;
}

/**
 * Dashboard (Pulpit) - zgodny z prototypami 00 i 01
 * Wyświetla komunikaty w formie tabeli z Data publikacji i Temat
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- Tabs -->
    <div class="flex space-x-4 border-b border-gray-200 mb-6">
      <button 
        class="px-4 py-2 border-b-2 border-uknf-primary text-uknf-primary font-medium">
        Pulpit użytkownika
      </button>
      <button 
        routerLink="/access-requests"
        class="px-4 py-2 border-b-2 border-transparent text-gray-600 hover:text-gray-900">
        Wnioski o dostęp
      </button>
      <button 
        routerLink="/library"
        class="px-4 py-2 border-b-2 border-transparent text-gray-600 hover:text-gray-900">
        Biblioteka - repozytorium plików
      </button>
    </div>

    <!-- Main content -->
    <div class="bg-white rounded-lg shadow">
      <!-- Header sekcji -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Komunikaty</h2>
          
          <!-- Search and filters -->
          <div class="flex items-center space-x-4">
            <!-- Wyszukiwanie -->
            <div class="relative">
              <button 
                (click)="showSearch = !showSearch"
                class="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50 flex items-center space-x-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <span>Wyszukiwanie</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Search input (conditional) -->
        <div *ngIf="showSearch" class="mt-4">
          <div class="flex items-center space-x-4">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Data publikacji</label>
              <input 
                type="text"
                [(ngModel)]="searchDate"
                placeholder="RRRR-MM-DD"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-uknf-primary focus:border-uknf-primary">
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Temat</label>
              <input 
                type="text"
                [(ngModel)]="searchSubject"
                placeholder="Wpisz temat..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-uknf-primary focus:border-uknf-primary">
            </div>
            <div class="flex-shrink-0 mt-6">
              <button 
                (click)="applySearch()"
                class="px-4 py-2 bg-uknf-primary text-white rounded hover:bg-uknf-primary-dark transition-colors">
                Szukaj
              </button>
              <button 
                (click)="clearSearch()"
                class="ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">
                Wyczyść
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  (click)="sortBy('date')">
                <div class="flex items-center space-x-1">
                  <span>Data publikacji</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                  </svg>
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  (click)="sortBy('subject')">
                <div class="flex items-center space-x-1">
                  <span>Temat</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                  </svg>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let announcement of paginatedAnnouncements" 
                class="hover:bg-gray-50 cursor-pointer transition-colors"
                (click)="viewAnnouncement(announcement)">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ announcement.publicationDate }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                <div class="flex items-center">
                  <span [class.font-semibold]="!announcement.isRead">
                    {{ announcement.subject }}
                  </span>
                  <span *ngIf="!announcement.isRead" 
                        class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    Nowy
                  </span>
                </div>
              </td>
            </tr>

            <!-- Empty state -->
            <tr *ngIf="paginatedAnnouncements.length === 0">
              <td colspan="2" class="px-6 py-12 text-center text-gray-500">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                </svg>
                <p class="mt-2">Brak komunikatów do wyświetlenia</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div class="text-sm text-gray-700">
          Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredAnnouncements.length }} entries
        </div>
        
        <div class="flex items-center space-x-2">
          <!-- First page -->
          <button 
            (click)="goToPage(1)"
            [disabled]="currentPage === 1"
            class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
            </svg>
          </button>

          <!-- Previous page -->
          <button 
            (click)="goToPage(currentPage - 1)"
            [disabled]="currentPage === 1"
            class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          <!-- Page numbers -->
          <button 
            *ngFor="let page of visiblePages"
            (click)="goToPage(page)"
            [class.bg-uknf-primary]="page === currentPage"
            [class.text-white]="page === currentPage"
            [class.text-gray-700]="page !== currentPage"
            class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
            {{ page }}
          </button>

          <!-- Next page -->
          <button 
            (click)="goToPage(currentPage + 1)"
            [disabled]="currentPage === totalPages"
            class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>

          <!-- Last page -->
          <button 
            (click)="goToPage(totalPages)"
            [disabled]="currentPage === totalPages"
            class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
            </svg>
          </button>

          <!-- Items per page -->
          <select 
            [(ngModel)]="itemsPerPage"
            (change)="onItemsPerPageChange()"
            class="ml-4 px-2 py-1 border border-gray-300 rounded focus:ring-uknf-primary focus:border-uknf-primary">
            <option [value]="10">10</option>
            <option [value]="25">25</option>
            <option [value]="50">50</option>
            <option [value]="100">100</option>
          </select>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end space-x-3">
        <button 
          (click)="viewSelected()"
          [disabled]="selectedAnnouncements.length === 0"
          class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
          <span>Podgląd</span>
        </button>
        
        <button 
          (click)="exportData()"
          class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors flex items-center space-x-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <span>Eksportuj</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* Hover effect for table rows */
    tbody tr:hover {
      background-color: #f9fafb;
    }

    /* Active page button */
    .bg-uknf-primary {
      background-color: #003d82;
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  
  // Search
  showSearch = false;
  searchDate = '';
  searchSubject = '';
  
  // Data
  announcements: Announcement[] = [];
  filteredAnnouncements: Announcement[] = [];
  selectedAnnouncements: Announcement[] = [];
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  
  constructor(private mockAuthService: MockAuthService) {}

  ngOnInit(): void {
    this.mockAuthService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
    });

    // Load mock data
    this.loadAnnouncements();
  }

  loadAnnouncements(): void {
    // Mock data - 200 komunikatów
    this.announcements = [];
    for (let i = 1; i <= 200; i++) {
      const date = new Date(2025, Math.floor(Math.random() * 4), Math.floor(Math.random() * 28) + 1);
      this.announcements.push({
        id: i,
        publicationDate: date.toISOString().split('T')[0],
        subject: this.getRandomSubject(i),
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        isRead: Math.random() > 0.3
      });
    }

    // Sort by date descending
    this.announcements.sort((a, b) => b.publicationDate.localeCompare(a.publicationDate));
    this.filteredAnnouncements = [...this.announcements];
    this.updatePagination();
  }

  getRandomSubject(index: number): string {
    const subjects = [
      'Aktualizacja wytycznych dotyczących sprawozdawczości za Q4 2025',
      'Planowana przerwa techniczna systemu w dniu 15.10.2025',
      'Nowa wersja formularza RIP – ważne zmiany w sekcji 3',
      'Komunikat bezpieczeństwa: zalecana zmiana haseł do kont użytkowników',
      'Publikacja raportu zbiorczego – zestawienie wskaźników za 2025',
      'Zmiany w procesie nadawania dostępów dla użytkowników zewnętrznych',
      'Instrukcja przygotowania plików do importu podmiotów (XLSX)',
      'Nowe funkcjonalności modułu Wiadomości – wątki prywatne 1:1',
      'Przypomnienie o terminie złożenia korekt sprawozdań',
      'Informacja o polityce retencji plików w repozytorium'
    ];
    return subjects[index % subjects.length];
  }

  applySearch(): void {
    this.filteredAnnouncements = this.announcements.filter(a => {
      const matchesDate = !this.searchDate || a.publicationDate.includes(this.searchDate);
      const matchesSubject = !this.searchSubject || a.subject.toLowerCase().includes(this.searchSubject.toLowerCase());
      return matchesDate && matchesSubject;
    });
    
    this.currentPage = 1;
    this.updatePagination();
  }

  clearSearch(): void {
    this.searchDate = '';
    this.searchSubject = '';
    this.filteredAnnouncements = [...this.announcements];
    this.currentPage = 1;
    this.updatePagination();
  }

  sortBy(field: 'date' | 'subject'): void {
    if (field === 'date') {
      this.filteredAnnouncements.sort((a, b) => b.publicationDate.localeCompare(a.publicationDate));
    } else {
      this.filteredAnnouncements.sort((a, b) => a.subject.localeCompare(b.subject));
    }
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredAnnouncements.length / this.itemsPerPage);
  }

  get paginatedAnnouncements(): Announcement[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredAnnouncements.slice(start, end);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredAnnouncements.length);
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1;
    this.updatePagination();
  }

  viewAnnouncement(announcement: Announcement): void {
    announcement.isRead = true;
    alert(`Viewing announcement: ${announcement.subject}\n\n${announcement.content}`);
  }

  viewSelected(): void {
    alert('Viewing selected announcements (feature not yet implemented)');
  }

  exportData(): void {
    // Simple CSV export
    const csv = 'Data publikacji,Temat\n' + 
      this.filteredAnnouncements.map(a => `${a.publicationDate},"${a.subject}"`).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'komunikaty.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === UserRole.ADMIN;
  }
}
