import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h3 class="text-2xl font-bold text-gray-900 mb-6">Rejestracja</h3>
      <p class="text-gray-600">Formularz rejestracji - wkrótce...</p>
    </div>
  `
})
export class RegisterComponent {}
