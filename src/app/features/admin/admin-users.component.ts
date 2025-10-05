import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminUser, UserFilter, PagedResponse, UserStatus } from '../../core/services/admin.service';
import { BreadcrumbsComponent } from '../../shared/components/breadcrumbs.component';
import { UserRole } from '../../core/models/user.model';

/**
 * FAZA 4.8 - Panel Administracyjny
 * Zarządzanie użytkownikami systemu
 */
@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BreadcrumbsComponent],
  templateUrl: './admin-users.component.html'
})
export class AdminUsersComponent implements OnInit {
  private adminService = inject(AdminService);
  private router = inject(Router);

  users: AdminUser[] = [];
  loading = false;
  filter: UserFilter = { page: 0, size: 20 };
  currentPage = 0;
  pageSize = 20;
  totalElements = 0;
  totalPages = 0;
  searchTimeout: any;
  showFilters = false;
  Math = Math;

  // Opcje filtrów
  UserRole = UserRole;
  userRoles = Object.values(UserRole);
  userStatuses: UserStatus[] = ['ACTIVE', 'INACTIVE', 'BLOCKED', 'PENDING_ACTIVATION'];

  // Modals
  showDeleteModal = false;
  showBlockModal = false;
  showResetPasswordModal = false;
  selectedUser: AdminUser | null = null;
  resetPasswordEmail = true;
  temporaryPassword = '';

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.filter.page = this.currentPage;
    this.filter.size = this.pageSize;

