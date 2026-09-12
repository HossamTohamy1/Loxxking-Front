import { sanitizeWithInitial } from '../../utils/config-sanitizer';
import { Injectable, signal, effect, inject, NgZone } from '@angular/core';


const INSTANCE_ID = typeof crypto !== 'undefined' && crypto.randomUUID 
  ? crypto.randomUUID() 
  : Math.random().toString(36).substring(2) + Date.now().toString(36);

export interface AboutReasonConfig {
    id: string;
    icon: string;
    title: string;
    titleAr?: string;
    titleEn?: string;
    text: string;
    textAr?: string;
    textEn?: string;
}

export interface AboutValueConfig {
    id: string;
    icon: string;
    label: string;
    labelAr?: string;
    labelEn?: string;
}

export interface AboutContactConfig {
    id: string;
    icon: string;
    label: string;
    labelAr?: string;
    labelEn?: string;
    link: string;
}

export interface AboutPageConfig {
    showTitle: boolean;
    headerTitle: string;
    headerTitleAr?: string;
    headerTitleEn?: string;
    headerSubtitle: string;
    headerSubtitleAr?: string;
    headerSubtitleEn?: string;
    
    showIntroSection: boolean;
    introText: string;
    introTextAr?: string;
    introTextEn?: string;
    
    showReasonsSection: boolean;
    reasonsTitle: string;
    reasonsTitleAr?: string;
    reasonsTitleEn?: string;
    reasons: AboutReasonConfig[];
    
    showVisionSection: boolean;
    visionTitle: string;
    visionTitleAr?: string;
    visionTitleEn?: string;
    visionText: string;
    visionTextAr?: string;
    visionTextEn?: string;
    
    showMissionSection: boolean;
    missionTitle: string;
    missionTitleAr?: string;
    missionTitleEn?: string;
    missionText: string;
    missionTextAr?: string;
    missionTextEn?: string;
    
    showValuesSection: boolean;
    valuesTitle: string;
    valuesTitleAr?: string;
    valuesTitleEn?: string;
    values: AboutValueConfig[];
    
    showContactSection: boolean;
    contactTitle: string;
    contactTitleAr?: string;
    contactTitleEn?: string;
    contacts: AboutContactConfig[];
}

