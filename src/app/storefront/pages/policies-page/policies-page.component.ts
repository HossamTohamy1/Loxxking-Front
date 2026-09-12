import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { 
  LucideAngularModule, 
  ShieldCheck, 
  UserRound, 
  FileText, 
  LockKeyhole, 
  UsersRound, 
  BadgeCheck, 
  Truck, 
  Clock3, 
  CreditCard, 
  MapPin, 
  Info, 
  PackageOpen, 
  CalendarDays, 
  RefreshCcw, 
  FileCheck2, 
  Monitor, 
  Landmark, 
  Tags, 
  CircleAlert, 
  PencilLine, 
  ChevronLeft, 
  ShoppingCart 
} from 'lucide-angular';

import { StoreLayoutComponent } from '../../../shared/components/layout/store-layout/store-layout.component';
import { HomeHeaderComponent } from '../../../shared/components/layout/home-header/home-header.component';

type PolicyKey = 'privacy' | 'shipping' | 'returns' | 'terms';

type PolicySection = {
    title: string;
    description: string;
    icon: any;
    bullets?: string[];
};

type PolicyDefinition = {
    key: PolicyKey;
    title: string;
    subtitle: string;
    gridTitle: string;
    gridDescription: string;
    icon: any;
    heroIcon: any;
    sections: PolicySection[];
    showWhatsApp?: boolean;
};

const policies: PolicyDefinition[] = [
    {
        key: 'privacy',
        title: 'POLICIES.PRIVACY',
        subtitle: 'STOREFRONT.AUTO_STR_22',
        gridTitle: 'POLICIES.PRIVACY',
        gridDescription: 'STOREFRONT.AUTO_STR_156',
        icon: ShieldCheck,
        heroIcon: ShieldCheck,
        sections: [
            {
                title: 'STOREFRONT.AUTO_STR_166',
                description: 'STOREFRONT.AUTO_STR_27',
                icon: UserRound,
            },
            {
                title: 'STOREFRONT.AUTO_STR_212',
                description: 'STOREFRONT.AUTO_STR_19',
                icon: FileText,
            },
            {
                title: 'STOREFRONT.AUTO_STR_252',
                description: 'STOREFRONT.AUTO_STR_17',
                icon: LockKeyhole,
            },
            {
                title: 'STOREFRONT.AUTO_STR_233',
                description: 'STOREFRONT.AUTO_STR_6',
                icon: UsersRound,
            },
            {
                title: 'STOREFRONT.AUTO_STR_464',
                description: 'STOREFRONT.AUTO_STR_30',
                icon: BadgeCheck,
            },
        ],
    },
    {
        key: 'shipping',
        title: 'STOREFRONT.AUTO_STR_176',
        subtitle: 'STOREFRONT.AUTO_STR_48',
        gridTitle: 'STOREFRONT.AUTO_STR_372',
        gridDescription: 'STOREFRONT.AUTO_STR_177',
        icon: Truck,
        heroIcon: Truck,
        sections: [
            {
                title: 'STOREFRONT.AUTO_STR_373',
                description: 'STOREFRONT.AUTO_STR_11',
                icon: Clock3,
            },
            {
                title: 'DASHBOARD.AUTO_STR_354',
                description: 'STOREFRONT.AUTO_STR_23',
                icon: CreditCard,
            },
            {
                title: 'STOREFRONT.AUTO_STR_397',
                description: 'STOREFRONT.AUTO_STR_8',
                icon: MapPin,
            },
            {
                title: 'STOREFRONT.AUTO_STR_337',
                description: 'STOREFRONT.AUTO_STR_13',
                icon: Info,
            },
        ],
    },
    {
        key: 'returns',
        title: 'POLICIES.RETURNS_POLICY',
        subtitle: 'STOREFRONT.AUTO_STR_10',
        gridTitle: 'POLICIES.RETURNS_POLICY',
        gridDescription: 'STOREFRONT.AUTO_STR_130',
        icon: PackageOpen,
        heroIcon: PackageOpen,
        sections: [
            {
                title: 'STOREFRONT.AUTO_STR_131',
                description: 'STOREFRONT.AUTO_STR_20',
                icon: CalendarDays,
            },
            {
                title: 'POLICIES.EXCHANGE_TERMS',
                description: '',
                icon: ShieldCheck,
                bullets: [
                    'STOREFRONT.AUTO_STR_121',
                    'STOREFRONT.AUTO_STR_49',
                    'STOREFRONT.AUTO_STR_84',
                ],
            },
            {
                title: 'STOREFRONT.AUTO_STR_253',
                description: '',
                icon: RefreshCcw,
                bullets: [
                    'STOREFRONT.AUTO_STR_132',
                    'STOREFRONT.AUTO_STR_199',
                    'STOREFRONT.AUTO_STR_157',
                ],
            },
            {
                title: 'STOREFRONT.AUTO_STR_254',
                description: 'STOREFRONT.AUTO_STR_74',
                icon: Truck,
            },
        ],
        showWhatsApp: true,
    },
    {
        key: 'terms',
        title: 'STOREFRONT.AUTO_STR_249',
        subtitle: 'STOREFRONT.AUTO_STR_14',
        gridTitle: 'STOREFRONT.AUTO_STR_249',
        gridDescription: 'STOREFRONT.AUTO_STR_178',
        icon: FileCheck2,
        heroIcon: FileCheck2,
        sections: [
            {
                title: 'STOREFRONT.AUTO_STR_279',
                description: 'STOREFRONT.AUTO_STR_4',
                icon: Monitor,
            },
            {
                title: 'STOREFRONT.AUTO_STR_280',
                description: 'STOREFRONT.AUTO_STR_1',
                icon: Landmark,
            },
            {
                title: 'STOREFRONT.AUTO_STR_255',
                description: 'STOREFRONT.AUTO_STR_5',
                icon: Tags,
            },
            {
                title: 'STOREFRONT.AUTO_STR_427',
                description: 'STOREFRONT.AUTO_STR_2',
                icon: CircleAlert,
            },
            {
                title: 'STOREFRONT.AUTO_STR_338',
                description: 'STOREFRONT.AUTO_STR_3',
                icon: PencilLine,
            },
        ],
    },
];

