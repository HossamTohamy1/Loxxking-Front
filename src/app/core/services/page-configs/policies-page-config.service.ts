import { broadcastConfig, listenForConfig } from './config-sync.util';
import { sanitizeWithInitial } from '../../utils/config-sanitizer';
import { Injectable, signal, effect , NgZone, inject} from '@angular/core';



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
    showTitle?: boolean;
    title: string;
    subtitle: string;
    showPoliciesGrid?: boolean;
    policies: PolicyConfig[];
}


const initialConfig: PoliciesPageConfig = {
    showTitle: true,
    title: 'السياسات والمعلومات',
    subtitle: 'تعرف على سياسات المتجر وشروط استخدامه',
    showPoliciesGrid: true,
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
