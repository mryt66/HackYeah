import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CasesService, CreateCaseRequest, CaseItem } from '../../core/services/cases.service';

@Component({
  selector: 'app-case-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">{{ isEdit ? 'Edytuj sprawę' : 'Nowa sprawa' }}</h2>
      <form (ngSubmit)="submit()" class="space-y-4">
        <div>
          <label class="block text-sm text-gray-700 mb-1">Tytuł *</label>
          <input [(ngModel)]="form.title" name="title" required class="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label class="block text-sm text-gray-700 mb-1">Opis</label>
          <textarea [(ngModel)]="form.description" name="description" rows="4" class="w-full px-3 py-2 border rounded"></textarea>
        </div>
        <div>
          <label class="block text-sm text-gray-700 mb-1">ID Podmiotu</label>
          <input [(ngModel)]="form.subjectId" name="subjectId" type="number" class="w-full px-3 py-2 border rounded" />
        </div>
        <div class="flex gap-2 justify-end pt-4">
          <button type="button" (click)="cancel()" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded">Anuluj</button>
          <button type="submit" [disabled]="!form.title" class="px-4 py-2 bg-uknf-primary text-white rounded hover:bg-uknf-primary-dark">Zapisz</button>
        </div>
      </form>
    </div>
  `
})
export class CaseFormComponent implements OnInit {
  isEdit = false;
  id?: number;
  form: CreateCaseRequest = { title: '', description: '', subjectId: undefined };

  constructor(private route: ActivatedRoute, private router: Router, private service: CasesService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.id = +id;
      this.service.get(this.id).subscribe((c: CaseItem) => {
        this.form = { title: c.title, description: '', subjectId: c.subjectId };
      });
    }
  }

  submit(): void {
    if (this.isEdit && this.id) {
      this.service.update(this.id, this.form).subscribe(() => this.router.navigate(['/cases']));
    } else {
      this.service.create(this.form).subscribe(() => this.router.navigate(['/cases']));
    }
  }

  cancel(): void {
    this.router.navigate(['/cases']);
  }
}