import { PoliciesPageConfigService } from '../../../core/services/page-configs/policies-page-config.service';
import { inject, signal, computed } from '@angular/core';

const ICON_MAP: Record<string, any> = {
  ShieldCheck, UserRound, FileText, LockKeyhole, UsersRound, BadgeCheck, Truck, Clock3, CreditCard, MapPin, Info, PackageOpen, CalendarDays, RefreshCcw, FileCheck2, Monitor, Landmark, Tags, CircleAlert, PencilLine, ChevronLeft, ShoppingCart
};

@Component({
  selector: 'app-policies-page',
  standalone: true,
  imports: [TranslatePipe, TranslateDirective, CommonModule, RouterModule, LucideAngularModule, StoreLayoutComponent, HomeHeaderComponent],
  templateUrl: './policies-page.component.html'
})
export class PoliciesPageComponent implements OnInit {
  private configService = inject(PoliciesPageConfigService);
  config = this.configService.pageConfig;

  currentView = signal<string | null>(null);
  cartCount: number = 0;
  logoHeader = 'assets/home/logo-header.png';

  readonly ChevronLeft = ChevronLeft;
  readonly ShoppingCart = ShoppingCart;

  getIcon(iconName: any): any {
    if (typeof iconName === 'string') {
      return ICON_MAP[iconName] || FileText;
    }
    return iconName || FileText;
  }

  resolvedPolicies = computed(() => {
    const raw = this.config()?.policies;
    if (raw && raw.length > 0) {
      return raw.map((p: any) => ({
        ...p,
        icon: this.getIcon(p.icon),
        heroIcon: this.getIcon(p.heroIcon || p.icon),
        sections: (p.sections || []).map((s: any) => ({
          ...s,
          icon: this.getIcon(s.icon)
        }))
      }));
    }
    return policies;
  });

  get policies(): any[] {
    return this.resolvedPolicies();
  }

  selectedPolicyComputed = computed(() => {
    const requested = this.currentView();
    if (!requested) return null;
    return this.resolvedPolicies().find(p => p.key === requested) || null;
  });

  get selectedPolicy(): any {
    return this.selectedPolicyComputed();
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.currentView.set(params['view'] || null);
    });
  }

  selectPolicy(key: string): void {
    this.currentView.set(key);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view: key },
      queryParamsHandling: 'merge',
    }).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  goBack(): void {
    if (this.selectedPolicy) {
      this.currentView.set(null);
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {}
      }).then(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      return;
    }

    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    }
  }
}
