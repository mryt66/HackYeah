import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LibraryService, LibraryFile, LibraryFilter, PagedResponse } from '../../core/services/library.service';
import { ExportService } from '../../shared/export.service';
import { BreadcrumbsComponent } from '../../shared/components/breadcrumbs.component';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-library-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BreadcrumbsComponent],
  templateUrl: './library-list.component.html'
})
export class LibraryListComponent implements OnInit {
  files: LibraryFile[] = [];
  categories: string[] = [];
  loading = false;
  filter: LibraryFilter = { page: 0, size: 10 };
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  searchTimeout: any;

  constructor(
    public libraryService: LibraryService,
    public authService: AuthService,
    private router: Router,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.loadFiles();
    this.loadCategories();
  }

  get isAdmin(): boolean {
    return this.authService.hasRole(UserRole.ADMIN);
  }

  loadFiles(): void {
    this.loading = true;
    this.filter.page = this.currentPage;
    this.filter.size = this.pageSize;
    this.libraryService.getFiles(this.filter).subscribe({
      next: (response: PagedResponse<LibraryFile>) => {
        this.files = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: () => {
        this.loadMockData();
        this.loading = false;
      }
    });
  }

  loadMockData(): void {
    this.files = [
      {
        id: 1,
        name: 'Instrukcja RIP',
        filename: 'instrukcja_rip.pdf',
        originalFilename: 'instrukcja_rip.pdf',
        contentType: 'application/pdf',
        fileSize: 2048576,
        category: 'Instrukcje',
        description: 'Instrukcja wypełniania formularza RIP',
        uploadedBy: { id: 1, name: 'Admin UKNF' },
        uploadedAt: '2025-01-15T10:00:00',
        updatedAt: '2025-01-15T10:00:00',
        tags: [],
        status: 'ACTIVE',
        accessLevel: 'PUBLIC',
        version: 1,
        versionHistory: []
      },
      {
        id: 2,
        name: 'Ustawa o nadzorze',
        filename: 'ustawa_nadzor.pdf',
        originalFilename: 'ustawa_nadzor.pdf',
        contentType: 'application/pdf',
        fileSize: 1536000,
        category: 'Dokumenty prawne',
        description: 'Ustawa o nadzorze nad rynkiem finansowym',
        uploadedBy: { id: 1, name: 'Admin UKNF' },
        uploadedAt: '2025-01-10T14:30:00',
        updatedAt: '2025-01-10T14:30:00',
        tags: ['prawo', 'ustawa'],
        status: 'ACTIVE',
        accessLevel: 'PUBLIC',
        version: 1,
        versionHistory: []
      }
    ];
    this.totalElements = 2;
    this.totalPages = 1;
  }

  loadCategories(): void {
    this.libraryService.getCategories().subscribe({
      next: (cats) => this.categories = cats,
      error: () => this.categories = ['Sprawozdania', 'Instrukcje', 'Dokumenty prawne', 'Inne']
    });
  }

  onSearchChange(): void {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.applyFilters(), 500);
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadFiles();
  }

  clearFilters(): void {
    this.filter = { page: 0, size: 10 };
    this.currentPage = 0;
    this.loadFiles();
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadFiles();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadFiles();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadFiles();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages, start + maxVisible);
    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  }

  exportCSV(): void {
    const rows = this.files.map(f => ({
      id: f.id,
      nazwa: f.name,
      kategoria: f.category,
      plik: f.filename,
      rozmiar: f.fileSize,
      wersja: f.version,
      status: f.status,
      dostep: f.accessLevel,
      data: f.uploadedAt
    }));
    this.exportService.toCSV(rows, 'biblioteka.csv');
  }

  downloadFile(file: LibraryFile): void {
    this.libraryService.downloadFile(file.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.filename;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => alert('Błąd pobierania pliku')
    });
  }

  viewVersionHistory(file: LibraryFile): void {
    this.router.navigate(['/library', file.id, 'history']);
  }

  uploadNewVersion(file: LibraryFile): void {
    alert('Funkcja dodawania nowej wersji - TODO: Modal z wyborem pliku');
  }

  openUploadModal(): void {
    this.router.navigate(['/library/add']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
}
