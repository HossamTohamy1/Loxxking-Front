import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { SectionCardComponent } from '../components/section-card/section-card.component';
import { Component, inject} from '@angular/core';
import { BilingualInputComponent } from '../components/bilingual-input/bilingual-input.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Trash2 } from 'lucide-angular';
import { CheckoutPageConfigService, CheckoutPageConfig } from '../../../../core/services/page-configs/checkout-page-config.service';
import { getEnglishTranslation } from '../../../../core/utils/config-sanitizer';

@Component({
  selector: 'app-checkout-page-editor',
  standalone: true,
  imports: [TranslatePipe, TranslateDirective, CommonModule, FormsModule, LucideAngularModule, SectionCardComponent, BilingualInputComponent],
  
  template: `
        <div class="w-full flex flex-col gap-2 pb-24" dir="rtl">
            <div class="text-center mb-4">
                <h2 class="text-xl font-bold text-gray-900 mb-1">{{ 'CART.CHECKOUT' | translate }}</h2>
                <p class="text-sm text-gray-500">{{ 'DASHBOARD.AUTO_STR_24' | translate }}</p>
            </div>

            <app-section-card title="رأس الصفحة" [index]="0" [enabled]="config().showHeader !== false" [isFirst]="true" [isLast]="false" (toggle)="updateConfig({ showHeader: $event })" (duplicate)="noop()" (delete)="noop()" (moveUp)="noop()" (moveDown)="noop()" (onDragStart)="noop()" (onDragEnd)="noop()" (onDragOver)="noop()" (onDrop)="noop()">
                <app-bilingual-input title="DASHBOARD.AUTO_STR_178" labelAr="عربي / AR" labelEn="English / EN" 
                [valueAr]="$any(config())['headerTitleAr'] || ''" 
                [valueEn]="$any(config())['headerTitleEn'] || ''" 
                (valueChange)="updateBilingualField('headerTitle', $event.lang, $event.value)"></app-bilingual-input>
                <app-bilingual-input title="DASHBOARD.AUTO_STR_316" labelAr="عربي / AR" labelEn="English / EN" 
                [valueAr]="$any(config())['headerSubtitleAr'] || ''" 
                [valueEn]="$any(config())['headerSubtitleEn'] || ''" 
                (valueChange)="updateBilingualField('headerSubtitle', $event.lang, $event.value)"></app-bilingual-input>
            </app-section-card>

            <app-section-card title="الأقسام والنصوص" [index]="1" [showToggle]="false" [enabled]="true" [isFirst]="false" [isLast]="false" (duplicate)="noop()" (delete)="noop()" (moveUp)="noop()" (moveDown)="noop()" (onDragStart)="noop()" (onDragEnd)="noop()" (onDragOver)="noop()" (onDrop)="noop()">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                    <label class="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-100 cursor-pointer">
                        <span class="text-xs font-bold text-gray-700">بيانات العميل</span>
                        <input type="checkbox" [ngModel]="config().showCustomerInfo !== false" (ngModelChange)="updateConfig({showCustomerInfo: $event})" class="rounded text-blue-600 focus:ring-blue-500" />
                    </label>
                    <label class="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-100 cursor-pointer">
                        <span class="text-xs font-bold text-gray-700">طريقة الدفع</span>
                        <input type="checkbox" [ngModel]="config().showPaymentInfo !== false" (ngModelChange)="updateConfig({showPaymentInfo: $event})" class="rounded text-blue-600 focus:ring-blue-500" />
                    </label>
                    <label class="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-100 cursor-pointer">
                        <span class="text-xs font-bold text-gray-700">ملخص الطلب</span>
                        <input type="checkbox" [ngModel]="config().showOrderSummary !== false" (ngModelChange)="updateConfig({showOrderSummary: $event})" class="rounded text-blue-600 focus:ring-blue-500" />
                    </label>
                </div>

                <app-bilingual-input title="DASHBOARD.AUTO_STR_163" labelAr="عربي / AR" labelEn="English / EN" 
                [valueAr]="$any(config())['customerInfoTitleAr'] || ''" 
                [valueEn]="$any(config())['customerInfoTitleEn'] || ''" 
                (valueChange)="updateBilingualField('customerInfoTitle', $event.lang, $event.value)"></app-bilingual-input>
                <app-bilingual-input title="DASHBOARD.AUTO_STR_181" labelAr="عربي / AR" labelEn="English / EN" 
                [valueAr]="$any(config())['paymentInfoTitleAr'] || ''" 
                [valueEn]="$any(config())['paymentInfoTitleEn'] || ''" 
                (valueChange)="updateBilingualField('paymentInfoTitle', $event.lang, $event.value)"></app-bilingual-input>
                <app-bilingual-input title="DASHBOARD.AUTO_STR_278" labelAr="عربي / AR" labelEn="English / EN" 
                [valueAr]="$any(config())['summaryTitleAr'] || ''" 
                [valueEn]="$any(config())['summaryTitleEn'] || ''" 
                (valueChange)="updateBilingualField('summaryTitle', $event.lang, $event.value)"></app-bilingual-input>
                
                <div class="flex items-center gap-2 mb-2 mt-4">
                    <input type="checkbox" [ngModel]="config().showSafeShopping" (ngModelChange)="updateConfig({showSafeShopping: $event})" class="rounded text-blue-600 focus:ring-blue-500" />
                    <span class="text-sm font-medium">{{ 'DASHBOARD.AUTO_STR_57' | translate }}</span>
                </div>
                
                <app-bilingual-input title="DASHBOARD.AUTO_STR_115" labelAr="عربي / AR" labelEn="English / EN" 
                [valueAr]="$any(config())['safeShoppingTitleAr'] || ''" 
                [valueEn]="$any(config())['safeShoppingTitleEn'] || ''" 
                (valueChange)="updateBilingualField('safeShoppingTitle', $event.lang, $event.value)"></app-bilingual-input>
                <app-bilingual-input title="DASHBOARD.AUTO_STR_182" labelAr="عربي / AR" labelEn="English / EN" 
                [valueAr]="$any(config())['safeShoppingTextAr'] || ''" 
                [valueEn]="$any(config())['safeShoppingTextEn'] || ''" 
                (valueChange)="updateBilingualField('safeShoppingText', $event.lang, $event.value)"></app-bilingual-input>
            </app-section-card>
            
            <app-section-card title="حالة السلة الفارغة" [index]="2" [enabled]="config().showEmptyState !== false" [isFirst]="false" [isLast]="false" (toggle)="updateConfig({ showEmptyState: $event })" (duplicate)="noop()" (delete)="noop()" (moveUp)="noop()" (moveDown)="noop()" (onDragStart)="noop()" (onDragEnd)="noop()" (onDragOver)="noop()" (onDrop)="noop()">
                <app-bilingual-input title="COMMON.ADDRESS" labelAr="عربي / AR" labelEn="English / EN" 
                [valueAr]="$any(config())['emptyStateTitleAr'] || ''" 
                [valueEn]="$any(config())['emptyStateTitleEn'] || ''" 
                (valueChange)="updateBilingualField('emptyStateTitle', $event.lang, $event.value)"></app-bilingual-input>
                <app-bilingual-input title="DASHBOARD.AUTO_STR_449" labelAr="عربي / AR" labelEn="English / EN" 
                [valueAr]="$any(config())['emptyStateTextAr'] || ''" 
                [valueEn]="$any(config())['emptyStateTextEn'] || ''" 
                (valueChange)="updateBilingualField('emptyStateText', $event.lang, $event.value)"></app-bilingual-input>
                <app-bilingual-input title="DASHBOARD.AUTO_STR_275" labelAr="عربي / AR" labelEn="English / EN" 
                [valueAr]="$any(config())['emptyStateCtaAr'] || ''" 
                [valueEn]="$any(config())['emptyStateCtaEn'] || ''" 
                (valueChange)="updateBilingualField('emptyStateCta', $event.lang, $event.value)"></app-bilingual-input>
            </app-section-card>

            <app-section-card title="مميزات الشراء" [index]="3" [enabled]="config().showTrustBadges !== false" [isFirst]="false" [isLast]="true" (toggle)="updateConfig({showTrustBadges: $event})" (duplicate)="noop()" (delete)="noop()" (moveUp)="noop()" (moveDown)="noop()" (onDragStart)="noop()" (onDragEnd)="noop()" (onDragOver)="noop()" (onDrop)="noop()" [addAction]="{ label: 'إضافة ميزة', onClick: addTrustBadge.bind(this) }">
                <div class="flex flex-col gap-3 mt-3">
                    <div *ngFor="let badge of config().trustBadges; let idx = index; trackBy: trackByIndex" class="flex gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div class="flex flex-col gap-2 flex-1">
                            <div class="grid grid-cols-2 gap-2" dir="rtl">
                                <div>
                                    <span class="text-[10px] font-bold text-gray-500 mb-1 block text-right">العنوان (عربي)</span>
                                    <input type="text" dir="rtl" class="w-full text-sm font-bold bg-white border border-gray-200 rounded-md px-2 py-1 text-right" [ngModel]="badge.titleAr" (ngModelChange)="updateTrustBadge(idx, { titleAr: $event })" />
                                </div>
                                <div>
                                    <span class="text-[10px] font-bold text-gray-500 mb-1 block text-left">Title (EN)</span>
                                    <input type="text" dir="ltr" class="w-full text-sm font-bold bg-white border border-gray-200 rounded-md px-2 py-1 text-left" [ngModel]="badge.titleEn" (ngModelChange)="updateTrustBadge(idx, { titleEn: $event })" />
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-2" dir="rtl">
                                <div>
                                    <span class="text-[10px] font-bold text-gray-500 mb-1 block text-right">الوصف القصير (عربي)</span>
                                    <input type="text" dir="rtl" class="w-full text-sm bg-white border border-gray-200 rounded-md px-2 py-1 text-right" [ngModel]="badge.subtitleAr" (ngModelChange)="updateTrustBadge(idx, { subtitleAr: $event })" />
                                </div>
                                <div>
                                    <span class="text-[10px] font-bold text-gray-500 mb-1 block text-left">Subtitle (EN)</span>
                                    <input type="text" dir="ltr" class="w-full text-sm bg-white border border-gray-200 rounded-md px-2 py-1 text-left" [ngModel]="badge.subtitleEn" (ngModelChange)="updateTrustBadge(idx, { subtitleEn: $event })" />
                                </div>
                            </div>
                            <select class="w-full text-sm bg-white border border-gray-200 rounded-md px-2 py-1 mt-1" [ngModel]="badge.icon" (ngModelChange)="updateTrustBadge(idx, { icon: $event })">
                                <option value="BadgeCheck">شارة صح (BadgeCheck)</option>
                                <option value="Truck">شاحنة (Truck)</option>
                                <option value="RotateCcw">إرجاع (RotateCcw)</option>
                                <option value="ShieldCheck">درع صح (ShieldCheck)</option>
                            </select>
                        </div>
                        <button (click)="removeTrustBadge(idx)" class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md h-fit mt-5">
                            <lucide-icon name="trash-2" [img]="Trash2" size="16"></lucide-icon>
                        </button>
                    </div>
                </div>
            </app-section-card>

            
        </div>
  `
})
export class CheckoutPageEditorComponent {
  private configService = inject(CheckoutPageConfigService);
  config = this.configService.pageConfig;
  Trash2 = Trash2;

