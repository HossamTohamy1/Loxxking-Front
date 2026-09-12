import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MyOrdersPageConfigService } from '../../../../core/services/page-configs/my-orders-page-config.service';
import { SectionCardComponent } from '../components/section-card/section-card.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-my-orders-page-editor',
  standalone: true,
  imports: [TranslatePipe, TranslateDirective, CommonModule, FormsModule, SectionCardComponent, LucideAngularModule],
  template: `
    <div class="w-full flex flex-col gap-2 pb-24" dir="rtl">
        <div class="text-center mb-4">
            <h2 class="text-xl font-bold text-gray-900 mb-1">{{ 'DASHBOARD.AUTO_STR_102' | translate }}</h2>
            <p class="text-sm text-gray-500">{{ 'DASHBOARD.AUTO_STR_59' | translate }}</p>
        </div>

        <app-section-card title="رأس الصفحة وحقول البحث" [index]="0" [enabled]="config().showHeader !== false" [isFirst]="true" [isLast]="false" (toggle)="updateConfig({showHeader: $event})">
            <div class="flex flex-col gap-1.5 mb-3">
                <span class="text-xs font-bold text-gray-700">{{ 'DASHBOARD.AUTO_STR_178' | translate }}</span>
                <input type="text" class="w-full text-sm bg-gray-50 border border-gray-200 rounded-md px-3 py-2 outline-none focus:border-blue-500" [ngModel]="config().headerTitle" (ngModelChange)="updateConfig({headerTitle: $event})" />
            </div>
            <div class="flex flex-col gap-1.5 mb-3">
                <span class="text-xs font-bold text-gray-700">{{ 'DASHBOARD.AUTO_STR_316' | translate }}</span>
                <textarea class="w-full text-sm bg-gray-50 border border-gray-200 rounded-md px-3 py-2 outline-none focus:border-blue-500" [ngModel]="config().headerSubtitle" (ngModelChange)="updateConfig({headerSubtitle: $event})" rows="3"></textarea>
            </div>
            <hr class="my-3 border-gray-100" />
            <div class="flex flex-col gap-1.5 mb-3">
                <span class="text-xs font-bold text-gray-700">{{ 'DASHBOARD.AUTO_STR_243' | translate }}</span>
                <input type="text" class="w-full text-sm bg-gray-50 border border-gray-200 rounded-md px-3 py-2 outline-none focus:border-blue-500" [ngModel]="config().phonePlaceholder" (ngModelChange)="updateConfig({phonePlaceholder: $event})" />
            </div>
            <div class="flex flex-col gap-1.5 mb-3">
                <span class="text-xs font-bold text-gray-700">{{ 'DASHBOARD.AUTO_STR_289' | translate }}</span>
                <input type="text" class="w-full text-sm bg-gray-50 border border-gray-200 rounded-md px-3 py-2 outline-none focus:border-blue-500" [ngModel]="config().orderPlaceholder" (ngModelChange)="updateConfig({orderPlaceholder: $event})" />
            </div>
            <div class="flex flex-col gap-1.5 mb-3">
                <span class="text-xs font-bold text-gray-700">{{ 'DASHBOARD.AUTO_STR_330' | translate }}</span>
                <input type="text" class="w-full text-sm bg-gray-50 border border-gray-200 rounded-md px-3 py-2 outline-none focus:border-blue-500" [ngModel]="config().buttonText" (ngModelChange)="updateConfig({buttonText: $event})" />
            </div>
        </app-section-card>

        <app-section-card title="الحالات الفارغة" [index]="1" [enabled]="config().showEmptyState !== false" [isFirst]="false" [isLast]="false" (toggle)="updateConfig({showEmptyState: $event})">
            <div class="mb-2 font-bold text-sm text-gray-800">حالة: لا توجد طلبات</div>
            <div class="flex flex-col gap-1.5 mb-3">
                <span class="text-xs font-bold text-gray-700">{{ 'COMMON.ADDRESS' | translate }}</span>
                <input type="text" class="w-full text-sm bg-gray-50 border border-gray-200 rounded-md px-3 py-2 outline-none focus:border-blue-500" [ngModel]="config().emptyTitle" (ngModelChange)="updateConfig({emptyTitle: $event})" />
            </div>
            <div class="flex flex-col gap-1.5 mb-3">
                <span class="text-xs font-bold text-gray-700">{{ 'DASHBOARD.AUTO_STR_449' | translate }}</span>
                <textarea class="w-full text-sm bg-gray-50 border border-gray-200 rounded-md px-3 py-2 outline-none focus:border-blue-500" [ngModel]="config().emptyText" (ngModelChange)="updateConfig({emptyText: $event})" rows="3"></textarea>
            </div>
            <div class="flex flex-col gap-1.5 mb-3">
                <span class="text-xs font-bold text-gray-700">{{ 'DASHBOARD.AUTO_STR_283' | translate }}</span>
                <input type="text" class="w-full text-sm bg-gray-50 border border-gray-200 rounded-md px-3 py-2 outline-none focus:border-blue-500" [ngModel]="config().emptyCta" (ngModelChange)="updateConfig({emptyCta: $event})" />
            </div>
            
            <hr class="my-3 border-gray-100" />
            <div class="mb-2 font-bold text-sm text-gray-800">حالة: لم يتم العثور على الطلب</div>
            <div class="flex flex-col gap-1.5 mb-3">
                <span class="text-xs font-bold text-gray-700">{{ 'COMMON.ADDRESS' | translate }}</span>
                <input type="text" class="w-full text-sm bg-gray-50 border border-gray-200 rounded-md px-3 py-2 outline-none focus:border-blue-500" [ngModel]="config().notFoundTitle" (ngModelChange)="updateConfig({notFoundTitle: $event})" />
            </div>
            <div class="flex flex-col gap-1.5 mb-3">
                <span class="text-xs font-bold text-gray-700">{{ 'DASHBOARD.AUTO_STR_449' | translate }}</span>
                <textarea class="w-full text-sm bg-gray-50 border border-gray-200 rounded-md px-3 py-2 outline-none focus:border-blue-500" [ngModel]="config().notFoundText" (ngModelChange)="updateConfig({notFoundText: $event})" rows="3"></textarea>
            </div>
        </app-section-card>

        <app-section-card title="بطاقة الدعم" [index]="2" [enabled]="config().showSupportCard" [isFirst]="false" [isLast]="true" (toggle)="updateConfig({showSupportCard: $event})">
            <div class="flex flex-col gap-1.5 mb-3">
                <span class="text-xs font-bold text-gray-700">{{ 'DASHBOARD.AUTO_STR_245' | translate }}</span>
                <input type="text" class="w-full text-sm bg-gray-50 border border-gray-200 rounded-md px-3 py-2 outline-none focus:border-blue-500" [ngModel]="config().supportTitle" (ngModelChange)="updateConfig({supportTitle: $event})" />
            </div>
            <div class="flex flex-col gap-1.5 mb-3">
                <span class="text-xs font-bold text-gray-700">{{ 'DASHBOARD.AUTO_STR_362' | translate }}</span>
                <input type="text" class="w-full text-sm bg-gray-50 border border-gray-200 rounded-md px-3 py-2 outline-none focus:border-blue-500" [ngModel]="config().supportText" (ngModelChange)="updateConfig({supportText: $event})" />
            </div>
        </app-section-card>
    </div>
  `
})
export class MyOrdersPageEditorComponent {
  myOrdersService = inject(MyOrdersPageConfigService);
  config = this.myOrdersService.pageConfig;

  updateConfig(updates: Partial<ReturnType<typeof this.config>>) {
      this.myOrdersService.updateConfig({ ...this.config(), ...updates } as any);
  }
}
