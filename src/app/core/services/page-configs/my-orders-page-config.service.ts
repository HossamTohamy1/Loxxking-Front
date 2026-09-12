import { sanitizeWithInitial } from '../../utils/config-sanitizer';
import { Injectable, signal, effect , NgZone, inject} from '@angular/core';


const INSTANCE_ID = typeof crypto !== 'undefined' && crypto.randomUUID 
  ? crypto.randomUUID() 
  : Math.random().toString(36).substring(2) + Date.now().toString(36);

export interface MyOrdersPageConfig {
    showHeader: boolean;
    headerTitle: string;
    headerSubtitle: string;
    
    phonePlaceholder: string;
    orderPlaceholder: string;
    buttonText: string;
    
    showEmptyState: boolean;
    emptyTitle: string;
    emptyText: string;
    emptyCta: string;
    
    notFoundTitle: string;
    notFoundText: string;
    
    showSupportCard: boolean;
    supportTitle: string;
    supportText: string;
}


const initialConfig: MyOrdersPageConfig = {
    showHeader: true,
    headerTitle: 'تتبع',
    headerSubtitle: 'أدخل رقم الهاتف ورقم الطلب لمعرفة حالة طلبك بسهولة',
    
    phonePlaceholder: 'رقم الهاتف',
    orderPlaceholder: 'رقم الطلب',
    buttonText: 'تتبع',
    
    showEmptyState: true,
    
    emptyTitle: 'ليس لديك طلبات مشحونة',
    emptyText: 'لا يوجد حاليًا أي طلبات مكتملة أو قيد الشحن. ابدئي التسوق وسيظهر طلبك هنا بعد إتمامه.',
    emptyCta: 'ابدأي التسوق',
    
    notFoundTitle: 'لم يتم العثور على طلب مطابق',
    notFoundText: 'تأكدي من رقم الهاتف أو رقم الطلب ثم حاولي مرة أخرى.',
    
    showSupportCard: true,
    supportTitle: 'نحن هنا لمساعدتك',
    supportText: 'إذا واجهت أي مشكلة، تواصل معنا عبر واتساب'
}

@Injectable({
  providedIn: 'root'
})
export class MyOrdersPageConfigService {
  private readonly storageKey = 'loxxking-myorders-page-config';

  private isApplyingExternalUpdate = false;
  private lastSavedJson: string = '';

  readonly pageConfig = signal<MyOrdersPageConfig>(this.loadInitialConfig());

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

  updateConfig(newConfig: MyOrdersPageConfig) {
    this.zone.run(() => { this.pageConfig.set(newConfig); });
  }

  private loadInitialConfig(): MyOrdersPageConfig {
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
