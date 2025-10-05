import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ExportService {
  toCSV<T extends object>(rows: T[], filename = 'export.csv'): void {
    if (!rows || rows.length === 0) { alert('Brak danych do eksportu'); return; }
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(',')]
      .concat(rows.map(r => headers.map(h => this.escapeCSV((r as any)[h])).join(',')))
      .join('\n');
    this.downloadText(csv, filename, 'text/csv;charset=utf-8;');
  }

  toJSON(rows: any[], filename = 'export.json'): void {
    this.downloadText(JSON.stringify(rows, null, 2), filename, 'application/json;charset=utf-8;');
  }

  private escapeCSV(value: any): string {
    if (value === null || value === undefined) return '';
    const str = String(value).replace(/"/g, '""');
    return /[",\n]/.test(str) ? `"${str}"` : str;
  }

  private downloadText(text: string, filename: string, type: string): void {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
