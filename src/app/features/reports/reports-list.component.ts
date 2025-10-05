import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ReportsService, Report, ReportFilter, ReportSchedule } from '../../core/services/reports.service';
import { BreadcrumbsComponent } from '../../shared/components/breadcrumbs.component';
import { ExportService } from '../../shared/export.service';

@Component({
  selector: 'app-reports-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, BreadcrumbsComponent],
  template: `
    <div class="container mx-auto px-4 py-6">
      <app-breadcrumbs [crumbs]="[
        { label: 'System', link: ['/dashboard'] },
        { label: 'Sprawozdania' }
      ]" />
      <!-- Header with Actions -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 class="text-3xl font-bold text-uknf-primary">Sprawozdania</h1>
        <div class="flex flex-wrap gap-2">
          <button 
            (click)="navigateToUpload()"
            class="bg-uknf-primary text-white px-4 py-2 rounded-md hover:bg-uknf-dark transition flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
            </svg>
            Prześlij sprawozdanie
          </button>
          <button 
            (click)="showScheduleModal = true"
            class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition">
            📅 Harmonogram
          </button>
          <button 
            (click)="exportToExcel()"
            class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition">
            📊 Eksportuj Excel
          </button>
        </div>
      </div>

      <!-- Filters Panel -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Filtry</h3>
          <button 
            (click)="showFilters = !showFilters"
            class="text-uknf-primary hover:underline text-sm">
            {{ showFilters ? 'Ukryj' : 'Pokaż' }} filtry
          </button>
        </div>
        
        <div *ngIf="showFilters" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Search -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Wyszukaj</label>
            <input 
              type="text"
              [(ngModel)]="searchTerm"
              (input)="onSearchChange()"
              placeholder="Nazwa podmiotu, typ sprawozdania..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-uknf-primary focus:border-uknf-primary">
          </div>

          <!-- Status -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select 
              [(ngModel)]="filter.status"
              (change)="applyFilters()"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-uknf-primary focus:border-uknf-primary">
              <option value="">Wszystkie</option>
              <option value="DRAFT">Robocze</option>
              <option value="SUBMITTED">Przekazane</option>
              <option value="IN_PROGRESS">W trakcie walidacji</option>
              <option value="COMPLETED">Zakończone sukcesem</option>
              <option value="ERROR">Błędy walidacji</option>
            </select>
          </div>

          <!-- Validation Status -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Walidacja</label>
            <select 
              [(ngModel)]="filter.validationStatus"
              (change)="applyFilters()"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-uknf-primary focus:border-uknf-primary">
              <option value="">Wszystkie</option>
              <option value="PENDING">Oczekuje</option>
              <option value="VALID">Poprawne</option>
              <option value="INVALID">Niepoprawne</option>
            </select>
          </div>

          <!-- Period -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Okres</label>
            <select 
              [(ngModel)]="filter.period"
              (change)="applyFilters()"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-uknf-primary focus:border-uknf-primary">
              <option value="">Wszystkie</option>
              <option value="Q1_2025">Q1 2025</option>
              <option value="Q2_2025">Q2 2025</option>
              <option value="Q3_2025">Q3 2025</option>
              <option value="Q4_2025">Q4 2025</option>
            </select>
          </div>

          <!-- My Subjects Only -->
          <div class="flex items-center pt-6">
            <input 
              type="checkbox"
              id="mySubjects"
              [(ngModel)]="filter.mySubjectsOnly"
              (change)="applyFilters()"
              class="w-4 h-4 text-uknf-primary border-gray-300 rounded focus:ring-uknf-primary">
            <label for="mySubjects" class="ml-2 text-sm text-gray-700">
              Tylko moje podmioty
            </label>
          </div>

          <!-- Clear Filters -->
          <div class="flex items-end pt-6">
            <button 
              (click)="clearFilters()"
              class="text-sm text-gray-600 hover:text-gray-900 underline">
              Wyczyść filtry
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-uknf-primary"></div>
      </div>

      <!-- Reports Table -->
      <div *ngIf="!loading" class="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" (click)="sortBy('id')">
                  ID
                  <span *ngIf="filter.sortBy === 'id'">{{ filter.sortDirection === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" (click)="sortBy('subjectName')">
                  Podmiot
                  <span *ngIf="filter.sortBy === 'subjectName'">{{ filter.sortDirection === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Typ</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Okres</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plik</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" (click)="sortBy('uploadDate')">
                  Data przesłania
                  <span *ngIf="filter.sortBy === 'uploadDate'">{{ filter.sortDirection === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Walidacja</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akcje</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr *ngFor="let report of reports" class="hover:bg-gray-50 transition">
                <td class="px-4 py-3 text-sm text-gray-900">#{{ report.id }}</td>
                <td class="px-4 py-3 text-sm">
                  <div class="font-medium text-gray-900">{{ report.subjectName }}</div>
                  <div class="text-xs text-gray-500">ID: {{ report.subjectId }}</div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-900">{{ report.reportType }}</td>
                <td class="px-4 py-3 text-sm text-gray-900">{{ report.period }}</td>
                <td class="px-4 py-3 text-sm">
                  <div class="text-gray-900">{{ report.fileName }}</div>
                  <div class="text-xs text-gray-500">{{ formatFileSize(report.fileSize) }}</div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-900">{{ report.uploadDate | date:'dd.MM.yyyy HH:mm' }}</td>
                <td class="px-4 py-3">
                  <span [ngClass]="getStatusClass(report.status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                    {{ getStatusLabel(report.status) }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span *ngIf="report.validationStatus" [ngClass]="getValidationClass(report.validationStatus)" class="px-2 py-1 text-xs font-semibold rounded-full">
                    {{ getValidationLabel(report.validationStatus) }}
                  </span>
                  <span *ngIf="!report.validationStatus" class="text-xs text-gray-400">-</span>
                </td>
                <td class="px-4 py-3 text-sm">
                  <div class="flex gap-2">
                    <button 
                      (click)="viewDetails(report)"
                      class="text-uknf-primary hover:underline text-xs"
                      title="Zobacz szczegóły">
                      👁️ Szczegóły
                    </button>
                    <button 
                      (click)="downloadReport(report.id)"
                      class="text-blue-600 hover:underline text-xs"
                      title="Pobierz plik">
                      ⬇️ Pobierz
                    </button>
                    <button 
                      *ngIf="report.status === 'COMPLETED' && !report.isCorrected"
                      (click)="createCorrection(report)"
                      class="text-orange-600 hover:underline text-xs"
                      title="Utwórz korektę">
                      📝 Korekta
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="reports.length === 0">
                <td colspan="9" class="px-4 py-8 text-center text-gray-500">
                  Brak sprawozdań do wyświetlenia
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Wyniki {{ (currentPage * pageSize) + 1 }} - {{ Math.min((currentPage + 1) * pageSize, totalElements) }} z {{ totalElements }}
          </div>
          <div class="flex gap-2">
            <button 
              (click)="previousPage()"
              [disabled]="currentPage === 0"
              class="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100">
              ← Poprzednia
            </button>
            <button 
              *ngFor="let page of getPageNumbers()"
              (click)="goToPage(page)"
              [class.bg-uknf-primary]="page === currentPage"
              [class.text-white]="page === currentPage"
              class="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100">
              {{ page + 1 }}
            </button>
            <button 
              (click)="nextPage()"
              [disabled]="currentPage >= totalPages - 1"
              class="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100">
              Następna →
            </button>
          </div>
        </div>
      </div>

      <!-- Upload Modal -->
      <div *ngIf="showUploadModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-gray-900">Prześlij sprawozdanie</h2>
              <button (click)="closeUploadModal()" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <form>
              <!-- Report Type -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Typ sprawozdania *</label>
                <select 
                  [(ngModel)]="uploadForm.reportType"
                  name="reportType"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-uknf-primary focus:border-uknf-primary">
                  <option value="">Wybierz typ</option>
                  <option value="RIP">RIP - Raport o sytuacji finansowej</option>
                  <option value="RIZ">RIZ - Raport o zabezpieczeniach</option>
                  <option value="RKW">RKW - Raport kwartalny</option>
                  <option value="RRR">RRR - Raport roczny</option>
                </select>
              </div>

              <!-- Period -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Okres sprawozdawczy *</label>
                <select 
                  [(ngModel)]="uploadForm.period"
                  name="period"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-uknf-primary focus:border-uknf-primary">
                  <option value="">Wybierz okres</option>
                  <option value="Q1_2025">Q1 2025</option>
                  <option value="Q2_2025">Q2 2025</option>
                  <option value="Q3_2025">Q3 2025</option>
                  <option value="Q4_2025">Q4 2025</option>
                </select>
              </div>

              <!-- File Upload -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Plik XLSX *</label>
                <div 
                  class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-uknf-primary transition"
                  (dragover)="onDragOver($event)"
                  (drop)="onDrop($event)">
                  <input 
                    type="file"
                    #fileInput
                    (change)="onFileSelected($event)"
                    accept=".xlsx,.xls"
                    class="hidden">
                  <button 
                    type="button"
                    (click)="fileInput.click()"
                    class="text-uknf-primary hover:underline">
                    Kliknij aby wybrać plik lub przeciągnij tutaj
                  </button>
                  <p class="text-sm text-gray-500 mt-2">Tylko pliki XLSX, max 100MB</p>
                  <div *ngIf="uploadForm.selectedFile" class="mt-4 text-sm">
                    <p class="font-medium text-gray-900">{{ uploadForm.selectedFile.name }}</p>
                    <p class="text-gray-500">{{ formatFileSize(uploadForm.selectedFile.size) }}</p>
                  </div>
                </div>
              </div>

              <!-- Progress Bar -->
              <div *ngIf="uploadProgress > 0" class="mb-4">
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-uknf-primary h-2 rounded-full transition-all"
                    [style.width.%]="uploadProgress">
                  </div>
                </div>
                <p class="text-sm text-gray-600 mt-1">Przesyłanie: {{ uploadProgress }}%</p>
              </div>

              <!-- Buttons -->
              <div class="flex justify-end gap-3 mt-6">
                <button 
                  type="button"
                  (click)="closeUploadModal()"
                  class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                  Anuluj
                </button>
                <button 
                  type="button"
                  (click)="submitUpload()"
                  [disabled]="!isUploadFormValid() || uploadProgress > 0"
                  class="px-4 py-2 bg-uknf-primary text-white rounded-md hover:bg-uknf-dark disabled:opacity-50 disabled:cursor-not-allowed">
                  Prześlij
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Schedule Modal -->
      <div *ngIf="showScheduleModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-gray-900">Harmonogram sprawozdawczości</h2>
              <button (click)="showScheduleModal = false" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Typ</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Okres</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Termin</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr *ngFor="let schedule of reportSchedule">
                    <td class="px-4 py-3 text-sm text-gray-900">{{ schedule.reportType }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ schedule.period }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ schedule.deadline | date:'dd.MM.yyyy' }}</td>
                    <td class="px-4 py-3">
                      <span [ngClass]="getScheduleStatusClass(schedule.status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                        {{ getScheduleStatusLabel(schedule.status) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Details Modal (placeholder) -->
      <div *ngIf="selectedReport" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-gray-900">Szczegóły sprawozdania #{{ selectedReport.id }}</h2>
              <button (click)="selectedReport = null" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-500">Podmiot</p>
                  <p class="font-medium">{{ selectedReport.subjectName }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Typ sprawozdania</p>
                  <p class="font-medium">{{ selectedReport.reportType }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Okres</p>
                  <p class="font-medium">{{ selectedReport.period }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Data przesłania</p>
                  <p class="font-medium">{{ selectedReport.uploadDate | date:'dd.MM.yyyy HH:mm' }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Status</p>
                  <span [ngClass]="getStatusClass(selectedReport.status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                    {{ getStatusLabel(selectedReport.status) }}
                  </span>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Walidacja</p>
                  <span *ngIf="selectedReport.validationStatus" [ngClass]="getValidationClass(selectedReport.validationStatus)" class="px-2 py-1 text-xs font-semibold rounded-full">
                    {{ getValidationLabel(selectedReport.validationStatus) }}
                  </span>
                </div>
              </div>

              <div *ngIf="selectedReport.validationResult" class="bg-gray-50 p-4 rounded-lg">
                <p class="text-sm font-medium text-gray-900 mb-2">Wynik walidacji:</p>
                <pre class="text-xs text-gray-700 whitespace-pre-wrap">{{ selectedReport.validationResult }}</pre>
              </div>
            </div>

            <div class="flex justify-end gap-3 mt-6">
              <button 
                (click)="downloadReport(selectedReport.id)"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Pobierz plik
              </button>
              <button 
                (click)="selectedReport = null"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                Zamknij
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ReportsListComponent implements OnInit {
  reports: Report[] = [];
  reportSchedule: ReportSchedule[] = [];
  selectedReport: Report | null = null;
  
  loading = false;
  showFilters = false;
  showUploadModal = false;
  showScheduleModal = false;
  
  searchTerm = '';
  filter: ReportFilter = {
    page: 0,
    size: 10,
    sortBy: 'uploadDate',
    sortDirection: 'desc'
  };
  
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  
  uploadForm = {
    reportType: '',
    period: '',
    selectedFile: null as File | null
  };
  uploadProgress = 0;
  
  Math = Math;

  constructor(
    private reportsService: ReportsService,
    private router: Router,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.loadReports();
    this.loadSchedule();
  }

  loadReports(): void {
    this.loading = true;
    this.reportsService.getReports(this.filter).subscribe({
      next: (response) => {
        this.reports = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.currentPage = response.number;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading reports:', error);
        this.loading = false;
        alert('Błąd podczas ładowania sprawozdań');
      }
    });
  }

  loadSchedule(): void {
    this.reportsService.getSchedule().subscribe({
      next: (schedule) => {
        this.reportSchedule = schedule;
      },
      error: (error) => {
        console.error('Error loading schedule:', error);
      }
    });
  }

  onSearchChange(): void {
    // Debounce search - simplified version
    setTimeout(() => this.applyFilters(), 300);
  }

  applyFilters(): void {
    this.filter.page = 0;
    this.loadReports();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filter = {
      page: 0,
      size: 10,
      sortBy: 'uploadDate',
      sortDirection: 'desc'
    };
    this.loadReports();
  }

  sortBy(field: string): void {
    if (this.filter.sortBy === field) {
      this.filter.sortDirection = this.filter.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.filter.sortBy = field;
      this.filter.sortDirection = 'asc';
    }
    this.loadReports();
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.filter.page = this.currentPage - 1;
      this.loadReports();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.filter.page = this.currentPage + 1;
      this.loadReports();
    }
  }

  goToPage(page: number): void {
    this.filter.page = page;
    this.loadReports();
  }

  getPageNumbers(): number[] {
    const maxPages = 5;
    const pages: number[] = [];
    let start = Math.max(0, this.currentPage - Math.floor(maxPages / 2));
    let end = Math.min(this.totalPages, start + maxPages);
    
    if (end - start < maxPages) {
      start = Math.max(0, end - maxPages);
    }
    
    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  }

  viewDetails(report: Report): void {
    this.router.navigate(['/reports', report.id]);
  }

  navigateToUpload(): void {
    this.router.navigate(['/reports/upload']);
  }

  downloadReport(id: number): void {
    this.reportsService.downloadReport(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sprawozdanie_${id}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading report:', error);
        alert('Błąd podczas pobierania pliku');
      }
    });
  }

  createCorrection(report: Report): void {
    const confirmed = confirm(`Czy na pewno chcesz utworzyć korektę dla sprawozdania #${report.id}?`);
    if (confirmed) {
      this.router.navigate(['/reports', report.id, 'correction']);
    }
  }

  closeUploadModal(): void {
    this.showUploadModal = false;
    this.uploadForm = {
      reportType: '',
      period: '',
      selectedFile: null
    };
    this.uploadProgress = 0;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        alert('Plik jest za duży. Maksymalny rozmiar to 100MB.');
        return;
      }
      if (!file.name.match(/\.(xlsx|xls)$/)) {
        alert('Nieprawidłowy format pliku. Dozwolone są tylko pliki XLSX.');
        return;
      }
      this.uploadForm.selectedFile = file;
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.size > 100 * 1024 * 1024) {
        alert('Plik jest za duży. Maksymalny rozmiar to 100MB.');
        return;
      }
      if (!file.name.match(/\.(xlsx|xls)$/)) {
        alert('Nieprawidłowy format pliku. Dozwolone są tylko pliki XLSX.');
        return;
      }
      this.uploadForm.selectedFile = file;
    }
  }

  isUploadFormValid(): boolean {
    return !!(this.uploadForm.reportType && this.uploadForm.period && this.uploadForm.selectedFile);
  }

  submitUpload(): void {
    if (!this.isUploadFormValid()) return;

    const formData = new FormData();
    formData.append('file', this.uploadForm.selectedFile!);
    formData.append('reportType', this.uploadForm.reportType);
    formData.append('period', this.uploadForm.period);

    this.uploadProgress = 0;
    
    // Simulate progress (in real implementation, use HttpEvent with reportProgress)
    const progressInterval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 90) {
        clearInterval(progressInterval);
      }
    }, 200);

    this.reportsService.uploadReport(formData).subscribe({
      next: (report) => {
        clearInterval(progressInterval);
        this.uploadProgress = 100;
        alert('Sprawozdanie zostało pomyślnie przesłane!');
        this.closeUploadModal();
        this.loadReports();
      },
      error: (error) => {
        clearInterval(progressInterval);
        this.uploadProgress = 0;
        console.error('Error uploading report:', error);
        alert('Błąd podczas przesyłania sprawozdania');
      }
    });
  }

  exportToExcel(): void {
    // minimalny CSV jako szybki eksport
    const rows = this.reports.map(r => ({
      id: r.id,
      podmiot: r.subjectName,
      typ: r.reportType,
      okres: r.period,
      plik: r.fileName,
      rozmiar: r.fileSize,
      dataPrzeslania: r.uploadDate,
      status: r.status,
      walidacja: r.validationStatus || ''
    }));
    this.exportService.toCSV(rows, 'sprawozdania.csv');
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'DRAFT': 'bg-gray-100 text-gray-800',
      'SUBMITTED': 'bg-blue-100 text-blue-800',
      'IN_PROGRESS': 'bg-yellow-100 text-yellow-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'ERROR': 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'DRAFT': 'Roboczy',
      'SUBMITTED': 'Przekazany',
      'IN_PROGRESS': 'W trakcie',
      'COMPLETED': 'Zakończony',
      'ERROR': 'Błędy'
    };
    return labels[status] || status;
  }

  getValidationClass(status: string): string {
    const classes: { [key: string]: string } = {
      'PENDING': 'bg-gray-100 text-gray-800',
      'VALID': 'bg-green-100 text-green-800',
      'INVALID': 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getValidationLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'PENDING': 'Oczekuje',
      'VALID': 'Poprawny',
      'INVALID': 'Niepoprawny'
    };
    return labels[status] || status;
  }

  getScheduleStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'UPCOMING': 'bg-blue-100 text-blue-800',
      'DUE': 'bg-yellow-100 text-yellow-800',
      'OVERDUE': 'bg-red-100 text-red-800',
      'SUBMITTED': 'bg-green-100 text-green-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getScheduleStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'UPCOMING': 'Nadchodzący',
      'DUE': 'Do przesłania',
      'OVERDUE': 'Przekroczony',
      'SUBMITTED': 'Przesłany'
    };
    return labels[status] || status;
  }
}
