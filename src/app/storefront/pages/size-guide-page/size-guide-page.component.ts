import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, BadgeCheck, PackageCheck, ShieldCheck, Truck } from 'lucide-angular';
import { StoreLayoutComponent } from '../../../shared/components/layout/store-layout/store-layout.component';
import { HomeHeaderComponent } from '../../../shared/components/layout/home-header/home-header.component';
import { SizeGuidePageConfigService } from '../../../core/services/page-configs/size-guide-page-config.service';

@Component({
  selector: 'app-size-guide-page',
  standalone: true,
  imports: [TranslatePipe, TranslateDirective, 
    CommonModule,
    RouterModule,
    LucideAngularModule,
    StoreLayoutComponent,
    HomeHeaderComponent
  ],
  templateUrl: './size-guide-page.component.html',
  styleUrl: './size-guide-page.component.css'
})
export class SizeGuidePageComponent {
  private configService = inject(SizeGuidePageConfigService);
  pageConfig = this.configService.pageConfig;
  readonly sizeRows = [
    { size: 'XS', numeric: '32 - 34', waist: '60 - 66', belly: '70 - 76' },
    { size: 'S', numeric: '36 - 38', waist: '67 - 73', belly: '77 - 83' },
    { size: 'M', numeric: '40 - 42', waist: '74 - 80', belly: '84 - 90' },
    { size: 'L', numeric: '44 - 46', waist: '81 - 87', belly: '91 - 97' },
    { size: 'XL', numeric: '48 - 50', waist: '88 - 94', belly: '98 - 104' },
    { size: '2XL', numeric: '52 - 54', waist: '95 - 101', belly: '105 - 111' },
    { size: '3XL', numeric: '56 - 58', waist: '102 - 108', belly: '112 - 118' },
    { size: '4XL', numeric: '60 - 62', waist: '109 - 115', belly: '119 - 125' },
    { size: '5XL', numeric: '64 - 66', waist: '116 - 122', belly: '126 - 132' },
  ];

  readonly BadgeCheck = BadgeCheck;
  readonly PackageCheck = PackageCheck;
  readonly ShieldCheck = ShieldCheck;
  readonly Truck = Truck;
}
