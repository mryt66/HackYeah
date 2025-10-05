import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Subject {
  id: number;
  name: string;
  code: string;
  selected: boolean;
}

interface Attachment {
  id: number;
  fileName: string;
  fileType: string;
  uploadDate: string;
}

interface RequestDocument {
  id: number;
  title: string;
  date: string;
  status: string;
}

interface AccessRequest {
  id: number;
  requestNumber: string;
  requestDate: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  pesel: string;
  email: string;
  phone: string;
  subjects: Subject[];
  status: 'pending' | 'approved' | 'rejected';
  statusLabel: string;
  enabled: boolean;
  attachments?: Attachment[];
  documents?: RequestDocument[];
}

/**
 * Wnioski o dostęp - zgodny z prototypem 02
 * Wyświetla wnioski o dostęp do systemu
 */
@Component({
  selector: 'app-access-requests',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- Tabs -->
    <div class="flex space-x-4 border-b border-gray-200 mb-6">
      <button 
        routerLink="/dashboard"
        class="px-4 py-2 border-b-2 border-transparent text-gray-600 hover:text-gray-900">
        Pulpit
      </button>
      <button 
        class="px-4 py-2 border-b-2 border-uknf-primary text-uknf-primary font-medium">
        Wnioski o dostęp
      </button>
      <button 
        routerLink="/library"
        class="px-4 py-2 border-b-2 border-transparent text-gray-600 hover:text-gray-900">
        Biblioteka plików
      </button>
    </div>

    <!-- Main content -->
    <div class="bg-white rounded-lg shadow">
      <!-- Header sekcji -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-base font-semibold text-gray-900">Wniosek o dostęp do systemu - podgląd</h2>
      </div>

      <!-- Lista wniosków -->
      <div class="p-6">
        <div *ngIf="accessRequests.length === 0" class="text-center py-12 text-gray-500">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <p class="text-lg font-medium">Brak wniosków o dostęp</p>
        </div>

        <!-- Tabela wniosków -->
        <div *ngIf="accessRequests.length > 0" class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 border-b">Imię *</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 border-b">Drugie imię</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 border-b">Nazwisko *</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 border-b">PESEL</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 border-b">E-mail *</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 border-b">Telefon *</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 border-b">Uprawnienie</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 border-b">Status</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 border-b">Akcje</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                *ngFor="let request of accessRequests" 
                class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 text-sm text-gray-900 border-b">{{ request.firstName }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 border-b">{{ request.middleName || '-' }}</td>
                <td class="px-4 py-3 text-sm text-gray-900 border-b">{{ request.lastName }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 border-b">{{ maskPesel(request.pesel) }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 border-b">{{ request.email }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 border-b">{{ request.phone }}</td>
                <td class="px-4 py-3 text-sm border-b">
                  <span *ngIf="request.enabled" class="text-green-600">Tak</span>
                  <span *ngIf="!request.enabled" class="text-gray-400">Nie</span>
                </td>
                <td class="px-4 py-3 text-sm border-b">
                  <span 
                    [class]="getStatusBadgeClass(request.status)"
                    class="px-2 py-1 text-xs font-medium rounded">
                    {{ request.statusLabel }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm border-b">
                  <button 
                    (click)="viewRequestDetails(request)"
                    class="text-uknf-primary hover:underline">
                    Podgląd
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div *ngIf="accessRequests.length > 0" class="flex items-center justify-between mt-6 pt-4 border-t">
          <div class="text-sm text-gray-600">
            Showing 1 to {{ accessRequests.length }} of {{ accessRequests.length }} entries
          </div>
          <div class="flex items-center space-x-2">
            <button class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50" disabled>
              ←
            </button>
            <button class="px-3 py-1 bg-uknf-primary text-white rounded">1</button>
            <button class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">2</button>
            <button class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">3</button>
            <button class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">→</button>
          </div>
        </div>
      </div>
    </div>



    <!-- Modal - Podgląd wniosku -->
    <div 
      *ngIf="selectedRequest"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-base font-semibold text-gray-900">
            Wniosek o dostęp do systemu - podgląd
          </h3>
        </div>
        
        <div class="p-6">
          <!-- Dane osobowe -->
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Imię *</label>
              <input 
                type="text" 
                [value]="selectedRequest.firstName"
                readonly
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Drugie imię</label>
              <input 
                type="text" 
                [value]="selectedRequest.middleName || ''"
                readonly
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Nazwisko *</label>
              <input 
                type="text" 
                [value]="selectedRequest.lastName"
                readonly
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50">
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">PESEL</label>
              <input 
                type="text" 
                [value]="selectedRequest.pesel"
                readonly
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">E-mail *</label>
              <input 
                type="email" 
                [value]="selectedRequest.email"
                readonly
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Telefon *</label>
              <input 
                type="tel" 
                [value]="selectedRequest.phone"
                readonly
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50">
            </div>
          </div>

          <!-- Uprawnienia -->
          <div class="mb-6">
            <div class="flex items-center mb-3">
              <input 
                type="checkbox" 
                [checked]="selectedRequest.enabled"
                disabled
                class="w-4 h-4 text-uknf-primary rounded mr-2">
              <label class="text-sm text-gray-700">Włączenie uprawnienia</label>
            </div>
          </div>

          <!-- Lista podmiotów -->
          <div class="mb-6">
            <h4 class="text-sm font-semibold text-gray-900 mb-3">Uprawnienia</h4>
            <div class="border border-gray-200 rounded">
              <div class="bg-gray-50 px-4 py-2 flex items-center space-x-4">
                <button class="text-sm text-gray-600 hover:text-gray-900">Wszystkie podmioty</button>
                <button class="text-sm text-gray-600 hover:text-gray-900">Wybrane podmioty</button>
              </div>
              <div class="divide-y divide-gray-200">
                <div 
                  *ngFor="let subject of selectedRequest.subjects"
                  class="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                  <div class="flex items-center">
                    <input 
                      type="checkbox" 
                      [checked]="subject.selected"
                      disabled
                      class="w-4 h-4 text-uknf-primary rounded mr-3">
                    <div class="flex-1">
                      <div class="flex items-center space-x-4">
                        <span class="text-sm font-medium text-gray-900">{{ subject.name }}</span>
                        <span class="text-xs text-gray-500">{{ subject.code }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Status -->
          <div class="mb-6">
            <label class="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <span 
              [class]="getStatusBadgeClass(selectedRequest.status)"
              class="inline-block px-3 py-1 text-sm font-medium rounded">
              {{ selectedRequest.statusLabel }}
            </span>
          </div>

          <!-- Załączniki -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-sm font-semibold text-gray-900">Załączniki</h4>
              <button class="text-xs text-uknf-primary hover:underline">
                Pobierz
              </button>
            </div>
            <div *ngIf="selectedRequest.attachments && selectedRequest.attachments.length > 0" class="border border-gray-200 rounded">
              <table class="w-full text-sm">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-600">Załącznik</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-600">Załącznik_druga.pdf</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-600">Załącznik_trzeci.txt</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let attachment of selectedRequest.attachments" class="border-t hover:bg-gray-50">
                    <td class="px-4 py-3">
                      <button (click)="downloadAttachment(attachment)" class="text-uknf-primary hover:underline text-xs">
                        Pobierz
                      </button>
                    </td>
                    <td class="px-4 py-3 text-gray-600">{{ attachment.fileName }}</td>
                    <td class="px-4 py-3 text-gray-500 text-xs">{{ attachment.uploadDate }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div *ngIf="!selectedRequest.attachments || selectedRequest.attachments.length === 0" class="text-sm text-gray-500 text-center py-4 border border-gray-200 rounded bg-gray-50">
              Brak załączników
            </div>
          </div>

          <!-- Wnioski -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-sm font-semibold text-gray-900">Wnioski</h4>
              <button class="text-xs text-uknf-primary hover:underline">
                Pobierz
              </button>
            </div>
            <div *ngIf="selectedRequest.documents && selectedRequest.documents.length > 0" class="border border-gray-200 rounded">
              <div *ngFor="let doc of selectedRequest.documents" class="px-4 py-3 border-b last:border-b-0 hover:bg-gray-50">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ doc.title }}</p>
                    <p class="text-xs text-gray-500">Data wniosku: {{ doc.date }}</p>
                  </div>
                  <button (click)="downloadDocument(doc)" class="text-uknf-primary hover:underline text-xs">
                    Pobierz
                  </button>
                </div>
              </div>
            </div>
            <div *ngIf="!selectedRequest.documents || selectedRequest.documents.length === 0" class="text-sm text-gray-500 text-center py-4 border border-gray-200 rounded bg-gray-50">
              Brak wniosków
            </div>
          </div>

          <!-- Wiadomości -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-sm font-semibold text-gray-900">Wiadomości</h4>
            </div>
            <div class="border border-gray-200 rounded overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-600">Data utworzenia</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-600">Priorytet</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-600">Data przewidywanego UKNF</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-600">Data otrzymania Podmiotu</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-600">Data otrzymania Podmotu</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-600">Nadawca</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-600">Akcje</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-600">Status wiadomości</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-t">
                    <td class="px-4 py-3 text-gray-600">2025-01-11 16:38:16</td>
                    <td class="px-4 py-3 text-gray-600">Brak</td>
                    <td class="px-4 py-3 text-gray-600">2025-01-02 16:25</td>
                    <td class="px-4 py-3 text-gray-600">2025-01-02 16:25</td>
                    <td class="px-4 py-3 text-gray-600">2025-01-02 16:25</td>
                    <td class="px-4 py-3 text-gray-600">Jan Nowak</td>
                    <td class="px-4 py-3">
                      <button class="text-uknf-primary hover:underline text-xs">
                        Otwórz wiadomość
                      </button>
                    </td>
                    <td class="px-4 py-3 text-gray-600">Otwórz lub odpowiedź</td>
                  </tr>
                  <tr class="border-t">
                    <td class="px-4 py-3 text-gray-600">2025-01-01 10:15:30</td>
                    <td class="px-4 py-3 text-gray-600">Wysoki</td>
                    <td class="px-4 py-3 text-gray-600">2025-01-05 14:00</td>
                    <td class="px-4 py-3 text-gray-600">2025-01-03 09:20</td>
                    <td class="px-4 py-3 text-gray-600">2025-01-03 09:20</td>
                    <td class="px-4 py-3 text-gray-600">UKNF</td>
                    <td class="px-4 py-3">
                      <button class="text-uknf-primary hover:underline text-xs">
                        Otwórz wiadomość
                      </button>
                    </td>
                    <td class="px-4 py-3 text-gray-600">Oczekuje na odpowiedź</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="flex items-center justify-between mt-3 text-xs text-gray-600">
              <div>Showing 1 to 10 of 15 entries</div>
              <div class="flex items-center space-x-1">
                <button class="px-2 py-1 border rounded hover:bg-gray-50">←</button>
                <button class="px-2 py-1 bg-uknf-primary text-white rounded">1</button>
                <button class="px-2 py-1 border rounded hover:bg-gray-50">2</button>
                <button class="px-2 py-1 border rounded hover:bg-gray-50">3</button>
                <button class="px-2 py-1 border rounded hover:bg-gray-50">→</button>
              </div>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button 
            (click)="closeRequestDetails()"
            class="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded transition-colors">
            Wróć
          </button>
          <button 
            class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors">
            Zapisz wniosek
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AccessRequestsComponent implements OnInit {
  accessRequests: AccessRequest[] = [];
  selectedRequest: AccessRequest | null = null;
  
  availableSubjects: Subject[] = [
    { id: 1, name: 'Bank Testowy S.A.', code: 'BT001', selected: false },
    { id: 2, name: 'Instytucja Finansowa Sp. z o.o.', code: 'IF002', selected: false },
    { id: 3, name: 'Towarzystwo Ubezpieczeń "Bezpieczny"', code: 'TU003', selected: false },
    { id: 4, name: 'Fundusz Inwestycyjny Alpha', code: 'FI004', selected: false }
  ];

  ngOnInit(): void {
    this.loadAccessRequests();
  }

  loadAccessRequests(): void {
    // Mock data - zgodnie z prototypem 02
    this.accessRequests = [
      {
        id: 1,
        requestNumber: 'WN/2025/001',
        requestDate: '2025-01-15',
        firstName: 'Jan',
        middleName: '',
        lastName: 'Kowalski',
        pesel: '85010112345',
        email: 'kowalski@example.com',
        phone: '+48123456789',
        subjects: [
          { id: 1, name: 'Bank Testowy S.A.', code: 'BT001', selected: true },
          { id: 2, name: 'Instytucja Finansowa Sp. z o.o.', code: 'IF002', selected: true }
        ],
        status: 'approved',
        statusLabel: 'Zatwierdzona',
        enabled: true,
        attachments: [
          { id: 1, fileName: 'Załącznik_pierwszy.pdf', fileType: 'PDF', uploadDate: '2025-01-15' },
          { id: 2, fileName: 'Załącznik_druga.pdf', fileType: 'PDF', uploadDate: '2025-01-15' },
          { id: 3, fileName: 'Załącznik_trzeci.txt', fileType: 'TXT', uploadDate: '2025-01-16' }
        ],
        documents: [
          { id: 1, title: 'Wniosek o dostęp do Systemu Sprawozdawczości', date: '2025-01-15', status: 'Zatwierdzony' },
          { id: 2, title: 'Wniosek o rozszerzenie uprawnień', date: '2025-01-20', status: 'W trakcie' }
        ]
      },
      {
        id: 2,
        requestNumber: 'WN/2025/002',
        requestDate: '2025-02-20',
        firstName: 'Anna',
        middleName: 'Maria',
        lastName: 'Nowak',
        pesel: '90050298765',
        email: 'a.nowak@example.com',
        phone: '+48987654321',
        subjects: [
          { id: 3, name: 'Towarzystwo Ubezpieczeń "Bezpieczny"', code: 'TU003', selected: true }
        ],
        status: 'approved',
        statusLabel: 'Zatwierdzony',
        enabled: true,
        attachments: [
          { id: 4, fileName: 'Dokument_identyfikacyjny.pdf', fileType: 'PDF', uploadDate: '2025-02-20' }
        ],
        documents: [
          { id: 3, title: 'Wniosek o dostęp podstawowy', date: '2025-02-20', status: 'Zatwierdzony' }
        ]
      }
    ];
  }

  maskPesel(pesel: string): string {
    // Maskowanie PESEL: pokazuj tylko pierwsze 2 i ostatnie 2 cyfry
    if (pesel.length !== 11) return pesel;
    return pesel.substring(0, 2) + '*******' + pesel.substring(9);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  viewRequestDetails(request: AccessRequest): void {
    this.selectedRequest = request;
  }

  closeRequestDetails(): void {
    this.selectedRequest = null;
  }

  downloadAttachment(attachment: Attachment): void {
    alert(`Pobieranie załącznika: ${attachment.fileName}\n\n(Symulacja - plik nie zostanie faktycznie pobrany)`);
  }

  downloadDocument(doc: RequestDocument): void {
    alert(`Pobieranie dokumentu: ${doc.title}\n\n(Symulacja - plik nie zostanie faktycznie pobrany)`);
  }
}
