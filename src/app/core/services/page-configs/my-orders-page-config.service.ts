import { broadcastConfig, listenForConfig } from './config-sync.util';
import { sanitizeWithInitial } from '../../utils/config-sanitizer';
import { Injectable, signal, effect , NgZone, inject} from '@angular/core';



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
