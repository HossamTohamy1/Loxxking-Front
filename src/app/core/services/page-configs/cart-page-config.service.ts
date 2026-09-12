import { sanitizeWithInitial } from '../../utils/config-sanitizer';
import { Injectable, signal, effect, NgZone, inject } from '@angular/core';


const INSTANCE_ID = typeof crypto !== 'undefined' && crypto.randomUUID 
  ? crypto.randomUUID() 
  : Math.random().toString(36).substring(2) + Date.now().toString(36);

export interface TrustBadgeConfig {
    id: string;
    icon: string;
    title: string;
    titleAr?: string;
    titleEn?: string;
    subtitle: string;
    subtitleAr?: string;
    subtitleEn?: string;
}

export interface CartPageConfig {
    headerTitle: string;
    headerTitleAr?: string;
    headerTitleEn?: string;
    
    showProductImage: boolean;
    showQuantityControls: boolean;
    showRemoveButton: boolean;
    showOldPrice: boolean;

    showCouponSection: boolean;
    couponTitle: string;
    couponTitleAr?: string;
    couponTitleEn?: string;
    couponPlaceholder: string;
    couponPlaceholderAr?: string;
    couponPlaceholderEn?: string;
    couponButtonText: string;
    couponButtonTextAr?: string;
    couponButtonTextEn?: string;

    showSubtotal: boolean;
    showShipping: boolean;
    showDiscount: boolean;
    showTotal: boolean;

    checkoutButtonText: string;
    checkoutButtonTextAr?: string;
    checkoutButtonTextEn?: string;

    emptyCartIllustration: boolean;
    emptyCartText: string;
    emptyCartTextAr?: string;
    emptyCartTextEn?: string;
    showContinueShopping: boolean;

    showTrustBadges: boolean;
    trustBadges: TrustBadgeConfig[];
}


const initialConfig: CartPageConfig = {
    headerTitle: 'سلة التسوق',
    headerTitleAr: 'سلة التسوق',
    headerTitleEn: 'Shopping Cart',
    
    showProductImage: true,
    showQuantityControls: true,
    showRemoveButton: true,
    showOldPrice: true,

    showCouponSection: true,
    couponTitle: 'كود الخصم',
    couponTitleAr: 'كود الخصم',
    couponTitleEn: 'Discount Code',
    couponPlaceholder: 'ادخل كود الخصم',
    couponPlaceholderAr: 'ادخل كود الخصم',
    couponPlaceholderEn: 'Enter discount code',
    couponButtonText: 'تطبيق',
    couponButtonTextAr: 'تطبيق',
    couponButtonTextEn: 'Apply',

    showSubtotal: true,
    showShipping: true,
    showDiscount: true,
    showTotal: true,

    checkoutButtonText: 'إتمام الطلب',
    checkoutButtonTextAr: 'إتمام الطلب',
    checkoutButtonTextEn: 'Checkout',

    emptyCartIllustration: true,
    emptyCartText: 'السلة فارغة',
    emptyCartTextAr: 'السلة فارغة',
    emptyCartTextEn: 'Cart is empty',
    showContinueShopping: true,

    showTrustBadges: true,
    trustBadges: [
        { id: 't1', icon: 'BadgeCheck', title: 'منتجات أصلية', titleAr: 'منتجات أصلية', titleEn: 'Original Products', subtitle: '100% مضمونة', subtitleAr: '100% مضمونة', subtitleEn: '100% Guaranteed' },
        { id: 't2', icon: 'Truck', title: 'شحن سريع', titleAr: 'شحن سريع', titleEn: 'Fast Shipping', subtitle: 'خلال 2 - 5 أيام', subtitleAr: 'خلال 2 - 5 أيام', subtitleEn: 'Within 2 - 5 days' },
        { id: 't3', icon: 'RotateCcw', title: 'إرجاع سهل', titleAr: 'إرجاع سهل', titleEn: 'Easy Returns', subtitle: 'خلال 14 يوم', subtitleAr: 'خلال 14 يوم', subtitleEn: 'Within 14 days' },
        { id: 't4', icon: 'ShieldCheck', title: 'دفع آمن', titleAr: 'دفع آمن', titleEn: 'Secure Payment', subtitle: '100% آمن', subtitleAr: '100% آمن', subtitleEn: '100% Secure' },
    ]
}

@Injectable({
  providedIn: 'root'
})
export class CartPageConfigService {
  private readonly storageKey = 'loxxking-cart-page-config';

  private isApplyingExternalUpdate = false;
  private lastSavedJson: string = '';

  readonly pageConfig = signal<CartPageConfig>(this.loadInitialConfig());

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

  updateConfig(newConfig: CartPageConfig) {
    this.pageConfig.set(newConfig);
  }

  private loadInitialConfig(): CartPageConfig {
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
