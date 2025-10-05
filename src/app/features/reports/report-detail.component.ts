import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BreadcrumbsComponent } from '../../shared/components/breadcrumbs.component';
import { ReportsService, Report } from '../../core/services/reports.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-report-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, BreadcrumbsComponent],
  template: `
    <div class="container mx-auto px-4 py-6" *ngIf="!loading && report; else loadingTpl">
      <app-breadcrumbs [crumbs]="[
        { label: 'System', link: ['/dashboard'] },
        { label: 'Sprawozdania', link: ['/reports'] },
        { label: '#' + report.id }
      ]" />
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-uknf-primary">Sprawozdanie #{{ report.id }}</h1>
          <p class="text-gray-600 mt-1">{{ report.subjectName }} · {{ report.reportType }} · {{ report.period }}</p>
        </div>
        <div class="flex gap-2">
          <a [routerLink]="['/reports']" class="px-4 py-2 border rounded-md text-sm hover:bg-gray-50">← Wróć do listy</a>
          <button (click)="downloadReport()" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">⬇️ Pobierz</button>
          <a *ngIf="report.status === 'COMPLETED' && !report.isCorrected"
             [routerLink]="['/reports', report.id, 'correction']"
             class="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700">📝 Korekta</a>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 class="text-lg font-semibold mb-4">Szczegóły</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div class="text-gray-500">Podmiot</div>
                <div class="font-medium">{{ report.subjectName }} (ID: {{ report.subjectId }})</div>
              </div>
              <div>
                <div class="text-gray-500">Typ sprawozdania</div>
                <div class="font-medium">{{ report.reportType }}</div>
              </div>
              <div>
                <div class="text-gray-500">Okres</div>
                <div class="font-medium">{{ report.period }}</div>
              </div>
              <div>
                <div class="text-gray-500">Przesłane</div>
                <div class="font-medium">{{ report.uploadDate | date:'dd.MM.yyyy HH:mm' }}</div>
              </div>
              <div>
                <div class="text-gray-500">Plik</div>
                <div class="font-medium">{{ report.fileName }}</div>
              </div>
              <div>
                <div class="text-gray-500">Wielkość</div>
                <div class="font-medium">{{ formatFileSize(report.fileSize) }}</div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 class="text-lg font-semibold mb-4">Walidacja</h2>
            <div class="flex items-center gap-3 mb-4">
              <span [ngClass]="getStatusClass(report.status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                {{ getStatusLabel(report.status) }}
              </span>
              <span *ngIf="report.validationStatus" [ngClass]="getValidationClass(report.validationStatus!)" class="px-2 py-1 text-xs font-semibold rounded-full">
                {{ getValidationLabel(report.validationStatus!) }}
              </span>
            </div>
            <div *ngIf="validationResult; else noValidation" class="bg-gray-50 p-4 rounded-lg">
              <pre class="text-xs text-gray-700 whitespace-pre-wrap">{{ validationResult }}</pre>
            </div>
            <ng-template #noValidation>
              <p class="text-sm text-gray-500">Brak wyników walidacji do wyświetlenia.</p>
            </ng-template>
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 class="text-lg font-semibold mb-4">Akcje</h2>
            <div class="flex flex-col gap-2">
              <button (click)="downloadReport()" class="w-full px-4 py-2 border rounded-md hover:bg-gray-50">⬇️ Pobierz plik</button>
              <a *ngIf="report.status === 'COMPLETED' && !report.isCorrected" [routerLink]="['/reports', report.id, 'correction']" class="w-full text-center px-4 py-2 border rounded-md hover:bg-gray-50">📝 Utwórz korektę</a>
              <a [routerLink]="['/reports']" class="w-full text-center px-4 py-2 border rounded-md hover:bg-gray-50">← Wróć do listy</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ng-template #loadingTpl>
      <div class="container mx-auto px-4 py-10 text-center text-gray-600">Wczytywanie...</div>
    </ng-template>
  `
})
export class ReportDetailComponent implements OnInit, OnDestroy {
  report!: Report | null;
  validationResult: string | null = null;
  loading = true;
  private sub = new Subscription();

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
    this.sub.add(
      this.reportsService.getReportById(id).subscribe({
        next: (rep) => {
          this.report = rep;
          this.loading = false;
          this.loadValidation(rep.id);
        },
        error: () => {
          this.loading = false;
          this.router.navigate(['/reports']);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  loadValidation(id: number): void {
    this.sub.add(
      this.reportsService.getValidationResult(id).subscribe({
        next: (res: any) => {
          // Assume string or JSON
          this.validationResult = typeof res === 'string' ? res : JSON.stringify(res, null, 2);
        },
        error: () => {
          this.validationResult = null;
        }
      })
    );
  }

  downloadReport(): void {
    if (!this.report) return;
    this.reportsService.downloadReport(this.report.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.report!.fileName || 'sprawozdanie_' + this.report!.id}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => alert('Błąd podczas pobierania pliku')
    });
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
      'VALID': 'Poprawne',
      'INVALID': 'Niepoprawne'
    };
    return labels[status] || status;
  }
}
