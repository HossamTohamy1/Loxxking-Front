import { broadcastConfig, listenForConfig } from './config-sync.util';
import { sanitizeWithInitial } from '../../utils/config-sanitizer';
import { Injectable, signal, effect, inject, NgZone } from '@angular/core';



export interface CategoryCardConfig {
    id: string;
    title: string;
    titleAr?: string;
    titleEn?: string;
    accent: string;
    accentAr?: string;
    accentEn?: string;
    description: string;
    descriptionAr?: string;
    descriptionEn?: string;
    path: string;
}

export interface CategoriesPageConfig {
    showTitle: boolean;
    headerTitle: string;
    headerTitleAr?: string;
    headerTitleEn?: string;
    headerSubtitle: string;
    headerSubtitleAr?: string;
    headerSubtitleEn?: string;
    showCategories: boolean;
    categories: CategoryCardConfig[];
}


const initialConfig: CategoriesPageConfig = {
    showTitle: true,
    headerTitle: 'التصنيفات',
    headerSubtitle: 'تصفح جميع المنتجات حسب الفئة',
    showCategories: true,
    categories: [
        { id: 'men', title: 'مشدات', accent: 'رجالية', description: 'دعم مثالي وثقة\nطوال اليوم', path: '/all-shapers?type=men' },
        { id: 'women', title: 'مشدات', accent: 'نسائية', description: 'تصاميم أنثوية\nلإطلالة مثالية', path: '/all-shapers?type=women' },
        { id: 'postpartum', title: 'مشدات بعد', accent: 'الولادة', description: 'راحة ودعم بعد\nفترة الحمل', path: '/all-shapers?type=postpartum' },
        { id: 'sport', title: 'مشدات', accent: 'رياضية', description: 'حرية الحركة\nوأداء أفضل', path: '/all-shapers?type=sport' },
        { id: 'full-body', title: 'مشد كامل', accent: 'الجسم', description: 'تنسيق شامل\nلجسم مثالي', path: '/all-shapers?type=full-body' },
        { id: 'waist', title: 'مشدات', accent: 'الخصر', description: 'خصر أنحف\nوإطلالة جذابة', path: '/all-shapers?type=waist' }
    ]
}

@Injectable({
  providedIn: 'root'
})
export class CategoriesPageConfigService {
  private readonly storageKey = 'loxxking-categories-page-config';

  private isApplyingExternalUpdate = false;
  private lastSavedJson: string = '';

  readonly pageConfig = signal<CategoriesPageConfig>(this.loadInitialConfig());
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

  updateConfig(newConfig: CategoriesPageConfig) {
    this.pageConfig.set(newConfig);
  }

  private loadInitialConfig(): CategoriesPageConfig {
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