    this.adminService.getUsers(this.filter).subscribe({
      next: (response: PagedResponse<AdminUser>) => {
        this.users = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loadMockData();
        this.loading = false;
      }
    });
  }

  loadMockData(): void {
    this.users = [
      {
        id: 1,
        email: 'jan.kowalski@bank.pl',
        firstName: 'Jan',
        lastName: 'Kowalski',
        role: UserRole.SUBJECT,
        status: 'ACTIVE',
        subjectId: 1,
        subjectName: 'Bank Przykładowy S.A.',
        createdAt: '2020-01-15T10:00:00',
        lastLogin: '2025-10-04T14:30:00',
        isActive: true
      },
      {
        id: 2,
        email: 'anna.nowak@bank.pl',
        firstName: 'Anna',
        lastName: 'Nowak',
        role: UserRole.SUBJECT,
        status: 'ACTIVE',
        subjectId: 1,
        subjectName: 'Bank Przykładowy S.A.',
        createdAt: '2020-03-20T11:00:00',
        lastLogin: '2025-10-03T16:45:00',
        isActive: true
      },
      {
        id: 3,
        email: 'piotr.wisniewski@uknf.gov.pl',
        firstName: 'Piotr',
        lastName: 'Wiśniewski',
        role: UserRole.UKNF_EMPLOYEE,
        status: 'ACTIVE',
        createdAt: '2019-06-10T09:00:00',
        lastLogin: '2025-10-05T08:15:00',
        isActive: true
      },
      {
        id: 4,
        email: 'maria.kowalczyk@uknf.gov.pl',
        firstName: 'Maria',
        lastName: 'Kowalczyk',
        role: UserRole.ADMIN,
        status: 'ACTIVE',
        createdAt: '2018-01-05T10:00:00',
        lastLogin: '2025-10-05T09:00:00',
        isActive: true
      },
      {
        id: 5,
        email: 'tomasz.lewandowski@insurance.pl',
        firstName: 'Tomasz',
        lastName: 'Lewandowski',
        role: UserRole.SUBJECT,
        status: 'BLOCKED',
        subjectId: 2,
        subjectName: 'Towarzystwo Ubezpieczeń ABC',
        createdAt: '2021-05-12T14:00:00',
        lastLogin: '2025-09-20T12:30:00',
        isActive: false
      },
      {
        id: 6,
        email: 'katarzyna.nowak@fund.pl',
        firstName: 'Katarzyna',
        lastName: 'Nowak',
        role: UserRole.SUBJECT,
        status: 'PENDING_ACTIVATION',
        subjectId: 3,
        subjectName: 'Fundusz Inwestycyjny XYZ TFI',
        createdAt: '2025-10-01T10:00:00',
        isActive: false
      }
    ];
    this.totalElements = this.users.length;
    this.totalPages = Math.ceil(this.totalElements / this.pageSize);
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 0;
      this.loadUsers();
    }, 500);
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadUsers();
  }

  clearFilters(): void {
    this.filter = { page: 0, size: this.pageSize };
    this.currentPage = 0;
    this.loadUsers();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  // Pagination
  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  getPageNumbers(): number[] {
    const maxVisible = 5;
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages, start + maxVisible);
    return Array.from({ length: end - start }, (_, i) => start + i);
  }

  // User actions
  createUser(): void {
    this.router.navigate(['/admin/users/new']);
  }

  editUser(user: AdminUser): void {
    this.router.navigate(['/admin/users', user.id, 'edit']);
  }

  viewUser(user: AdminUser): void {
    this.router.navigate(['/admin/users', user.id]);
  }

  openDeleteModal(user: AdminUser): void {
    this.selectedUser = user;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedUser = null;
  }

  confirmDelete(): void {
    if (!this.selectedUser) return;

    this.adminService.deleteUser(this.selectedUser.id).subscribe({
      next: () => {
        alert('Użytkownik został usunięty.');
        this.closeDeleteModal();
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        alert('Nie udało się usunąć użytkownika.');
      }
    });
  }

  openBlockModal(user: AdminUser): void {
    this.selectedUser = user;
    this.showBlockModal = true;
  }

  closeBlockModal(): void {
    this.showBlockModal = false;
    this.selectedUser = null;
  }

  confirmBlockUnblock(): void {
    if (!this.selectedUser) return;

    const action = this.selectedUser.status === 'BLOCKED' 
      ? this.adminService.unblockUser(this.selectedUser.id)
      : this.adminService.blockUser(this.selectedUser.id);

    action.subscribe({
      next: () => {
        const message = this.selectedUser!.status === 'BLOCKED' 
          ? 'Użytkownik został odblokowany.' 
          : 'Użytkownik został zablokowany.';
        alert(message);
        this.closeBlockModal();
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error blocking/unblocking user:', error);
        alert('Nie udało się zmienić statusu użytkownika.');
      }
    });
  }

  openResetPasswordModal(user: AdminUser): void {
    this.selectedUser = user;
    this.resetPasswordEmail = true;
    this.temporaryPassword = '';
    this.showResetPasswordModal = true;
  }

  closeResetPasswordModal(): void {
    this.showResetPasswordModal = false;
    this.selectedUser = null;
    this.temporaryPassword = '';
  }

  confirmResetPassword(): void {
    if (!this.selectedUser) return;

    this.adminService.resetPassword({
      userId: this.selectedUser.id,
      sendEmail: this.resetPasswordEmail
    }).subscribe({
      next: (response) => {
        if (!this.resetPasswordEmail && response.temporaryPassword) {
          this.temporaryPassword = response.temporaryPassword;
          alert('Hasło zostało zresetowane. Tymczasowe hasło: ' + response.temporaryPassword);
        } else {
          alert('Hasło zostało zresetowane. Link aktywacyjny został wysłany na email użytkownika.');
          this.closeResetPasswordModal();
        }
      },
      error: (error) => {
        console.error('Error resetting password:', error);
        alert('Nie udało się zresetować hasła.');
      }
    });
  }

  // Helper methods
  getRoleLabel(role: UserRole): string {
    return this.adminService.getRoleLabel(role);
  }

  getStatusLabel(status: UserStatus): string {
    return this.adminService.getStatusLabel(status);
  }

  getRoleClass(role: UserRole): string {
    return this.adminService.getRoleClass(role);
  }

  getStatusClass(status: UserStatus): string {
    return this.adminService.getStatusClass(status);
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'Nigdy';
    return new Date(date).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
