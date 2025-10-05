import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Subject {
  id: number;
  name: string;
  nip: string;
  regon: string;
  krs?: string;
  subjectType: SubjectType;
  category: SubjectCategory;
  address: Address;
  contactPerson: ContactPerson;
  status: SubjectStatus;
  registrationDate: string;
  lastModified: string;
  users: SubjectUser[];
  changeHistory: SubjectChange[];
}

export type SubjectType = 'BANK' | 'INSURANCE' | 'INVESTMENT' | 'COOPERATIVE' | 'PENSION' | 'OTHER';
export type SubjectCategory = 'COMMERCIAL_BANK' | 'COOPERATIVE_BANK' | 'INSURANCE_COMPANY' | 'REINSURANCE_COMPANY' | 
                               'INVESTMENT_FUND' | 'INVESTMENT_FIRM' | 'PENSION_FUND' | 'SKOK' | 'OTHER';
export type SubjectStatus = 'ACTIVE' | 'SUSPENDED' | 'LIQUIDATION' | 'BANKRUPTCY' | 'DELETED';

export interface Address {
  street: string;
  buildingNumber: string;
  apartmentNumber?: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface ContactPerson {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
}

export interface SubjectUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  status: string;
  lastLogin?: string;
}

export interface SubjectChange {
  id: number;
  changeDate: string;
  changedBy: {
    id: number;
    name: string;
  };
  changeType: ChangeType;
  fieldName: string;
  oldValue: string;
  newValue: string;
  status: ChangeStatus;
  caseId?: number;
}

export type ChangeType = 'DATA_UPDATE' | 'STATUS_CHANGE' | 'USER_ADDED' | 'USER_REMOVED' | 'ADDRESS_CHANGE' | 'CONTACT_CHANGE';
export type ChangeStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'AUTO_APPROVED';

export interface SubjectFilter {
  searchQuery?: string;
  subjectType?: SubjectType;
  category?: SubjectCategory;
  status?: SubjectStatus;
  city?: string;
  mySubjectsOnly?: boolean;
  page?: number;
  size?: number;
}

export interface SubjectChangeRequest {
  subjectId: number;
  changeType: ChangeType;
  fieldName: string;
  newValue: string;
  reason: string;
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
export class SubjectsService {
  private apiUrl = `${environment.apiUrl}/subjects`;

  constructor(private http: HttpClient) {}

  getSubjects(filter: SubjectFilter = {}): Observable<PagedResponse<Subject>> {
    let params = new HttpParams();
    
    if (filter.searchQuery) params = params.set('search', filter.searchQuery);
    if (filter.subjectType) params = params.set('type', filter.subjectType);
    if (filter.category) params = params.set('category', filter.category);
    if (filter.status) params = params.set('status', filter.status);
    if (filter.city) params = params.set('city', filter.city);
    if (filter.mySubjectsOnly !== undefined) params = params.set('mySubjectsOnly', filter.mySubjectsOnly.toString());
    if (filter.page !== undefined) params = params.set('page', filter.page.toString());
    if (filter.size !== undefined) params = params.set('size', filter.size.toString());

    return this.http.get<PagedResponse<Subject>>(this.apiUrl, { params });
  }

  getSubjectById(id: number): Observable<Subject> {
    return this.http.get<Subject>(`${this.apiUrl}/${id}`);
  }

  updateSubject(id: number, subject: Partial<Subject>): Observable<Subject> {
    return this.http.put<Subject>(`${this.apiUrl}/${id}`, subject);
  }

  requestChange(changeRequest: SubjectChangeRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/change-request`, changeRequest);
  }

  getChangeHistory(subjectId: number): Observable<SubjectChange[]> {
    return this.http.get<SubjectChange[]>(`${this.apiUrl}/${subjectId}/changes`);
  }

  approveChange(changeId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/changes/${changeId}/approve`, {});
  }

  rejectChange(changeId: number, reason: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/changes/${changeId}/reject`, { reason });
  }

  getSubjectUsers(subjectId: number): Observable<SubjectUser[]> {
    return this.http.get<SubjectUser[]>(`${this.apiUrl}/${subjectId}/users`);
  }

  getTypeLabel(type: SubjectType): string {
    const labels: Record<SubjectType, string> = {
      BANK: 'Bank',
      INSURANCE: 'Ubezpieczenia',
      INVESTMENT: 'Inwestycje',
      COOPERATIVE: 'SKOK',
      PENSION: 'Emerytalne',
      OTHER: 'Inne'
    };
    return labels[type] || type;
  }

  getCategoryLabel(category: SubjectCategory): string {
    const labels: Record<SubjectCategory, string> = {
      COMMERCIAL_BANK: 'Bank komercyjny',
      COOPERATIVE_BANK: 'Bank spółdzielczy',
      INSURANCE_COMPANY: 'Zakład ubezpieczeń',
      REINSURANCE_COMPANY: 'Zakład reasekuracji',
      INVESTMENT_FUND: 'Fundusz inwestycyjny',
      INVESTMENT_FIRM: 'Firma inwestycyjna',
      PENSION_FUND: 'Fundusz emerytalny',
      SKOK: 'SKOK',
      OTHER: 'Inny'
    };
    return labels[category] || category;
  }

  getStatusLabel(status: SubjectStatus): string {
    const labels: Record<SubjectStatus, string> = {
      ACTIVE: 'Aktywny',
      SUSPENDED: 'Zawieszony',
      LIQUIDATION: 'W likwidacji',
      BANKRUPTCY: 'Upadłość',
      DELETED: 'Usunięty'
    };
    return labels[status] || status;
  }

  getChangeTypeLabel(type: ChangeType): string {
    const labels: Record<ChangeType, string> = {
      DATA_UPDATE: 'Aktualizacja danych',
      STATUS_CHANGE: 'Zmiana statusu',
      USER_ADDED: 'Dodano użytkownika',
      USER_REMOVED: 'Usunięto użytkownika',
      ADDRESS_CHANGE: 'Zmiana adresu',
      CONTACT_CHANGE: 'Zmiana danych kontaktowych'
    };
    return labels[type] || type;
  }

  getChangeStatusLabel(status: ChangeStatus): string {
    const labels: Record<ChangeStatus, string> = {
      PENDING: 'Oczekuje',
      APPROVED: 'Zatwierdzono',
      REJECTED: 'Odrzucono',
      AUTO_APPROVED: 'Auto-zatwierdzono'
    };
    return labels[status] || status;
  }

  getTypeClass(type: SubjectType): string {
    const classes: Record<SubjectType, string> = {
      BANK: 'bg-blue-100 text-blue-800',
      INSURANCE: 'bg-green-100 text-green-800',
      INVESTMENT: 'bg-purple-100 text-purple-800',
      COOPERATIVE: 'bg-orange-100 text-orange-800',
      PENSION: 'bg-indigo-100 text-indigo-800',
      OTHER: 'bg-gray-100 text-gray-800'
    };
    return classes[type] || 'bg-gray-100 text-gray-800';
  }

  getStatusClass(status: SubjectStatus): string {
    const classes: Record<SubjectStatus, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      SUSPENDED: 'bg-yellow-100 text-yellow-800',
      LIQUIDATION: 'bg-orange-100 text-orange-800',
      BANKRUPTCY: 'bg-red-100 text-red-800',
      DELETED: 'bg-gray-100 text-gray-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getChangeStatusClass(status: ChangeStatus): string {
    const classes: Record<ChangeStatus, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      AUTO_APPROVED: 'bg-blue-100 text-blue-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }
}
