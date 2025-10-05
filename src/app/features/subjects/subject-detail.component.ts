import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SubjectsService, Subject, SubjectChange, SubjectUser } from '../../core/services/subjects.service';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-subject-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './subject-detail.component.html'
})
export class SubjectDetailComponent implements OnInit {
  private subjectsService = inject(SubjectsService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  subject: Subject | null = null;
  changeHistory: SubjectChange[] = [];
  subjectUsers: SubjectUser[] = [];
  loading = false;
  error = '';

  // Aktywna zakładka
  activeTab: 'details' | 'history' | 'users' = 'details';

  // Modal zatwierdzania zmiany
  showApproveModal = false;
  selectedChange: SubjectChange | null = null;

  // Modal odrzucania zmiany
  showRejectModal = false;
  rejectReason = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const numericId = parseInt(id, 10);
      this.loadSubject(numericId);
      this.loadChangeHistory(numericId);
      this.loadSubjectUsers(numericId);
    }
  }

  loadSubject(id: number): void {
    this.loading = true;
    this.error = '';

    this.subjectsService.getSubjectById(id).subscribe({
      next: (subject) => {
        this.subject = subject;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading subject:', error);
        this.error = 'Nie udało się załadować danych podmiotu.';
        this.loading = false;

        // Fallback na dane mockowe
        this.loadMockSubject(id);
      }
    });
  }

  loadMockSubject(id: number): void {
    const mockSubjects: Subject[] = [
      {
        id: 1,
        name: 'Bank Przykładowy S.A.',
        nip: '1234567890',
        regon: '123456789',
        krs: '0000123456',
        subjectType: 'BANK',
        category: 'COMMERCIAL_BANK',
        address: {
          street: 'ul. Bankowa',
          buildingNumber: '10',
          apartmentNumber: '5',
          postalCode: '00-001',
          city: 'Warszawa',
          country: 'Polska'
        },
        contactPerson: {
          firstName: 'Jan',
          lastName: 'Kowalski',
          position: 'Dyrektor',
          email: 'jan.kowalski@bank.pl',
          phone: '+48 22 123 4567'
        },
        status: 'ACTIVE',
        registrationDate: '2020-01-15',
        lastModified: '2025-04-10',
        users: [],
        changeHistory: []
      },
      {
        id: 2,
        name: 'Towarzystwo Ubezpieczeń ABC',
        nip: '9876543210',
        regon: '987654321',
        krs: '0000654321',
        subjectType: 'INSURANCE',
        category: 'INSURANCE_COMPANY',
        address: {
          street: 'Al. Jerozolimskie',
          buildingNumber: '100',
          postalCode: '02-001',
          city: 'Warszawa',
          country: 'Polska'
        },
        contactPerson: {
          firstName: 'Maria',
          lastName: 'Nowak',
          position: 'Prezes Zarządu',
          email: 'maria.nowak@tuabc.pl',
          phone: '+48 22 555 6677'
        },
        status: 'ACTIVE',
        registrationDate: '2019-06-20',
        lastModified: '2025-04-08',
        users: [],
        changeHistory: []
      }
    ];

    this.subject = mockSubjects.find(s => s.id === id) || mockSubjects[0];
    this.loading = false;
  }

  loadChangeHistory(subjectId: number): void {
    this.subjectsService.getChangeHistory(subjectId).subscribe({
      next: (changes) => {
        this.changeHistory = changes;
      },
      error: (error) => {
        console.error('Error loading change history:', error);
        // Fallback na mockowe dane
        this.loadMockChangeHistory();
      }
    });
  }

  loadMockChangeHistory(): void {
    this.changeHistory = [
      {
        id: 1,
        changeDate: '2025-03-15',
        changedBy: {
          id: 1,
          name: 'Anna Wiśniewska'
        },
        changeType: 'ADDRESS_CHANGE',
        fieldName: 'address.street',
        oldValue: 'ul. Stara 5',
        newValue: 'ul. Bankowa 10',
        status: 'APPROVED',
        caseId: 101
      },
      {
        id: 2,
        changeDate: '2025-04-10',
        changedBy: {
          id: 10,
          name: 'Jan Kowalski'
        },
        changeType: 'CONTACT_CHANGE',
        fieldName: 'contactPerson.email',
        oldValue: 'old@bank.pl',
        newValue: 'jan.kowalski@bank.pl',
        status: 'PENDING'
      },
      {
        id: 3,
        changeDate: '2025-03-01',
        changedBy: {
          id: 1,
          name: 'Anna Wiśniewska'
        },
        changeType: 'STATUS_CHANGE',
        fieldName: 'status',
        oldValue: 'SUSPENDED',
        newValue: 'ACTIVE',
        status: 'AUTO_APPROVED',
        caseId: 95
      }
    ];
  }

  loadSubjectUsers(subjectId: number): void {
    this.subjectsService.getSubjectUsers(subjectId).subscribe({
      next: (users) => {
        this.subjectUsers = users;
      },
      error: (error) => {
        console.error('Error loading subject users:', error);
        // Fallback na mockowe dane
        this.loadMockSubjectUsers();
      }
    });
  }

  loadMockSubjectUsers(): void {
    this.subjectUsers = [
      {
        id: 10,
        firstName: 'Jan',
        lastName: 'Kowalski',
        email: 'jan.kowalski@bank.pl',
        roles: ['ADMIN'],
        status: 'ACTIVE',
        lastLogin: '2025-04-10'
      },
      {
        id: 11,
        firstName: 'Anna',
        lastName: 'Nowak',
        email: 'anna.nowak@bank.pl',
        roles: ['USER'],
        status: 'ACTIVE',
        lastLogin: '2025-04-09'
      },
      {
        id: 12,
        firstName: 'Piotr',
        lastName: 'Wiśniewski',
        email: 'piotr.wisniewski@bank.pl',
        roles: ['USER'],
        status: 'INACTIVE',
        lastLogin: '2024-12-15'
      }
    ];
  }

  setActiveTab(tab: 'details' | 'history' | 'users'): void {
    this.activeTab = tab;
  }

  openApproveModal(change: SubjectChange): void {
    this.selectedChange = change;
    this.showApproveModal = true;
  }

  closeApproveModal(): void {
    this.showApproveModal = false;
    this.selectedChange = null;
  }

  approveChange(): void {
    if (!this.selectedChange) return;

    this.subjectsService.approveChange(this.selectedChange.id).subscribe({
      next: () => {
        alert('Zmiana została zatwierdzona.');
        this.closeApproveModal();
        // Odśwież dane
        if (this.subject) {
          this.loadSubject(this.subject.id);
          this.loadChangeHistory(this.subject.id);
        }
      },
      error: (error) => {
        console.error('Error approving change:', error);
        alert('Nie udało się zatwierdzić zmiany.');
      }
    });
  }

  openRejectModal(change: SubjectChange): void {
    this.selectedChange = change;
    this.showRejectModal = true;
    this.rejectReason = '';
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.selectedChange = null;
    this.rejectReason = '';
  }

  rejectChange(): void {
    if (!this.selectedChange) return;

    if (!this.rejectReason.trim()) {
      alert('Proszę podać powód odrzucenia.');
      return;
    }

    this.subjectsService.rejectChange(this.selectedChange.id, this.rejectReason).subscribe({
      next: () => {
        alert('Zmiana została odrzucona.');
        this.closeRejectModal();
        // Odśwież historię zmian
        if (this.subject) {
          this.loadChangeHistory(this.subject.id);
        }
      },
      error: (error) => {
        console.error('Error rejecting change:', error);
        alert('Nie udało się odrzucić zmiany.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/subjects']);
  }

  get isUknfEmployee(): boolean {
    const currentUser = this.authService.currentUserValue;
    return currentUser?.role === UserRole.UKNF_EMPLOYEE || currentUser?.role === UserRole.ADMIN;
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'Brak daty';
    return new Date(date).toLocaleDateString('pl-PL');
  }

  getTypeLabel(type: string): string {
    return this.subjectsService.getTypeLabel(type as any);
  }

  getCategoryLabel(category: string): string {
    return this.subjectsService.getCategoryLabel(category as any);
  }

  getStatusLabel(status: string): string {
    return this.subjectsService.getStatusLabel(status as any);
  }

  getChangeTypeLabel(type: string): string {
    return this.subjectsService.getChangeTypeLabel(type as any);
  }

  getChangeStatusLabel(status: string): string {
    return this.subjectsService.getChangeStatusLabel(status as any);
  }

  getTypeClass(type: string): string {
    return this.subjectsService.getTypeClass(type as any);
  }

  getStatusClass(status: string): string {
    return this.subjectsService.getStatusClass(status as any);
  }

  getChangeStatusClass(status: string): string {
    return this.subjectsService.getChangeStatusClass(status as any);
  }
}
