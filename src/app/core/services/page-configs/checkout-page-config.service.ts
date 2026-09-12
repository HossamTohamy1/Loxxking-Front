import { sanitizeWithInitial } from '../../utils/config-sanitizer';
import { Injectable, signal, effect, inject, NgZone } from '@angular/core';


const INSTANCE_ID = typeof crypto !== 'undefined' && crypto.randomUUID 
  ? crypto.randomUUID() 
  : Math.random().toString(36).substring(2) + Date.now().toString(36);

export interface CheckoutTrustBadge {
    id: string;
    icon: string;
    title: string;
    titleAr?: string;
    titleEn?: string;
    subtitle: string;
    subtitleAr?: string;
    subtitleEn?: string;
}

export interface CheckoutPageConfig {
    headerTitle: string;
    headerTitleAr?: string;
    headerTitleEn?: string;
    headerSubtitle: string;
    headerSubtitleAr?: string;
    headerSubtitleEn?: string;
    
    showCustomerInfo: boolean;
    customerInfoTitle: string;
    customerInfoTitleAr?: string;
    customerInfoTitleEn?: string;
    
    showPaymentInfo: boolean;
    paymentInfoTitle: string;
    paymentInfoTitleAr?: string;
    paymentInfoTitleEn?: string;
    
    showOrderSummary: boolean;
    summaryTitle: string;
    summaryTitleAr?: string;
    summaryTitleEn?: string;
    
    showSafeShopping: boolean;
    safeShoppingTitle: string;
    safeShoppingTitleAr?: string;
    safeShoppingTitleEn?: string;
    safeShoppingText: string;
    safeShoppingTextAr?: string;
    safeShoppingTextEn?: string;
    
    showTrustBadges: boolean;
    trustBadges: CheckoutTrustBadge[];
    
    emptyStateTitle: string;
    emptyStateTitleAr?: string;
    emptyStateTitleEn?: string;
    emptyStateText: string;
    emptyStateTextAr?: string;
    emptyStateTextEn?: string;
    emptyStateCta: string;
    emptyStateCtaAr?: string;
    emptyStateCtaEn?: string;
}

const initialConfig: CheckoutPageConfig = {
    headerTitle: 'إتمام الطلب',
    headerTitleAr: 'إتمام الطلب',
    headerTitleEn: 'Checkout',
    headerSubtitle: 'أدخل بياناتك لإكمال الطلب',
    headerSubtitleAr: 'أدخل بياناتك لإكمال الطلب',
    headerSubtitleEn: 'Enter your details to complete the order',
    
    showCustomerInfo: true,
    customerInfoTitle: 'بيانات العميل',
    customerInfoTitleAr: 'بيانات العميل',
    customerInfoTitleEn: 'Customer Details',
    
    showPaymentInfo: true,
    paymentInfoTitle: 'طريقة الدفع',
    paymentInfoTitleAr: 'طريقة الدفع',
    paymentInfoTitleEn: 'Payment Method',
    
    showOrderSummary: true,
    summaryTitle: 'ملخص الطلب',
    summaryTitleAr: 'ملخص الطلب',
    summaryTitleEn: 'Order Summary',
    
    showSafeShopping: true,
    safeShoppingTitle: 'تسوق آمن',
    safeShoppingTitleAr: 'تسوق آمن',
    safeShoppingTitleEn: 'Safe Shopping',
    safeShoppingText: 'نحن نضمن حماية بياناتك ومعلوماتك الشخصية',
    safeShoppingTextAr: 'نحن نضمن حماية بياناتك ومعلوماتك الشخصية',
    safeShoppingTextEn: 'We ensure full protection of your personal information',
    
    showTrustBadges: true,
    trustBadges: [
        { id: '1', icon: 'BadgeCheck', title: 'منتجات أصلية', titleAr: 'منتجات أصلية', titleEn: 'Original Products', subtitle: '100% مضمونة', subtitleAr: '100% مضمونة', subtitleEn: '100% Guaranteed' },
        { id: '2', icon: 'Truck', title: 'شحن سريع', titleAr: 'شحن سريع', titleEn: 'Fast Shipping', subtitle: 'خلال 2 - 5 أيام', subtitleAr: 'خلال 2 - 5 أيام', subtitleEn: 'Within 2 - 5 days' },
        { id: '3', icon: 'RotateCcw', title: 'إرجاع سهل', titleAr: 'إرجاع سهل', titleEn: 'Easy Returns', subtitle: 'خلال 14 يوم', subtitleAr: 'خلال 14 يوم', subtitleEn: 'Within 14 days' },
        { id: '4', icon: 'ShieldCheck', title: 'دفع آمن', titleAr: 'دفع آمن', titleEn: 'Secure Payment', subtitle: '100% آمن', subtitleAr: '100% آمن', subtitleEn: '100% Secure' }
    ],
    
    emptyStateTitle: 'لا توجد منتجات لإتمام الطلب',
    emptyStateTitleAr: 'لا توجد منتجات لإتمام الطلب',
    emptyStateTitleEn: 'No items to checkout',
    emptyStateText: 'أضيفي المنتجات إلى السلة أولًا ثم تابعي إتمام الطلب.',
    emptyStateTextAr: 'أضيفي المنتجات إلى السلة أولًا ثم تابعي إتمام الطلب.',
    emptyStateTextEn: 'Please add items to your cart first before proceeding to checkout.',
    emptyStateCta: 'عودة إلى السلة',
    emptyStateCtaAr: 'عودة إلى السلة',
    emptyStateCtaEn: 'Return to Cart'
};

@Injectable({
  providedIn: 'root'
})
export class CheckoutPageConfigService {
  private readonly storageKey = 'loxxking-checkout-page-config';

  private isApplyingExternalUpdate = false;
  private lastSavedJson: string = '';

  readonly pageConfig = signal<CheckoutPageConfig>(this.loadInitialConfig());
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

  updateConfig(newConfig: CheckoutPageConfig) {
    this.pageConfig.set(newConfig);
  }

  private loadInitialConfig(): CheckoutPageConfig {
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
