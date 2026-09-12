import { sanitizeWithInitial } from '../../utils/config-sanitizer';
import { Injectable, signal, effect, inject, NgZone } from '@angular/core';

const INSTANCE_ID = typeof crypto !== 'undefined' && crypto.randomUUID 
  ? crypto.randomUUID() 
  : Math.random().toString(36).substring(2) + Date.now().toString(36);

export interface FaqItemConfig {
  id: string;
  question: string;
  questionAr?: string;
  questionEn?: string;
  answer: string;
  answerAr?: string;
  answerEn?: string;
}

export interface FaqPageConfig {
  showIntro?: boolean;
  title: string;
  titleAr?: string;
  titleEn?: string;
  subtitle: string;
  subtitleAr?: string;
  subtitleEn?: string;
  searchPlaceholder: string;
  searchPlaceholderAr?: string;
  searchPlaceholderEn?: string;
  showSearch: boolean;
  showFaqList?: boolean;
  showSupportCard: boolean;
  supportCardTitle: string;
  supportCardTitleAr?: string;
  supportCardTitleEn?: string;
  supportCardSubtitle: string;
  supportCardSubtitleAr?: string;
  supportCardSubtitleEn?: string;
  faqs: FaqItemConfig[];
}

const initialConfig: FaqPageConfig = {
  showIntro: true,
  title: 'الأسئلة الشائعة',
  titleAr: 'الأسئلة الشائعة',
  titleEn: 'Frequently Asked Questions',
  subtitle: 'ابحث عن إجابات لأسئلتك الشائعة هنا',
  subtitleAr: 'ابحث عن إجابات لأسئلتك الشائعة هنا',
  subtitleEn: 'Find answers to common questions here',
  searchPlaceholder: 'ابحث في الأسئلة',
  searchPlaceholderAr: 'ابحث في الأسئلة',
  searchPlaceholderEn: 'Search questions...',
  showSearch: true,
  showFaqList: true,
  showSupportCard: true,
  supportCardTitle: 'لم تجد ما تبحث عنه؟',
  supportCardTitleAr: 'لم تجد ما تبحث عنه؟',
  supportCardTitleEn: "Didn't find what you were looking for?",
  supportCardSubtitle: 'تواصل معنا على الواتساب',
  supportCardSubtitleAr: 'تواصل معنا على الواتساب',
  supportCardSubtitleEn: 'Contact us via WhatsApp',
  faqs: [
    {
      id: 'size',
      question: 'كيف اعرف مقاسي؟',
      questionAr: 'كيف اعرف مقاسي؟',
      questionEn: 'How do I know my size?',
      answer: 'يمكنك معرفة مقاسك من خلال جدول المقاسات',
      answerAr: 'يمكنك معرفة مقاسك من خلال جدول المقاسات',
      answerEn: 'You can check your size using our size guide'
    }
  ]
};

@Injectable({
  providedIn: 'root'
})
export class FaqPageConfigService {
  private readonly storageKey = 'loxxking-faq-page-config';

  private isApplyingExternalUpdate = false;
  private lastSavedJson: string = '';

  readonly pageConfig = signal<FaqPageConfig>(this.loadInitialConfig());
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

  updateConfig(newConfig: FaqPageConfig) {
    this.pageConfig.set(newConfig);
  }

  private loadInitialConfig(): FaqPageConfig {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return this.mergeWithInitial(parsed);
      } catch (e) {}
    }
    return initialConfig;
  }

  private mergeWithInitial(parsed: any): FaqPageConfig {
    return sanitizeWithInitial(parsed, initialConfig);
  }
}
