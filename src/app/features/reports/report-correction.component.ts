import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReportsService, Report } from '../../core/services/reports.service';

@Component({
  selector: 'app-report-correction',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-6" *ngIf="report">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-uknf-primary">Korekta sprawozdania #{{ report.id }}</h1>
          <p class="text-gray-600 mt-1">{{ report.subjectName }} · {{ report.reportType }} · {{ report.period }}</p>
        </div>
        <a [routerLink]="['/reports', report.id]" class="px-4 py-2 border rounded-md text-sm hover:bg-gray-50">← Wróć do szczegółów</a>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200 max-w-2xl">
        <h2 class="text-lg font-semibold mb-4">Prześlij poprawiony plik</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Plik XLS/XLSX</label>
            <input type="file" (change)="onFileSelected($event)" accept=".xlsx,.xls" class="w-full" />
            <p class="text-xs text-gray-500 mt-1">Maksymalny rozmiar 100 MB. Dozwolone formaty: .xlsx, .xls</p>
            <div *ngIf="selectedFile" class="mt-2 text-sm">
              <div class="font-medium">{{ selectedFile.name }}</div>
              <div class="text-gray-500">{{ formatFileSize(selectedFile.size) }}</div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <button (click)="submit()"
                    [disabled]="!selectedFile || submitting"
                    class="bg-uknf-primary text-white px-4 py-2 rounded-md hover:bg-uknf-dark disabled:opacity-50">
              {{ submitting ? 'Przesyłanie...' : 'Prześlij korektę' }}
            </button>
            <a [routerLink]="['/reports', report.id]" class="px-4 py-2 border rounded-md text-sm hover:bg-gray-50">Anuluj</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReportCorrectionComponent implements OnInit {
  report!: Report;
  selectedFile: File | null = null;
  submitting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reportsService: ReportsService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/reports']);
      return;
    }
    this.reportsService.getReportById(id).subscribe({
      next: (rep) => this.report = rep,
      error: () => this.router.navigate(['/reports'])
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) { alert('Plik jest za duży. Maksymalny rozmiar 100MB.'); return; }
      if (!file.name.match(/\.(xlsx|xls)$/)) { alert('Nieprawidłowy format pliku.'); return; }
      this.selectedFile = file;
    }
  }

  submit(): void {
    if (!this.report || !this.selectedFile) return;
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    this.submitting = true;
    this.reportsService.createCorrection(this.report.id, formData).subscribe({
      next: (r) => {
        alert('Korekta została utworzona.');
        this.router.navigate(['/reports', r.id]);
      },
      error: () => {
        this.submitting = false;
        alert('Błąd podczas tworzenia korekty.');
      }
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
