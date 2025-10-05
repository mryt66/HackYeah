import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../models/api.config';

export interface MessageListItem {
  id: number | string;
  subject: string;
  sender: string;
  date: string;
  status?: 'unread' | 'read' | 'replied';
  statusLabel?: string;
  excerpt?: string;
  category?: string;
  priority?: 'low' | 'normal' | 'high';
}

@Injectable({ providedIn: 'root' })
export class MessagesService {
  constructor(private http: HttpClient) {}

  getInbox(params?: { subjectId?: number; status?: string; page?: number; size?: number }): Observable<MessageListItem[]> {
    let httpParams = new HttpParams();
    if (params?.subjectId !== undefined) httpParams = httpParams.set('subjectId', params.subjectId);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.page !== undefined) httpParams = httpParams.set('page', params.page);
    if (params?.size !== undefined) httpParams = httpParams.set('size', params.size);

    return this.http.get<MessageListItem[]>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MESSAGES.BASE}`,
      { params: httpParams }
    );
  }

  getSent(params?: { page?: number; size?: number }): Observable<MessageListItem[]> {
    let httpParams = new HttpParams();
    if (params?.page !== undefined) httpParams = httpParams.set('page', params.page);
    if (params?.size !== undefined) httpParams = httpParams.set('size', params.size);

    return this.http.get<MessageListItem[]>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MESSAGES.SENT}`,
      { params: httpParams }
    );
  }
}
