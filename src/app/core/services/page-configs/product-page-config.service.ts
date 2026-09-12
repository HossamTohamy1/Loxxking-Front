import { sanitizeWithInitial } from '../../utils/config-sanitizer';
import { Injectable, signal, effect, inject, NgZone } from '@angular/core';


const INSTANCE_ID = typeof crypto !== 'undefined' && crypto.randomUUID 
  ? crypto.randomUUID() 
  : Math.random().toString(36).substring(2) + Date.now().toString(36);

export interface ProductFeatureConfig {
    id: string;
    icon: string;
    title: string;
    titleAr?: string;
    titleEn?: string;
    subtitle: string;
    subtitleAr?: string;
    subtitleEn?: string;
}

export interface ServiceRowConfig {
    id: string;
    icon: string;
    text: string;
    textAr?: string;
    textEn?: string;
}

export interface ProductPageConfig {
    showBreadcrumb: boolean;
    showBestSellerBadge: boolean;
    bestSellerText: string;
    bestSellerTextAr?: string;
    bestSellerTextEn?: string;
    showRatingLine: boolean;
    
    showColorOptions: boolean;
    colorLabel: string;
    colorLabelAr?: string;
    colorLabelEn?: string;
    showSizeOptions: boolean;
    sizeLabel: string;
    sizeLabelAr?: string;
    sizeLabelEn?: string;
    sizeGuideText: string;
    sizeGuideTextAr?: string;
    sizeGuideTextEn?: string;
    
    showPurchaseActions: boolean;
    addToCartText: string;
    addToCartTextAr?: string;
    addToCartTextEn?: string;
    buyNowText: string;
    buyNowTextAr?: string;
    buyNowTextEn?: string;
    
    showServiceRow: boolean;
    services: ServiceRowConfig[];
    
    showTabs: boolean;
    tabDescriptionText: string;
    tabDescriptionTextAr?: string;
    tabDescriptionTextEn?: string;
    tabFeaturesText: string;
    tabFeaturesTextAr?: string;
    tabFeaturesTextEn?: string;
    tabReviewsText: string;
    tabReviewsTextAr?: string;
    tabReviewsTextEn?: string;
    
    showDescriptionSection: boolean;
    
    showFeaturesSection: boolean;
    features: ProductFeatureConfig[];
    
    showReviewsSection: boolean;
}


const initialConfig: ProductPageConfig = {
    showBreadcrumb: true,
    showBestSellerBadge: true,
    bestSellerText: 'الأكثر مبيعاً',
    showRatingLine: true,
    
    showColorOptions: true,
    colorLabel: 'اللون',
    showSizeOptions: true,
    sizeLabel: 'المقاس',
    sizeGuideText: 'دليل المقاسات',
    
    showPurchaseActions: true,
    addToCartText: 'أضف للسلة',
    buyNowText: 'شراء الآن',
    
    showServiceRow: true,
    services: [
        { id: '1', icon: 'Truck', text: 'توصيل مجاني للطلبات فوق 300 ر.س' },
        { id: '2', icon: 'RotateCcw', text: 'استبدال واسترجاع خلال 14 يوم' }
    ],
    
    showTabs: true,
    tabDescriptionText: 'الوصف',
    tabFeaturesText: 'المميزات',
    tabReviewsText: 'التقييمات',
    
    showDescriptionSection: true,
    
    showFeaturesSection: true,
    features: [
        { id: '1', icon: 'shield', title: 'خامة آمنة', subtitle: 'لطيفة على البشرة' },
        { id: '2', icon: 'feather', title: 'خفيف الوزن', subtitle: 'لراحة تدوم طويلاً' },
        { id: '3', icon: 'posture', title: 'دعم الظهر', subtitle: 'يحسن استقامة القوام' },
        { id: '4', icon: 'fabric', title: 'تهوية عالية', subtitle: 'يسمح بمرور الهواء' },
        { id: '5', icon: 'waist', title: 'نحت الخصر', subtitle: 'يمنحك شكلاً متناسقاً' }
    ],
    
    showReviewsSection: true,
}

@Injectable({
  providedIn: 'root'
})
export class ProductPageConfigService {
  private readonly storageKey = 'loxxking-product-page-config';

  private isApplyingExternalUpdate = false;
  private lastSavedJson: string = '';

  readonly pageConfig = signal<ProductPageConfig>(this.loadInitialConfig());
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

  updateConfig(newConfig: ProductPageConfig) {
    this.pageConfig.set(newConfig);
  }

  private loadInitialConfig(): ProductPageConfig {
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
