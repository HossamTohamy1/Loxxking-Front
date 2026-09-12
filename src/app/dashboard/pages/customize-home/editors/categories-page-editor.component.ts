import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { SectionCardComponent } from '../components/section-card/section-card.component';
import { Component, inject} from '@angular/core';
import { BilingualInputComponent } from '../components/bilingual-input/bilingual-input.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriesPageConfigService, CategoriesPageConfig } from '../../../../core/services/page-configs/categories-page-config.service';
import { getEnglishTranslation } from '../../../../core/utils/config-sanitizer';

@Component({
  selector: 'app-categories-page-editor',
  standalone: true,
  imports: [TranslatePipe, TranslateDirective, CommonModule, FormsModule, SectionCardComponent, BilingualInputComponent],
  
  template: `
    <div class="w-full flex flex-col gap-2 pb-24" dir="rtl">
        <div class="text-center mb-4">
            <h2 class="text-xl font-bold text-gray-900 mb-1">{{ 'DASHBOARD.AUTO_STR_201' | translate }}</h2>
            <p class="text-sm text-gray-500">{{ 'DASHBOARD.AUTO_STR_13' | translate }}</p>
        </div>

        <app-section-card 
            title="الرأس" 
            [index]="0" 
            [enabled]="config().showTitle" 
            [isFirst]="true" 
            [isLast]="false" 
            (toggle)="updateConfig({showTitle: $event})"
            (duplicate)="noop()"
            (delete)="noop()"
            (moveUp)="noop()"
            (moveDown)="noop()"
            (onDragStart)="noop()"
            (onDragEnd)="noop()"
            (onDragOver)="noop()"
            (onDrop)="noop()">
            
            <app-bilingual-input title="DASHBOARD.AUTO_STR_178" labelAr="عربي / AR" labelEn="English / EN" 
                [valueAr]="$any(config())['headerTitleAr'] || ''" 
                [valueEn]="$any(config())['headerTitleEn'] || ''" 
                (valueChange)="updateBilingualField('headerTitle', $event.lang, $event.value)"></app-bilingual-input>
            <app-bilingual-input title="DASHBOARD.AUTO_STR_316" labelAr="عربي / AR" labelEn="English / EN" 
                [valueAr]="$any(config())['headerSubtitleAr'] || ''" 
                [valueEn]="$any(config())['headerSubtitleEn'] || ''" 
                (valueChange)="updateBilingualField('headerSubtitle', $event.lang, $event.value)"></app-bilingual-input>
        </app-section-card>

        <app-section-card 
            title="التصنيفات" 
            [index]="1" 
            [enabled]="config().showCategories !== false" 
            [isFirst]="false" 
            [isLast]="true"
            (toggle)="updateConfig({showCategories: $event})"
            (duplicate)="noop()"
            (delete)="noop()"
            (moveUp)="noop()"
            (moveDown)="noop()"
            (onDragStart)="noop()"
            (onDragEnd)="noop()"
            (onDragOver)="noop()"
            (onDrop)="noop()">
            
            <div class="flex flex-col gap-3">
                <div *ngFor="let cat of config().categories; let idx = index; trackBy: trackByIndex" class="flex gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div class="flex flex-col gap-2 flex-1">
                        <div class="text-xs font-bold text-gray-500">التصنيف: {{cat.id}}</div>
                        <div class="grid grid-cols-2 gap-2" dir="rtl">
                            <div>
                                <span class="text-[10px] font-bold text-gray-500 mb-1 block text-right">العنوان الأول (عربي)</span>
                                <input type="text" dir="rtl" class="w-full text-sm bg-white border border-gray-200 rounded-md px-2 py-1 text-right" 
                                       [ngModel]="cat.titleAr" (ngModelChange)="updateCategory(idx, { titleAr: $event })" />
                            </div>
                            <div>
                                <span class="text-[10px] font-bold text-gray-500 mb-1 block text-left">Title (EN)</span>
                                <input type="text" dir="ltr" class="w-full text-sm bg-white border border-gray-200 rounded-md px-2 py-1 text-left" 
                                       [ngModel]="cat.titleEn" (ngModelChange)="updateCategory(idx, { titleEn: $event })" />
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-2" dir="rtl">
                            <div>
                                <span class="text-[10px] font-bold text-gray-500 mb-1 block text-right">الكلمة المميزة (عربي)</span>
                                <input type="text" dir="rtl" class="w-full text-sm font-bold bg-white border border-gray-200 rounded-md px-2 py-1 text-blue-600 text-right" 
                                       [ngModel]="cat.accentAr" (ngModelChange)="updateCategory(idx, { accentAr: $event })" />
                            </div>
                            <div>
                                <span class="text-[10px] font-bold text-gray-500 mb-1 block text-left">Accent (EN)</span>
                                <input type="text" dir="ltr" class="w-full text-sm font-bold bg-white border border-gray-200 rounded-md px-2 py-1 text-blue-600 text-left" 
                                       [ngModel]="cat.accentEn" (ngModelChange)="updateCategory(idx, { accentEn: $event })" />
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-2" dir="rtl">
                            <div>
                                <span class="text-[10px] font-bold text-gray-500 mb-1 block text-right">الوصف (عربي)</span>
                                <textarea class="w-full text-sm bg-white border border-gray-200 rounded-md px-2 py-1 text-right" 
                                          [ngModel]="cat.descriptionAr" (ngModelChange)="updateCategory(idx, { descriptionAr: $event })" rows="2" dir="rtl"></textarea>
                            </div>
                            <div>
                                <span class="text-[10px] font-bold text-gray-500 mb-1 block text-left">Description (EN)</span>
                                <textarea class="w-full text-sm bg-white border border-gray-200 rounded-md px-2 py-1 text-left" 
                                          [ngModel]="cat.descriptionEn" (ngModelChange)="updateCategory(idx, { descriptionEn: $event })" rows="2" dir="ltr"></textarea>
                            </div>
                        </div>
                        <div>
                            <span class="text-[10px] font-bold text-gray-500 mb-1 block">الرابط</span>
                            <input type="text" class="w-full text-sm bg-white border border-gray-200 rounded-md px-2 py-1" 
                                   [ngModel]="cat.path" (ngModelChange)="updateCategory(idx, { path: $event })" dir="ltr" />
                        </div>
                    </div>
                </div>
            </div>
        </app-section-card>
        
        
    </div>
  `
})
export class CategoriesPageEditorComponent {
  private configService = inject(CategoriesPageConfigService);
  config = this.configService.pageConfig;

