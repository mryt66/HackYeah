import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const SUBJECTS_ROUTES: Routes = [
	{
		path: '',
		canActivate: [authGuard],
		loadComponent: () => import('./subjects-list.component').then(m => m.SubjectsListComponent)
	},
	{
		path: 'import',
		canActivate: [authGuard],
		loadComponent: () => import('./subjects-import.component').then(m => m.SubjectsImportComponent)
	}
];
