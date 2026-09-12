import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { Component, inject } from '@angular/core';
import { BilingualInputComponent } from '../components/bilingual-input/bilingual-input.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AllShapersPageConfigService } from '../../../../core/services/page-configs/all-shapers-page-config.service';
import { SectionCardComponent } from '../components/section-card/section-card.component';
import { getEnglishTranslation } from '../../../../core/utils/config-sanitizer';

@Component({
  selector: 'app-all-shapers-page-editor',
  standalone: true,
  imports: [TranslatePipe, TranslateDirective, CommonModule, FormsModule, SectionCardComponent, BilingualInputComponent],
  template: `
    <div class="w-full flex flex-col gap-2 pb-24" dir="rtl">
      <div class="text-center mb-4">
        <h2 class="text-xl font-bold text-gray-900 mb-1">{{ 'DASHBOARD.AUTO_STR_226' | translate }}</h2>
        <p class="text-sm text-gray-500">إدارة صفحة 'كل المشدات'</p>
      </div>

      <app-section-card title="رأس الصفحة" [index]="0" [enabled]="config().showHeader !== false" [isFirst]="true" [isLast]="false"
        [draggable]="false" [showReorder]="false" [showCopy]="false" [showDelete]="false" (toggle)="updateConfig({ showHeader: $event })">
        <app-bilingual-input title="DASHBOARD.AUTO_STR_178" labelAr="عربي / AR" labelEn="English / EN" 
                [valueAr]="$any(config())['headerTitleAr'] || ''" 
                [valueEn]="$any(config())['headerTitleEn'] || ''" 
                (valueChange)="updateBilingualField('headerTitle', $event.lang, $event.value)"></app-bilingual-input>
      </app-section-card>

      <app-section-card title="تفاصيل بطاقة المنتج" [index]="1" [showToggle]="false" [enabled]="true" [isFirst]="false" [isLast]="false"
        [draggable]="false" [showReorder]="false" [showCopy]="false" [showDelete]="false">
        <div class="flex items-center gap-2 mb-2">
          <input type="checkbox" [ngModel]="config().showRating" (ngModelChange)="updateConfig({ showRating: $event })" class="rounded text-blue-600 focus:ring-blue-500" />
          <span class="text-sm font-medium">إظهار النجوم (التقييم)</span>
        </div>
        <div class="flex items-center gap-2 mb-2">
          <input type="checkbox" [ngModel]="config().showReviewsCount" (ngModelChange)="updateConfig({ showReviewsCount: $event })" class="rounded text-blue-600 focus:ring-blue-500" />
          <span class="text-sm font-medium">{{ 'DASHBOARD.AUTO_STR_99' | translate }}</span>
        </div>
        <div class="flex items-center gap-2 mb-2">
          <input type="checkbox" [ngModel]="config().showOriginalPrice" (ngModelChange)="updateConfig({ showOriginalPrice: $event })" class="rounded text-blue-600 focus:ring-blue-500" />
          <span class="text-sm font-medium">إظهار السعر قبل الخصم (إذا وُجد)</span>
        </div>
      </app-section-card>

      <app-section-card title="حالة عدم وجود نتائج" [index]="2" [enabled]="config().showEmptyState !== false" [isFirst]="false" [isLast]="true"
        [draggable]="false" [showReorder]="false" [showCopy]="false" [showDelete]="false" (toggle)="updateConfig({ showEmptyState: $event })">
        <app-bilingual-input title="COMMON.ADDRESS" labelAr="عربي / AR" labelEn="English / EN" 
                [valueAr]="$any(config())['emptyTitleAr'] || ''" 
                [valueEn]="$any(config())['emptyTitleEn'] || ''" 
                (valueChange)="updateBilingualField('emptyTitle', $event.lang, $event.value)"></app-bilingual-input>
        <app-bilingual-input title="DASHBOARD.AUTO_STR_449" labelAr="عربي / AR" labelEn="English / EN" 
                [valueAr]="$any(config())['emptyTextAr'] || ''" 
                [valueEn]="$any(config())['emptyTextEn'] || ''" 
                (valueChange)="updateBilingualField('emptyText', $event.lang, $event.value)"></app-bilingual-input>
        <app-bilingual-input title="DASHBOARD.AUTO_STR_275" labelAr="عربي / AR" labelEn="English / EN" 
                [valueAr]="$any(config())['emptyCtaAr'] || ''" 
                [valueEn]="$any(config())['emptyCtaEn'] || ''" 
                (valueChange)="updateBilingualField('emptyCta', $event.lang, $event.value)"></app-bilingual-input>
      </app-section-card>
    </div>
  `
})
export class AllShapersPageEditorComponent {
  private configService = inject(AllShapersPageConfigService);
  config = this.configService.pageConfig;

  constructor() {
    this.backfillLocalizedStrings();
  }

  backfillLocalizedStrings() {
    const c: any = { ...this.config() };
    let changed = false;
    const ARABIC_REGEX = /[\u0600-\u06FF]/;
    const fields = [
      'headerTitle', 'emptyTitle', 'emptyText', 'emptyCta'
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

    if (changed) {
      this.configService.updateConfig(c);
    }
  }

  updateConfig(updates: Partial<any>) {
    this.configService.updateConfig({ ...this.config(), ...updates });
  }

  updateBilingualField(field: string, lang: 'Ar' | 'En', value: string) {
    const current = { ...this.config() } as any;
    current[field + lang] = value;
    current[field] = current[field + 'Ar'] || current[field + 'En'];
    this.updateConfig(current);
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
}
