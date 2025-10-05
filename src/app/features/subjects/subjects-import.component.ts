import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-subjects-import',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Import podmiotów (XLSX)</h2>
      </div>
      <div class="p-6 space-y-4">
        <div>
          <label class="block text-sm text-gray-700 mb-1">Plik XLSX z danymi podmiotów</label>
          <input type="file" accept=".xlsx" (change)="onFileSelected($event)" />
          <div *ngIf="file" class="mt-2 text-sm text-gray-600">Wybrano: {{ file?.name }}</div>
          <p class="mt-2 text-xs text-gray-500">Użyj pliku „F. przykładowe dane podmiotów nadzorowanych do zaimportowania.xlsx”.</p>
        </div>
      </div>
      <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
        <button (click)="cancel()" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded">Anuluj</button>
        <button (click)="upload()" [disabled]="!file" class="px-4 py-2 bg-uknf-primary text-white rounded hover:bg-uknf-primary-dark">Wyślij</button>
      </div>
    </div>
  `
})
export class SubjectsImportComponent {
  file: File | null = null;
  constructor(private router: Router) {}
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.file = input.files && input.files.length ? input.files[0] : null;
  }
  async upload(): Promise<void> {
    if (!this.file) return;
    const form = new FormData();
    form.append('file', this.file);
    try {
      await fetch('/api/subjects/import', { method: 'POST', body: form });
      alert('Import zakończony');
      this.router.navigate(['/subjects']);
    } catch (e) {
      alert('Błąd podczas importu');
    }
  }
  cancel(): void { this.router.navigate(['/subjects']); }
}
