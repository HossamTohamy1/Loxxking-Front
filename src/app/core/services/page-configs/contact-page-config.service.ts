import { broadcastConfig, listenForConfig } from './config-sync.util';
import { sanitizeWithInitial } from '../../utils/config-sanitizer';
import { Injectable, signal, effect, inject, NgZone } from '@angular/core';
type ContactMethod = {
    id: string;
    type: 'phone' | 'whatsapp' | 'email';
    title: string;
    titleAr?: string;
    titleEn?: string;
    value: string;
    valueAr?: string;
    valueEn?: string;
    link: string;
};

const DEFAULT_CONFIG = {
    pageTitle: 'تواصل معنا',
    pageTitleAr: 'تواصل معنا',
    pageTitleEn: 'Contact Us',
    pageSubtitle: 'نحن هنا لمساعدتك والإجابة على كافة استفساراتك.',
    pageSubtitleAr: 'نحن هنا لمساعدتك والإجابة على كافة استفساراتك.',
    pageSubtitleEn: 'We are here to help and answer all your inquiries.',
    formTitle: 'أرسل لنا رسالة',
    formTitleAr: 'أرسل لنا رسالة',
    formTitleEn: 'Send Us a Message',
    formSubtitle: 'سنقوم بالرد عليك في أقرب وقت ممكن.',
    formSubtitleAr: 'سنقوم بالرد عليك في أقرب وقت ممكن.',
    formSubtitleEn: 'We will get back to you as soon as possible.',
    showContactForm: true,
    bannerImage: '',
    contactMethods: [
        { id: '1', type: 'phone', title: 'خدمة العملاء', titleAr: 'خدمة العملاء', titleEn: 'Customer Service', value: '920000000', valueAr: '920000000', valueEn: '920000000', link: 'tel:920000000' },
        { id: '2', type: 'whatsapp', title: 'واتساب', titleAr: 'واتساب', titleEn: 'WhatsApp', value: '+966500000000', valueAr: '+966500000000', valueEn: '+966500000000', link: 'https://wa.me/966500000000' },
        { id: '3', type: 'email', title: 'البريد الإلكتروني', titleAr: 'البريد الإلكتروني', titleEn: 'Email', value: 'support@loxxking.com', valueAr: 'support@loxxking.com', valueEn: 'support@loxxking.com', link: 'mailto:support@loxxking.com' },
    ]
};




@Injectable({
  providedIn: 'root'
})
export class ContactPageConfigService {
  private readonly storageKey = 'loxx-contact-config';

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
    this.pageConfig.set(newConfig);
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
