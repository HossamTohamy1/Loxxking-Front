import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, CheckCircle, Package, MessageCircle } from 'lucide-angular';
import { StoreLayoutComponent } from '../../../shared/components/layout/store-layout/store-layout.component';

import { OrderConfirmationPageConfigService } from '../../../core/services/page-configs/order-confirmation-page-config.service';

@Component({
  selector: 'app-order-confirmation-page',
  standalone: true,
  imports: [TranslatePipe, TranslateDirective, 
    CommonModule,
    RouterLink,
    StoreLayoutComponent,
    LucideAngularModule
  ],
  templateUrl: './order-confirmation-page.component.html'
})
export class OrderConfirmationPageComponent implements OnInit {
  private configService = inject(OrderConfirmationPageConfigService);
  pageConfig = this.configService.pageConfig;

  lang = signal('en');
  show = signal(false);
  orderNumber = signal('');

  ngOnInit() {
    this.orderNumber.set(`LK-2025-${Math.floor(1800 + Math.random() * 200)}`);
    setTimeout(() => {
      this.show.set(true);
    }, 100);
  }

  t(key: string, lang: string): string {
    const translations: Record<string, Record<string, string>> = {
      orderPlaced: { en: 'Order Placed!', ar: 'STOREFRONT.AUTO_STR_278' },
      orderSent: { en: 'Confirmation sent', ar: 'STOREFRONT.AUTO_STR_232' },
      orderNumber: { en: 'Order Number', ar: 'ORDERS.ORDER_NUMBER' },
      trackOrder: { en: 'Track Order', ar: 'STOREFRONT.AUTO_STR_397' },
      continueShopping: { en: 'Continue Shopping', ar: 'COMMON.CONTINUESHOPPING' }
    };
    return translations[key]?.[lang] || key;
  }
}
