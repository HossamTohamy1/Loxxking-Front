import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { Component, inject } from '@angular/core';
import { BilingualInputComponent } from '../components/bilingual-input/bilingual-input.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { CartPageConfigService } from '../../../../core/services/page-configs/cart-page-config.service';
import { SectionCardComponent } from '../components/section-card/section-card.component';
import { AddItemButtonComponent } from '../components/add-item-button/add-item-button.component';
import { getEnglishTranslation } from '../../../../core/utils/config-sanitizer';

@Component({
  selector: 'app-cart-page-editor',
  standalone: true,
  imports: [TranslatePipe, TranslateDirective, CommonModule, FormsModule, LucideAngularModule, SectionCardComponent, AddItemButtonComponent, BilingualInputComponent],
  template: `
    <div class="w-full flex flex-col gap-2 pb-24" dir="rtl">
      <div class="text-center mb-4">
        <h2 class="text-xl font-bold text-gray-900 mb-1">{{ 'CART.TITLE' | translate }}</h2>
        <p class="text-sm text-gray-500">{{ 'DASHBOARD.AUTO_STR_16' | translate }}</p>
      </div>

      <app-section-card title="رأس الصفحة" [index]="0" [enabled]="config().showHeader !== false" [isFirst]="true" [isLast]="false"
        [draggable]="false" [showReorder]="false" [showCopy]="false" [showDelete]="false" (toggle)="updateConfig({ showHeader: $event })">
        <app-bilingual-input title="عنوان الصفحة" labelAr="عربي / AR" labelEn="English / EN" 
                [valueAr]="$any(config())['headerTitleAr'] || ''" 
                [valueEn]="$any(config())['headerTitleEn'] || ''" 
                (valueChange)="updateBilingualField('headerTitle', $event.lang, $event.value)"></app-bilingual-input>
      </app-section-card>

      <app-section-card title="عناصر السلة" [index]="1" [enabled]="config().showCartItems !== false" [isFirst]="false" [isLast]="false"
        [draggable]="false" [showReorder]="false" [showCopy]="false" [showDelete]="false" (toggle)="updateConfig({ showCartItems: $event })">
        <div class="grid grid-cols-2 gap-2">
          <ng-container *ngTemplateOutlet="checkboxTemplate; context: { label: 'إظهار صورة المنتج', field: 'showProductImage' }"></ng-container>
          <ng-container *ngTemplateOutlet="checkboxTemplate; context: { label: 'أزرار الكمية', field: 'showQuantityControls' }"></ng-container>
          <ng-container *ngTemplateOutlet="checkboxTemplate; context: { label: 'زر الحذف', field: 'showRemoveButton' }"></ng-container>
          <ng-container *ngTemplateOutlet="checkboxTemplate; context: { label: 'السعر قبل الخصم', field: 'showOldPrice' }"></ng-container>
        </div>
      </app-section-card>

      <app-section-card title="كود الخصم" [index]="2" [enabled]="config().showCouponSection" [isFirst]="false" [isLast]="false"
        [draggable]="false" [showReorder]="false" [showCopy]="false" [showDelete]="false" (toggle)="updateConfig({ showCouponSection: $event })">
        <div class="flex flex-col gap-2">
          <app-bilingual-input title="عنوان القسم" labelAr="عربي / AR" labelEn="English / EN" 
                [valueAr]="$any(config())['couponTitleAr'] || ''" 
                [valueEn]="$any(config())['couponTitleEn'] || ''" 
                (valueChange)="updateBilingualField('couponTitle', $event.lang, $event.value)"></app-bilingual-input>
          <app-bilingual-input title="النص الإرشادي (Placeholder)" labelAr="عربي / AR" labelEn="English / EN" 
                [valueAr]="$any(config())['couponPlaceholderAr'] || ''" 
                [valueEn]="$any(config())['couponPlaceholderEn'] || ''" 
                (valueChange)="updateBilingualField('couponPlaceholder', $event.lang, $event.value)"></app-bilingual-input>
          <app-bilingual-input title="نص زر التطبيق" labelAr="عربي / AR" labelEn="English / EN" 
                [valueAr]="$any(config())['couponButtonTextAr'] || ''" 
                [valueEn]="$any(config())['couponButtonTextEn'] || ''" 
                (valueChange)="updateBilingualField('couponButtonText', $event.lang, $event.value)"></app-bilingual-input>
        </div>
      </app-section-card>

      <app-section-card title="ملخص الطلب" [index]="3" [enabled]="config().showOrderSummary !== false" [isFirst]="false" [isLast]="false"
        [draggable]="false" [showReorder]="false" [showCopy]="false" [showDelete]="false" (toggle)="updateConfig({ showOrderSummary: $event })">
        <div class="grid grid-cols-2 gap-2">
          <ng-container *ngTemplateOutlet="checkboxTemplate; context: { label: 'المجموع الفرعي', field: 'showSubtotal' }"></ng-container>
          <ng-container *ngTemplateOutlet="checkboxTemplate; context: { label: 'رسوم الشحن', field: 'showShipping' }"></ng-container>
          <ng-container *ngTemplateOutlet="checkboxTemplate; context: { label: 'الخصم', field: 'showDiscount' }"></ng-container>
          <ng-container *ngTemplateOutlet="checkboxTemplate; context: { label: 'الإجمالي', field: 'showTotal' }"></ng-container>
        </div>
        <div class="mt-4">
          <app-bilingual-input title="نص زر إتمام الطلب" labelAr="عربي / AR" labelEn="English / EN" 
                [valueAr]="$any(config())['checkoutButtonTextAr'] || ''" 
                [valueEn]="$any(config())['checkoutButtonTextEn'] || ''" 
                (valueChange)="updateBilingualField('checkoutButtonText', $event.lang, $event.value)"></app-bilingual-input>
        </div>
      </app-section-card>

      <app-section-card title="السلة الفارغة" [index]="4" [enabled]="config().showEmptyCartSection !== false" [isFirst]="false" [isLast]="false"
        [draggable]="false" [showReorder]="false" [showCopy]="false" [showDelete]="false" (toggle)="updateConfig({ showEmptyCartSection: $event })">
        <div class="flex flex-col gap-2">
          <ng-container *ngTemplateOutlet="checkboxTemplate; context: { label: 'إظهار الرسم التوضيحي', field: 'emptyCartIllustration' }"></ng-container>
          <app-bilingual-input title="نص السلة الفارغة" labelAr="عربي / AR" labelEn="English / EN" 
                [valueAr]="$any(config())['emptyCartTextAr'] || ''" 
                [valueEn]="$any(config())['emptyCartTextEn'] || ''" 
                (valueChange)="updateBilingualField('emptyCartText', $event.lang, $event.value)"></app-bilingual-input>
        </div>
      </app-section-card>

      <app-section-card title="شارات الثقة" [index]="5" [enabled]="config().showTrustBadges" [isFirst]="false" [isLast]="true"
        [draggable]="false" [showReorder]="false" [showCopy]="false" [showDelete]="false" addActionLabel="إضافة شارة" (onAddAction)="addTrustBadge()"
        (toggle)="updateConfig({ showTrustBadges: $event })">
        <div class="flex flex-col gap-3">
          <div *ngFor="let badge of config().trustBadges; let idx = index; trackBy: trackByIndex" class="flex gap-2 items-start bg-gray-50 border border-gray-200 rounded-lg p-2">
            <div class="flex flex-col gap-2 flex-1">
               <div class="grid grid-cols-2 gap-2" dir="rtl">
                 <div>
                   <span class="text-[10px] font-bold text-gray-500 mb-1 block text-right">العنوان (عربي)</span>
                   <input type="text" dir="rtl" class="w-full text-sm bg-white border border-gray-200 rounded-md px-2 py-1 text-right" 
                     [ngModel]="badge.titleAr" (ngModelChange)="updateTrustBadge(idx, { titleAr: $event })" />
                 </div>
                 <div>
                   <span class="text-[10px] font-bold text-gray-500 mb-1 block text-left">Title (EN)</span>
                   <input type="text" dir="ltr" class="w-full text-sm bg-white border border-gray-200 rounded-md px-2 py-1 text-left" 
                     [ngModel]="badge.titleEn" (ngModelChange)="updateTrustBadge(idx, { titleEn: $event })" />
                 </div>
               </div>
               <div class="grid grid-cols-2 gap-2" dir="rtl">
                 <div>
                   <span class="text-[10px] font-bold text-gray-500 mb-1 block text-right">الوصف (عربي)</span>
                   <input type="text" dir="rtl" class="w-full text-sm bg-white border border-gray-200 rounded-md px-2 py-1 text-gray-500 text-right" 
                     [ngModel]="badge.subtitleAr" (ngModelChange)="updateTrustBadge(idx, { subtitleAr: $event })" />
                 </div>
                 <div>
                   <span class="text-[10px] font-bold text-gray-500 mb-1 block text-left">Subtitle (EN)</span>
                   <input type="text" dir="ltr" class="w-full text-sm bg-white border border-gray-200 rounded-md px-2 py-1 text-gray-500 text-left" 
                     [ngModel]="badge.subtitleEn" (ngModelChange)="updateTrustBadge(idx, { subtitleEn: $event })" />
                 </div>
               </div>
            </div>
            <button (click)="removeTrustBadge(idx)" class="p-2 mt-5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md"><lucide-icon name="trash-2" [size]="16"></lucide-icon></button>
          </div>
        </div>
      </app-section-card>

      <ng-template #checkboxTemplate let-label="label" let-field="field">
        <label class="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
          <span class="text-sm text-gray-700">{{ label | translate }}</span>
          <div class="relative inline-flex items-center">
            <input type="checkbox" class="sr-only peer" [checked]="!!getConfigValue(field)" (change)="updateConfigField(field, $any($event.target).checked)" />
            <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
          </div>
        </label>
      </ng-template>

      
    </div>
  `
})
export class CartPageEditorComponent {
  private configService = inject(CartPageConfigService);
  config = this.configService.pageConfig;

