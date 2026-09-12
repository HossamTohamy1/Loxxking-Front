import { sanitizeWithInitial } from '../../utils/config-sanitizer';
import { Injectable, signal, effect, NgZone, inject } from '@angular/core';

export interface OffersPageConfig {
    showHero: boolean;
    heroTitle: string;
    heroTitleAr?: string;
    heroTitleEn?: string;
    heroSubtitle: string;
    heroSubtitleAr?: string;
    heroSubtitleEn?: string;

    showCurrentOffers: boolean;
    currentOffersTitle: string;
    currentOffersTitleAr?: string;
    currentOffersTitleEn?: string;

    showBundles: boolean;
    bundlesTitle: string;
    bundlesTitleAr?: string;
    bundlesTitleEn?: string;
    bundlesSubtitle: string;
    bundlesSubtitleAr?: string;
    bundlesSubtitleEn?: string;

    showMultiBuy: boolean;
    multiBuyTitle: string;
    multiBuyTitleAr?: string;
    multiBuyTitleEn?: string;

    showLimitedOffer: boolean;
    limitedOfferTitle: string;
    limitedOfferTitleAr?: string;
    limitedOfferTitleEn?: string;
    limitedOfferSubtitle: string;
    limitedOfferSubtitleAr?: string;
    limitedOfferSubtitleEn?: string;
}

const DEFAULT_CONFIG: OffersPageConfig = {
    showHero: true,
    heroTitle: 'عروض خاصة',
    heroTitleAr: 'عروض خاصة',
    heroTitleEn: 'Special Offers',
    heroSubtitle: 'أفضل الأسعار لفترة محدودة',
    heroSubtitleAr: 'أفضل الأسعار لفترة محدودة',
    heroSubtitleEn: 'Best Prices for a Limited Time',

    showCurrentOffers: true,
    currentOffersTitle: 'التخفيضات الحالية',
    currentOffersTitleAr: 'التخفيضات الحالية',
    currentOffersTitleEn: 'Current Discounts',

    showBundles: true,
    bundlesTitle: 'وفر أكثر مع الباقات',
    bundlesTitleAr: 'وفر أكثر مع الباقات',
    bundlesTitleEn: 'Save More with Bundles',
    bundlesSubtitle: 'اختار الباقة الأنسب لك بأسعار مخفضة',
    bundlesSubtitleAr: 'اختار الباقة الأنسب لك بأسعار مخفضة',
    bundlesSubtitleEn: 'Choose the best bundle for you at discounted prices',

    showMultiBuy: true,
    multiBuyTitle: 'عروض شراء أكثر من قطعة',
    multiBuyTitleAr: 'عروض شراء أكثر من قطعة',
    multiBuyTitleEn: 'Multi-Item Deals',

    showLimitedOffer: true,
    limitedOfferTitle: 'العروض محدودة المدة',
    limitedOfferTitleAr: 'العروض محدودة المدة',
    limitedOfferTitleEn: 'Limited-Time Offers',
    limitedOfferSubtitle: 'ينتهي العرض قريباً',
    limitedOfferSubtitleAr: 'ينتهي العرض قريباً',
    limitedOfferSubtitleEn: 'Offer Ends Soon',
};

const INSTANCE_ID = typeof crypto !== 'undefined' && crypto.randomUUID 
  ? crypto.randomUUID() 
  : Math.random().toString(36).substring(2) + Date.now().toString(36);

@Injectable({
  providedIn: 'root'
})
export class OffersPageConfigService {
  private readonly storageKey = 'loxx-offers-config';

  private isApplyingExternalUpdate = false;
  private lastSavedJson: string = '';

  readonly pageConfig = signal<OffersPageConfig>(this.loadInitialConfig());

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

  updateConfig(newConfig: any) {
    this.zone.run(() => { this.pageConfig.set(newConfig); });
  }

  private loadInitialConfig(): any {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return this.mergeWithInitial(parsed);
      } catch (e) {}
    }
    return DEFAULT_CONFIG;
  }

  private mergeWithInitial(parsed: any): any {
    return sanitizeWithInitial(parsed, DEFAULT_CONFIG);
  }
}
