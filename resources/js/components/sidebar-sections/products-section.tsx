// components/sidebar-sections/products-section.tsx
import { Package, Tag, Layers, Palette, Percent, Star, BadgePercent } from 'lucide-react';
import { type NavItem } from '@/types';

interface ProductsSectionProps {
    hasAnyProductPerm: boolean;
    hasAnyCategoryPerm: boolean;
    hasAnyVariantPerm: boolean;
    hasAnyAttributePerm: boolean;
}

export function ProductsSection({
    hasAnyProductPerm,
    hasAnyCategoryPerm,
    hasAnyVariantPerm,
    hasAnyAttributePerm,
}: ProductsSectionProps): NavItem | null {
    if (!hasAnyProductPerm && !hasAnyCategoryPerm && !hasAnyVariantPerm && !hasAnyAttributePerm) {
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

    if (hasAnyProductPerm) {
        productSubmenu.push({
            title: 'Products Deals',
            href: '/admin/productsDeals',
            icon: Percent,  // یا BadgePercent
        });
    }

    if (hasAnyProductPerm) {
        productSubmenu.push({
            title: 'Reviews',
            href: '/admin/productsReviews',
            icon: Star,
        });
    }

    return {
        title: 'Products Manage',
        href: '#',
        icon: Package,
        children: productSubmenu,
    };
}