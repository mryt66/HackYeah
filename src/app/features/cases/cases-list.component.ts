import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CasesService, CaseItem } from '../../core/services/cases.service';

@Component({
  selector: 'app-cases-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Sprawy</h2>
        <button (click)="navigateToNew()" class="px-4 py-2 bg-uknf-primary text-white rounded hover:bg-uknf-primary-dark">Nowa sprawa</button>
      </div>

      <div *ngIf="loading" class="text-gray-600">Ładowanie...</div>

      <div *ngIf="!loading" class="bg-white rounded shadow-sm overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left">ID</th>
              <th class="px-4 py-2 text-left">Tytuł</th>
              <th class="px-4 py-2 text-left">Podmiot</th>
              <th class="px-4 py-2 text-left">Status</th>
              <th class="px-4 py-2 text-left">Utworzono</th>
              <th class="px-4 py-2 text-left">Akcje</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of cases" class="border-t">
              <td class="px-4 py-2">#{{ c.id }}</td>
              <td class="px-4 py-2">{{ c.title }}</td>
              <td class="px-4 py-2">{{ c.subjectName || '-' }}</td>
              <td class="px-4 py-2">{{ c.status }}</td>
              <td class="px-4 py-2">{{ c.createdAt | date:'dd.MM.yyyy HH:mm' }}</td>
              <td class="px-4 py-2">
                <a [routerLink]="['/cases', c.id, 'edit']" class="text-uknf-primary hover:underline">Edytuj</a>
              </td>
            </tr>
            <tr *ngIf="cases.length === 0">
              <td colspan="6" class="px-4 py-6 text-center text-gray-500">Brak spraw</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class CasesListComponent implements OnInit {
  loading = false;
  cases: CaseItem[] = [];

  constructor(private service: CasesService, private router: Router) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.loading = true;
    this.service.list(0, 20).subscribe({
      next: (res) => {
        this.cases = res.content;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  navigateToNew(): void {
    this.router.navigate(['/cases/new']);
  }
}
