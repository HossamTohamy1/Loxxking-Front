import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ArrowLeft, Eye, EyeOff, Heart, Lock, Mail, ShieldCheck } from 'lucide-angular';
import { StoreLayoutComponent } from '../../../shared/components/layout/store-layout/store-layout.component';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth/auth.service';
import { sanitizeWithInitial } from '../../../core/utils/config-sanitizer';

export type LoginBenefit = { id: string; title: string; line1: string; line2: string; };
export type LoginPageConfig = { heroTitlePrefix: string; heroTitleHighlight: string; heroSubtitle: string; welcomeTitle: string; welcomeSubtitle: string; showSocialLogin: boolean; benefits: LoginBenefit[]; heroImage: string; };

const DEFAULT_CONFIG: LoginPageConfig = {
  heroTitlePrefix: 'STOREFRONT.AUTO_STR_272',
  heroTitleHighlight: 'STOREFRONT.AUTO_STR_271',
  heroSubtitle: 'STOREFRONT.AUTO_STR_87',
  welcomeTitle: 'AUTH.LOGIN',
  welcomeSubtitle: 'STOREFRONT.AUTO_STR_480',
  showSocialLogin: true,
  heroImage: '',
  benefits: [
    { id: '1', title: 'STOREFRONT.AUTO_STR_275', line1: 'STOREFRONT.AUTO_STR_96', line2: 'STOREFRONT.AUTO_STR_228' },
    { id: '2', title: 'STOREFRONT.AUTO_STR_274', line1: 'STOREFRONT.AUTO_STR_360', line2: 'STOREFRONT.AUTO_STR_254' },
    { id: '3', title: 'STOREFRONT.AUTO_STR_273', line1: 'STOREFRONT.AUTO_STR_221', line2: 'STOREFRONT.AUTO_STR_258' },
    { id: '4', title: 'STOREFRONT.AUTO_STR_271', line1: 'STOREFRONT.AUTO_STR_305', line2: 'STOREFRONT.AUTO_STR_140' },
  ],
};

import { LoginPageConfigService } from '../../../core/services/page-configs/login-page-config.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [TranslatePipe, TranslateDirective, CommonModule, RouterModule, FormsModule, LucideAngularModule, StoreLayoutComponent],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private configService = inject(LoginPageConfigService);

  pageConfig = this.configService.pageConfig;
  readonly ArrowLeft = ArrowLeft; readonly Eye = Eye; readonly EyeOff = EyeOff; readonly Heart = Heart; readonly Lock = Lock; readonly Mail = Mail; readonly ShieldCheck = ShieldCheck;
  logoImage = 'assets/login/loxx-login-logo.png';
  sceneImage = 'assets/login/loxx-login-scene.png';
  googleIcon = 'assets/login/google-login.png';
  appleIcon = 'assets/login/apple-login.png';
  facebookIcon = 'assets/login/facebook-login.png';

  showPassword = signal(false);
  isSubmitting = signal(false);
  form = { email: '', password: '', remember: false };

  ngOnInit() {
    const rememberedEmail = window.localStorage.getItem('loxx-remembered-email');
    if (rememberedEmail) { this.form.email = rememberedEmail; this.form.remember = true; }
  }

  togglePassword() { this.showPassword.update(v => !v); }

  handleSubmit(event: Event) {
    event.preventDefault();
    if (!this.form.email.trim() || !this.form.password.trim()) return;

    if (this.form.remember) { window.localStorage.setItem('loxx-remembered-email', this.form.email.trim()); }
    else { window.localStorage.removeItem('loxx-remembered-email'); }

    this.isSubmitting.set(true);

    this.http.post<any>('/api/users/login', { email: this.form.email.trim(), password: this.form.password.trim() }).subscribe({
      next: (res: any) => {
        const token = res?.data?.token || res?.token;
        const userId = res?.data?.userId || res?.userId;
        const role = res?.data?.role || res?.role || 'customer';
        
        if (token) { localStorage.setItem('lk-auth-token', token); }
        
        this.http.get<any>('/api/users/me', { headers: { Authorization: 'Bearer ' + token } }).subscribe({
          next: (meRes: any) => {
            const profile = meRes?.data || meRes;
            this.authService.setUser({
              id: userId,
              name: profile?.name || this.form.email.trim().split('@')[0],
              email: profile?.email || this.form.email.trim(),
              role: role.toLowerCase(),
            });
            this.isSubmitting.set(false);
            this.router.navigate(['/']);
          },
          error: (err: any) => {
            this.isSubmitting.set(false);
            console.error(err);
          }
        });
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        console.error(err);
      }
    });
  }

  handleSocialLogin() { this.router.navigate(['/']); }
}
