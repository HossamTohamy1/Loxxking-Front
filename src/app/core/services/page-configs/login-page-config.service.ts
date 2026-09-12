import { broadcastConfig, listenForConfig } from './config-sync.util';
import { sanitizeWithInitial } from '../../utils/config-sanitizer';
import { Injectable, signal, effect , NgZone, inject} from '@angular/core';





export interface LoginBenefit {
  id: string;
  title: string;
  line1: string;
  line2: string;
}

export interface LoginPageConfig {
  heroTitlePrefix: string;
  heroTitleHighlight: string;
  heroSubtitle: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  showSocialLogin: boolean;
  benefits: LoginBenefit[];
  heroImage: string;
}

const DEFAULT_CONFIG: LoginPageConfig = {
  heroTitlePrefix: 'STOREFRONT.AUTO_STR_272',
  heroTitleHighlight: 'STOREFRONT.AUTO_STR_271',
  heroSubtitle: 'STOREFRONT.AUTO_STR_87',
  welcomeTitle: 'AUTH.LOGIN',
  welcomeSubtitle: 'STOREFRONT.AUTO_STR_480',
  showSocialLogin: true,
  heroImage: '',
  benefits: [
    { id: '1', title: 'STOREFRONT.AUTO_STR_275', line1: 'STOREFRONT.AUTO_STR_96', line2: 'STOREFRONT.AUTO_STR_228' },
    { id: '2', title: 'STOREFRONT.AUTO_STR_274', line1: 'STOREFRONT.AUTO_STR_360', line2: 'STOREFRONT.AUTO_STR_254' },
    { id: '3', title: 'STOREFRONT.AUTO_STR_273', line1: 'STOREFRONT.AUTO_STR_221', line2: 'STOREFRONT.AUTO_STR_258' },
    { id: '4', title: 'STOREFRONT.AUTO_STR_271', line1: 'STOREFRONT.AUTO_STR_305', line2: 'STOREFRONT.AUTO_STR_140' },
  ],
};


@Injectable({
  providedIn: 'root'
})
export class LoginPageConfigService {
  private readonly storageKey = 'loxx-login-config';

  private isApplyingExternalUpdate = false;
  private lastSavedJson: string = '';

  readonly pageConfig = signal<LoginPageConfig>(this.loadInitialConfig());

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
