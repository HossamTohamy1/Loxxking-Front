import { Injectable, signal, effect, PLATFORM_ID, Inject, inject, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, from } from 'rxjs';
import { debounceTime, map, catchError } from 'rxjs/operators';
import { PageConfig } from '../../models/config.model';
import { sanitizeWithInitial } from '../../utils/config-sanitizer';
import { homeCategories, homeProducts } from '../../../shared/data/homePageData';
import { environment } from '../../../../environments/environment';

const CONFIG_KEY = 'loxxking-homepage-config';
const INSTANCE_ID = typeof crypto !== 'undefined' && crypto.randomUUID 
  ? crypto.randomUUID() 
  : Math.random().toString(36).substring(2) + Date.now().toString(36);

const heroVisual = '/assets/home/hero-visual-hd.png';
const offerBanner = '/assets/home/offer-products-banner-hd.png';

const initialConfig: PageConfig = {
  sections: [
    {
      id: 'sec-hero',
      type: 'hero',
      enabled: true,
      title: 'مشدات فاخرة وتشكيلة مميزة',
      titleAr: 'مشدات فاخرة وتشكيلة مميزة',
      titleEn: 'Luxury Shapers & Premium Collection',
      image: heroVisual,
      slides: [
        { id: 'slide-1', image: heroVisual, title: 'شد أقوى\nوقوام أفضل', titleAr: 'شد أقوى\nوقوام أفضل', titleEn: 'Stronger Sculpt\n& Better Silhouette' }
      ]
    },
    {
      id: 'sec-benefits',
      type: 'benefits',
      enabled: true,
      benefits: [
        { id: 'b1', text: 'دفع عند الاستلام\nادفع بعد الاستلام', textAr: 'دفع عند الاستلام\nادفع بعد الاستلام', textEn: 'Cash on Delivery\nPay upon delivery', icon: 'CreditCard', enabled: true },
        { id: 'b2', text: 'شحن مجاني\nلجميع الطلبات في المملكة', textAr: 'شحن مجاني\nلجميع الطلبات في المملكة', textEn: 'Free Shipping\nOn all orders in KSA', icon: 'Truck', enabled: true },
        { id: 'b3', text: 'استرجاع مجاني\nخلال 14 يوم بكل سهولة', textAr: 'استرجاع مجاني\nخلال 14 يوم بكل سهولة', textEn: 'Free Returns\nWithin 14 days easily', icon: 'RefreshCcw', enabled: true }
      ]
    },
    {
      id: 'sec-categories',
      type: 'categories',
      enabled: true,
      title: 'تسوق حسب الفئة',
      titleAr: 'تسوق حسب الفئة',
      titleEn: 'Shop by Category',
      showTitle: true,
      categories: [
        { id: 'women', name: 'نساء', nameAr: 'نساء', nameEn: "Women's", image: '/assets/home/category-women-hd.png' },
        { id: 'sport', name: 'رياضي', nameAr: 'رياضي', nameEn: 'Sports', image: '/assets/home/category-sport-hd.png' },
        { id: 'postpartum', name: 'ما بعد الولادة', nameAr: 'ما بعد الولادة', nameEn: 'Postpartum', image: '/assets/home/category-postpartum-hd.png' },
        { id: 'men', name: 'رجالي', nameAr: 'رجالي', nameEn: "Men's", image: '/assets/home/category-men-hd.png' }
      ]
    },
    {
      id: 'sec-bestsellers',
      type: 'bestsellers',
      enabled: true,
      title: 'الأكثر مبيعاً',
      titleAr: 'الأكثر مبيعاً',
      titleEn: 'Bestsellers',
      showTitle: true,
      products: [
        { id: 'prod-2', productId: 'prod-2', name: 'مشد كامل للجسم', nameAr: 'مشد كامل للجسم', nameEn: 'Full Body Shaper', price: 260, originalPrice: 320, image: '/assets/home/product-full-body-hd.png', rating: 4.9, reviewsCount: 112 },
        { id: 'prod-3', productId: 'prod-3', name: 'مشد ما بعد الولادة', nameAr: 'مشد ما بعد الولادة', nameEn: 'Postpartum Shaper', price: 210, originalPrice: 250, image: '/assets/home/product-postpartum-beige-hd.png', rating: 4.8, reviewsCount: 96 },
        { id: 'prod-4', productId: 'prod-4', name: 'مشد رياضي', nameAr: 'مشد رياضي', nameEn: 'Sports Shaper', price: 230, originalPrice: 270, image: '/assets/home/product-sport-black-hd.png', discount: '-15%', rating: 4.7, reviewsCount: 86 },
        { id: 'prod-6', productId: 'prod-6', name: 'مشد يومي مربع', nameAr: 'مشد يومي مربع', nameEn: 'Daily Square Shaper', price: 195, originalPrice: 250, image: '/assets/home/product-beige-square-hd.png', rating: 4.7, reviewsCount: 96 }
      ]
    },
    {
      id: 'sec-promo',
      type: 'promo',
      enabled: true,
      titleAr: 'عروض حصرية',
      titleEn: 'Exclusive Offers',
      image: offerBanner
    }
  ]
};

