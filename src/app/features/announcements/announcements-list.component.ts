import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AnnouncementsService, Announcement, AnnouncementFilter, PagedResponse } from '../../core/services/announcements.service';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-announcements-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './announcements-list.component.html',
  styles: ['.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; } .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }']
})
export class AnnouncementsListComponent implements OnInit {
  announcements: Announcement[] = [];
  pinnedAnnouncements: Announcement[] = [];
  loading = false;
  filter: AnnouncementFilter = { page: 0, size: 10 };
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  searchTimeout: any;

  constructor(
    private router: Router,
    public announcementsService: AnnouncementsService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAnnouncements();
  }

  get isAdmin(): boolean {
    return this.authService.hasRole(UserRole.ADMIN) || this.authService.hasRole(UserRole.UKNF_EMPLOYEE);
  }

  loadAnnouncements(): void {
    this.loading = true;
    this.filter.page = this.currentPage;
    this.filter.size = this.pageSize;
    this.announcementsService.getAnnouncements(this.filter).subscribe({
      next: (response: PagedResponse<Announcement>) => {
        this.pinnedAnnouncements = response.content.filter(a => a.isPinned);
        this.announcements = response.content.filter(a => !a.isPinned);
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: () => {
        this.loadMockData();
        this.loading = false;
      }
    });
  }

  loadMockData(): void {
    const mockData: Announcement[] = [
      {
        id: 1,
        title: 'Nowe wytyczne dotyczące sprawozdawczości RIP za Q1 2025',
        content: 'Uprzejmie informujemy, że w związku ze zmianami w przepisach unijnych wprowadzamy nowe wytyczne dotyczące wypełniania formularzy sprawozdawczych RIP.',
        category: 'REPORTING',
        priority: 'HIGH',
        status: 'PUBLISHED',
        isPinned: true,
        targetAudience: ['ALL'],
        publishedAt: '2025-01-15T10:00:00',
        expiresAt: '2025-04-30T23:59:59',
        attachments: [
          { id: 1, filename: 'wytyczne_rip_2025.pdf', fileSize: 2048576, contentType: 'application/pdf', uploadedAt: '2025-01-15T10:00:00' }
        ],
        createdBy: { id: 1, name: 'Admin UKNF' },
        viewCount: 1247
      },
      {
        id: 2,
        title: 'Szkolenie online: Nowe wymogi ESG',
        content: 'Zapraszamy na szkolenie online dotyczące nowych wymogów ESG dla funduszy inwestycyjnych.',
        category: 'TRAINING',
        priority: 'NORMAL',
        status: 'PUBLISHED',
        isPinned: true,
        targetAudience: ['INVESTMENT'],
        publishedAt: '2025-01-10T14:30:00',
        attachments: [],
        createdBy: { id: 1, name: 'Admin UKNF' },
        viewCount: 342
      }
    ];
    
    this.pinnedAnnouncements = mockData.filter(a => a.isPinned);
    this.announcements = mockData.filter(a => !a.isPinned);
    this.totalElements = mockData.length;
    this.totalPages = 1;
  }

  onSearchChange(): void {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.applyFilters(), 500);
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadAnnouncements();
  }

  clearFilters(): void {
    this.filter = { page: 0, size: 10 };
    this.currentPage = 0;
    this.loadAnnouncements();
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadAnnouncements();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadAnnouncements();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadAnnouncements();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages, start + maxVisible);
    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  }

  viewAnnouncement(announcement: Announcement): void {
    this.announcementsService.incrementViewCount(announcement.id).subscribe();
    this.router.navigate(['/announcements', announcement.id]);
  }

  togglePin(announcement: Announcement, event: Event): void {
    event.stopPropagation();
    this.announcementsService.togglePin(announcement.id).subscribe({
      next: () => {
        announcement.isPinned = !announcement.isPinned;
        this.loadAnnouncements();
      },
      error: () => alert('Bd podczas przypinania ogoszenia')
    });
  }

  editAnnouncement(announcement: Announcement, event: Event): void {
    event.stopPropagation();
    alert('Edycja ogoszenia - TODO: Modal z formularzem');
  }

  deleteAnnouncement(announcement: Announcement, event: Event): void {
    event.stopPropagation();
    if (confirm('Czy na pewno chcesz usun to ogoszenie?')) {
      this.announcementsService.deleteAnnouncement(announcement.id).subscribe({
        next: () => this.loadAnnouncements(),
        error: () => alert('Bd podczas usuwania ogoszenia')
      });
    }
  }

  openCreateModal(): void {
    alert('Tworzenie nowego ogoszenia - TODO: Modal z formularzem');
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', { 
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
