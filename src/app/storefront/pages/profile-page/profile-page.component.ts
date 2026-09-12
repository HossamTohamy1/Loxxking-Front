import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { Component, signal, computed, ElementRef, ViewChild, OnInit, inject } from '@angular/core';
import { ProfilePageConfigService } from '../../../core/services/page-configs/profile-page-config.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreLayoutComponent } from '../../../shared/components/layout/store-layout/store-layout.component';
import { HomeHeaderComponent } from '../../../shared/components/layout/home-header/home-header.component';
import { sanitizeWithInitial } from '../../../core/utils/config-sanitizer';
import {
  Building2,
  Camera,
  CheckCircle2,
  Hash,
  Home,
  ImagePlus,
  Landmark,
  Mail,
  MapPin,
  Phone,
  Save,
  Trash2,
  UserRound,
  LucideAngularModule,
} from 'lucide-angular';

export type ProfilePageConfig = {
    headerTitle: string;
    headerSubtitle: string;
    showAvatarSection: boolean;
    showBasicInfoSection: boolean;
    showAddressSection: boolean;
};

const DEFAULT_CONFIG: ProfilePageConfig = {
    headerTitle: 'PROFILE.TITLE',
    headerSubtitle: 'PROFILE.SUBTITLE',
    showAvatarSection: true,
    showBasicInfoSection: true,
    showAddressSection: true,
};

type CustomerProfileDetails = {
  profileImage: string
  name: string
  email: string
  phone: string
  alternatePhone: string
  country: string
  city: string
  area: string
  street: string
  building: string
  floor: string
  apartment: string
  postalCode: string
  landmark: string
}

type StoredAddress = {
  id: string
  label: string
  country: string
  city: string
  area: string
  street: string
}

const PROFILE_DETAILS_STORAGE_KEY = 'loxx-customer-full-profile-v1';
const LEGACY_ADDRESS_STORAGE_KEY = 'loxx-customer-addresses-v1';
const PROFILE_UPDATED_EVENT = 'loxx-customer-full-profile-updated';

const countryOptions = [
  'SHARED.AUTO_STR_117',
  'SHARED.AUTO_STR_79',
  'SHARED.AUTO_STR_80',
  'SHARED.AUTO_STR_93',
  'SHARED.AUTO_STR_116',
  'SHARED.AUTO_STR_83',
  'SHARED.AUTO_STR_108',
  'SHARED.AUTO_STR_92',
  'SHARED.AUTO_STR_107',
  'SHARED.AUTO_STR_109',
];

function getSupportCustomerIdentity() {
  return { name: 'STOREFRONT.AUTO_STR_432', email: '', phone: '' };
}

function saveSupportCustomerProfile(profile: any) {
  // Mock function
}

function readFirstSavedAddress(): Partial<CustomerProfileDetails> {
  try {
    const raw = window.localStorage.getItem(LEGACY_ADDRESS_STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) return {};

    const address = parsed[0] as Partial<StoredAddress>;
    return {
      country: typeof address.country === 'string' ? address.country : '',
      city: typeof address.city === 'string' ? address.city : '',
      area: typeof address.area === 'string' ? address.area : '',
      street: typeof address.street === 'string' ? address.street : '',
    };
  } catch {
    return {};
  }
}

function readProfileDetails(): CustomerProfileDetails {
  const identity = getSupportCustomerIdentity();
  const legacyAddress = readFirstSavedAddress();

  const fallback: CustomerProfileDetails = {
    profileImage: '',
    name: identity.name.startsWith('STOREFRONT.AUTO_STR_432') ? '' : identity.name,
    email: identity.email ?? '',
    phone: identity.phone ?? '',
    alternatePhone: '',
    country: legacyAddress.country ?? '',
    city: legacyAddress.city ?? '',
    area: legacyAddress.area ?? '',
    street: legacyAddress.street ?? '',
    building: '',
    floor: '',
    apartment: '',
    postalCode: '',
    landmark: '',
  };

  try {
    const raw = window.localStorage.getItem(PROFILE_DETAILS_STORAGE_KEY);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as Partial<CustomerProfileDetails>;
    return {
      ...fallback,
      ...Object.fromEntries(
        Object.entries(parsed).filter(([, value]) => typeof value === 'string'),
      ),
    } as CustomerProfileDetails;
  } catch {
    return fallback;
  }
}

function fileToSquareDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('SHARED.AUTO_STR_36'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('STOREFRONT.AUTO_STR_235'));
      image.onload = () => {
        const size = 560;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
          reject(new Error('STOREFRONT.AUTO_STR_216'));
          return;
        }

        canvas.width = size;
        canvas.height = size;

        const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
        const sourceX = (image.naturalWidth - sourceSize) / 2;
        const sourceY = (image.naturalHeight - sourceSize) / 2;

        context.drawImage(
          image,
          sourceX,
          sourceY,
          sourceSize,
          sourceSize,
          0,
          0,
          size,
          size,
        );

        resolve(canvas.toDataURL('image/jpeg', 0.86));
      };
      image.src = String(reader.result);
    };

    reader.readAsDataURL(file);
  });
}

