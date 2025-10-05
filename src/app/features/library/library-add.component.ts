import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BreadcrumbsComponent } from '../../shared/components/breadcrumbs.component';

/**
 * Biblioteka - dodawanie pliku (prototyp 04)
 * Formularz do przesyłania nowych plików do repozytorium
 */
@Component({
  selector: 'app-library-add',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BreadcrumbsComponent],
  template: `
    <app-breadcrumbs [crumbs]="[
      { label: 'System', link: ['/dashboard'] },
      { label: 'Biblioteka', link: ['/library'] },
      { label: 'Dodaj plik' }
    ]" />
    <!-- Tabs -->
    <div class="flex space-x-4 border-b border-gray-200 mb-6">
      <button 
        routerLink="/dashboard"
        class="px-4 py-2 border-b-2 border-transparent text-gray-600 hover:text-gray-900">
        Pulpit
      </button>
      <button 
        routerLink="/access-requests"
        class="px-4 py-2 border-b-2 border-transparent text-gray-600 hover:text-gray-900">
        Wnioski o dostęp
      </button>
      <button 
        routerLink="/library"
        class="px-4 py-2 border-b-2 border-uknf-primary text-uknf-primary font-medium">
        Biblioteka plików
      </button>
    </div>

    <!-- Main content -->
    <div class="bg-white rounded-lg shadow">
      <!-- Header sekcji -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Dodaj nowy plik</h2>
            <p class="text-sm text-gray-500 mt-1">Prześlij dokument do biblioteki systemu</p>
          </div>
          
          <button 
            routerLink="/library"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors">
            <span class="flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Powrót do listy
            </span>
          </button>
        </div>
      </div>

      <!-- Formularz -->
      <div class="p-6">
        <form (ngSubmit)="submitForm()" class="space-y-6">
          <!-- Upload pliku -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Wybierz plik *
            </label>
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-uknf-primary transition-colors">
              <input 
                type="file"
                #fileInput
                (change)="onFileSelected($event)"
                class="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip">
              
              <div *ngIf="!selectedFileName">
                <svg class="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
                <button 
                  type="button"
                  (click)="fileInput.click()"
                  class="px-4 py-2 bg-uknf-primary hover:bg-uknf-primary-dark text-white rounded transition-colors">
                  Wybierz plik
                </button>
                <p class="mt-2 text-sm text-gray-500">
                  lub przeciągnij plik tutaj
                </p>
                <p class="mt-1 text-xs text-gray-400">
                  Obsługiwane formaty: PDF, DOC, DOCX, XLS, XLSX, TXT, ZIP (max 50 MB)
                </p>
              </div>

              <div *ngIf="selectedFileName" class="flex items-center justify-center">
                <div class="flex items-center space-x-3 bg-gray-50 px-4 py-3 rounded">
                  <svg class="w-8 h-8 text-uknf-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <div class="text-left">
                    <p class="font-medium text-gray-900">{{ selectedFileName }}</p>
                    <p class="text-sm text-gray-500">{{ selectedFileSize }}</p>
                  </div>
                  <button 
                    type="button"
                    (click)="removeFile()"
                    class="ml-4 text-red-600 hover:text-red-800">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Kategoria -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Kategoria *
            </label>
            <select 
              [(ngModel)]="formData.category"
              name="category"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-uknf-primary focus:border-transparent">
              <option value="">Wybierz kategorię</option>
              <option value="Sprawozdania">Sprawozdania</option>
              <option value="Dokumenty prawne">Dokumenty prawne</option>
              <option value="Instrukcje">Instrukcje</option>
              <option value="Inne">Inne</option>
            </select>
          </div>

          <!-- Opis -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Opis *
            </label>
            <textarea 
              [(ngModel)]="formData.description"
              name="description"
              required
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-uknf-primary focus:border-transparent"
              placeholder="Wprowadź opis pliku..."></textarea>
            <p class="mt-1 text-xs text-gray-500">
              Podaj krótki opis zawartości pliku (min. 10 znaków)
            </p>
          </div>

          <!-- Tagi (opcjonalne) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Tagi (opcjonalne)
            </label>
            <input 
              type="text"
              [(ngModel)]="formData.tags"
              name="tags"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-uknf-primary focus:border-transparent"
              placeholder="np. sprawozdawczość, Q1, 2025">
            <p class="mt-1 text-xs text-gray-500">
              Oddziel tagi przecinkami
            </p>
          </div>

          <!-- Widoczność -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Widoczność
            </label>
            <div class="space-y-2">
              <label class="flex items-center">
                <input 
                  type="radio"
                  [(ngModel)]="formData.visibility"
                  name="visibility"
                  value="public"
                  class="mr-2 text-uknf-primary focus:ring-uknf-primary">
                <span class="text-sm text-gray-700">Publiczny - widoczny dla wszystkich użytkowników</span>
              </label>
              <label class="flex items-center">
                <input 
                  type="radio"
                  [(ngModel)]="formData.visibility"
                  name="visibility"
                  value="private"
                  class="mr-2 text-uknf-primary focus:ring-uknf-primary">
                <span class="text-sm text-gray-700">Prywatny - widoczny tylko dla mnie</span>
              </label>
            </div>
          </div>

          <!-- Informacja -->
          <div class="bg-blue-50 border border-blue-200 rounded p-4">
            <div class="flex">
              <svg class="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div>
                <p class="text-sm text-blue-800 font-medium">Informacja o przetwarzaniu danych</p>
                <p class="text-sm text-blue-700 mt-1">
                  Przesłane pliki będą przechowywane na serwerach UKNF i dostępne zgodnie z wybraną opcją widoczności.
                  Dane będą przetwarzane zgodnie z RODO.
                </p>
              </div>
            </div>
          </div>

          <!-- Przyciski akcji -->
          <div class="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button 
              type="button"
              routerLink="/library"
              class="px-6 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded transition-colors">
              Anuluj
            </button>
            <button 
              type="submit"
              [disabled]="!isFormValid()"
              [class.opacity-50]="!isFormValid()"
              [class.cursor-not-allowed]="!isFormValid()"
              class="px-6 py-2 bg-uknf-primary hover:bg-uknf-primary-dark text-white rounded transition-colors">
              Prześlij plik
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class LibraryAddComponent {
  selectedFileName = '';
  selectedFileSize = '';
  
  formData = {
    category: '',
    description: '',
    tags: '',
    visibility: 'public'
  };

  constructor(private router: Router) {}

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

  isFormValid(): boolean {
    return this.selectedFileName !== '' 
      && this.formData.category !== '' 
      && this.formData.description.length >= 10;
  }

  submitForm(): void {
    if (!this.isFormValid()) return;

    // Symulacja uploadu
    alert(`Plik "${this.selectedFileName}" został pomyślnie przesłany!\n\nKategoria: ${this.formData.category}\nOpis: ${this.formData.description}`);
    
    // Przekierowanie do listy
    this.router.navigate(['/library']);
  }
}
