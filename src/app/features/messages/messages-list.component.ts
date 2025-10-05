import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MessagesService, MessageListItem } from '../../core/services/messages.service';
import { FormsModule } from '@angular/forms';

type Message = MessageListItem & { status: 'unread' | 'read' | 'replied'; statusLabel: string; excerpt: string };

/**
 * Wiadomości - lista (prototypy 05, 06)
 * Inbox z wiadomościami i zaawansowanym filtrowaniem
 */
@Component({
  selector: 'app-messages-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="bg-white rounded-lg shadow">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Moje pytania i wiadomości</h2>
          
          <div class="flex items-center space-x-3">
            <button 
              (click)="toggleFilters()"
              [class.bg-uknf-primary]="showFilters"
              [class.text-white]="showFilters"
              class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors">
              <span class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
                </svg>
                Filtry
              </span>
            </button>
            
            <button 
              (click)="navigateToNew()"
              class="px-4 py-2 bg-uknf-primary hover:bg-uknf-primary-dark text-white rounded transition-colors">
              <span class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Nowa wiadomość
              </span>
            </button>
            <button 
              (click)="navigateToBulk()"
              class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors">
              <span class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12h18M3 6h18M3 18h18"/>
                </svg>
                Wiadomość masowa
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Zakładki Inbox/Wysłane -->
      <div class="px-6 pt-4">
        <div class="inline-flex rounded-md shadow-sm border border-gray-200 overflow-hidden" role="group">
          <button (click)="switchTab('inbox')" [class.bg-uknf-primary]="activeTab==='inbox'" [class.text-white]="activeTab==='inbox'" class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:z-10">Odebrane</button>
          <button (click)="switchTab('sent')" [class.bg-uknf-primary]="activeTab==='sent'" [class.text-white]="activeTab==='sent'" class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:z-10 border-l border-gray-200">Wysłane</button>
        </div>
      </div>

      <!-- Panel filtrów (prototyp 06) -->
      <div *ngIf="showFilters" class="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Temat</label>
            <input 
              type="text"
              [(ngModel)]="filters.subject"
              (ngModelChange)="applyFilters()"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-uknf-primary focus:border-transparent"
              placeholder="Szukaj w temacie...">
          </div>
          
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select 
              [(ngModel)]="filters.status"
              (ngModelChange)="applyFilters()"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-uknf-primary focus:border-transparent">
              <option value="">Wszystkie</option>
              <option value="unread">Nieprzeczytane</option>
              <option value="read">Przeczytane</option>
              <option value="replied">Z odpowiedzią</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Kategoria</label>
            <select 
              [(ngModel)]="filters.category"
              (ngModelChange)="applyFilters()"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-uknf-primary focus:border-transparent">
              <option value="">Wszystkie</option>
              <option value="Sprawozdawczość">Sprawozdawczość</option>
              <option value="Dostęp">Dostęp</option>
              <option value="Techniczne">Techniczne</option>
              <option value="Inne">Inne</option>
            </select>
          </div>

          <div class="flex items-end">
            <button 
              (click)="clearFilters()"
              class="w-full px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded transition-colors text-sm">
              Wyczyść filtry
            </button>
          </div>
        </div>
      </div>

      <!-- Statystyki -->
      <div class="px-6 py-3 bg-blue-50 border-b border-blue-100">
        <div class="flex items-center space-x-6 text-sm">
          <div class="flex items-center">
            <span class="text-gray-600">Wszystkie:</span>
            <span class="ml-2 font-semibold text-gray-900">{{ messages.length }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-gray-600">Nieprzeczytane:</span>
            <span class="ml-2 font-semibold text-blue-600">{{ getUnreadCount() }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-gray-600">Wyświetlane:</span>
            <span class="ml-2 font-semibold text-gray-900">{{ filteredMessages.length }}</span>
          </div>
        </div>
      </div>

      <!-- Lista wiadomości -->
      <div class="divide-y divide-gray-200">
        <div *ngIf="filteredMessages.length === 0" class="text-center py-12 text-gray-500">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          <p class="text-lg font-medium">Brak wiadomości</p>
          <p class="mt-2">{{ filters.subject || filters.status || filters.category ? 'Nie znaleziono wiadomości spełniających kryteria' : 'Twoja skrzynka jest pusta' }}</p>
        </div>

        <div 
          *ngFor="let message of filteredMessages" 
          (click)="viewMessage(message)"
          [class.bg-blue-50]="message.status === 'unread'"
          class="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors">
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-3 mb-1">
                <span 
                  [class]="getStatusBadgeClass(message.status)"
                  class="px-2 py-1 text-xs font-medium rounded">
                  {{ message.statusLabel }}
                </span>
                
                <span 
                  *ngIf="message.priority === 'high'"
                  class="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800">
                  Wysoki priorytet
                </span>

                <span class="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                  {{ message.category }}
                </span>
              </div>

              <h3 
                [class.font-bold]="message.status === 'unread'"
                class="text-base text-gray-900 mb-1">
                {{ message.subject }}
              </h3>

              <p class="text-sm text-gray-600 mb-2">
                {{ message.excerpt }}
              </p>

              <div class="flex items-center text-xs text-gray-500 space-x-4">
                <span class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  {{ message.sender }}
                </span>
                <span class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  {{ message.date }}
                </span>
              </div>
            </div>

            <div class="ml-4">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class MessagesListComponent implements OnInit {
  messages: Message[] = [];
  filteredMessages: Message[] = [];
  showFilters = false;
  activeTab: 'inbox' | 'sent' = 'inbox';
  
  filters = {
    subject: '',
    status: '',
    category: ''
  };

  constructor(private router: Router, private messagesService: MessagesService) {}

  ngOnInit(): void {
    // if route ends with /sent, switch tab
    if (this.router.url.endsWith('/sent')) {
      this.activeTab = 'sent';
    }
    this.loadMessages();
  }

  loadMessages(): void {
    if (this.activeTab === 'sent') {
      this.messagesService.getSent().subscribe({
        next: (res) => {
          this.messages = this.mapApiToView(res);
          this.applyFilters();
        },
        error: () => {
          // fallback demo data
          this.messages = this.getMockMessages();
          this.applyFilters();
        }
      });
    } else {
      this.messagesService.getInbox().subscribe({
        next: (res) => {
          this.messages = this.mapApiToView(res);
          this.applyFilters();
        },
        error: () => {
          this.messages = this.getMockMessages();
          this.applyFilters();
        }
      });
    }
  }

  private mapApiToView(items: MessageListItem[]): Message[] {
    return (items || []).map(m => ({
      id: typeof m.id === 'string' ? Number(m.id) : (m.id as number),
      subject: m.subject,
      sender: m.sender,
      date: m.date,
      status: m.status || 'read',
      statusLabel: m.status === 'unread' ? 'Nieprzeczytane' : (m.status === 'replied' ? 'Z odpowiedzią' : 'Przeczytane'),
      excerpt: m.excerpt || '',
      category: m.category || 'Inne',
      priority: m.priority || 'normal'
    }));
  }

  private getMockMessages(): Message[] {
    return [
      {
        id: 1,
        subject: 'Pytanie dotyczące sprawozdania Q1 2025',
        sender: 'UKNF Departament Sprawozdawczości',
        date: '2025-10-03',
        status: 'unread',
        statusLabel: 'Nieprzeczytane',
        excerpt: 'W odpowiedzi na Państwa pytanie dotyczące wypełnienia formularza RIP...',
        category: 'Sprawozdawczość',
        priority: 'high'
      },
      {
        id: 2,
        subject: 'Potwierdzenie dostępu do systemu',
        sender: 'UKNF Administrator',
        date: '2025-10-01',
        status: 'read',
        statusLabel: 'Przeczytane',
        excerpt: 'Informujemy, że Państwa wniosek o dostęp został rozpatrzony pozytywnie...',
        category: 'Dostęp',
        priority: 'normal'
      },
      {
        id: 3,
        subject: 'Odpowiedź na pytanie #12345',
        sender: 'Jan Kowalski (UKNF)',
        date: '2025-09-28',
        status: 'replied',
        statusLabel: 'Z odpowiedzią',
        excerpt: 'Dziękujemy za kontakt. W odpowiedzi na Państwa zapytanie...',
        category: 'Techniczne',
        priority: 'normal'
      },
      {
        id: 4,
        subject: 'Aktualizacja regulaminu systemu',
        sender: 'UKNF Komunikacja',
        date: '2025-09-25',
        status: 'read',
        statusLabel: 'Przeczytane',
        excerpt: 'Informujemy o aktualizacji regulaminu korzystania z systemu...',
        category: 'Inne',
        priority: 'low'
      }
    ];
  }

  switchTab(tab: 'inbox' | 'sent') {
    if (this.activeTab !== tab) {
      this.activeTab = tab;
      // update URL for deep linking
      if (tab === 'sent') {
        this.router.navigate(['/messages/sent']);
      } else {
        this.router.navigate(['/messages']);
      }
      this.loadMessages();
    }
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  applyFilters(): void {
    this.filteredMessages = this.messages.filter(message => {
      const matchesSubject = !this.filters.subject || 
        message.subject.toLowerCase().includes(this.filters.subject.toLowerCase());
      
      const matchesStatus = !this.filters.status || 
        message.status === this.filters.status;
      
      const matchesCategory = !this.filters.category || 
        message.category === this.filters.category;
      
      return matchesSubject && matchesStatus && matchesCategory;
    });
  }

  clearFilters(): void {
    this.filters = {
      subject: '',
      status: '',
      category: ''
    };
    this.applyFilters();
  }

  getUnreadCount(): number {
    return this.messages.filter(m => m.status === 'unread').length;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'unread':
        return 'bg-blue-100 text-blue-800';
      case 'read':
        return 'bg-gray-100 text-gray-700';
      case 'replied':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  viewMessage(message: Message): void {
    this.router.navigate(['/messages', message.id]);
  }

  navigateToNew(): void {
    this.router.navigate(['/messages/new']);
  }

  navigateToBulk(): void {
    this.router.navigate(['/messages/bulk']);
  }
}
