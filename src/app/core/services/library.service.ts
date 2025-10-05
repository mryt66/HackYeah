import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Interfaces
export interface LibraryFile {
  id: number;
  name: string;
  description: string;
  category: string;
  filename: string;
  originalFilename: string;
  fileSize: number;
  contentType: string;
  version: number;
  status: 'ACTIVE' | 'ARCHIVED';
  accessLevel: 'PUBLIC' | 'UKNF_ONLY' | 'RESTRICTED';
  uploadedBy: {
    id: number;
    name: string;
  };
  uploadedAt: string;
  updatedAt: string;
  tags: string[];
  versionHistory: FileVersion[];
}

export interface FileVersion {
  id: number;
  version: number;
  filename: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  changeDescription: string;
}

export interface LibraryFilter {
  name?: string;
  category?: string;
  status?: string;
  accessLevel?: string;
  tags?: string[];
  page?: number;
  size?: number;
  sort?: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LibraryService {
  private apiUrl = `${environment.apiUrl}/library`;

  constructor(private http: HttpClient) {}

  /**
   * Pobiera listę plików z filtrowaniem i paginacją
   */
  getFiles(filter: LibraryFilter = {}): Observable<PagedResponse<LibraryFile>> {
    let params = new HttpParams();
    
    if (filter.name) params = params.set('name', filter.name);
    if (filter.category) params = params.set('category', filter.category);
    if (filter.status) params = params.set('status', filter.status);
    if (filter.accessLevel) params = params.set('accessLevel', filter.accessLevel);
    if (filter.tags && filter.tags.length > 0) {
      filter.tags.forEach(tag => params = params.append('tags', tag));
    }
    if (filter.page !== undefined) params = params.set('page', filter.page.toString());
    if (filter.size !== undefined) params = params.set('size', filter.size.toString());
    if (filter.sort) params = params.set('sort', filter.sort);

    return this.http.get<PagedResponse<LibraryFile>>(this.apiUrl, { params });
  }

  /**
   * Pobiera plik po ID
   */
  getFileById(id: number): Observable<LibraryFile> {
    return this.http.get<LibraryFile>(`${this.apiUrl}/${id}`);
  }

  /**
   * Upload nowego pliku
   */
  uploadFile(file: File, metadata: {
    name: string;
    description: string;
    category: string;
    accessLevel: string;
    tags: string[];
  }): Observable<LibraryFile> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', metadata.name);
    formData.append('description', metadata.description);
    formData.append('category', metadata.category);
    formData.append('accessLevel', metadata.accessLevel);
    formData.append('tags', JSON.stringify(metadata.tags));
    
    return this.http.post<LibraryFile>(this.apiUrl, formData);
  }

  /**
   * Aktualizuje metadane pliku
   */
  updateFile(id: number, metadata: Partial<{
    name: string;
    description: string;
    category: string;
    accessLevel: string;
    tags: string[];
  }>): Observable<LibraryFile> {
    return this.http.put<LibraryFile>(`${this.apiUrl}/${id}`, metadata);
  }

  /**
   * Upload nowej wersji pliku
   */
  uploadNewVersion(id: number, file: File, changeDescription: string): Observable<LibraryFile> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('changeDescription', changeDescription);
    
    return this.http.post<LibraryFile>(`${this.apiUrl}/${id}/versions`, formData);
  }

  /**
   * Pobiera historię wersji pliku
   */
  getVersionHistory(id: number): Observable<FileVersion[]> {
    return this.http.get<FileVersion[]>(`${this.apiUrl}/${id}/versions`);
  }

  /**
   * Pobiera konkretną wersję pliku
   */
  downloadVersion(id: number, versionId: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/${id}/versions/${versionId}/download`,
      { responseType: 'blob' }
    );
  }

  /**
   * Pobiera aktualny plik
   */
  downloadFile(id: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/${id}/download`,
      { responseType: 'blob' }
    );
  }

  /**
   * Zmienia status pliku (aktywny/archiwalny)
   */
  updateStatus(id: number, status: 'ACTIVE' | 'ARCHIVED'): Observable<LibraryFile> {
    return this.http.put<LibraryFile>(`${this.apiUrl}/${id}/status`, { status });
  }

  /**
   * Usuwa plik (tylko UKNF)
   */
  deleteFile(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Pobiera dostępne kategorie
   */
  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }

  /**
   * Pobiera dostępne tagi
   */
  getTags(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/tags`);
  }

  /**
   * Formatuje rozmiar pliku
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Zwraca polską etykietę statusu
   */
  getStatusLabel(status: string): string {
    const labels: {[key: string]: string} = {
      'ACTIVE': 'Aktywny',
      'ARCHIVED': 'Archiwalny'
    };
    return labels[status] || status;
  }

  /**
   * Zwraca polską etykietę poziomu dostępu
   */
  getAccessLevelLabel(level: string): string {
    const labels: {[key: string]: string} = {
      'PUBLIC': 'Publiczny',
      'UKNF_ONLY': 'Tylko UKNF',
      'RESTRICTED': 'Ograniczony'
    };
    return labels[level] || level;
  }

  /**
   * Zwraca klasę CSS dla statusu
   */
  getStatusClass(status: string): string {
    const classes: {[key: string]: string} = {
      'ACTIVE': 'bg-green-100 text-green-800',
      'ARCHIVED': 'bg-gray-100 text-gray-700'
    };
    return classes[status] || 'bg-gray-100 text-gray-700';
  }

  /**
   * Zwraca klasę CSS dla poziomu dostępu
   */
  getAccessLevelClass(level: string): string {
    const classes: {[key: string]: string} = {
      'PUBLIC': 'bg-blue-100 text-blue-800',
      'UKNF_ONLY': 'bg-purple-100 text-purple-800',
      'RESTRICTED': 'bg-red-100 text-red-800'
    };
    return classes[level] || 'bg-gray-100 text-gray-700';
  }
}
