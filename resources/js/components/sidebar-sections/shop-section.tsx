// components/sidebar-sections/shop-section.tsx
import { ShoppingCart, User, DollarSign, TicketPercent, Star, Package } from 'lucide-react';
import { type NavItem } from '@/types';

interface ShopSectionProps {
    hasAnyCustomerPerm: boolean;
    hasAnyOrderPerm: boolean;
    hasAnySalePerm: boolean;
}

export function ShopSection({
    hasAnyCustomerPerm,
    hasAnyOrderPerm,
    hasAnySalePerm,
}: ShopSectionProps): NavItem | null {
    if (!hasAnyCustomerPerm && !hasAnyOrderPerm && !hasAnySalePerm) {
        return null;
    }

    const shopSubmenu: NavItem[] = [];

    if (hasAnyCustomerPerm) {
        shopSubmenu.push({
            title: 'Customers',
            href: '/admin/customers',
            icon: User,
        });
    }

    if (hasAnyOrderPerm) {
        shopSubmenu.push({
            title: 'Orders',
            href: '/admin/orders',
            icon: ShoppingCart,
        });
    }

    if (hasAnySalePerm) {
        shopSubmenu.push({
            title: 'Sales',
            href: '/admin/sales',
            icon: DollarSign,
        });
    }

    if (hasAnySalePerm) {
        shopSubmenu.push({
            title: 'Coupons',
            href: '/admin/coupons',
            icon: TicketPercent,
        });
    }

    if (hasAnySalePerm) {
        shopSubmenu.push({
            title: 'Order Reviews',
            href: '/admin/orderReviews',
            icon: Star,
        });
    }

    return {
        title: 'Shop',
        href: '#',
        icon: ShoppingCart,
        children: shopSubmenu,
    };
}