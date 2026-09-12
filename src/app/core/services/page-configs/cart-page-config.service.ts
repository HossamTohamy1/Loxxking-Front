import { broadcastConfig, listenForConfig } from './config-sync.util';
import { sanitizeWithInitial } from '../../utils/config-sanitizer';
import { Injectable, signal, effect, NgZone, inject } from '@angular/core';



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
    showHeader: boolean;
    headerTitle: string;
    headerTitleAr?: string;
    headerTitleEn?: string;
    
    showCartItems: boolean;
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

    showOrderSummary: boolean;
    showSubtotal: boolean;
    showShipping: boolean;
    showDiscount: boolean;
    showTotal: boolean;

    checkoutButtonText: string;
    checkoutButtonTextAr?: string;
    checkoutButtonTextEn?: string;

    showEmptyCartSection: boolean;
    emptyCartIllustration: boolean;
    emptyCartText: string;
    emptyCartTextAr?: string;
    emptyCartTextEn?: string;
    showContinueShopping: boolean;

    showTrustBadges: boolean;
    trustBadges: TrustBadgeConfig[];
}


const initialConfig: CartPageConfig = {
    showHeader: true,
    headerTitle: 'سلة التسوق',
    headerTitleAr: 'سلة التسوق',
    headerTitleEn: 'Shopping Cart',
    
    showCartItems: true,
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

    showOrderSummary: true,
    showSubtotal: true,
    showShipping: true,
    showDiscount: true,
    showTotal: true,

    checkoutButtonText: 'إتمام الطلب',
    checkoutButtonTextAr: 'إتمام الطلب',
    checkoutButtonTextEn: 'Checkout',

    showEmptyCartSection: true,
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

    listenForConfig(this.storageKey, (json) => {
      if (json === this.lastSavedJson) return;
      try {
        const merged = this.mergeWithInitial(JSON.parse(json));
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
    });

    effect(() => {
      const config = this.pageConfig();
      const stringified = JSON.stringify(config);

      if (this.isApplyingExternalUpdate) return;
      if (stringified === this.lastSavedJson) return;

      this.lastSavedJson = stringified;
      broadcastConfig(this.storageKey, stringified);
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
