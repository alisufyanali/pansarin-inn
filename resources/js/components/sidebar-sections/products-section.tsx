// components/sidebar-sections/products-section.tsx
import {
    Package,
    Tag,
    Layers,
    Palette,
    Percent,
    Star,
    Warehouse,
    Heart,
    Activity,
} from 'lucide-react';
import { type NavItem } from '@/types';

interface ProductsSectionProps {
    hasAnyProductPerm: boolean;
    hasAnyCategoryPerm: boolean;
    hasAnyVariantPerm: boolean;
    hasAnyAttributePerm: boolean;
    hasAnyDealPerm: boolean;
    hasAnyInventoryPerm: boolean;
    hasAnyWishlistPerm: boolean;
    hasAnyReviewPerm: boolean;
    hasAnyHealthConcernPerm: boolean;
}

export function ProductsSection({
    hasAnyProductPerm,
    hasAnyCategoryPerm,
    hasAnyVariantPerm,
    hasAnyAttributePerm,
    hasAnyDealPerm,
    hasAnyInventoryPerm,
    hasAnyWishlistPerm,
    hasAnyReviewPerm,
    hasAnyHealthConcernPerm,
}: ProductsSectionProps): NavItem | null {
    if (
        !hasAnyProductPerm &&
        !hasAnyCategoryPerm &&
        !hasAnyVariantPerm &&
        !hasAnyAttributePerm &&
        !hasAnyDealPerm &&
        !hasAnyInventoryPerm &&
        !hasAnyWishlistPerm &&
        !hasAnyReviewPerm &&
        !hasAnyHealthConcernPerm
    ) {
        return null;
    }

    const productSubmenu: NavItem[] = [];

    if (hasAnyCategoryPerm) {
        productSubmenu.push({
            title: 'Categories',
            href: '/admin/categories',
            icon: Tag,
        });
    }

    if (hasAnyHealthConcernPerm) {
        productSubmenu.push({
            title: 'Health Concerns',
            href: '/admin/health-concerns',
            icon: Activity,
        });
    }

    if (hasAnyVariantPerm) {
        productSubmenu.push({
            title: 'Variants',
            href: '/admin/product-variants',
            icon: Layers,
        });
    }

    if (hasAnyAttributePerm) {
        productSubmenu.push({
            title: 'Attributes',
            href: '/admin/attributes',
            icon: Palette,
        });
    }

    if (hasAnyProductPerm) {
        productSubmenu.push({
            title: 'Products',
            href: '/admin/products',
            icon: Package,
        });
    }

    if (hasAnyDealPerm) {
        productSubmenu.push({
            title: 'Products Deals',
            href: '/admin/deals',
            icon: Percent,
        });
    }

    if (hasAnyReviewPerm) {
        productSubmenu.push({
            title: 'Reviews',
            href: '/admin/reviews',
            icon: Star,
        });
    }

    if (hasAnyInventoryPerm) {
        productSubmenu.push({
            title: 'Inventory',
            href: '/admin/inventory',
            icon: Warehouse,
        });
    }

    if (hasAnyWishlistPerm) {
        productSubmenu.push({
            title: 'Wishlist',
            href: '/admin/wishlist',
            icon: Heart,
        });
    }

    return {
        title: 'Products Management',
        href: '#',
        icon: Package,
        children: productSubmenu,
    };
}
