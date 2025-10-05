import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
	selector: 'app-new-message',
	standalone: true,
	imports: [CommonModule, FormsModule],
	template: `
		<div class="bg-white rounded-lg shadow">
			<div class="px-6 py-4 border-b border-gray-200">
				<h2 class="text-lg font-semibold text-gray-900">Nowa wiadomość (1:1)</h2>
			</div>
			<div class="p-6 space-y-4">
				<div>
					<label class="block text-sm text-gray-700 mb-1">Odbiorca (ID użytkownika)</label>
					<input [(ngModel)]="recipientId" type="number" class="w-full px-3 py-2 border rounded" placeholder="np. 123" />
				</div>
				<div>
					<label class="block text-sm text-gray-700 mb-1">Podmiot (ID)</label>
					<input [(ngModel)]="subjectId" type="number" class="w-full px-3 py-2 border rounded" placeholder="np. 1001" />
				</div>
				<div>
					<label class="block text-sm text-gray-700 mb-1">Temat</label>
					<input [(ngModel)]="title" class="w-full px-3 py-2 border rounded" placeholder="Wpisz temat wiadomości" />
				</div>
				<div>
					<label class="block text-sm text-gray-700 mb-1">Treść</label>
					<textarea [(ngModel)]="content" rows="6" class="w-full px-3 py-2 border rounded" placeholder="Wpisz treść..."></textarea>
				</div>
				<div>
					<label class="block text-sm text-gray-700 mb-1">Załączniki</label>
					<input type="file" multiple (change)="onFilesSelected($event)" />
					<div *ngIf="files.length" class="mt-2 text-sm text-gray-600">Wybrano plików: {{ files.length }}</div>
				</div>
			</div>
			<div class="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
				<button (click)="cancel()" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded">Anuluj</button>
				<button (click)="send()" class="px-4 py-2 bg-uknf-primary text-white rounded hover:bg-uknf-primary-dark">Wyślij</button>
			</div>
		</div>
	`
})
export class NewMessageComponent {
	recipientId: number | null = null;
	subjectId: number | null = null;
	title = '';
	content = '';
	files: File[] = [];

	constructor(private router: Router) {}

	onFilesSelected(event: Event): void {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			this.files = Array.from(input.files);
		}
	}

	async send(): Promise<void> {
		if (!this.subjectId || !this.recipientId || !this.title || !this.content) {
			alert('Uzupełnij odbiorcę, podmiot, temat i treść.');
			return;
		}

		const form = new FormData();
		form.append('subjectId', String(this.subjectId));
		form.append('recipientId', String(this.recipientId));
		form.append('title', this.title);
		form.append('content', this.content);
		for (const f of this.files) form.append('attachments', f);

		try {
			await fetch('/api/messages', { method: 'POST', body: form });
			alert('Wiadomość wysłana');
			this.router.navigate(['/messages']);
		} catch (e) {
			alert('Błąd podczas wysyłania');
		}
	}

	cancel(): void {
		this.router.navigate(['/messages']);
	}
}
