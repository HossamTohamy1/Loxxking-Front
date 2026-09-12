import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { StoreLayoutComponent } from '../../../shared/components/layout/store-layout/store-layout.component';
import { ProductCardComponent } from '../../components/product/product-card/product-card.component';
import { LucideAngularModule, SlidersHorizontal, ChevronDown, Loader2 } from 'lucide-angular';
import { LangService } from '../../../core/services/lang/lang.service';
import { products, categories } from '../../../shared/data/mockData';
import { t } from '../../../shared/i18n/translations';
import { ProductRepositoryImpl } from '../../../data/repositories/product.repository.impl';

const sortOptions = [
  { value: 'popular', en: 'Most Popular', ar: 'الأكثر شهرة' },
  { value: 'newest', en: 'Newest', ar: 'الأحدث' },
  { value: 'price-asc', en: 'Price: Low to High', ar: 'السعر: الأقل أولاً' },
  { value: 'price-desc', en: 'Price: High to Low', ar: 'السعر: الأعلى أولاً' },
  { value: 'rating', en: 'Top Rated', ar: 'الأعلى تقييماً' },
];

const ITEMS_PER_PAGE = 8;
const queryCache = new Map<string, any[]>();

async function fetchProductsFromBackend(slug: string) {
  if (queryCache.has(slug)) return queryCache.get(slug) || [];
  await new Promise(resolve => setTimeout(resolve, 500));
  const data = slug === 'all' ? products : products.filter((p: any) => p.category === slug);
  queryCache.set(slug, data);
  return data;
}

import { CategoryPageConfigService } from '../../../core/services/page-configs/category-page-config.service';

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [TranslatePipe, TranslateDirective, CommonModule, RouterLink, StoreLayoutComponent, ProductCardComponent, LucideAngularModule, ModalComponent, ButtonComponent],
  templateUrl: './category-page.component.html'
})
export class CategoryPageComponent implements OnInit {
  route = inject(ActivatedRoute);
  langService = inject<any>(LangService);
  private productRepo = inject(ProductRepositoryImpl);
  private categoryConfigService = inject(CategoryPageConfigService);
  pageConfig = this.categoryConfigService.pageConfig;
  
  readonly SlidersHorizontal = SlidersHorizontal;
  readonly ChevronDown = ChevronDown;
  readonly Loader2 = Loader2;

  lang = this.langService.lang;
  t = t;
  categoriesSignal = signal<any[]>(categories);
  get categories() { return this.categoriesSignal(); }
  sortOptions = sortOptions;

  slug = signal('all');
  queryString = signal('');
  
  filterOpen = signal(false);
  sortBy = signal('popular');
  priceRange = signal([0, 200]);
  showSortDropdown = signal(false);

  baseData = signal<any[]>([]);
  isLoading = signal(true);
  page = signal(1);

  constructor() {
    this.route.paramMap.subscribe(params => {
      this.slug.set(params.get('slug') || 'all');
      this.loadData();
    });
    this.route.queryParamMap.subscribe(params => {
      this.queryString.set(params.get('q') || '');
    });
    this.productRepo.getCategories().subscribe(cats => {
      if (cats && cats.length > 0) {
        this.categoriesSignal.set(cats);
      }
    });
  }

  ngOnInit() {}

  loadData() {
    this.isLoading.set(true);
    this.productRepo.getProducts().subscribe({
      next: (prods) => {
        const slug = this.slug();
        const data = slug === 'all' 
          ? prods 
          : prods.filter(p => (p.category && p.category.toLowerCase() === slug.toLowerCase()) || p.slug === slug);
        this.baseData.set(data.length > 0 ? data : prods);
        this.isLoading.set(false);
        this.page.set(1);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  category = computed(() => this.categoriesSignal().find((c: any) => c.slug === this.slug()) || categories.find((c: any) => c.slug === this.slug()));

  filtered = computed(() => {
    let list = [...this.baseData()];
    const q = this.queryString().toLowerCase();
    if (q) {
      list = list.filter((p: any) => (p.nameEn && p.nameEn.toLowerCase().includes(q)) || (p.nameAr && p.nameAr.includes(q)) || (p.descEn && p.descEn.toLowerCase().includes(q)));
    }
    const [min, max] = this.priceRange();
    list = list.filter((p: any) => p.price >= min && p.price <= max);

    switch (this.sortBy()) {
      case 'newest': return list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      case 'price-asc': return list.sort((a, b) => a.price - b.price);
      case 'price-desc': return list.sort((a, b) => b.price - a.price);
      case 'rating': return list.sort((a, b) => b.rating - a.rating);
      default: return list.sort((a, b) => b.reviewCount - a.reviewCount);
    }
  });

  paginatedProducts = computed(() => this.filtered().slice(0, this.page() * ITEMS_PER_PAGE));
  hasMore = computed(() => this.paginatedProducts().length < this.filtered().length);
  currentSort = computed(() => sortOptions.find(s => s.value === this.sortBy()));

  prefetchCategory(catSlug: string) {
    if (!queryCache.has(catSlug)) {
      fetchProductsFromBackend(catSlug);
    }
  }

  setPriceMin(e: Event) {
    const val = +(e.target as HTMLInputElement).value;
    this.priceRange.set([val, this.priceRange()[1]]);
  }

  setPriceMax(e: Event) {
    const val = +(e.target as HTMLInputElement).value;
    this.priceRange.set([this.priceRange()[0], val]);
  }

  resetFilter() {
    this.priceRange.set([0, 200]);
    this.filterOpen.set(false);
  }
}
