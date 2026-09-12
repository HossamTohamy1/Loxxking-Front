import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Smartphone, Monitor, Eye, Undo2, Redo2, Lock } from 'lucide-angular';
import { Subscription } from 'rxjs';
import { LivePreviewComponent } from './live-preview.component';
import { EditorRouterComponent } from './editors/editor-router.component';
import { AdminLayoutComponent } from '../../../shared/components/layout/admin-layout/admin-layout.component';
import { PreviewScrollService } from '../../../core/services/page-configs/preview-scroll.service';
import { dbSyncStatus, forceSaveAllConfigsToDatabase } from '../../../core/services/page-configs/config-sync.util';

@Component({
  selector: 'app-customize-home-page',
  standalone: true,
  imports: [TranslatePipe, TranslateDirective, 
    CommonModule, 
    LucideAngularModule, 
    LivePreviewComponent, 
    EditorRouterComponent,
    AdminLayoutComponent
  ],
  template: `
    <app-admin-layout>
      <div class="flex flex-col h-full bg-gray-50/50">
        <!-- Toolbar -->
        <div class="flex items-center justify-between p-4 flex-row-reverse bg-white border-b border-gray-200">
          <div class="flex flex-col items-center gap-4">
            <h1 class="text-xl font-black text-gray-900 tracking-tight">{{ 'DASHBOARD.AUTO_STR_270' | translate }}</h1>
            <span class="text-sm text-gray-500 hidden md:inline">
              قم بتخصيص وتعديل واجهات المتجر المختلفة. ستظهر التغييرات بشكل مباشر.
            </span>
          </div>

          <div class="flex flex-row-reverse items-center gap-4">
            <!-- Quick Navigation Dropdown (placeholder) -->
            <div class="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700">
                <span class="text-gray-500 font-medium">الصفحة الحالية:</span>
                <span class="font-bold font-mono text-xs">{{ currentRoute }}</span>
            </div>

            <!-- Mode Switcher -->
            <div class="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
              <button
                (click)="previewMode = 'mobile'"
                [class.bg-white]="previewMode === 'mobile'"
                [class.shadow-sm]="previewMode === 'mobile'"
                [class.text-blue-600]="previewMode === 'mobile'"
                [class.text-gray-500]="previewMode !== 'mobile'"
                class="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all"
              >
                <lucide-icon name="smartphone" [size]="16"></lucide-icon>
                <span>{{ 'DASHBOARD.AUTO_STR_40' | translate }}</span>
              </button>
              <button
                (click)="previewMode = 'desktop'"
                [class.bg-white]="previewMode === 'desktop'"
                [class.shadow-sm]="previewMode === 'desktop'"
                [class.text-blue-600]="previewMode === 'desktop'"
                [class.text-gray-500]="previewMode !== 'desktop'"
                class="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all"
              >
                <lucide-icon name="monitor" [size]="16"></lucide-icon>
                <span>{{ 'DASHBOARD.AUTO_STR_150' | translate }}</span>
              </button>
            </div>
          </div>

          <div class="flex flex-row-reverse items-center gap-3">
            <!-- Database Sync Indicator -->
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300"
                 [ngClass]="{
                   'bg-amber-50 text-amber-700 border-amber-200': dbStatus() === 'saving' || isManualSaving,
                   'bg-emerald-50 text-emerald-700 border-emerald-200': dbStatus() === 'saved' || dbStatus() === 'idle',
                   'bg-rose-50 text-rose-700 border-rose-200': dbStatus() === 'error'
                 }">
              <span class="relative flex h-2 w-2">
                <span *ngIf="dbStatus() === 'saving' || isManualSaving"
                      class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2"
                      [ngClass]="{
                        'bg-amber-500': dbStatus() === 'saving' || isManualSaving,
                        'bg-emerald-500': dbStatus() === 'saved' || dbStatus() === 'idle',
                        'bg-rose-500': dbStatus() === 'error'
                      }"></span>
              </span>
              <span *ngIf="dbStatus() === 'saving' || isManualSaving">جاري الحفظ في قاعدة البيانات...</span>
              <span *ngIf="dbStatus() === 'saved'">تم الحفظ في قاعدة البيانات</span>
              <span *ngIf="dbStatus() === 'idle'">متصل بقاعدة البيانات</span>
              <span *ngIf="dbStatus() === 'error'">تعذر الحفظ في قاعدة البيانات</span>
            </div>

            <button
              type="button"
              (click)="manualSave()"
              [disabled]="isManualSaving || dbStatus() === 'saving'"
              class="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
              <lucide-icon name="lock" [size]="16" class="mb-0.5"></lucide-icon>
              <span>{{ (isManualSaving || dbStatus() === 'saving') ? 'جاري الحفظ...' : 'حفظ في قاعدة البيانات' }}</span>
            </button>
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="flex flex-col lg:flex-row p-4 lg:p-6 gap-6 lg:gap-8 items-start relative min-h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] overflow-y-auto lg:overflow-hidden">
          <!-- Editor Area (Right side in RTL) -->
          <div id="lk-editor-scroll-container" class="w-full lg:flex-1 min-h-[500px] lg:h-full relative overflow-y-visible lg:overflow-y-auto custom-scrollbar no-scrollbar rounded-2xl bg-white border border-gray-200 shadow-sm p-4 lg:p-5">
             <app-editor-router [currentRoute]="currentRoute"></app-editor-router>
          </div>

          <!-- Live Preview Area (Left side in RTL) -->
          <div class="w-full lg:w-[45%] flex-shrink-0 flex justify-center h-[800px] lg:h-full overflow-hidden mt-6 lg:mt-0">
            <app-live-preview [mode]="previewMode"></app-live-preview>
          </div>
        </div>
      </div>
    </app-admin-layout>
  `
})
export class CustomizeHomePageComponent implements OnInit, OnDestroy {
  previewMode: 'mobile' | 'desktop' = 'mobile';
  currentRoute: string = '/';
  private scrollSub?: Subscription;

  readonly dbStatus = dbSyncStatus;
  isManualSaving = false;

  async manualSave() {
    this.isManualSaving = true;
    await forceSaveAllConfigsToDatabase();
    this.isManualSaving = false;
  }

  constructor(
    private zone: NgZone,
    private previewScrollService: PreviewScrollService
  ) {}

  private messageHandler = (event: MessageEvent) => {
    if (event.data?.type === 'STOREFRONT_ROUTE_CHANGE' && event.data.pathname) {
      this.zone.run(() => {
        this.currentRoute = event.data.pathname;
      });
    }
  };

  ngOnInit() {
    window.addEventListener('message', this.messageHandler);
    this.scrollSub = this.previewScrollService.scrollToEditorTop$.subscribe(() => {
      const container = document.getElementById('lk-editor-scroll-container');
      if (container) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  ngOnDestroy() {
    window.removeEventListener('message', this.messageHandler);
    this.scrollSub?.unsubscribe();
  }
}
