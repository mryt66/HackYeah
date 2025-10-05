import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Message {
  id: number;
  subject: string;
  sender: string;
  date: string;
  status: 'unread' | 'read' | 'replied';
  statusLabel: string;
  content: string;
  category: string;
  priority: 'low' | 'normal' | 'high';
  attachments?: { name: string; size: string }[];
}

/**
 * Wiadomości - szczegóły (prototyp 07)
 * Pełna treść wiadomości z formularzem odpowiedzi
 */
@Component({
  selector: 'app-messages-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="max-w-5xl mx-auto">
      <div class="mb-6">
        <button 
          (click)="goBack()"
          class="flex items-center text-uknf-primary hover:text-uknf-primary-dark transition-colors">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Powrót do listy wiadomości
        </button>
      </div>

      <div *ngIf="!message" class="bg-white rounded-lg shadow p-8 text-center">
        <p class="text-gray-500 text-lg">Wiadomość nie została znaleziona</p>
      </div>

      <div *ngIf="message" class="bg-white rounded-lg shadow">
        <!-- Nagłówek wiadomości -->
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-2">
                <span 
                  [class]="getStatusBadgeClass(message.status)"
                  class="px-3 py-1 text-sm font-medium rounded">
                  {{ message.statusLabel }}
                </span>
                
                <span 
                  *ngIf="message.priority === 'high'"
                  class="px-3 py-1 text-sm font-medium rounded bg-red-100 text-red-800">
                  Wysoki priorytet
                </span>

                <span class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded">
                  {{ message.category }}
                </span>
              </div>

              <h1 class="text-2xl font-bold text-gray-900 mb-3">
                {{ message.subject }}
              </h1>

              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-600">Od:</span>
                  <span class="ml-2 font-medium text-gray-900">{{ message.sender }}</span>
                </div>
                <div>
                  <span class="text-gray-600">Data:</span>
                  <span class="ml-2 font-medium text-gray-900">{{ message.date }}</span>
                </div>
              </div>
            </div>

            <button 
              *ngIf="message.status === 'unread'"
              (click)="markAsRead()"
              class="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded transition-colors text-sm">
              Oznacz jako przeczytane
            </button>
          </div>
        </div>

        <!-- Treść wiadomości -->
        <div class="px-6 py-6 border-b border-gray-200">
          <div class="prose max-w-none">
            <p class="text-gray-800 leading-relaxed whitespace-pre-wrap">{{ message.content }}</p>
          </div>

          <!-- Załączniki -->
          <div *ngIf="message.attachments && message.attachments.length > 0" class="mt-6">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">Załączniki</h3>
            <div class="space-y-2">
              <div 
                *ngFor="let attachment of message.attachments"
                class="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                <div class="flex items-center">
                  <svg class="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                  </svg>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ attachment.name }}</p>
                    <p class="text-xs text-gray-500">{{ attachment.size }}</p>
                  </div>
                </div>
                <button 
                  (click)="downloadAttachment(attachment.name)"
                  class="px-3 py-1 text-sm text-uknf-primary hover:bg-uknf-primary hover:text-white border border-uknf-primary rounded transition-colors">
                  Pobierz
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sekcja odpowiedzi -->
        <div class="px-6 py-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">Odpowiedz na wiadomość</h2>
            <button 
              *ngIf="!showReplyForm"
              (click)="toggleReplyForm()"
              class="px-4 py-2 bg-uknf-primary hover:bg-uknf-primary-dark text-white rounded transition-colors">
              <span class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
                </svg>
                Odpowiedz
              </span>
            </button>
          </div>

          <div *ngIf="showReplyForm" class="space-y-4">
            <!-- Informacja o odpowiadającym -->
            <div class="bg-blue-50 border border-blue-200 rounded p-4">
              <div class="flex items-start">
                <svg class="w-5 h-5 text-blue-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div class="flex-1">
                  <p class="text-sm font-medium text-blue-900">Twoja odpowiedź</p>
                  <p class="text-xs text-blue-700 mt-1">Odpowiedź zostanie wysłana do: {{ message.sender }}</p>
                </div>
              </div>
            </div>

            <!-- Pole tekstowe odpowiedzi -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Treść odpowiedzi <span class="text-red-600">*</span>
              </label>
              <textarea
                [(ngModel)]="replyContent"
                rows="8"
                class="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded focus:ring-2 focus:ring-uknf-primary focus:border-transparent resize-none"
                placeholder="Wpisz treść swojej odpowiedzi..."></textarea>
              <p class="text-xs text-gray-500 mt-1">
                Minimalna długość: 20 znaków (obecna: {{ replyContent.length }})
              </p>
            </div>

            <!-- Dodaj załącznik -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Załącz plik (opcjonalnie)</label>
              <div class="flex items-center space-x-3">
                <label class="cursor-pointer">
                  <input 
                    type="file"
                    (change)="onFileSelected($event)"
                    class="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.zip">
                  <span class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-300 inline-flex items-center transition-colors">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                    </svg>
                    Wybierz plik
                  </span>
                </label>
                <span *ngIf="!selectedFileName" class="text-sm text-gray-500">Brak wybranego pliku</span>
                <div *ngIf="selectedFileName" class="flex items-center bg-gray-100 px-3 py-2 rounded">
                  <span class="text-sm text-gray-700 mr-2">{{ selectedFileName }} ({{ selectedFileSize }})</span>
                  <button 
                    (click)="removeFile()"
                    class="text-red-600 hover:text-red-800">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Przyciski akcji -->
            <div class="flex items-center justify-end space-x-3 pt-4">
              <button 
                (click)="toggleReplyForm()"
                class="px-6 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded transition-colors">
                Anuluj
              </button>
              <button 
                (click)="submitReply()"
                [disabled]="!isReplyValid()"
                [class.opacity-50]="!isReplyValid()"
                [class.cursor-not-allowed]="!isReplyValid()"
                class="px-6 py-2 bg-uknf-primary hover:bg-uknf-primary-dark text-white rounded transition-colors disabled:hover:bg-uknf-primary">
                <span class="flex items-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                  </svg>
                  Wyślij odpowiedź
                </span>
              </button>
            </div>
          </div>

          <div *ngIf="!showReplyForm && message.status === 'replied'" class="text-center py-8">
            <svg class="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-gray-600">Na tę wiadomość już odpowiedziano</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class MessagesDetailComponent implements OnInit {
  message: Message | null = null;
  showReplyForm = false;
  replyContent = '';
  selectedFileName = '';
  selectedFileSize = '';

  // Mock wszystkich wiadomości (te same co w liście)
  private allMessages: Message[] = [
    {
      id: 1,
      subject: 'Pytanie dotyczące sprawozdania Q1 2025',
      sender: 'UKNF Departament Sprawozdawczości',
      date: '2025-10-03',
      status: 'unread',
      statusLabel: 'Nieprzeczytane',
      content: `Szanowni Państwo,

W odpowiedzi na Państwa pytanie dotyczące wypełnienia formularza RIP dla pierwszego kwartału 2025 roku, uprzejmie wyjaśniamy:

1. Pole A.1.2 należy wypełnić zgodnie z instrukcją znajdującą się w sekcji 3.2.1 dokumentu metodologicznego.

2. W przypadku pozycji B.3.4, proszę zastosować nową metodę kalkulacji wprowadzoną w zaktualizowanym rozporządzeniu z dnia 15.01.2025.

3. Termin złożenia sprawozdania za Q1 2025 upływa 30 kwietnia 2025 roku.

W razie dalszych pytań prosimy o kontakt.

Z poważaniem,
Zespół Departamentu Sprawozdawczości`,
      category: 'Sprawozdawczość',
      priority: 'high',
      attachments: [
        { name: 'Instrukcja_RIP_Q1_2025.pdf', size: '1.2 MB' },
        { name: 'Metodologia_obliczen.xlsx', size: '450 KB' }
      ]
    },
    {
      id: 2,
      subject: 'Potwierdzenie dostępu do systemu',
      sender: 'UKNF Administrator',
      date: '2025-10-01',
      status: 'read',
      statusLabel: 'Przeczytane',
      content: `Szanowni Państwo,

Informujemy, że Państwa wniosek o dostęp do systemu został rozpatrzony pozytywnie.

Dane dostępowe:
- Login: WN/2025/001
- Hasło zostało wysłane w oddzielnej wiadomości e-mail

Dostęp aktywny od: 2025-10-01
Uprawnienia: Podgląd sprawozdań, Składanie pytań

Prosimy o zmianę hasła przy pierwszym logowaniu.

Pozdrawiamy,
Zespół Administratorów`,
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
      content: `Dzień dobry,

Dziękujemy za kontakt. W odpowiedzi na Państwa zapytanie techniczne dotyczące funkcji eksportu danych:

Problem został zidentyfikowany i naprawiony. Funkcja eksportu powinna działać poprawnie od dnia 28.09.2025.

W razie dalszych problemów prosimy o kontakt.

Pozdrawiam,
Jan Kowalski
Wsparcie Techniczne`,
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
      content: `Szanowni Państwo,

Informujemy o aktualizacji regulaminu korzystania z systemu, która weszła w życie z dniem 25.09.2025.

Najważniejsze zmiany:
- Wydłużenie czasu sesji z 30 do 45 minut
- Możliwość eksportu danych do formatu Excel
- Nowe funkcje dostępności dla osób z niepełnosprawnościami

Pełna treść regulaminu dostępna jest w sekcji "Dokumenty".

Zespół UKNF`,
      category: 'Inne',
      priority: 'low',
      attachments: [
        { name: 'Regulamin_wrzesien_2025.pdf', size: '890 KB' }
      ]
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.message = this.allMessages.find(m => m.id === id) || null;
  }

  goBack(): void {
    this.router.navigate(['/messages']);
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

  markAsRead(): void {
    if (this.message) {
      this.message.status = 'read';
      this.message.statusLabel = 'Przeczytane';
      alert('Wiadomość została oznaczona jako przeczytana');
    }
  }

  toggleReplyForm(): void {
    this.showReplyForm = !this.showReplyForm;
    if (!this.showReplyForm) {
      this.replyContent = '';
      this.selectedFileName = '';
      this.selectedFileSize = '';
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFileName = file.name;
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      this.selectedFileSize = `${sizeInMB} MB`;
    }
  }

  removeFile(): void {
    this.selectedFileName = '';
    this.selectedFileSize = '';
  }

  isReplyValid(): boolean {
    return this.replyContent.trim().length >= 20;
  }

  submitReply(): void {
    if (!this.isReplyValid()) {
      alert('Treść odpowiedzi musi mieć minimum 20 znaków');
      return;
    }

    if (this.message) {
      this.message.status = 'replied';
      this.message.statusLabel = 'Z odpowiedzią';
    }

    alert(`Odpowiedź została wysłana!\n\nTreść: ${this.replyContent.substring(0, 50)}...`);
    this.showReplyForm = false;
    this.replyContent = '';
    this.selectedFileName = '';
    this.selectedFileSize = '';
  }

  downloadAttachment(filename: string): void {
    alert(`Pobieranie pliku: ${filename}\n\n(Symulacja - plik nie zostanie faktycznie pobrany)`);
  }
}
