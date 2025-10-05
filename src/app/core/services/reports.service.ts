import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';
import { Observable, filter, map } from 'rxjs';

export interface Report {
  id: number;
  subjectId: number;
  subjectName: string;
  reportType: string;
  period: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  status: 'DRAFT' | 'SUBMITTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ERROR';
  validationStatus?: 'PENDING' | 'VALID' | 'INVALID';
  validationResult?: string;
  userId: number;
  userName: string;
  isCorrected: boolean;
  correctionOf?: number;
}

export interface ReportSchedule {
  id: number;
  reportType: string;
  period: string;
  deadline: string;
  status: 'UPCOMING' | 'DUE' | 'OVERDUE' | 'SUBMITTED';
}

export interface ReportFilter {
  subjectId?: number;
  // Frontend logical status (DRAFT/COMPLETED etc.) — not supported by backend yet
  status?: string;
  // Backend expects validation status under parameter name `status`
  validationStatus?: 'PENDING' | 'VALID' | 'INVALID';
  // Not supported by backend endpoint yet
  period?: string;
  reportType?: string;
  mySubjectsOnly?: boolean;
  page?: number;
  size?: number;
  // Sorting not yet supported in backend
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private apiUrl = 'http://localhost:8080/api/reports';

  constructor(private http: HttpClient) {}

  getReports(filter: ReportFilter = {}): Observable<PagedResponse<Report>> {
    let params = new HttpParams();
    
    // Map only supported backend params to avoid 400 enum conversion errors
    if (filter.subjectId) params = params.set('subjectId', filter.subjectId.toString());
    if (filter.validationStatus) params = params.set('status', filter.validationStatus);
    if (filter.mySubjectsOnly) params = params.set('mySubjects', 'true');
    if (filter.page !== undefined) params = params.set('page', filter.page.toString());
    if (filter.size !== undefined) params = params.set('size', filter.size.toString());
    // Sorting and additional filters currently not supported by backend endpoint

    return this.http.get<PagedResponse<Report>>(this.apiUrl, { params });
  }

  getReportById(id: number): Observable<Report> {
    return this.http.get<Report>(`${this.apiUrl}/${id}`);
  }

  uploadReport(formData: FormData, onProgress?: (progress: number) => void): Observable<Report> {
    return this.http.post(`${this.apiUrl}/upload`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      filter((event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress && onProgress && event.total) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
        return event.type === HttpEventType.Response;
      }),
      map(event => event as any),
      map(event => event.body as Report)
    );
  }

  downloadReport(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, {
      responseType: 'blob'
    });
  }

  createCorrection(originalReportId: number, formData: FormData): Observable<Report> {
    return this.http.post<Report>(`${this.apiUrl}/${originalReportId}/correction`, formData);
  }

  getSchedule(subjectId?: number): Observable<ReportSchedule[]> {
    let params = new HttpParams();
    if (subjectId) params = params.set('subjectId', subjectId.toString());
    
    return this.http.get<ReportSchedule[]>(`${this.apiUrl}/schedule`, { params });
  }

  deleteReport(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getValidationResult(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/validation-result`);
  }
}
