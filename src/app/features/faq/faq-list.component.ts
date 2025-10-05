import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FaqService, FaqItem, FaqFilter, FaqFeedback, PagedResponse } from '../../core/services/faq.service';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-faq-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './faq-list.component.html'
})
export class FaqListComponent implements OnInit {
  faqItems: FaqItem[] = [];
  popularFaqs: FaqItem[] = [];
  loading = false;
  filter: FaqFilter = { page: 0, size: 10 };
  selectedTags: string[] = [];
  tagInput = '';
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  searchTimeout: any;
  expandedFaqs = new Set<number>();

  constructor(
    public faqService: FaqService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadFaqs();
    this.loadPopularFaqs();
  }

  get isAdmin(): boolean {
    return this.authService.hasRole(UserRole.ADMIN) || this.authService.hasRole(UserRole.UKNF_EMPLOYEE);
  }

  loadFaqs(): void {
    this.loading = true;
    this.filter.page = this.currentPage;
    this.filter.size = this.pageSize;
    this.filter.tags = this.selectedTags.length > 0 ? this.selectedTags : undefined;
    
    this.faqService.getFaqItems(this.filter).subscribe({
      next: (response: PagedResponse<FaqItem>) => {
        this.faqItems = response.content;
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

  loadPopularFaqs(): void {
    this.faqService.getPopularFaqs(5).subscribe({
      next: (faqs) => this.popularFaqs = faqs,
      error: () => this.popularFaqs = []
    });
  }

  loadMockData(): void {
    this.faqItems = [
      {
        id: 1,
        question: 'Jak zresetować hasło do systemu?',
        answer: 'Aby zresetować hasło:\n1. Kliknij "Zapomniałem hasła" na stronie logowania\n2. Wprowadź swój adres email\n3. Sprawdź skrzynkę email i kliknij link resetujący\n4. Ustaw nowe hasło (minimum 8 znaków, w tym cyfra i znak specjalny)',
        category: 'ACCESS',
        tags: ['hasło', 'logowanie', 'reset'],
        viewCount: 1523,
        helpfulCount: 145,
        notHelpfulCount: 8,
        lastUpdated: '2024-12-01T10:00:00',
        relatedFaqIds: [2, 5]
      },
      {
        id: 2,
        question: 'Jaki jest termin składania sprawozdań RIP za Q1 2025?',
        answer: 'Sprawozdania RIP za Q1 2025 należy złożyć do 30 kwietnia 2025 roku.\n\nTermin jest nieprzekraczalny. W przypadku problemów technicznych prosimy o kontakt z helpdesk co najmniej 3 dni przed terminem.',
        category: 'DEADLINES',
        tags: ['RIP', 'sprawozdania', 'terminy', 'Q1'],
        viewCount: 2891,
        helpfulCount: 278,
        notHelpfulCount: 12,
        lastUpdated: '2025-01-05T14:00:00',
        relatedFaqIds: [4]
      },
      {
        id: 3,
        question: 'Jakie dokumenty są wymagane przy wniosku o dostęp do systemu?',
        answer: 'Do wniosku o dostęp należy dołączyć:\n- Pełnomocnictwo od podmiotu nadzorowanego (na wzorze UKNF)\n- Skan dowodu osobistego\n- Formularz wniosku (dostępny w systemie)\n\nWniosek jest rozpatrywany w ciągu 5 dni roboczych.',
        category: 'ACCESS',
        tags: ['dostęp', 'wniosek', 'dokumenty', 'pełnomocnictwo'],
        viewCount: 987,
        helpfulCount: 92,
        notHelpfulCount: 5,
        lastUpdated: '2024-11-20T11:00:00',
        relatedFaqIds: [1]
      },
      {
        id: 4,
        question: 'Gdzie mogę znaleźć instrukcję wypełniania formularza RIP?',
        answer: 'Instrukcja wypełniania formularzy RIP jest dostępna w sekcji "Biblioteka" w systemie.\n\nMożesz również:\n- Pobrać instrukcję ze strony www.uknf.gov.pl\n- Skontaktować się z helpdesk (support@uknf.gov.pl)\n- Obejrzeć webinar instruktażowy (link w bibliotece)',
        category: 'REPORTING',
        tags: ['RIP', 'instrukcja', 'formularze', 'pomoc'],
        viewCount: 1756,
        helpfulCount: 165,
        notHelpfulCount: 15,
        lastUpdated: '2024-12-15T09:30:00',
        relatedFaqIds: [2]
      }
    ];
    this.totalElements = 4;
    this.totalPages = 1;
  }

  onSearchChange(): void {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.applyFilters(), 500);
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadFaqs();
  }

  clearFilters(): void {
    this.filter = { page: 0, size: 10 };
    this.selectedTags = [];
    this.tagInput = '';
    this.currentPage = 0;
    this.loadFaqs();
  }

  addTag(): void {
    if (this.tagInput.trim() && !this.selectedTags.includes(this.tagInput.trim())) {
      this.selectedTags.push(this.tagInput.trim());
      this.tagInput = '';
      this.applyFilters();
    }
  }

  removeTag(tag: string): void {
    this.selectedTags = this.selectedTags.filter(t => t !== tag);
    this.applyFilters();
  }

  toggleFaq(index: number): void {
    if (this.expandedFaqs.has(index)) {
      this.expandedFaqs.delete(index);
    } else {
      this.expandedFaqs.add(index);
      const faq = this.faqItems[index];
      this.faqService.incrementViewCount(faq.id).subscribe();
    }
  }

  viewFaq(faq: FaqItem): void {
    const index = this.faqItems.findIndex(f => f.id === faq.id);
    if (index >= 0) {
      this.expandedFaqs.add(index);
      this.faqService.incrementViewCount(faq.id).subscribe();
    }
  }

  submitFeedback(faq: FaqItem, helpful: boolean): void {
    const feedback: FaqFeedback = {
      faqId: faq.id,
      helpful: helpful
    };
    
    this.faqService.submitFeedback(feedback).subscribe({
      next: () => {
        if (helpful) {
          faq.helpfulCount++;
        } else {
          faq.notHelpfulCount++;
        }
        alert(helpful ? 'Dzikujemy za pozytywn opini!' : 'Dzikujemy za feedback. Postaramy si poprawi odpowied.');
      },
      error: () => alert('Bd podczas wysyania opinii')
    });
  }

  editFaq(faq: FaqItem): void {
    alert('Edycja FAQ - TODO: Modal z formularzem');
  }

  deleteFaq(faq: FaqItem): void {
    if (confirm('Czy na pewno chcesz usunąć to pytanie?')) {
      // TODO: Implement deleteFaq in FaqService
      alert('Funkcja usuwania pytań - TODO: Implementacja');
      // this.faqService.deleteFaq(faq.id).subscribe({
      //   next: () => this.loadFaqs(),
      //   error: () => alert('Błąd podczas usuwania pytania')
      // });
    }
  }

  openCreateModal(): void {
    alert('Dodawanie nowego pytania - TODO: Modal z formularzem');
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadFaqs();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadFaqs();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadFaqs();
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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
}
