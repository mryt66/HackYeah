import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CaseItem {
	id: number;
	title: string;
	subjectId?: number;
	subjectName?: string;
	status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'CANCELLED';
	createdAt: string;
	updatedAt?: string;
	createdBy?: string;
}

export interface CreateCaseRequest {
	title: string;
	description?: string;
	subjectId?: number;
}

export interface PagedResponse<T> {
	content: T[];
	totalElements: number;
	totalPages: number;
	size: number;
	number: number;
}

@Injectable({ providedIn: 'root' })
export class CasesService {
	private apiUrl = 'http://localhost:8080/api/cases';

	constructor(private http: HttpClient) {}

	list(page = 0, size = 10): Observable<PagedResponse<CaseItem>> {
		const params = new HttpParams().set('page', page).set('size', size);
		return this.http.get<PagedResponse<CaseItem>>(this.apiUrl, { params });
	}

	get(id: number): Observable<CaseItem> {
		return this.http.get<CaseItem>(`${this.apiUrl}/${id}`);
	}

	create(payload: CreateCaseRequest): Observable<CaseItem> {
		return this.http.post<CaseItem>(this.apiUrl, payload);
	}

	update(id: number, payload: Partial<CreateCaseRequest>): Observable<CaseItem> {
		return this.http.put<CaseItem>(`${this.apiUrl}/${id}`, payload);
	}

	cancel(id: number): Observable<void> {
		return this.http.post<void>(`${this.apiUrl}/${id}/cancel`, {});
	}
}
