import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { BilingualInputComponent } from '../components/bilingual-input/bilingual-input.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchPageConfigService, SearchPageConfig } from '../../../../core/services/page-configs/search-page-config.service';
import { SectionCardComponent } from '../components/section-card/section-card.component';
import { LucideAngularModule, Trash2 } from 'lucide-angular';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { getEnglishTranslation } from '../../../../core/utils/config-sanitizer';

@Component({
  selector: 'app-search-page-editor',
  standalone: true,
  imports: [TranslatePipe, TranslateDirective, CommonModule, FormsModule, LucideAngularModule, SectionCardComponent, BilingualInputComponent],
  template: `
    <div *ngIf="localConfig" class="w-full flex flex-col gap-2 pb-24" dir="rtl">
      <div class="text-center mb-4">
        <h2 class="text-xl font-bold text-gray-900 mb-1">{{ 'DASHBOARD.AUTO_STR_364' | translate }}</h2>
        <p class="text-sm text-gray-500">{{ 'DASHBOARD.AUTO_STR_32' | translate }}</p>
      </div>

      <app-section-card title="إعدادات حقل البحث" [index]="0" [enabled]="localConfig.showSearchField !== false" [isFirst]="true" [isLast]="false" (toggle)="updateToggle('showSearchField', $event)" (duplicate)="noop()" (delete)="noop()" (moveUp)="noop()" (moveDown)="noop()" (onDragStart)="noop()" (onDragEnd)="noop()" (onDragOver)="noop()" (onDrop)="noop()">
        <app-bilingual-input title="نص حقل البحث (Placeholder)" labelAr="عربي / AR" labelEn="English / EN" 
                [(valueAr)]="localConfig.searchPlaceholderAr" 
                [(valueEn)]="localConfig.searchPlaceholderEn" 
                (valueChange)="updateBilingualField('searchPlaceholder', $event.lang, $event.value)"></app-bilingual-input>
      </app-section-card>

      <app-section-card title="عمليات البحث الشائعة" [index]="1" [enabled]="localConfig.showQuickSuggestions !== false" [isFirst]="false" [isLast]="false" (toggle)="updateToggle('showQuickSuggestions', $event)" (duplicate)="noop()" (delete)="noop()" (moveUp)="noop()" (moveDown)="noop()" (onDragStart)="noop()" (onDragEnd)="noop()" (onDragOver)="noop()" (onDrop)="noop()" [addAction]="{ label: 'إضافة كلمة', onClick: addSuggestion.bind(this) }">
        <app-bilingual-input title="عنوان القسم" labelAr="عربي / AR" labelEn="English / EN" 
                [(valueAr)]="localConfig.quickSuggestionsTitleAr" 
                [(valueEn)]="localConfig.quickSuggestionsTitleEn" 
                (valueChange)="updateBilingualField('quickSuggestionsTitle', $event.lang, $event.value)"></app-bilingual-input>
        <div class="flex flex-col gap-2 mt-2">
          <div *ngFor="let sugg of localConfig.quickSuggestions || []; let idx = index; trackBy: trackBySuggestionId" class="flex gap-2 bg-gray-50 border border-gray-200 rounded-lg p-2 items-start">
            <div class="flex flex-col sm:flex-row gap-2 w-full">
               <div class="w-full">
                 <span class="text-xs font-bold text-gray-500 mb-1 block">عربي / AR</span>
                 <input type="text" dir="rtl" class="w-full text-sm bg-white border border-gray-200 rounded-md px-2 py-1" [(ngModel)]="sugg.textAr" (ngModelChange)="onSuggestionChanged(idx)" />
               </div>
               <div class="w-full">
                 <span class="text-xs font-bold text-gray-500 mb-1 block text-left">English / EN</span>
                 <input type="text" dir="ltr" class="w-full text-sm bg-white border border-gray-200 rounded-md px-2 py-1" [(ngModel)]="sugg.textEn" (ngModelChange)="onSuggestionChanged(idx)" />
               </div>
            </div>
            <button (click)="removeSuggestion(idx)" class="p-2 mt-5 text-red-400 hover:text-red-600">
              <lucide-icon name="trash-2" [size]="16"></lucide-icon>
            </button>
          </div>
        </div>
      </app-section-card>

      <app-section-card title="عمليات البحث الأخيرة" [index]="2" [enabled]="localConfig.showRecentSearch !== false" [isFirst]="false" [isLast]="false" (toggle)="updateToggle('showRecentSearch', $event)" (duplicate)="noop()" (delete)="noop()" (moveUp)="noop()" (moveDown)="noop()" (onDragStart)="noop()" (onDragEnd)="noop()" (onDragOver)="noop()" (onDrop)="noop()">
        <app-bilingual-input title="عنوان القسم" labelAr="عربي / AR" labelEn="English / EN" 
                [(valueAr)]="localConfig.recentSearchTitleAr" 
                [(valueEn)]="localConfig.recentSearchTitleEn" 
                (valueChange)="updateBilingualField('recentSearchTitle', $event.lang, $event.value)"></app-bilingual-input>
      </app-section-card>

      <app-section-card title="حالة عدم وجود نتائج" [index]="3" [enabled]="localConfig.showNoResults !== false" [isFirst]="false" [isLast]="false" (toggle)="updateToggle('showNoResults', $event)" (duplicate)="noop()" (delete)="noop()" (moveUp)="noop()" (moveDown)="noop()" (onDragStart)="noop()" (onDragEnd)="noop()" (onDragOver)="noop()" (onDrop)="noop()">
        <app-bilingual-input title="العنوان" labelAr="عربي / AR" labelEn="English / EN" 
                [(valueAr)]="localConfig.noResultsTitleAr" 
                [(valueEn)]="localConfig.noResultsTitleEn" 
                (valueChange)="updateBilingualField('noResultsTitle', $event.lang, $event.value)"></app-bilingual-input>
        <app-bilingual-input title="الوصف الفرعي" labelAr="عربي / AR" labelEn="English / EN" 
                [(valueAr)]="localConfig.noResultsSubtitleAr" 
                [(valueEn)]="localConfig.noResultsSubtitleEn" 
                (valueChange)="updateBilingualField('noResultsSubtitle', $event.lang, $event.value)"></app-bilingual-input>
      </app-section-card>

      <app-section-card title="المنتجات المقترحة" [index]="4" [enabled]="localConfig.showSuggestedProducts !== false" [isFirst]="false" [isLast]="false" (toggle)="updateToggle('showSuggestedProducts', $event)" (duplicate)="noop()" (delete)="noop()" (moveUp)="noop()" (moveDown)="noop()" (onDragStart)="noop()" (onDragEnd)="noop()" (onDragOver)="noop()" (onDrop)="noop()">
        <app-bilingual-input title="عنوان المنتجات المقترحة" labelAr="عربي / AR" labelEn="English / EN" 
                [(valueAr)]="localConfig.suggestedProductsTitleAr" 
                [(valueEn)]="localConfig.suggestedProductsTitleEn" 
                (valueChange)="updateBilingualField('suggestedProductsTitle', $event.lang, $event.value)"></app-bilingual-input>
      </app-section-card>

      <app-section-card title="بطاقة الدعم والمساعدة" [index]="5" [enabled]="localConfig.showSupportCard !== false" [isFirst]="false" [isLast]="true" (toggle)="updateToggle('showSupportCard', $event)" (duplicate)="noop()" (delete)="noop()" (moveUp)="noop()" (moveDown)="noop()" (onDragStart)="noop()" (onDragEnd)="noop()" (onDragOver)="noop()" (onDrop)="noop()">
        <app-bilingual-input title="عنوان البطاقة" labelAr="عربي / AR" labelEn="English / EN" 
                [(valueAr)]="localConfig.supportCardTitleAr" 
                [(valueEn)]="localConfig.supportCardTitleEn" 
                (valueChange)="updateBilingualField('supportCardTitle', $event.lang, $event.value)"></app-bilingual-input>
        <app-bilingual-input title="النص الفرعي" labelAr="عربي / AR" labelEn="English / EN" 
                [(valueAr)]="localConfig.supportCardSubtitleAr" 
                [(valueEn)]="localConfig.supportCardSubtitleEn" 
                (valueChange)="updateBilingualField('supportCardSubtitle', $event.lang, $event.value)"></app-bilingual-input>
      </app-section-card>
    </div>
  `
})
export class SearchPageEditorComponent implements OnInit, OnDestroy {
  readonly configService = inject(SearchPageConfigService);
  readonly Trash2 = Trash2;

