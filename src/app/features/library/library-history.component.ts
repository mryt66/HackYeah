import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LibraryService, FileVersion, LibraryFile } from '../../core/services/library.service';
import { BreadcrumbsComponent } from '../../shared/components/breadcrumbs.component';

@Component({
  selector: 'app-library-history',
  standalone: true,
  imports: [CommonModule, RouterModule, BreadcrumbsComponent],
  template: `
    <div class="container mx-auto px-4 py-6">
      <app-breadcrumbs [crumbs]="[
        { label: 'System', link: ['/dashboard'] },
        { label: 'Biblioteka', link: ['/library'] },
        { label: 'Historia wersji' }
      ]" />
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-uknf-primary">Historia wersji</h1>
          <p class="text-gray-600 mt-1" *ngIf="file">{{ file.name }} · {{ file.category }}</p>
        </div>
        <a [routerLink]="['/library']" class="px-4 py-2 border rounded-md text-sm hover:bg-gray-50">← Wróć do biblioteki</a>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div *ngIf="loading" class="text-center text-gray-600 py-8">Wczytywanie...</div>
        <div *ngIf="!loading && versions.length === 0" class="text-gray-500">Brak historii wersji</div>
        <ul *ngIf="!loading && versions.length > 0" class="divide-y">
          <li *ngFor="let v of versions" class="py-3 flex items-center justify-between">
            <div>
              <div class="font-medium">Wersja {{ v.version }} · {{ (v.fileSize || 0) | number }} B</div>
              <div class="text-xs text-gray-500">{{ v.uploadedBy }} · {{ v.uploadedAt | date:'dd.MM.yyyy HH:mm' }}</div>
              <div class="text-xs text-gray-600 mt-1" *ngIf="v.changeDescription">{{ v.changeDescription }}</div>
            </div>
            <button (click)="download(v)" class="text-uknf-primary hover:underline text-sm">Pobierz</button>
          </li>
        </ul>
      </div>
    </div>
  `
})
export class LibraryHistoryComponent implements OnInit {
  fileId!: number;
  file: LibraryFile | null = null;
  versions: FileVersion[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private libraryService: LibraryService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.router.navigate(['/library']); return; }
    this.fileId = id;
    this.libraryService.getFileById(id).subscribe({
      next: (f) => this.file = f,
      error: () => {}
    });
    this.libraryService.getVersionHistory(id).subscribe({
      next: (versions) => { this.versions = versions; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  download(v: FileVersion): void {
    this.libraryService.downloadVersion(this.fileId, v.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `file_v${v.version}`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => alert('Błąd pobierania wersji')
    });
  }
}
