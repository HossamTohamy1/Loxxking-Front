import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { Component, inject } from '@angular/core';
import { BilingualInputComponent } from '../components/bilingual-input/bilingual-input.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FavoritesPageConfigService } from '../../../../core/services/page-configs/favorites-page-config.service';
import { SectionCardComponent } from '../components/section-card/section-card.component';
import { LucideAngularModule, Trash2 } from 'lucide-angular';
import { getEnglishTranslation } from '../../../../core/utils/config-sanitizer';

@Component({
  selector: 'app-favorites-page-editor',
  standalone: true,
  imports: [TranslatePipe, TranslateDirective, CommonModule, FormsModule, SectionCardComponent, LucideAngularModule, BilingualInputComponent],
  template: `
    <div class="w-full flex flex-col gap-2 pb-24" dir="rtl">
        <div class="text-center mb-4">
            <h2 class="text-xl font-bold text-gray-900 mb-1">{{ 'DASHBOARD.AUTO_STR_280' | translate }}</h2>
            <p class="text-sm text-gray-500">{{ 'DASHBOARD.AUTO_STR_18' | translate }}</p>
        </div>

        <app-section-card title="رأس الصفحة والأدوات" [index]="0" [enabled]="config().showTitle" [isFirst]="true" [isLast]="false" (toggle)="updateConfig({showTitle: $event})">
            <app-bilingual-input title="عنوان الصفحة" labelAr="عربي / AR" labelEn="English / EN" 
                [valueAr]="$any(config())['headerTitleAr'] || ''" 
                [valueEn]="$any(config())['headerTitleEn'] || ''" 
                (valueChange)="updateBilingualField('headerTitle', $event.lang, $event.value)"></app-bilingual-input>
            <app-bilingual-input title="وصف الصفحة" labelAr="عربي / AR" labelEn="English / EN" 
                [valueAr]="$any(config())['headerSubtitleAr'] || ''" 
                [valueEn]="$any(config())['headerSubtitleEn'] || ''" 
                (valueChange)="updateBilingualField('headerSubtitle', $event.lang, $event.value)"></app-bilingual-input>
            
            <hr class="my-3 border-gray-100" />
            
            <label class="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors mb-2">
                <span class="text-sm text-gray-700">{{ 'DASHBOARD.AUTO_STR_117' | translate }}</span>
                <div class="relative inline-flex items-center">
                    <input type="checkbox" class="sr-only peer" [ngModel]="config().showToolbar" (ngModelChange)="updateConfig({showToolbar: $event})" />
                    <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </div>
            </label>
            <label class="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors mb-2">
                <span class="text-sm text-gray-700">{{ 'DASHBOARD.AUTO_STR_81' | translate }}</span>
                <div class="relative inline-flex items-center">
                    <input type="checkbox" class="sr-only peer" [ngModel]="config().showSort" (ngModelChange)="updateConfig({showSort: $event})" />
                    <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </div>
            </label>
            <label class="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors mb-2">
                <span class="text-sm text-gray-700">{{ 'DASHBOARD.AUTO_STR_118' | translate }}</span>
                <div class="relative inline-flex items-center">
                    <input type="checkbox" class="sr-only peer" [ngModel]="config().showCount" (ngModelChange)="updateConfig({showCount: $event})" />
                    <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </div>
            </label>
            
            <hr class="my-3 border-gray-100" />
            
            <label class="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors mb-2">
                <span class="text-sm text-gray-700">{{ 'DASHBOARD.AUTO_STR_36' | translate }}</span>
                <div class="relative inline-flex items-center">
                    <input type="checkbox" class="sr-only peer" [ngModel]="config().showAddAllToCart" (ngModelChange)="updateConfig({showAddAllToCart: $event})" />
                    <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </div>
            </label>
            <app-bilingual-input title="نص زر الإضافة للسلة" labelAr="عربي / AR" labelEn="English / EN" 
                [valueAr]="$any(config())['addAllToCartTextAr'] || ''" 
                [valueEn]="$any(config())['addAllToCartTextEn'] || ''" 
                (valueChange)="updateBilingualField('addAllToCartText', $event.lang, $event.value)"></app-bilingual-input>
        </app-section-card>

        <app-section-card title="بطاقة المنتج" [index]="1" [showToggle]="false" [isFirst]="false" [isLast]="false">
            <label class="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors mb-2">
                <span class="text-sm text-gray-700">{{ 'DASHBOARD.AUTO_STR_327' | translate }}</span>
                <div class="relative inline-flex items-center">
                    <input type="checkbox" class="sr-only peer" [ngModel]="config().showProductColor" (ngModelChange)="updateConfig({showProductColor: $event})" />
                    <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </div>
            </label>
            <label class="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors mb-2">
                <span class="text-sm text-gray-700">{{ 'DASHBOARD.AUTO_STR_282' | translate }}</span>
                <div class="relative inline-flex items-center">
                    <input type="checkbox" class="sr-only peer" [ngModel]="config().showProductSize" (ngModelChange)="updateConfig({showProductSize: $event})" />
                    <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </div>
            </label>
            <label class="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors mb-2">
                <span class="text-sm text-gray-700">{{ 'DASHBOARD.AUTO_STR_119' | translate }}</span>
                <div class="relative inline-flex items-center">
                    <input type="checkbox" class="sr-only peer" [ngModel]="config().showProductPrice" (ngModelChange)="updateConfig({showProductPrice: $event})" />
                    <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </div>
            </label>
            <label class="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors mb-2">
                <span class="text-sm text-gray-700">إظهار السعر القديم (قبل الخصم)</span>
                <div class="relative inline-flex items-center">
                    <input type="checkbox" class="sr-only peer" [ngModel]="config().showProductOldPrice" (ngModelChange)="updateConfig({showProductOldPrice: $event})" />
                    <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </div>
            </label>
            <label class="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors mb-2">
                <span class="text-sm text-gray-700">{{ 'DASHBOARD.AUTO_STR_139' | translate }}</span>
                <div class="relative inline-flex items-center">
                    <input type="checkbox" class="sr-only peer" [ngModel]="config().showProductStock" (ngModelChange)="updateConfig({showProductStock: $event})" />
                    <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </div>
            </label>
            <hr class="my-3 border-gray-100" />
            <label class="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors mb-2">
                <span class="text-sm text-gray-700">{{ 'DASHBOARD.AUTO_STR_204' | translate }}</span>
                <div class="relative inline-flex items-center">
                    <input type="checkbox" class="sr-only peer" [ngModel]="config().showRemoveAction" (ngModelChange)="updateConfig({showRemoveAction: $event})" />
                    <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </div>
            </label>
            <label class="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors mb-2">
                <span class="text-sm text-gray-700">{{ 'DASHBOARD.AUTO_STR_82' | translate }}</span>
                <div class="relative inline-flex items-center">
                    <input type="checkbox" class="sr-only peer" [ngModel]="config().showMoveToCartAction" (ngModelChange)="updateConfig({showMoveToCartAction: $event})" />
                    <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </div>
            </label>
        </app-section-card>

        <app-section-card title="حالة المفضلة الفارغة" [index]="2" [enabled]="config().showEmptyState !== false" (toggle)="updateConfig({showEmptyState: $event})" [isFirst]="false" [isLast]="false">
            <label class="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors mb-2">
                <span class="text-sm text-gray-700">إظهار الرسم التوضيحي (Illustration)</span>
                <div class="relative inline-flex items-center">
                    <input type="checkbox" class="sr-only peer" [ngModel]="config().showEmptyStateIllustration" (ngModelChange)="updateConfig({showEmptyStateIllustration: $event})" />
                    <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </div>
            </label>
            <app-bilingual-input title="العنوان" labelAr="عربي / AR" labelEn="English / EN" 
                [valueAr]="$any(config())['emptyStateTitleAr'] || ''" 
                [valueEn]="$any(config())['emptyStateTitleEn'] || ''" 
                (valueChange)="updateBilingualField('emptyStateTitle', $event.lang, $event.value)"></app-bilingual-input>
            <app-bilingual-input title="الوصف" labelAr="عربي / AR" labelEn="English / EN" 
                [valueAr]="$any(config())['emptyStateSubtitleAr'] || ''" 
                [valueEn]="$any(config())['emptyStateSubtitleEn'] || ''" 
                (valueChange)="updateBilingualField('emptyStateSubtitle', $event.lang, $event.value)"></app-bilingual-input>
            <app-bilingual-input title="نص الزر" labelAr="عربي / AR" labelEn="English / EN" 
                [valueAr]="$any(config())['emptyStateButtonTextAr'] || ''" 
                [valueEn]="$any(config())['emptyStateButtonTextEn'] || ''" 
                (valueChange)="updateBilingualField('emptyStateButtonText', $event.lang, $event.value)"></app-bilingual-input>
        </app-section-card>

        <app-section-card title="مميزات التسوق" [index]="3" [enabled]="config().showTrustBadges" [isFirst]="false" [isLast]="true" (toggle)="updateConfig({showTrustBadges: $event})" [addAction]="{ label: 'إضافة ميزة', onClick: addBadge }">
            <div class="flex flex-col gap-3">
                <div *ngFor="let badge of config().trustBadges; let idx = index; trackBy: trackById" class="flex gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div class="flex flex-col gap-2 flex-1">
                       <div class="grid grid-cols-2 gap-2" dir="rtl">
                         <div>
                           <span class="text-[10px] font-bold text-gray-500 mb-1 block">العنوان (عربي)</span>
                           <input type="text" dir="rtl" class="w-full text-sm bg-white border border-gray-200 rounded-md px-2 py-1 text-right" 
                             [ngModel]="badge.titleAr" (ngModelChange)="updateBadge(idx, { titleAr: $event })" />
                         </div>
                         <div>
                           <span class="text-[10px] font-bold text-gray-500 mb-1 block">Title (EN)</span>
                           <input type="text" dir="ltr" class="w-full text-sm bg-white border border-gray-200 rounded-md px-2 py-1 text-left" 
                             [ngModel]="badge.titleEn" (ngModelChange)="updateBadge(idx, { titleEn: $event })" />
                         </div>
                       </div>
                       <div class="grid grid-cols-2 gap-2" dir="rtl">
                         <div>
                           <span class="text-[10px] font-bold text-gray-500 mb-1 block">الوصف (عربي)</span>
                           <input type="text" dir="rtl" class="w-full text-sm bg-white border border-gray-200 rounded-md px-2 py-1 text-gray-500 text-right" 
                             [ngModel]="badge.subtitleAr" (ngModelChange)="updateBadge(idx, { subtitleAr: $event })" />
                         </div>
                         <div>
                           <span class="text-[10px] font-bold text-gray-500 mb-1 block">Subtitle (EN)</span>
                           <input type="text" dir="ltr" class="w-full text-sm bg-white border border-gray-200 rounded-md px-2 py-1 text-gray-500 text-left" 
                             [ngModel]="badge.subtitleEn" (ngModelChange)="updateBadge(idx, { subtitleEn: $event })" />
                         </div>
                       </div>
                        <select class="w-full text-sm bg-white border border-gray-200 rounded-md px-2 py-1" [ngModel]="badge.icon" (ngModelChange)="updateBadge(idx, { icon: $event })">
                            <option value="BadgeCheck">شارة توثيق (BadgeCheck)</option>
                            <option value="Truck">سيارة شحن (Truck)</option>
                            <option value="RotateCcw">استرجاع (RotateCcw)</option>
                            <option value="ShieldCheck">درع حماية (ShieldCheck)</option>
                        </select>
                    </div>
                    <button (click)="removeBadge(idx)" class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md h-fit">
                        <lucide-icon name="trash-2" [size]="16"></lucide-icon>
                    </button>
                </div>
            </div>
        </app-section-card>
        
      
    </div>
  `
})
export class FavoritesPageEditorComponent {
  favoritesService = inject(FavoritesPageConfigService);
  config = this.favoritesService.pageConfig;
  Trash2 = Trash2;

