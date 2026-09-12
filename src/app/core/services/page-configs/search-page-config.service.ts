import { sanitizeWithInitial } from '../../utils/config-sanitizer';
import { Injectable, signal, effect, NgZone, inject } from '@angular/core';


const INSTANCE_ID = typeof crypto !== 'undefined' && crypto.randomUUID 
  ? crypto.randomUUID() 
  : Math.random().toString(36).substring(2) + Date.now().toString(36);

export interface SearchPageConfig {
    showSearchField: boolean;
    searchPlaceholder: string;
    searchPlaceholderAr?: string;
    searchPlaceholderEn?: string;
    showQuickSuggestions: boolean;
    quickSuggestionsTitle: string;
    quickSuggestionsTitleAr?: string;
    quickSuggestionsTitleEn?: string;
    quickSuggestions: { id?: string; text: string; textAr?: string; textEn?: string }[];
    recentSearchTitle: string;
    recentSearchTitleAr?: string;
    recentSearchTitleEn?: string;
    showRecentSearch: boolean;
    showNoResults: boolean;
    noResultsTitle: string;
    noResultsTitleAr?: string;
    noResultsTitleEn?: string;
    noResultsSubtitle: string;
    noResultsSubtitleAr?: string;
    noResultsSubtitleEn?: string;
    showSupportCard: boolean;
    supportCardTitle: string;
    supportCardTitleAr?: string;
    supportCardTitleEn?: string;
    supportCardSubtitle: string;
    supportCardSubtitleAr?: string;
    supportCardSubtitleEn?: string;
    showSuggestedProducts: boolean;
    suggestedProductsTitle: string;
    suggestedProductsTitleAr?: string;
    suggestedProductsTitleEn?: string;
}

const initialConfig: SearchPageConfig = {
    showSearchField: true,
    searchPlaceholder: 'ابحث عن...',
    searchPlaceholderAr: 'ابحث عن...',
    searchPlaceholderEn: 'Search for...',
    showQuickSuggestions: true,
    quickSuggestionsTitle: 'عمليات بحث شائعة:',
    quickSuggestionsTitleAr: 'عمليات بحث شائعة:',
    quickSuggestionsTitleEn: 'Popular Searches:',
    quickSuggestions: [
        { id: 'qs-1', text: 'مشد خصر رجالي', textAr: 'مشد خصر رجالي', textEn: 'Men Waist Trainer' },
        { id: 'qs-2', text: 'مشد خصر نسائي', textAr: 'مشد خصر نسائي', textEn: 'Women Waist Trainer' },
        { id: 'qs-3', text: 'مشد خصر للتنحيف', textAr: 'مشد خصر للتنحيف', textEn: 'Slimming Corset' },
        { id: 'qs-4', text: 'مشد خصر بعد الولادة', textAr: 'مشد خصر بعد الولادة', textEn: 'Postpartum Corset' },
    ],
    recentSearchTitle: 'عمليات البحث الأخيرة',
    recentSearchTitleAr: 'عمليات البحث الأخيرة',
    recentSearchTitleEn: 'Recent Searches',
    showRecentSearch: true,
    showNoResults: true,
    noResultsTitle: 'لم يتم العثور على أي منتج',
    noResultsTitleAr: 'لم يتم العثور على أي منتج',
    noResultsTitleEn: 'No products found',
    noResultsSubtitle: 'جرب استخدام كلمات بحث مختلفة أو تصفح المنتجات الشائعة',
    noResultsSubtitleAr: 'جرب استخدام كلمات بحث مختلفة أو تصفح المنتجات الشائعة',
    noResultsSubtitleEn: 'Try using different search keywords or browse popular products',
    showSupportCard: true,
    supportCardTitle: 'لم تجد ما تبحث عنه؟',
    supportCardTitleAr: 'لم تجد ما تبحث عنه؟',
    supportCardTitleEn: 'Did not find what you are looking for?',
    supportCardSubtitle: 'تواصل معنا عبر واتساب للمساعدة',
    supportCardSubtitleAr: 'تواصل معنا عبر واتساب للمساعدة',
    supportCardSubtitleEn: 'Contact us via WhatsApp for help',
    showSuggestedProducts: true,
    suggestedProductsTitle: 'منتجات مقترحة',
    suggestedProductsTitleAr: 'منتجات مقترحة',
    suggestedProductsTitleEn: 'Suggested Products',
}

@Injectable({
  providedIn: 'root'
})
export class SearchPageConfigService {
  private readonly storageKey = 'loxxking-search-page-config';
  private isApplyingExternalUpdate = false;
  private lastSavedJson: string = '';

  readonly pageConfig = signal<SearchPageConfig>(this.loadInitialConfig());

  private zone = inject(NgZone);

  constructor() {
    this.lastSavedJson = JSON.stringify(this.pageConfig());

    const applyExternalConfig = (key: string | null, newValue: string | null, sourceId?: string) => {
      if (sourceId === INSTANCE_ID) return; // Discard self-triggered synthetic events

      if (key === this.storageKey && newValue) {
        if (newValue === this.lastSavedJson) return; // Discard echo / identical payload

        try {
          const updated = JSON.parse(newValue);
          const merged = this.mergeWithInitial(updated);
          const mergedJson = JSON.stringify(merged);
          if (mergedJson === this.lastSavedJson) return;

          this.zone.run(() => {
            this.isApplyingExternalUpdate = true;
            this.lastSavedJson = mergedJson;
            this.pageConfig.set(merged);
            queueMicrotask(() => {
              this.isApplyingExternalUpdate = false;
            });
          });
        } catch (_) {}
      }
    };

    window.addEventListener('storage', (e: StorageEvent) => {
      applyExternalConfig(e.key, e.newValue, (e as any).__sourceInstanceId);
    });

    window.addEventListener('message', (e: MessageEvent) => {
      if (e.data?.type === 'STORAGE_SYNC') {
        applyExternalConfig(e.data.key, e.data.newValue, e.data.__sourceInstanceId);
      }
    });

    effect(() => {
      const config = this.pageConfig();
      const stringified = JSON.stringify(config);

      if (this.isApplyingExternalUpdate) return;
      if (stringified === this.lastSavedJson) return;

      this.lastSavedJson = stringified;
      localStorage.setItem(this.storageKey, stringified);
      
      try {
        const event = new StorageEvent('storage', {
          key: this.storageKey,
          newValue: stringified,
          storageArea: localStorage,
        });
        (event as any).__sourceInstanceId = INSTANCE_ID;
        window.dispatchEvent(event);

        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
          try {
            iframe.contentWindow?.dispatchEvent(event);
            iframe.contentWindow?.postMessage({
              type: 'STORAGE_SYNC',
              key: this.storageKey,
              newValue: stringified,
              __sourceInstanceId: INSTANCE_ID
            }, '*');
          } catch (_) {}
        });
      } catch (_) {}
    });
  }

  updateConfig(newConfig: SearchPageConfig) {
    this.pageConfig.set(newConfig);
  }

  private loadInitialConfig(): SearchPageConfig {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return this.mergeWithInitial(parsed);
      } catch (e) {}
    }
    return initialConfig;
  }

  private mergeWithInitial(parsed: any): any {
    return sanitizeWithInitial(parsed, initialConfig);
  }
}
