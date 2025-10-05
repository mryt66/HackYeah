import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpEventType } from '@angular/common/http';

export interface FileUploadItem extends File {
  progress?: number;
  error?: string;
  uploading?: boolean;
}

/**
 * FAZA 4 - Komponent współdzielony do upload'u plików
 * Wspiera drag & drop, walidację, progress bar, multi-file
 */
@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.component.html',
  styles: [`
    .file-upload-container { @apply w-full; }
    .drag-drop-area { @apply border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-colors; }
    .drag-drop-area.drag-over { @apply border-blue-600 bg-blue-50; }
    .upload-icon { @apply text-6xl mb-4; }
    .upload-text { @apply text-lg font-medium text-gray-700 mb-2; }
    .upload-hint { @apply text-sm text-gray-500; }
    .selected-files-list { @apply mt-6 space-y-3; }
    .list-title { @apply font-medium text-gray-700 mb-3; }
    .file-item { @apply border border-gray-200 rounded-lg p-4 flex items-start justify-between; }
    .file-info { @apply flex items-center space-x-3 flex-1; }
    .file-icon { @apply text-2xl; }
    .file-details { @apply flex-1 min-w-0; }
    .file-name { @apply font-medium text-gray-900 truncate; }
    .file-size { @apply text-sm text-gray-500; }
    .progress-container { @apply mt-2; }
    .progress-bar { @apply w-full bg-gray-200 rounded-full h-2 overflow-hidden; }
    .progress-fill { @apply h-full transition-all; }
    .progress-fill:not(.error):not(.success) { @apply bg-uknf-primary; }
    .progress-fill.success { @apply bg-green-500; }
    .progress-fill.error { @apply bg-red-500; }
    .progress-text { @apply text-xs text-gray-500 mt-1; }
    .error-message { @apply text-sm text-red-600 mt-2; }
    .remove-button { @apply text-red-600 hover:text-red-800 transition-colors; }
    .upload-actions { @apply mt-4 flex space-x-3; }
    .btn { @apply px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed; }
    .btn-primary { @apply bg-uknf-primary hover:bg-uknf-primary-dark text-white; }
    .btn-secondary { @apply bg-gray-200 hover:bg-gray-300 text-gray-700; }
  `]
})
export class FileUploadComponent {
  @Input() uploadUrl = '';
  @Input() multiple = true;
  @Input() autoUpload = false;
  @Input() maxSizeMB = 10;
  @Input() acceptedTypes: string[] = []; // ['.pdf', '.xlsx', '.docx', 'image/*']

  @Output() filesSelected = new EventEmitter<FileUploadItem[]>();
  @Output() uploadComplete = new EventEmitter<any>();
  @Output() uploadError = new EventEmitter<string>();

  selectedFiles: FileUploadItem[] = [];
  isDragging = false;
  uploading = false;

  constructor(private http: HttpClient) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  private handleFiles(files: File[]): void {
    const validFiles: FileUploadItem[] = [];

    for (const file of files) {
      const error = this.validateFile(file);
      if (error) {
        const fileItem = file as FileUploadItem;
        fileItem.error = error;
        fileItem.progress = 0;
        validFiles.push(fileItem);
      } else {
        const fileItem = file as FileUploadItem;
        fileItem.progress = 0;
        validFiles.push(fileItem);
      }
    }

    if (!this.multiple) {
      this.selectedFiles = [validFiles[0]];
    } else {
      this.selectedFiles.push(...validFiles);
    }

    this.filesSelected.emit(this.selectedFiles);

    if (this.autoUpload) {
      this.uploadFiles();
    }
  }

  private validateFile(file: File): string | null {
    const maxSize = this.maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      return `Plik przekracza maksymalny rozmiar ${this.maxSizeMB}MB`;
    }

    if (this.acceptedTypes.length > 0) {
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      const isAccepted = this.acceptedTypes.some(type => {
        if (type.includes('*')) {
          const mimeType = file.type.split('/')[0];
          return type.startsWith(mimeType);
        }
        return type === fileExt;
      });

      if (!isAccepted) {
        return `Niedozwolony typ pliku. Dozwolone: ${this.acceptedTypes.join(', ')}`;
      }
    }

    return null;
  }

  uploadFiles(): void {
    if (!this.uploadUrl) {
      console.error('Upload URL not provided');
      this.uploadError.emit('Upload URL not configured');
      return;
    }

    this.uploading = true;
    const uploads = this.selectedFiles
      .filter(f => !f.error && f.progress !== 100)
      .map(file => this.uploadFile(file));

    Promise.all(uploads).then(() => {
      this.uploading = false;
      this.uploadComplete.emit(this.selectedFiles);
    });
  }

  private uploadFile(file: FileUploadItem): Promise<void> {
    return new Promise((resolve) => {
      file.uploading = true;
      const formData = new FormData();
      formData.append('file', file);

      this.http.post(this.uploadUrl, formData, {
        reportProgress: true,
        observe: 'events'
      }).subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            file.progress = Math.round((100 * event.loaded) / event.total);
          } else if (event.type === HttpEventType.Response) {
            file.progress = 100;
            file.uploading = false;
            resolve();
          }
        },
        error: (error) => {
          file.error = 'Błąd podczas wysyłania pliku';
          file.progress = 0;
          file.uploading = false;
          this.uploadError.emit(file.name);
          resolve();
        }
      });
    });
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  clearAll(): void {
    this.selectedFiles = [];
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