function buildAddressLine(profile: CustomerProfileDetails): string {
  return [
    profile.street,
    profile.building ? `مبنى ${profile.building}` : '',
    profile.floor ? `الدور ${profile.floor}` : '',
    profile.apartment ? `شقة ${profile.apartment}` : '',
    profile.landmark,
  ]
    .filter(Boolean)
    .join('، ');
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [TranslatePipe, TranslateDirective, 
    CommonModule,
    FormsModule,
    StoreLayoutComponent,
    HomeHeaderComponent,
    LucideAngularModule
  ],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent implements OnInit {
  Building2 = Building2;
  Camera = Camera;
  CheckCircle2 = CheckCircle2;
  Hash = Hash;
  HomeIcon = Home;
  ImagePlus = ImagePlus;
  Landmark = Landmark;
  Mail = Mail;
  MapPin = MapPin;
  Phone = Phone;
  Save = Save;
  Trash2 = Trash2;
  UserRound = UserRound;

  countryOptions = countryOptions;
  
  private profileConfigService = inject(ProfilePageConfigService);
  config = this.profileConfigService.pageConfig;
  profile = signal<CustomerProfileDetails>(readProfileDetails());
  isSaving = signal(false);
  isImageLoading = signal(false);
  savedSuccessfully = signal(false);

  @ViewChild('imageInput') imageInputRef!: ElementRef<HTMLInputElement>;

  initials = computed(() => {
    const words = this.profile().name.trim().split(/\s+/).filter(Boolean);
    return words.slice(0, 2).map(word => word.charAt(0)).join('') || 'ح';
  });

  ngOnInit() {}

  updateField(field: keyof CustomerProfileDetails, value: string): void {
    this.savedSuccessfully.set(false);
    this.profile.update(p => ({ ...p, [field]: value }));
  }

  async handleImageChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.showToast('STOREFRONT.AUTO_STR_180', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.showToast('SHARED.AUTO_STR_6', 'error');
      return;
    }

    try {
      this.isImageLoading.set(true);
      const dataUrl = await fileToSquareDataUrl(file);
      this.updateField('profileImage', dataUrl);
      this.showToast('STOREFRONT.AUTO_STR_133', 'success');
    } catch (error) {
      this.showToast(error instanceof Error ? error.message : 'SHARED.AUTO_STR_44', 'error');
    } finally {
      this.isImageLoading.set(false);
    }
  }

  removeProfileImage(): void {
    this.updateField('profileImage', '');
    this.showToast('STOREFRONT.AUTO_STR_167', 'info');
  }

  handleSubmit(event: Event): void {
    event.preventDefault();

    const p = this.profile();
    if (!p.name.trim()) {
      this.showToast('STOREFRONT.AUTO_STR_192', 'error');
      return;
    }

    if (!p.phone.trim()) {
      this.showToast('STOREFRONT.AUTO_STR_236', 'error');
      return;
    }

    if (!p.country.trim() || !p.city.trim()) {
      this.showToast('STOREFRONT.AUTO_STR_105', 'error');
      return;
    }

    if (!p.street.trim()) {
      this.showToast('STOREFRONT.AUTO_STR_158', 'error');
      return;
    }

    try {
      this.isSaving.set(true);

      const cleanedProfile = Object.fromEntries(
        Object.entries(p).map(([key, value]) => [key, value.trim()]),
      ) as unknown as CustomerProfileDetails;

      window.localStorage.setItem(
        PROFILE_DETAILS_STORAGE_KEY,
        JSON.stringify(cleanedProfile),
      );

      const mainAddress: StoredAddress = {
        id: 'primary-address',
        label: 'DASHBOARD.AUTO_STR_178',
        country: cleanedProfile.country,
        city: cleanedProfile.city,
        area: cleanedProfile.area,
        street: buildAddressLine(cleanedProfile),
      };

      window.localStorage.setItem(
        LEGACY_ADDRESS_STORAGE_KEY,
        JSON.stringify([mainAddress]),
      );

      saveSupportCustomerProfile({
        name: cleanedProfile.name,
        email: cleanedProfile.email,
        phone: cleanedProfile.phone,
      });

      window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
      this.profile.set(cleanedProfile);
      this.savedSuccessfully.set(true);
      this.showToast('STOREFRONT.AUTO_STR_123', 'success');
    } catch {
      this.showToast('STOREFRONT.AUTO_STR_75', 'error');
    } finally {
      this.isSaving.set(false);
    }
  }

  showToast(message: string, type: 'success' | 'error' | 'info') {
    // Dummy implementation for showToast
    console.log(`[Toast] ${type}: ${message}`);
  }
}