@Injectable({
  providedIn: 'root'
})
export class HomePageConfigService {
  private readonly storageKey = CONFIG_KEY;
  private readonly http = inject(HttpClient);

  readonly pageConfig = signal<PageConfig>(this.loadInitialConfig());
  
  private updateSubject = new Subject<PageConfig>();

  private zone = inject(NgZone);
  private isApplyingExternalUpdate = false;
  private lastSavedJson = '';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.lastSavedJson = JSON.stringify(this.pageConfig());

      // 0. Setup debounced backend sync
      this.updateSubject.pipe(
        debounceTime(750)
      ).subscribe((newConfig) => {
        const payload = {
          sectionsJson: JSON.stringify(newConfig.sections)
        };
        this.http.put(`${environment.apiUrl}/home-page-config`, payload).subscribe({
          error: (err) => {
            console.warn('Could not persist homepage config to server, retaining local cache:', err);
          }
        });
      });

      // 1. Fetch persistent configuration from Backend API on boot
      this.fetchFromBackend();

      // 2. Cross-tab/frame synchronization with echo prevention
      const applyExternalConfig = (key: string | null, newValue: string | null, sourceId?: string) => {
        if (sourceId === INSTANCE_ID) {
          return; // Discard self-triggered synthetic events
        }

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

      // 3. Keep local cache in sync and broadcast to preview iframes
      effect(() => {
        const config = this.pageConfig();
        const stringified = JSON.stringify(config);

        if (this.isApplyingExternalUpdate) return;
        if (stringified === this.lastSavedJson) return;

        this.lastSavedJson = stringified;
        try {
          localStorage.setItem(this.storageKey, stringified);
        } catch (_) {}

        try {
          const event = new StorageEvent('storage', {
            key: this.storageKey,
            newValue: stringified,
            storageArea: localStorage
          });
          (event as any).__sourceInstanceId = INSTANCE_ID;
          window.dispatchEvent(event);

          // Direct broadcast to preview iframes
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
  }

  updateConfig(newConfig: PageConfig) {
    // 1. Optimistic local update
    this.zone.run(() => { this.pageConfig.set(newConfig); });

    // 2. Persist to Backend via debounced subject
    this.updateSubject.next(newConfig);
  }

  setPageConfig(newConfig: PageConfig) {
    this.updateConfig(newConfig);
  }

  uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${environment.apiUrl}/home-page-config/upload-image`, formData).pipe(
      map(res => ({ url: (res?.data?.url || res?.data || res?.url) as string })),
      catchError(() => {
        return from(
          new Promise<{ url: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ url: reader.result as string });
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
          })
        );
      })
    );
  }

  private fetchFromBackend() {
    this.http.get<any>(`${environment.apiUrl}/home-page-config`).subscribe({
      next: (res) => {
        const data = res?.data || res;
        if (data?.sectionsJson && data.sectionsJson.length > 2 && data.sectionsJson !== '[]') {
          try {
            const parsedSections = JSON.parse(data.sectionsJson);
            if (Array.isArray(parsedSections) && parsedSections.length > 0) {
              const merged = this.mergeWithInitial({ sections: parsedSections });
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
            }
          } catch (e) {
            console.error('Failed to parse sectionsJson from backend:', e);
          }
        }
      },
      error: () => {
        // Fallback silently to localStorage cache
      }
    });
  }

  private loadInitialConfig(): PageConfig {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return this.mergeWithInitial(parsed);
        } catch (_) {}
      }
    }
    return initialConfig;
  }

  private mergeWithInitial(parsed: any): PageConfig {
    const config = sanitizeWithInitial(parsed, initialConfig);
    if (config?.sections) {
      for (const sec of config.sections) {
        if (sec.type === 'bestsellers' && Array.isArray(sec.products)) {
          const aliasMap: Record<string, string> = {
            'home-product-1': 'prod-2',
            'home-product-2': 'prod-3',
            'home-product-3': 'prod-4',
            'home-product-4': 'prod-6',
            'home-product-5': 'prod-1'
          };
          sec.products = sec.products.map((p: any) => {
            const mappedId = aliasMap[p.id] || p.productId || p.id;
            return {
              ...p,
              productId: p.productId || mappedId,
              id: mappedId
            };
          });
        }
      }
    }
    return config;
  }
}
