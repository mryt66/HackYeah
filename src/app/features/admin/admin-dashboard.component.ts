import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Administracja</h2>
      <p class="text-gray-600">Panel administracyjny - wkrótce...</p>
    </div>
  `
})
export class AdminDashboardComponent {}