const initialConfig: AboutPageConfig = {
    showTitle: true,
    headerTitle: 'من نحن',
    headerTitleAr: 'من نحن',
    headerTitleEn: 'About Us',
    headerSubtitle: 'لوكس كينج... ثقتك، راحتك، جمالك',
    headerSubtitleAr: 'لوكس كينج... ثقتك، راحتك، جمالك',
    headerSubtitleEn: 'Loxxking... Your Confidence, Comfort, and Beauty',
    
    showIntroSection: true,
    introText: 'لوكس كينج هو متجرك الموثوق لمشدات الجسم ومنتجات العناية بالجمال عالية الجودة.\n\nنحن نؤمن أن الثقة تبدأ من الراحة، ونختار لك الأفضل لتشعري بأجمل إطلالة كل يوم.',
    introTextAr: 'لوكس كينج هو متجرك الموثوق لمشدات الجسم ومنتجات العناية بالجمال عالية الجودة.\n\nنحن نؤمن أن الثقة تبدأ من الراحة، ونختار لك الأفضل لتشعري بأجمل إطلالة كل يوم.',
    introTextEn: 'Loxxking is your trusted store for premium body shapers and beauty products.\n\nWe believe confidence starts with comfort, offering you the best to feel your finest every day.',
    
    showReasonsSection: true,
    reasonsTitle: 'لماذا نحن؟',
    reasonsTitleAr: 'لماذا نحن؟',
    reasonsTitleEn: 'Why Us?',
    reasons: [
        { id: '1', icon: 'ShieldCheck', title: 'جودة استثنائية', titleAr: 'جودة استثنائية', titleEn: 'Exceptional Quality', text: 'نختار منتجاتنا بعناية فائقة لضمان أفضل النتائج.', textAr: 'نختار منتجاتنا بعناية فائقة لضمان أفضل النتائج.', textEn: 'We carefully select our products to ensure the best results.' },
        { id: '2', icon: 'Heart', title: 'راحة تامة', titleAr: 'راحة تامة', titleEn: 'Total Comfort', text: 'تصاميم تناسب الاستخدام اليومي دون إزعاج.', textAr: 'تصاميم تناسب الاستخدام اليومي دون إزعاج.', textEn: 'Designs tailored for everyday wear with complete comfort.' },
        { id: '3', icon: 'Star', title: 'نتائج ملحوظة', titleAr: 'نتائج ملحوظة', titleEn: 'Visible Results', text: 'منتجات تساعدك على إبراز جمالك الطبيعي.', textAr: 'منتجات تساعدك على إبراز جمالك الطبيعي.', textEn: 'Products designed to enhance your natural beauty.' }
    ],
    
    showVisionSection: true,
    visionTitle: 'رؤيتنا',
    visionTitleAr: 'رؤيتنا',
    visionTitleEn: 'Our Vision',
    visionText: 'أن نكون الخيار الأول في مجال مشدات الجسم ومنتجات الجمال في الوطن العربي من خلال الجودة، المصداقية وخدمة العملاء المتميزة.',
    visionTextAr: 'أن نكون الخيار الأول في مجال مشدات الجسم ومنتجات الجمال في الوطن العربي من خلال الجودة، المصداقية وخدمة العملاء المتميزة.',
    visionTextEn: 'To be the premier choice for body shapers and beauty products across the region through uncompromised quality and customer service.',
    
    showMissionSection: true,
    missionTitle: 'رسالتنا',
    missionTitleAr: 'رسالتنا',
    missionTitleEn: 'Our Mission',
    missionText: 'تقديم منتجات موثوقة وآمنة تساعدك على إبراز جمالك وثقتك بنفسك، مع تجربة تسوق سهلة، سريعة وآمنة.',
    missionTextAr: 'تقديم منتجات موثوقة وآمنة تساعدك على إبراز جمالك وثقتك بنفسك، مع تجربة تسوق سهلة، سريعة وآمنة.',
    missionTextEn: 'Providing safe and trusted products that elevate your beauty and confidence, with a seamless, swift shopping experience.',
    
    showValuesSection: true,
    valuesTitle: 'قيمنا',
    valuesTitleAr: 'قيمنا',
    valuesTitleEn: 'Our Values',
    values: [
        { id: '1', icon: 'ShieldCheck', label: 'المصداقية', labelAr: 'المصداقية', labelEn: 'Integrity' },
        { id: '2', icon: 'Heart', label: 'العناية بالعميل', labelAr: 'العناية بالعميل', labelEn: 'Customer Care' },
        { id: '3', icon: 'Star', label: 'الجودة العالية', labelAr: 'الجودة العالية', labelEn: 'High Quality' },
        { id: '4', icon: 'Target', label: 'الابتكار المستمر', labelAr: 'الابتكار المستمر', labelEn: 'Continuous Innovation' },
        { id: '5', icon: 'Check', label: 'الشفافية', labelAr: 'الشفافية', labelEn: 'Transparency' }
    ],
    
    showContactSection: true,
    contactTitle: 'تواصل معنا',
    contactTitleAr: 'تواصل معنا',
    contactTitleEn: 'Contact Us',
    contacts: [
        { id: '1', icon: 'facebook', label: 'فيسبوك', labelAr: 'فيسبوك', labelEn: 'Facebook', link: 'https://facebook.com' },
        { id: '2', icon: 'instagram', label: 'إنستغرام', labelAr: 'إنستغرام', labelEn: 'Instagram', link: 'https://instagram.com' },
        { id: '3', icon: 'mail', label: 'بريد إلكتروني', labelAr: 'بريد إلكتروني', labelEn: 'Email', link: 'mailto:support@loxxking.com' },
        { id: '4', icon: 'phone', label: 'اتصال', labelAr: 'اتصال', labelEn: 'Phone Call', link: 'tel:+201000000000' },
        { id: '5', icon: 'whatsapp', label: 'واتساب', labelAr: 'واتساب', labelEn: 'WhatsApp', link: 'https://wa.me/201000000000' }
    ]
};

@Injectable({
  providedIn: 'root'
})
export class AboutPageConfigService {
  private readonly storageKey = 'loxxking-about-page-config';

  private isApplyingExternalUpdate = false;
  private lastSavedJson: string = '';

  readonly pageConfig = signal<AboutPageConfig>(this.loadInitialConfig());
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

  updateConfig(newConfig: AboutPageConfig) {
    this.pageConfig.set(newConfig);
  }

  private loadInitialConfig(): AboutPageConfig {
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
