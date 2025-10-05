import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserRole } from '../models/user.model';

export interface AdminUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  subjectId?: number;
  subjectName?: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING_ACTIVATION';

export interface UserFilter {
  searchQuery?: string;
  role?: UserRole;
  status?: UserStatus;
  subjectId?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  subjectId?: number;
  sendActivationEmail?: boolean;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  subjectId?: number;
  isActive?: boolean;
}

export interface SubjectAssignment {
  userId: number;
  subjectId: number;
  subjectName: string;
  assignedAt: string;
  assignedBy: {
    id: number;
    name: string;
  };
}

export interface PasswordResetRequest {
  userId: number;
  sendEmail: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin`;

  // ==================== USERS ====================
  
  getUsers(filter: UserFilter = {}): Observable<PagedResponse<AdminUser>> {
    let params = new HttpParams();
    if (filter.searchQuery) params = params.set('search', filter.searchQuery);
    if (filter.role) params = params.set('role', filter.role);
    if (filter.status) params = params.set('status', filter.status);
    if (filter.subjectId) params = params.set('subjectId', filter.subjectId.toString());
    if (filter.page !== undefined) params = params.set('page', filter.page.toString());
    if (filter.size) params = params.set('size', filter.size.toString());
    if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
    if (filter.sortOrder) params = params.set('sortOrder', filter.sortOrder);

    return this.http.get<PagedResponse<AdminUser>>(`${this.apiUrl}/users`, { params });
  }

  getUserById(id: number): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.apiUrl}/users/${id}`);
  }

  createUser(request: CreateUserRequest): Observable<AdminUser> {
    return this.http.post<AdminUser>(`${this.apiUrl}/users`, request);
  }

  updateUser(id: number, request: UpdateUserRequest): Observable<AdminUser> {
    return this.http.put<AdminUser>(`${this.apiUrl}/users/${id}`, request);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }

  blockUser(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/users/${id}/block`, {});
  }

  unblockUser(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/users/${id}/unblock`, {});
  }

  resetPassword(request: PasswordResetRequest): Observable<{ temporaryPassword?: string }> {
    return this.http.post<{ temporaryPassword?: string }>(
      `${this.apiUrl}/users/${request.userId}/reset-password`,
      { sendEmail: request.sendEmail }
    );
  }

  // ==================== SUBJECT ASSIGNMENTS ====================

  getUserSubjects(userId: number): Observable<SubjectAssignment[]> {
    return this.http.get<SubjectAssignment[]>(`${this.apiUrl}/users/${userId}/subjects`);
  }

  assignSubjectToUser(userId: number, subjectId: number): Observable<SubjectAssignment> {
    return this.http.post<SubjectAssignment>(`${this.apiUrl}/users/${userId}/subjects`, { subjectId });
  }

  removeSubjectFromUser(userId: number, subjectId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}/subjects/${subjectId}`);
  }

  // ==================== HELPER METHODS ====================

  getRoleLabel(role: UserRole): string {
    const labels: Record<UserRole, string> = {
      [UserRole.SUBJECT]: 'Użytkownik podmiotu',
      [UserRole.UKNF_EMPLOYEE]: 'Pracownik UKNF',
      [UserRole.ADMIN]: 'Administrator'
    };
    return labels[role] || role;
  }

  getStatusLabel(status: UserStatus): string {
    const labels: Record<UserStatus, string> = {
      ACTIVE: 'Aktywny',
      INACTIVE: 'Nieaktywny',
      BLOCKED: 'Zablokowany',
      PENDING_ACTIVATION: 'Oczekuje na aktywację'
    };
    return labels[status] || status;
  }

  getStatusClass(status: UserStatus): string {
    const classes: Record<UserStatus, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      BLOCKED: 'bg-red-100 text-red-800',
      PENDING_ACTIVATION: 'bg-yellow-100 text-yellow-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getRoleClass(role: UserRole): string {
    const classes: Record<UserRole, string> = {
      [UserRole.SUBJECT]: 'bg-blue-100 text-blue-800',
      [UserRole.UKNF_EMPLOYEE]: 'bg-purple-100 text-purple-800',
      [UserRole.ADMIN]: 'bg-red-100 text-red-800'
    };
    return classes[role] || 'bg-gray-100 text-gray-800';
  }
}