  constructor() {
    this.backfillLocalizedStrings();
  }

  backfillLocalizedStrings() {
    const c: any = { ...this.config() };
    let changed = false;
    const ARABIC_REGEX = /[\u0600-\u06FF]/;
    const fields = [
      'headerTitle', 'couponTitle', 'couponPlaceholder', 'couponButtonText', 
      'checkoutButtonText', 'emptyCartText'
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

  updateConfig(updates: Partial<any>) {
    this.configService.updateConfig({ ...this.config(), ...updates });
  }

  getConfigValue(field: string): any {
    return (this.config() as any)[field];
  }

  updateConfigField(field: string, value: any) {
    this.updateConfig({ [field]: value });
  }

  updateBilingualField(field: string, lang: 'Ar' | 'En', value: string) {
    const current = { ...this.config() } as any;
    current[field + lang] = value;
    current[field] = current[field + 'Ar'] || current[field + 'En'];
    this.updateConfig(current);
  }

  addTrustBadge() {
    const badges = [...this.config().trustBadges];
    badges.push({ 
      id: 't-' + Date.now(), 
      icon: 'BadgeCheck', 
      title: 'ميزة جديدة', titleAr: 'ميزة جديدة', titleEn: 'New Feature', 
      subtitle: 'تفاصيل الميزة', subtitleAr: 'تفاصيل الميزة', subtitleEn: 'Feature Details' 
    });
    this.updateConfig({ trustBadges: badges });
  }

  updateTrustBadge(index: number, updates: any) {
    const badges = [...this.config().trustBadges];
    badges[index] = { ...badges[index], ...updates };
    badges[index].title = badges[index].titleEn || badges[index].titleAr || '';
    badges[index].subtitle = badges[index].subtitleEn || badges[index].subtitleAr || '';
    this.updateConfig({ trustBadges: badges });
  }

  removeTrustBadge(index: number) {
    const badges = [...this.config().trustBadges];
    badges.splice(index, 1);
    this.updateConfig({ trustBadges: badges });
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
}
