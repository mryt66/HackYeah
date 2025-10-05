import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Announcement {
  id: number;
  title: string;
  content: string;
  category: AnnouncementCategory;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  isPinned: boolean;
  targetAudience: TargetAudience[];
  publishedAt: string;
  expiresAt?: string;
  attachments: AnnouncementAttachment[];
  createdBy: {
    id: number;
    name: string;
  };
  viewCount: number;
}

export type AnnouncementCategory = 'SYSTEM' | 'REPORTING' | 'LEGAL' | 'TECHNICAL' | 'TRAINING' | 'OTHER';
export type AnnouncementPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type AnnouncementStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'EXPIRED';
export type TargetAudience = 'ALL' | 'BANK' | 'INSURANCE' | 'INVESTMENT' | 'COOPERATIVE' | 'PENSION';

export interface AnnouncementAttachment {
  id: number;
  filename: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
}

export interface AnnouncementFilter {
  category?: AnnouncementCategory;
  priority?: AnnouncementPriority;
  targetAudience?: TargetAudience;
  searchQuery?: string;
  includeExpired?: boolean;
  page?: number;
  size?: number;
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
export class AnnouncementsService {
  private apiUrl = `${environment.apiUrl}/announcements`;

  constructor(private http: HttpClient) {}

  getAnnouncements(filter: AnnouncementFilter = {}): Observable<PagedResponse<Announcement>> {
    let params = new HttpParams();
    
    if (filter.category) params = params.set('category', filter.category);
    if (filter.priority) params = params.set('priority', filter.priority);
    if (filter.targetAudience) params = params.set('targetAudience', filter.targetAudience);
    if (filter.searchQuery) params = params.set('search', filter.searchQuery);
    if (filter.includeExpired !== undefined) params = params.set('includeExpired', filter.includeExpired.toString());
    if (filter.page !== undefined) params = params.set('page', filter.page.toString());
    if (filter.size !== undefined) params = params.set('size', filter.size.toString());

    return this.http.get<PagedResponse<Announcement>>(this.apiUrl, { params });
  }

  getAnnouncementById(id: number): Observable<Announcement> {
    return this.http.get<Announcement>(`${this.apiUrl}/${id}`);
  }

  createAnnouncement(announcement: Partial<Announcement>): Observable<Announcement> {
    return this.http.post<Announcement>(this.apiUrl, announcement);
  }

  updateAnnouncement(id: number, announcement: Partial<Announcement>): Observable<Announcement> {
    return this.http.put<Announcement>(`${this.apiUrl}/${id}`, announcement);
  }

  deleteAnnouncement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  togglePin(id: number): Observable<Announcement> {
    return this.http.patch<Announcement>(`${this.apiUrl}/${id}/pin`, {});
  }

  incrementViewCount(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/view`, {});
  }

  uploadAttachment(announcementId: number, file: File): Observable<AnnouncementAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<AnnouncementAttachment>(`${this.apiUrl}/${announcementId}/attachments`, formData);
  }

  getCategoryLabel(category: AnnouncementCategory): string {
    const labels: Record<AnnouncementCategory, string> = {
      SYSTEM: 'Systemowe',
      REPORTING: 'Sprawozdawczość',
      LEGAL: 'Prawne',
      TECHNICAL: 'Techniczne',
      TRAINING: 'Szkolenia',
      OTHER: 'Inne'
    };
    return labels[category] || category;
  }

  getPriorityLabel(priority: AnnouncementPriority): string {
    const labels: Record<AnnouncementPriority, string> = {
      LOW: 'Niski',
      NORMAL: 'Normalny',
      HIGH: 'Wysoki',
      URGENT: 'Pilne'
    };
    return labels[priority] || priority;
  }

  getStatusLabel(status: AnnouncementStatus): string {
    const labels: Record<AnnouncementStatus, string> = {
      DRAFT: 'Wersja robocza',
      PUBLISHED: 'Opublikowane',
      ARCHIVED: 'Zarchiwizowane',
      EXPIRED: 'Wygasłe'
    };
    return labels[status] || status;
  }

  getTargetAudienceLabel(audience: TargetAudience): string {
    const labels: Record<TargetAudience, string> = {
      ALL: 'Wszyscy',
      BANK: 'Banki',
      INSURANCE: 'Ubezpieczenia',
      INVESTMENT: 'Inwestycje',
      COOPERATIVE: 'SKOK',
      PENSION: 'Emerytalne'
    };
    return labels[audience] || audience;
  }

  getCategoryClass(category: AnnouncementCategory): string {
    const classes: Record<AnnouncementCategory, string> = {
      SYSTEM: 'bg-red-100 text-red-800',
      REPORTING: 'bg-blue-100 text-blue-800',
      LEGAL: 'bg-purple-100 text-purple-800',
      TECHNICAL: 'bg-green-100 text-green-800',
      TRAINING: 'bg-yellow-100 text-yellow-800',
      OTHER: 'bg-gray-100 text-gray-800'
    };
    return classes[category] || 'bg-gray-100 text-gray-800';
  }

  getPriorityClass(priority: AnnouncementPriority): string {
    const classes: Record<AnnouncementPriority, string> = {
      LOW: 'bg-gray-100 text-gray-800',
      NORMAL: 'bg-blue-100 text-blue-800',
      HIGH: 'bg-orange-100 text-orange-800',
      URGENT: 'bg-red-100 text-red-800'
    };
    return classes[priority] || 'bg-gray-100 text-gray-800';
  }

  getStatusClass(status: AnnouncementStatus): string {
    const classes: Record<AnnouncementStatus, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      PUBLISHED: 'bg-green-100 text-green-800',
      ARCHIVED: 'bg-yellow-100 text-yellow-800',
      EXPIRED: 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }
}