  constructor() {
    this.backfillLocalizedStrings();
  }

  backfillLocalizedStrings() {
    const c: any = { ...this.config() };
    let changed = false;
    const ARABIC_REGEX = /[\u0600-\u06FF]/;
    const fields = [
      'headerTitle', 'headerSubtitle', 'customerInfoTitle', 'paymentInfoTitle',
      'summaryTitle', 'safeShoppingTitle', 'safeShoppingText', 'emptyStateTitle',
      'emptyStateText', 'emptyStateCta'
    ];
    for (const f of fields) {
      if (c[f] && !c[f + 'Ar']) {
        c[f + 'Ar'] = c[f];
        changed = true;
      }
      if (!c[f + 'En'] || ARABIC_REGEX.test(c[f + 'En'])) {
        c[f + 'En'] = getEnglishTranslation(c[f + 'Ar'] || c[f]);
        changed = true;
      }
    }
    
    if (c.trustBadges && c.trustBadges.length > 0) {
      const newBadges = c.trustBadges.map((b: any) => {
        let bChanged = false;
        if (b.title && !b.titleAr) {
          b.titleAr = b.title;
          bChanged = true;
        }
        if (!b.titleEn || ARABIC_REGEX.test(b.titleEn)) {
          b.titleEn = getEnglishTranslation(b.titleAr || b.title, 'Feature');
          bChanged = true;
        }
        if (b.subtitle && !b.subtitleAr) {
          b.subtitleAr = b.subtitle;
          bChanged = true;
        }
        if (!b.subtitleEn || ARABIC_REGEX.test(b.subtitleEn)) {
          b.subtitleEn = getEnglishTranslation(b.subtitleAr || b.subtitle, 'Feature Details');
          bChanged = true;
        }
        if (bChanged) changed = true;
        return b;
      });
      c.trustBadges = newBadges;
    }

    if (changed) {
      this.configService.updateConfig(c);
    }
  }

