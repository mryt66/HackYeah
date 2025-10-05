import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CasesService, CaseItem } from '../../core/services/cases.service';

@Component({
  selector: 'app-case-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-white rounded-lg shadow p-6" *ngIf="caseItem; else loading">
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Sprawa #{{ caseItem.id }}</h2>
      <p class="text-gray-700 mb-4">{{ caseItem.title }}</p>
      <div class="text-sm text-gray-600 space-y-1">
        <div>Status: <span class="font-medium">{{ caseItem.status }}</span></div>
        <div>Utworzono: {{ caseItem.createdAt }}</div>
        <div *ngIf="caseItem.updatedAt">Zaktualizowano: {{ caseItem.updatedAt }}</div>
      </div>
    </div>
    <ng-template #loading>
      <div class="p-6 text-gray-500">Ładowanie szczegółów sprawy...</div>
    </ng-template>
  `
})
export class CaseDetailComponent implements OnInit {
  caseItem: CaseItem | null = null;

  constructor(private route: ActivatedRoute, private casesService: CasesService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isNaN(id)) {
      this.casesService.get(id).subscribe({
        next: (item) => (this.caseItem = item),
        error: () => (this.caseItem = {
          id,
          title: 'Przykładowa sprawa',
          status: 'OPEN',
          createdAt: new Date().toISOString(),
        }) as CaseItem,
      });
    }
  }
}
