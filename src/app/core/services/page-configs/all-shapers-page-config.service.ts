import { broadcastConfig, listenForConfig } from './config-sync.util';
import { sanitizeWithInitial } from '../../utils/config-sanitizer';
import { Injectable, signal, effect, inject, NgZone } from '@angular/core';



export interface AllShapersPageConfig {
  showHeader: boolean;
  headerTitle: string;
  headerTitleAr?: string;
  headerTitleEn?: string;

  showRating: boolean;
  showReviewsCount: boolean;
  showOriginalPrice: boolean;

  showEmptyState: boolean;
  emptyTitle: string;
  emptyTitleAr?: string;
  emptyTitleEn?: string;
  emptyText: string;
  emptyTextAr?: string;
  emptyTextEn?: string;
  emptyCta: string;
  emptyCtaAr?: string;
  emptyCtaEn?: string;
}

const initialConfig: AllShapersPageConfig = {
  showHeader: true,
  headerTitle: 'كل المشدات',
  headerTitleAr: 'كل المشدات',
  headerTitleEn: 'All Shapers',

  showRating: true,
  showReviewsCount: true,
  showOriginalPrice: true,

  showEmptyState: true,

  emptyTitle: 'لا توجد منتجات بهذه المواصفات',
  emptyTitleAr: 'لا توجد منتجات بهذه المواصفات',
  emptyTitleEn: 'No products match these specifications',
  emptyText: 'جرّبي تغيير اللون أو المقاس أو نطاق السعر.',
  emptyTextAr: 'جرّبي تغيير اللون أو المقاس أو نطاق السعر.',
  emptyTextEn: 'Try changing the color, size or price range.',
  emptyCta: 'عرض كل المشدات',
  emptyCtaAr: 'عرض كل المشدات',
  emptyCtaEn: 'View All Shapers'
};

@Injectable({
  providedIn: 'root'
})
export class AllShapersPageConfigService {
  private readonly storageKey = 'loxxking-allshapers-page-config';

  private isApplyingExternalUpdate = false;
  private lastSavedJson: string = '';

  readonly pageConfig = signal<AllShapersPageConfig>(this.loadInitialConfig());
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

  updateConfig(newConfig: AllShapersPageConfig) {
    this.pageConfig.set(newConfig);
  }

  private loadInitialConfig(): AllShapersPageConfig {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return this.mergeWithInitial(parsed);
      } catch (e) { }
    }
    return initialConfig;
  }

  private mergeWithInitial(parsed: any): any {
    return sanitizeWithInitial(parsed, initialConfig);
  }
}
