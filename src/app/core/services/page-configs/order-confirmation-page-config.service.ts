import { broadcastConfig, listenForConfig } from './config-sync.util';
import { sanitizeWithInitial } from '../../utils/config-sanitizer';
import { Injectable, signal, effect , NgZone, inject} from '@angular/core';
type OrderConfirmationPageConfig = {
    pageTitle: string;
    successMessage: string;
    showOrderDetails: boolean;
    showNextSteps: boolean;
};

const DEFAULT_CONFIG = {
    pageTitle: 'تم تأكيد طلبك',
    successMessage: 'شكراً لتسوقك من LOXX KING. تم استلام طلبك بنجاح.',
    showOrderDetails: true,
    showNextSteps: true,
};









@Injectable({
  providedIn: 'root'
})
export class OrderConfirmationPageConfigService {
  private readonly storageKey = 'loxx-order-confirmation-config';

  private isApplyingExternalUpdate = false;
  private lastSavedJson: string = '';

  readonly pageConfig = signal<any>(this.loadInitialConfig());

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
