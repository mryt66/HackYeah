import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: FaqCategory;
  tags: string[];
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  lastUpdated: string;
  relatedFaqIds: number[];
}

export type FaqCategory = 'REPORTING' | 'ACCESS' | 'TECHNICAL' | 'LEGAL' | 'DEADLINES' | 'GENERAL';

export interface FaqFilter {
  category?: FaqCategory;
  searchQuery?: string;
  tags?: string[];
  page?: number;
  size?: number;
}

export interface FaqFeedback {
  faqId: number;
  helpful: boolean;
  comment?: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class FaqService {
  private apiUrl = `${environment.apiUrl}/faq`;

  constructor(private http: HttpClient) {}

  getFaqItems(filter: FaqFilter = {}): Observable<PagedResponse<FaqItem>> {
    let params = new HttpParams();
    
    if (filter.category) params = params.set('category', filter.category);
    if (filter.searchQuery) params = params.set('search', filter.searchQuery);
    if (filter.tags && filter.tags.length > 0) {
      filter.tags.forEach(tag => params = params.append('tags', tag));
    }
    if (filter.page !== undefined) params = params.set('page', filter.page.toString());
    if (filter.size !== undefined) params = params.set('size', filter.size.toString());

    return this.http.get<PagedResponse<FaqItem>>(this.apiUrl, { params });
  }

  getFaqById(id: number): Observable<FaqItem> {
    return this.http.get<FaqItem>(`${this.apiUrl}/${id}`);
  }

  submitFeedback(feedback: FaqFeedback): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/feedback`, feedback);
  }

  getRelatedFaqs(faqId: number): Observable<FaqItem[]> {
    return this.http.get<FaqItem[]>(`${this.apiUrl}/${faqId}/related`);
  }

  getPopularFaqs(limit: number = 5): Observable<FaqItem[]> {
    return this.http.get<FaqItem[]>(`${this.apiUrl}/popular`, {
      params: { limit: limit.toString() }
    });
  }

  incrementViewCount(faqId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${faqId}/view`, {});
  }

  getCategoryLabel(category: FaqCategory): string {
    const labels: Record<FaqCategory, string> = {
      REPORTING: 'Sprawozdawczość',
      ACCESS: 'Dostęp',
      TECHNICAL: 'Techniczne',
      LEGAL: 'Prawne',
      DEADLINES: 'Terminy',
      GENERAL: 'Ogólne'
    };
    return labels[category] || category;
  }

  getCategoryClass(category: FaqCategory): string {
    const classes: Record<FaqCategory, string> = {
      REPORTING: 'bg-blue-100 text-blue-800',
      ACCESS: 'bg-green-100 text-green-800',
      TECHNICAL: 'bg-purple-100 text-purple-800',
      LEGAL: 'bg-red-100 text-red-800',
      DEADLINES: 'bg-orange-100 text-orange-800',
      GENERAL: 'bg-gray-100 text-gray-800'
    };
    return classes[category] || 'bg-gray-100 text-gray-800';
  }
}
