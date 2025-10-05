import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { UserRole } from '../../core/models/user.model';
import { SubjectsService } from '../../core/services/subjects.service';

@Component({
  selector: 'app-admin-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-user-form.component.html'
})
export class AdminUserFormComponent implements OnInit {
  userId: number | null = null;
  isEditMode = false;
  loading = false;
  saving = false;
  error: string | null = null;

  // Model formularza
  formData = {
    email: '',
    firstName: '',
    lastName: '',
    role: UserRole.SUBJECT as UserRole,
    subjectId: undefined as number | undefined,
    sendActivationEmail: true,
    isActive: true
  };

  // Walidacja
  errors: { [key: string]: string } = {};
  touched: { [key: string]: boolean } = {};

  // Dane dla selectów
  userRoles = [UserRole.ADMIN, UserRole.UKNF_EMPLOYEE, UserRole.SUBJECT];
  subjects: Array<{ id: number; name: string; type: string }> = [];
  filteredSubjects: Array<{ id: number; name: string; type: string }> = [];

  constructor(
    private adminService: AdminService,
    private subjectsService: SubjectsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.userId = idParam ? parseInt(idParam, 10) : null;
    this.isEditMode = !!this.userId;

    this.loadSubjects();

    if (this.isEditMode && this.userId) {
      this.loadUser(this.userId);
    }
  }

  loadSubjects(): void {
    // Mock danych - w produkcji: this.subjectsService.getSubjects()
    this.subjects = [
      { id: 1, name: 'PKO Bank Polski S.A.', type: 'BANK' },
      { id: 2, name: 'PZU S.A.', type: 'INSURANCE' },
      { id: 3, name: 'Nationale-Nederlanden TFI S.A.', type: 'INVESTMENT_FUND' },
      { id: 4, name: 'mBank S.A.', type: 'BANK' },
      { id: 5, name: 'Alior Bank S.A.', type: 'BANK' },
      { id: 6, name: 'Aviva TU S.A.', type: 'INSURANCE' },
      { id: 7, name: 'Pioneer Pekao TFI S.A.', type: 'INVESTMENT_FUND' }
    ];
    this.filteredSubjects = [...this.subjects];
  }

  loadUser(id: number): void {
    this.loading = true;
    this.error = null;

    this.adminService.getUserById(id).subscribe({
      next: (user) => {
        this.formData = {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          subjectId: user.subjectId || undefined,
          sendActivationEmail: false,
          isActive: user.isActive
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading user:', err);
        this.error = 'Nie udało się załadować danych użytkownika';
        this.loading = false;
      }
    });
  }

  onRoleChange(): void {
    // Jeśli zmieniono rolę na inną niż SUBJECT, wyczyść subjectId
    if (this.formData.role !== UserRole.SUBJECT) {
      this.formData.subjectId = undefined;
      this.errors['subjectId'] = '';
    }
  }

  onFieldBlur(fieldName: string): void {
    this.touched[fieldName] = true;
    this.validateField(fieldName);
  }

  validateField(fieldName: string): void {
    switch (fieldName) {
      case 'email':
        if (!this.formData.email) {
          this.errors['email'] = 'Email jest wymagany';
        } else if (!this.isValidEmail(this.formData.email)) {
          this.errors['email'] = 'Nieprawidłowy format email';
        } else {
          delete this.errors['email'];
        }
        break;

      case 'firstName':
        if (!this.formData.firstName) {
          this.errors['firstName'] = 'Imię jest wymagane';
        } else if (this.formData.firstName.length < 2) {
          this.errors['firstName'] = 'Imię musi mieć co najmniej 2 znaki';
        } else {
          delete this.errors['firstName'];
        }
        break;

      case 'lastName':
        if (!this.formData.lastName) {
          this.errors['lastName'] = 'Nazwisko jest wymagane';
        } else if (this.formData.lastName.length < 2) {
          this.errors['lastName'] = 'Nazwisko musi mieć co najmniej 2 znaki';
        } else {
          delete this.errors['lastName'];
        }
        break;

      case 'role':
        if (!this.formData.role) {
          this.errors['role'] = 'Rola jest wymagana';
        } else {
          delete this.errors['role'];
        }
        break;

      case 'subjectId':
        if (this.formData.role === UserRole.SUBJECT && !this.formData.subjectId) {
          this.errors['subjectId'] = 'Podmiot jest wymagany dla roli Użytkownik podmiotu';
        } else {
          delete this.errors['subjectId'];
        }
        break;
    }
  }

  validateForm(): boolean {
    // Oznacz wszystkie pola jako touched
    Object.keys(this.formData).forEach(key => {
      this.touched[key] = true;
    });

    // Waliduj wszystkie pola
    this.validateField('email');
    this.validateField('firstName');
    this.validateField('lastName');
    this.validateField('role');
    this.validateField('subjectId');

    return Object.keys(this.errors).length === 0;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      this.error = 'Proszę poprawić błędy w formularzu';
      return;
    }

    this.saving = true;
    this.error = null;

    if (this.isEditMode && this.userId) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  createUser(): void {
    const request = {
      email: this.formData.email,
      firstName: this.formData.firstName,
      lastName: this.formData.lastName,
      role: this.formData.role,
      subjectId: this.formData.role === UserRole.SUBJECT ? this.formData.subjectId : undefined,
      sendActivationEmail: this.formData.sendActivationEmail
    };

    this.adminService.createUser(request).subscribe({
      next: (user) => {
        console.log('User created:', user);
        this.router.navigate(['/admin/users']);
      },
      error: (err) => {
        console.error('Error creating user:', err);
        this.error = err.error?.message || 'Nie udało się utworzyć użytkownika';
        this.saving = false;
      }
    });
  }

  updateUser(): void {
    if (!this.userId) return;

    const request = {
      firstName: this.formData.firstName,
      lastName: this.formData.lastName,
      role: this.formData.role,
      subjectId: this.formData.role === UserRole.SUBJECT ? this.formData.subjectId : undefined,
      isActive: this.formData.isActive
    };

    this.adminService.updateUser(this.userId, request).subscribe({
      next: (user) => {
        console.log('User updated:', user);
        this.router.navigate(['/admin/users']);
      },
      error: (err) => {
        console.error('Error updating user:', err);
        this.error = err.error?.message || 'Nie udało się zaktualizować użytkownika';
        this.saving = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/users']);
  }

  getRoleLabel(role: UserRole): string {
    return this.adminService.getRoleLabel(role);
  }

  getSubjectTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'BANK': 'Bank',
      'INSURANCE': 'Zakład ubezpieczeń',
      'INVESTMENT_FUND': 'Fundusz inwestycyjny',
      'PENSION_FUND': 'Fundusz emerytalny',
      'BROKERAGE_HOUSE': 'Dom maklerski',
      'PAYMENT_INSTITUTION': 'Instytucja płatnicza'
    };
    return labels[type] || type;
  }

  hasError(fieldName: string): boolean {
    return this.touched[fieldName] && !!this.errors[fieldName];
  }

  getError(fieldName: string): string {
    return this.errors[fieldName] || '';
  }
}