  updateConfig(updates: Partial<CheckoutPageConfig>) {
    this.configService.updateConfig({ ...this.config(), ...updates });
  }

  updateBilingualField(field: string, lang: 'Ar' | 'En', value: string) {
    const current = { ...this.config() } as any;
    current[field + lang] = value;
    current[field] = current[field + 'Ar'] || current[field + 'En'];
    this.updateConfig(current);
  }

  addTrustBadge() {
    const badges = [...(this.config().trustBadges || [])];
    badges.push({ 
      id: 'tb-' + Date.now(), 
      icon: 'BadgeCheck', 
      title: 'ميزة جديدة', titleAr: 'ميزة جديدة', titleEn: 'New Feature', 
      subtitle: 'وصف قصير', subtitleAr: 'وصف قصير', subtitleEn: 'Short Description' 
    });
    this.updateConfig({ trustBadges: badges });
  }

  updateTrustBadge(index: number, updates: any) {
    const badges = [...(this.config().trustBadges || [])];
    badges[index] = { ...badges[index], ...updates };
    this.updateConfig({ trustBadges: badges });
  }

  removeTrustBadge(index: number) {
    const badges = [...(this.config().trustBadges || [])];
    badges.splice(index, 1);
    this.updateConfig({ trustBadges: badges });
  }

  noop() {}

  trackByIndex(index: number, item: any): number {
    return index;
  }
}
