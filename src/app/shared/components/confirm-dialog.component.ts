import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * FAZA 4 - Komponent współdzielony: Dialog potwierdzający
 * Konfigurowalne przyciski, tytuł, treść, style
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html'
})
export class ConfirmDialogComponent {
  @Input() isVisible = false;
  @Input() title = 'Potwierdź akcję';
  @Input() message = 'Czy na pewno chcesz kontynuować?';
  @Input() confirmButtonText = 'Potwierdź';
  @Input() cancelButtonText = 'Anuluj';
  @Input() showCancelButton = true;
  @Input() showCloseButton = true;
  @Input() confirmButtonClass = 'bg-uknf-primary hover:bg-uknf-primary-dark text-white';
  @Input() isDangerous = false;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  constructor() {}

  ngOnInit(): void {
    if (this.isDangerous) {
      this.confirmButtonClass = 'bg-red-600 hover:bg-red-700 text-white';
    }
  }

  onConfirm(): void {
    this.confirmed.emit();
    this.isVisible = false;
  }

  onCancel(): void {
    this.cancelled.emit();
    this.isVisible = false;
  }
}
