import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LibraryService, LibraryFile } from '../../core/services/library.service';
import { BreadcrumbsComponent } from '../../shared/components/breadcrumbs.component';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-library-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BreadcrumbsComponent],
  template: `
    <div class="container mx-auto px-4 py-6" *ngIf="!loading && file; else loadingTpl">
      <app-breadcrumbs [crumbs]="[
        { label: 'System', link: ['/dashboard'] },
        { label: 'Biblioteka', link: ['/library'] },
        { label: file.name }
      ]" />
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-uknf-primary">{{ file.name }}</h1>
          <p class="text-gray-600 mt-1">Kategoria: {{ file.category }} · v{{ file.version }}</p>
        </div>
        <div class="flex gap-2">
          <a [routerLink]="['/library']" class="px-4 py-2 border rounded-md text-sm hover:bg-gray-50">← Wróć do listy</a>
          <a [routerLink]="['/library', file.id, 'history']" class="px-4 py-2 border rounded-md text-sm hover:bg-gray-50">📜 Historia</a>
          <button (click)="download()" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">⬇️ Pobierz</button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Details -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 class="text-lg font-semibold mb-4">Szczegóły pliku</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div class="text-gray-500">Nazwa pliku</div>
                <div class="font-medium">{{ file.filename }}</div>
              </div>
              <div>
                <div class="text-gray-500">Rozmiar</div>
                <div class="font-medium">{{ formatFileSize(file.fileSize) }}</div>
              </div>
              <div>
                <div class="text-gray-500">Status</div>
                <span [class]="libraryService.getStatusClass(file.status)" class="px-2 py-1 text-xs font-medium rounded">{{ libraryService.getStatusLabel(file.status) }}</span>
              </div>
              <div>
                <div class="text-gray-500">Poziom dostępu</div>
                <span [class]="libraryService.getAccessLevelClass(file.accessLevel)" class="px-2 py-1 text-xs font-medium rounded">{{ libraryService.getAccessLevelLabel(file.accessLevel) }}</span>
              </div>
              <div>
                <div class="text-gray-500">Dodano</div>
                <div class="font-medium">{{ file.uploadedAt | date:'dd.MM.yyyy HH:mm' }} przez {{ file.uploadedBy.name }}</div>
              </div>
              <div>
                <div class="text-gray-500">Zaktualizowano</div>
                <div class="font-medium">{{ file.updatedAt | date:'dd.MM.yyyy HH:mm' }}</div>
              </div>
              <div class="md:col-span-2">
                <div class="text-gray-500">Opis</div>
                <div class="font-medium whitespace-pre-wrap">{{ file.description }}</div>
              </div>
              <div class="md:col-span-2" *ngIf="file.tags && file.tags.length">
                <div class="text-gray-500">Tagi</div>
                <div class="flex flex-wrap gap-2 mt-1">
                  <span *ngFor="let t of file.tags" class="px-2 py-1 text-xs bg-gray-100 rounded">#{{ t }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200" *ngIf="isAdmin">
            <h2 class="text-lg font-semibold mb-4">Nowa wersja</h2>
            <div class="space-y-3">
              <input type="file" (change)="onFileSelected($event)" accept=".pdf,.doc,.docx,.xlsx,.xls,.csv,.txt" class="w-full" />
              <input type="text" [(ngModel)]="changeDescription" placeholder="Opis zmian (opcjonalnie)" class="w-full px-3 py-2 border rounded" />
              <div class="flex gap-3">
                <button (click)="uploadVersion()" [disabled]="!selectedFile || uploading" class="bg-uknf-primary text-white px-4 py-2 rounded-md hover:bg-uknf-dark disabled:opacity-50">
                  {{ uploading ? 'Przesyłanie...' : 'Prześlij nową wersję' }}
                </button>
                <a [routerLink]="['/library', file.id, 'history']" class="px-4 py-2 border rounded-md text-sm hover:bg-gray-50">Zobacz historię</a>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="space-y-6">
          <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 class="text-lg font-semibold mb-4">Akcje</h2>
            <div class="flex flex-col gap-2">
              <button (click)="download()" class="w-full px-4 py-2 border rounded-md hover:bg-gray-50">⬇️ Pobierz</button>
              <a [routerLink]="['/library', file.id, 'history']" class="w-full text-center px-4 py-2 border rounded-md hover:bg-gray-50">📜 Historia wersji</a>
              <button *ngIf="isAdmin" (click)="toggleStatus()" class="w-full px-4 py-2 border rounded-md hover:bg-gray-50">
                {{ file.status === 'ACTIVE' ? 'Archiwizuj' : 'Przywróć jako aktywny' }}
              </button>
              <a [routerLink]="['/library']" class="w-full text-center px-4 py-2 border rounded-md hover:bg-gray-50">← Wróć do listy</a>
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
export class LibraryDetailComponent implements OnInit {
  file!: LibraryFile;
  loading = true;
  uploading = false;
  selectedFile: File | null = null;
  changeDescription = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public libraryService: LibraryService,
    public authService: AuthService
  ) {}

  get isAdmin(): boolean {
    return this.authService.hasRole(UserRole.ADMIN);
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.router.navigate(['/library']); return; }
    this.loadFile(id);
  }

  loadFile(id: number): void {
    this.loading = true;
    this.libraryService.getFileById(id).subscribe({
      next: (f) => { this.file = f; this.loading = false; },
      error: () => { this.loading = false; this.router.navigate(['/library']); }
    });
  }

  download(): void {
    this.libraryService.downloadFile(this.file.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.file.filename || `file_${this.file.id}`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => alert('Błąd pobierania pliku')
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) { this.selectedFile = file; }
  }

  uploadVersion(): void {
    if (!this.selectedFile) return;
    this.uploading = true;
    this.libraryService.uploadNewVersion(this.file.id, this.selectedFile, this.changeDescription).subscribe({
      next: () => {
        this.uploading = false;
        this.selectedFile = null;
        this.changeDescription = '';
        this.loadFile(this.file.id);
      },
      error: () => { this.uploading = false; alert('Błąd przesyłania nowej wersji'); }
    });
  }

  toggleStatus(): void {
    const newStatus = this.file.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE';
    this.libraryService.updateStatus(this.file.id, newStatus as any).subscribe({
      next: (f) => this.file = f,
      error: () => alert('Błąd zmiany statusu')
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
