import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { StoreLayoutComponent } from '../../../shared/components/layout/store-layout/store-layout.component';
import { LucideAngularModule, Bell, Package, Tag, MessageCircle, Info, CheckCheck } from 'lucide-angular';
import { NotificationsPageConfigService } from '../../../core/services/page-configs/notifications-page-config.service';
import { LangService } from '../../../core/services/lang/lang.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { notifications as initialNotifs, Notification } from '../../../shared/data/mockData';
import { t } from '../../../shared/i18n/translations';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [CommonModule, StoreLayoutComponent, LucideAngularModule, TranslatePipe, TranslateDirective],
  templateUrl: './notifications-page.component.html',
  styleUrl: './notifications-page.component.css'
})
export class NotificationsPageComponent {
  readonly configService = inject(NotificationsPageConfigService);
  readonly langService = inject(LangService);
  readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  notifs = signal<Notification[]>([...initialNotifs]);
  unread = computed(() => this.notifs().filter(n => !n.read).length);
  
  readonly Bell = Bell;
  readonly Package = Package;
  readonly Tag = Tag;
  readonly MessageCircle = MessageCircle;
  readonly Info = Info;
  readonly CheckCheck = CheckCheck;
  readonly t = t;

  markAllRead() {
    this.notifs.update(prev => prev.map(n => ({ ...n, read: true })));
    this.notificationService.setUnreadCount(0);
  }

  handleNotifClick(n: Notification) {
    this.notifs.update(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
    const currentUnread = this.notificationService.unreadCount();
    this.notificationService.setUnreadCount(Math.max(0, currentUnread - (n.read ? 0 : 1)));
    
    if (n.orderId) this.router.navigate(['/orders']);
    if (n.type === 'chat') this.router.navigate(['/chat']);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(
      this.langService.lang() === 'ar' ? 'ar-EG' : 'en-US', 
      { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    );
  }
}
