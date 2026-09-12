import { sanitizeWithInitial } from '../../utils/config-sanitizer';
import { Injectable, signal, effect , NgZone, inject} from '@angular/core';


const INSTANCE_ID = typeof crypto !== 'undefined' && crypto.randomUUID 
  ? crypto.randomUUID() 
  : Math.random().toString(36).substring(2) + Date.now().toString(36);

export interface PolicySectionConfig {
    title: string;
    description?: string;
    icon: string;
    bullets?: string[];
}

export interface PolicyConfig {
    key: string;
    gridTitle: string;
    gridDescription: string;
    icon: string;
    title: string;
    subtitle: string;
    heroIcon: string;
    showWhatsApp: boolean;
    sections: PolicySectionConfig[];
}

export interface PoliciesPageConfig {
    title: string;
    subtitle: string;
    policies: PolicyConfig[];
}


const initialConfig: PoliciesPageConfig = {
    title: 'السياسات والمعلومات',
    subtitle: 'تعرف على سياسات المتجر وشروط استخدامه',
    policies: [
        {
            key: 'privacy',
            gridTitle: 'سياسة الخصوصية',
            gridDescription: 'كيف نحمي بياناتك ومعلوماتك',
            icon: 'ShieldCheck',
            title: 'سياسة الخصوصية والأمان',
            subtitle: 'نحن نأخذ خصوصيتك على محمل الجد، ونلتزم بحماية كافة بياناتك الشخصية وفقاً لأعلى معايير الأمان العالمية.',
            heroIcon: 'ShieldCheck',
            showWhatsApp: false,
            sections: [
                { title: 'جمع المعلومات', description: 'نحن نجمع فقط المعلومات الضرورية لإتمام طلباتك...', icon: 'Database' }
            ]
        },
        {
            key: 'returns',
            gridTitle: 'الاستبدال والاسترجاع',
            gridDescription: 'شروط إرجاع واستبدال المنتجات',
            icon: 'RotateCcw',
            title: 'سياسة الاستبدال والاسترجاع',
            subtitle: 'حرصاً منا على رضاكم، نوفر سياسة مرنة للاستبدال والاسترجاع...',
            heroIcon: 'RotateCcw',
            showWhatsApp: true,
            sections: [
                { title: 'شروط الاستبدال', bullets: ['يجب أن يكون المنتج في حالته الأصلية', 'الاستبدال خلال 14 يوما'], icon: 'PackageCheck' }
            ]
        }
    ]
}

@Injectable({
  providedIn: 'root'
})
export class PoliciesPageConfigService {
  private readonly storageKey = 'loxxking-policies-page-config';

  private isApplyingExternalUpdate = false;
  private lastSavedJson: string = '';

  readonly pageConfig = signal<PoliciesPageConfig>(this.loadInitialConfig());

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

  updateConfig(newConfig: PoliciesPageConfig) {
    this.zone.run(() => { this.pageConfig.set(newConfig); });
  }

  private loadInitialConfig(): PoliciesPageConfig {
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
