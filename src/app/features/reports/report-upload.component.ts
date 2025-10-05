import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
	selector: 'app-report-upload',
	standalone: true,
	imports: [CommonModule, FormsModule],
	template: `
		<div class="bg-white rounded-lg shadow">
			<div class="px-6 py-4 border-b border-gray-200">
				<h2 class="text-lg font-semibold text-gray-900">Wgraj plik sprawozdania (XLSX)</h2>
			</div>
			<div class="p-6 space-y-4">
				<div>
					<label class="block text-sm text-gray-700 mb-1">ID Podmiotu</label>
					<input [(ngModel)]="subjectId" type="number" class="w-full px-3 py-2 border rounded" placeholder="np. 100000" />
				</div>
				<div>
					<label class="block text-sm text-gray-700 mb-1">Okres sprawozdawczy (data)</label>
					<input [(ngModel)]="reportingPeriod" type="date" class="w-full px-3 py-2 border rounded" />
				</div>
				<div>
					<label class="block text-sm text-gray-700 mb-1">Plik sprawozdania (np. G.RIP100000_Q1_2025.xlsx)</label>
					<input type="file" accept=".xlsx,.xls,.csv,.zip" (change)="onFileSelected($event)" />
					<div *ngIf="file" class="mt-2 text-sm text-gray-600">Wybrano: {{ file?.name }}</div>
				</div>
			</div>
			<div class="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
				<button (click)="cancel()" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded">Anuluj</button>
				<button (click)="upload()" [disabled]="!file || !subjectId || !reportingPeriod" class="px-4 py-2 bg-uknf-primary text-white rounded hover:bg-uknf-primary-dark">Wyślij</button>
			</div>
		</div>
	`
})
export class ReportUploadComponent {
	subjectId: number | null = null;
	reportingPeriod: string | null = null; // ISO date string YYYY-MM-DD
	file: File | null = null;

	constructor(private router: Router) {}

	onFileSelected(event: Event): void {
		const input = event.target as HTMLInputElement;
		this.file = input.files && input.files.length ? input.files[0] : null;
	}

	async upload(): Promise<void> {
		if (!this.file || !this.subjectId || !this.reportingPeriod) return;
		const form = new FormData();
		form.append('subjectId', String(this.subjectId));
		form.append('reportingPeriod', this.reportingPeriod);
		form.append('file', this.file);
		try {
			await fetch('/api/reports/upload', { method: 'POST', body: form });
			alert('Sprawozdanie wgrane');
			this.router.navigate(['/reports']);
		} catch (e) {
			alert('Błąd podczas wgrywania');
		}
	}

	cancel(): void {
		this.router.navigate(['/reports']);
	}
}
