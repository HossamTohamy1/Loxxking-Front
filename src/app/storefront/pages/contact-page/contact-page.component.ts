import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { StoreLayoutComponent } from '../../../shared/components/layout/store-layout/store-layout.component';
import { HomeHeaderComponent } from '../../../shared/components/layout/home-header/home-header.component';
import { LocalizeFieldPipe } from '../../../shared/pipes/localize-field.pipe';
import { ContactPageConfigService } from '../../../core/services/page-configs/contact-page-config.service';
import { ToastService } from '../../../core/services/toast/toast.service';
import {
  LucideAngularModule,
  ArrowLeft,
  ChevronLeft,
  Grid2X2,
  Heart,
  Home,
  Mail,
  MoreHorizontal,
  PencilLine,
  Phone,
  Send,
  User,
  UserRound
} from 'lucide-angular';

type ContactMethodDef = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  icon: string;
  external?: boolean;
  ltr?: boolean;
};

type ContactFormState = {
  name: string;
  phone: string;
  email: string;
  message: string;
};

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [TranslatePipe, TranslateDirective, 
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive,
    StoreLayoutComponent,
    HomeHeaderComponent,
    LucideAngularModule,
    LocalizeFieldPipe
  ],
  templateUrl: './contact-page.component.html',
  styleUrls: ['./contact-page.component.css']
})
export class ContactPageComponent {
  private configService = inject(ContactPageConfigService);
  private toastService = inject(ToastService);
  location = inject(Location);
  
  readonly ArrowLeft = ArrowLeft;
  readonly ChevronLeft = ChevronLeft;
  readonly Grid2X2 = Grid2X2;
  readonly Heart = Heart;
  readonly HomeIcon = Home;
  readonly Mail = Mail;
  readonly MoreHorizontal = MoreHorizontal;
  readonly PencilLine = PencilLine;
  readonly Phone = Phone;
  readonly Send = Send;
  readonly User = User;
  readonly UserRound = UserRound;

  get config() {
    return this.configService.pageConfig();
  }

  contactPlant = 'assets/contact/contact-plant.png';
  contactChatBubble = 'assets/contact/contact-chat-bubble.png';
  contactWhatsappBanner = 'assets/contact/contact-whatsapp-banner.png';

  get contactMethods() {
    return (this.config.contactMethods || []).map((m: any) => ({
      ...m,
      icon: m.type === 'phone' ? 'assets/contact/contact-phone.png' 
        : m.type === 'whatsapp' ? 'assets/contact/contact-whatsapp.png' 
        : m.type === 'email' ? 'assets/contact/contact-mail.png' 
        : 'assets/contact/contact-clock.png',
      external: m.type === 'whatsapp' || m.type === 'email',
      ltr: true
    }));
  }

  mobileNavigation = [
    { to: '/profile', label: 'STOREFRONT.AUTO_STR_457', icon: this.UserRound },
    { to: '/favorites', label: 'FAVORITES.TITLE', icon: this.Heart },
    { to: '/', label: 'NAV.HOME', icon: this.HomeIcon },
    { to: '/categories', label: 'COMMON.CATEGORIESMANAGEMENT', icon: this.Grid2X2 },
    { to: '/contact', label: 'SHARED.AUTO_STR_84', icon: this.MoreHorizontal, active: true },
  ];

  form: ContactFormState = {
    name: '',
    phone: '',
    email: '',
    message: '',
  };

  submitContactForm(contactForm: NgForm) {
    if (!this.form.name.trim() || !this.form.phone.trim() || !this.form.email.trim() || !this.form.message.trim()) {
        this.toastService.showToast('STOREFRONT.AUTO_STR_109', 'info');
        return;
    }

    this.toastService.showToast('STOREFRONT.AUTO_STR_164', 'success');
    this.form = { name: '', phone: '', email: '', message: '' };
    contactForm.resetForm();
  }
}
