import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface Crumb { label: string; link?: any[]; }

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="text-sm text-gray-600 flex items-center flex-wrap" aria-label="breadcrumbs">
      <ng-container *ngFor="let c of crumbs; let last = last">
        <a *ngIf="!last && c.link" [routerLink]="c.link" class="text-uknf-primary hover:underline">{{ c.label }}</a>
        <span *ngIf="!last && !c.link" class="text-gray-600">{{ c.label }}</span>
        <span *ngIf="!last" class="mx-2">/</span>
        <span *ngIf="last" class="font-medium text-gray-900">{{ c.label }}</span>
      </ng-container>
    </nav>
  `
})
export class BreadcrumbsComponent {
  @Input() crumbs: Crumb[] = [];
}