  constructor() {
    this.backfillLocalizedStrings();
  }

  backfillLocalizedStrings() {
    const c: any = { ...this.config() };
    let changed = false;
    const ARABIC_REGEX = /[\u0600-\u06FF]/;
    const fields = [
      'headerTitle', 'headerSubtitle'
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
    
    if (c.categories && c.categories.length > 0) {
      const newCats = c.categories.map((cat: any) => {
        let catChanged = false;
        if (cat.title && !cat.titleAr) {
          cat.titleAr = cat.title;
          catChanged = true;
        }
        if (!cat.titleEn || ARABIC_REGEX.test(cat.titleEn)) {
          cat.titleEn = getEnglishTranslation(cat.titleAr || cat.title, 'Category');
          catChanged = true;
        }
        if (cat.accent && !cat.accentAr) {
          cat.accentAr = cat.accent;
          catChanged = true;
        }
        if (!cat.accentEn || ARABIC_REGEX.test(cat.accentEn)) {
          cat.accentEn = getEnglishTranslation(cat.accentAr || cat.accent, 'Collection');
          catChanged = true;
        }
        if (cat.description && !cat.descriptionAr) {
          cat.descriptionAr = cat.description;
          catChanged = true;
        }
        if (!cat.descriptionEn || ARABIC_REGEX.test(cat.descriptionEn)) {
          cat.descriptionEn = getEnglishTranslation(cat.descriptionAr || cat.description, 'Explore our curated collection');
          catChanged = true;
        }
        if (catChanged) changed = true;
        return cat;
      });
      c.categories = newCats;
    }

    if (changed) {
      this.configService.updateConfig(c);
    }
  }

  updateConfig(updates: Partial<CategoriesPageConfig>) {
    this.configService.updateConfig({ ...this.config(), ...updates });
  }

  updateCategory(index: number, updates: any) {
    const cats = [...(this.config().categories || [])];
    const old = cats[index];
    const newVal = { ...old, ...updates };
    
    // For Ar/En updates, preserve the main field as the fallback.
    // E.g. if titleAr is updated, set title to titleEn || titleAr
    if (updates.titleAr !== undefined || updates.titleEn !== undefined) {
      newVal.title = newVal.titleEn || newVal.titleAr;
    }
    if (updates.accentAr !== undefined || updates.accentEn !== undefined) {
      newVal.accent = newVal.accentEn || newVal.accentAr;
    }
    if (updates.descriptionAr !== undefined || updates.descriptionEn !== undefined) {
      newVal.description = newVal.descriptionEn || newVal.descriptionAr;
    }
    
    cats[index] = newVal;
    this.updateConfig({ categories: cats });
  }

  updateBilingualField(field: string, lang: 'Ar' | 'En', value: string) {
    const current = { ...this.config() } as any;
    current[field + lang] = value;
    current[field] = current[field + 'En'] || current[field + 'Ar'];
    this.updateConfig(current);
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  noop() {}
}