  constructor() {
    this.backfillLocalizedStrings();
  }

  backfillLocalizedStrings() {
    const c: any = { ...this.config() };
    let changed = false;
    const ARABIC_REGEX = /[\u0600-\u06FF]/;
    const fields = [
      'headerTitle', 'headerSubtitle', 'addAllToCartText', 
      'emptyStateTitle', 'emptyStateSubtitle', 'emptyStateButtonText'
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
      this.favoritesService.updateConfig(c);
    }
  }

  addBadge = () => {
      const badges = [...(this.config().trustBadges || [])];
      badges.push({ id: 'b-' + Date.now(), icon: 'ShieldCheck', title: 'ميزة جديدة', titleAr: 'ميزة جديدة', titleEn: 'New Feature', subtitle: 'وصف قصير', subtitleAr: 'وصف قصير', subtitleEn: 'Feature Details' });
      this.updateConfig({ trustBadges: badges });
  };

  updateBilingualField(field: string, lang: 'Ar' | 'En', value: string) {
    const current = { ...this.config() } as any;
    current[field + lang] = value;
    current[field] = current[field + 'Ar'] || current[field + 'En'];
    this.updateConfig(current);
  }

  updateConfig(updates: Partial<ReturnType<typeof this.config>>) {
      this.favoritesService.updateConfig({ ...this.config(), ...updates } as any);
  }

  updateBadge(index: number, updates: any) {
      const badges = [...(this.config().trustBadges || [])];
      badges[index] = { ...badges[index], ...updates };
      badges[index].title = badges[index].titleAr || badges[index].titleEn || '';
      badges[index].subtitle = badges[index].subtitleAr || badges[index].subtitleEn || '';
      this.updateConfig({ trustBadges: badges });
  }

  removeBadge(index: number) {
      const badges = [...(this.config().trustBadges || [])];
      badges.splice(index, 1);
      this.updateConfig({ trustBadges: badges });
  }

  trackById(index: number, item: any): string {
    return item.id;
  }
}