  localConfig: any = null;
  private updateSubject = new Subject<void>();
  private sub?: Subscription;

  ngOnInit() {
    this.initLocalConfig();
    this.sub = this.updateSubject.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.flushSave();
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  private initLocalConfig() {
    const raw = this.configService.pageConfig();
    const c: any = JSON.parse(JSON.stringify(raw));

    c.showSearchField = c.showSearchField !== false;
    c.showQuickSuggestions = c.showQuickSuggestions !== false;
    c.showRecentSearch = c.showRecentSearch !== false;
    c.showNoResults = c.showNoResults !== false;
    c.showSuggestedProducts = c.showSuggestedProducts !== false;
    c.showSupportCard = c.showSupportCard !== false;
    
    // Backfill localized fields if needed
    const fields = [
      'searchPlaceholder', 'quickSuggestionsTitle', 'recentSearchTitle', 
      'noResultsTitle', 'noResultsSubtitle', 'supportCardTitle', 'supportCardSubtitle', 'suggestedProductsTitle'
    ];
    for (const f of fields) {
      if (!c[f + 'Ar'] && c[f]) {
        c[f + 'Ar'] = c[f];
      }
      if (!c[f + 'En']) {
        c[f + 'En'] = getEnglishTranslation(c[f + 'Ar'] || c[f] || '', '');
      } else if (/[\u0600-\u06FF]/.test(c[f + 'En'])) {
        c[f + 'En'] = getEnglishTranslation(c[f + 'En'], '');
      }
    }
    
    if (c.quickSuggestions && c.quickSuggestions.length > 0) {
      c.quickSuggestions = c.quickSuggestions.map((s: any, idx: number) => {
        if (typeof s === 'string') {
          return { id: 'qs-' + (idx + 1), text: s, textAr: s, textEn: getEnglishTranslation(s, 'Search Keyword') };
        }
        const item = { id: s.id || ('qs-' + (idx + 1)), ...s };
        if (!item.textAr && item.text) item.textAr = item.text;
        if (!item.textEn) {
          item.textEn = getEnglishTranslation(item.textAr || item.text || '', 'Search Keyword');
        } else if (/[\u0600-\u06FF]/.test(item.textEn)) {
          item.textEn = getEnglishTranslation(item.textEn, 'Search Keyword');
        }
        return item;
      });
    }

    this.localConfig = c;
  }

  noop() {}

  updateBilingualField(field: string, lang: 'Ar' | 'En', value: string) {
    if (!this.localConfig) return;
    this.localConfig[field + lang] = value;
    this.localConfig[field] = this.localConfig[field + 'Ar'] || this.localConfig[field + 'En'];
    this.updateSubject.next();
  }

  onSuggestionChanged(index: number) {
    if (!this.localConfig?.quickSuggestions?.[index]) return;
    const item = this.localConfig.quickSuggestions[index];
    item.text = item.textAr || item.textEn || '';
    this.updateSubject.next();
  }

  addSuggestion() {
    if (!this.localConfig) return;
    const newId = 'qs-' + Date.now();
    this.localConfig.quickSuggestions = [
      ...(this.localConfig.quickSuggestions || []),
      { id: newId, text: 'مشد كولومبي', textAr: 'مشد كولومبي', textEn: 'Colombian Corset' }
    ];
    this.flushSave();
  }

  removeSuggestion(index: number) {
    if (!this.localConfig?.quickSuggestions) return;
    this.localConfig.quickSuggestions.splice(index, 1);
    this.localConfig.quickSuggestions = [...this.localConfig.quickSuggestions];
    this.flushSave();
  }

  updateToggle(field: string, enabled: boolean) {
    if (!this.localConfig) return;
    this.localConfig[field] = enabled;
    this.flushSave();
  }

  trackBySuggestionId(index: number, item: any): string {
    return item?.id || index.toString();
  }

  private flushSave() {
    if (!this.localConfig) return;
    this.configService.updateConfig(JSON.parse(JSON.stringify(this.localConfig)));
  }
}
