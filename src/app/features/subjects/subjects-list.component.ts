import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
	selector: 'app-subjects-list',
	standalone: true,
	imports: [CommonModule],
	template: `
		<div class="bg-white rounded-lg shadow">
			<div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
				<h2 class="text-lg font-semibold text-gray-900">Kartoteka podmiotów</h2>
				<button (click)="goToImport()" class="px-4 py-2 bg-uknf-primary text-white rounded">Import (XLSX)</button>
			</div>
			<div class="p-6 text-gray-600 text-sm">
				Lista podmiotów – do uzupełnienia (filtry, paginacja, tabela). Skorzystaj z przycisku „Import (XLSX)”, aby wczytać dane testowe.
			</div>
		</div>
	`
})
export class SubjectsListComponent implements OnInit {
	constructor(private router: Router) {}
	ngOnInit(): void {}
	goToImport(): void { this.router.navigate(['/subjects/import']); }
}
