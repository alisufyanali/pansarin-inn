// components/sidebar-sections/shop-section.tsx
import { ShoppingCart, User, DollarSign, TicketPercent, Star, MapPin, RotateCcw, Coins } from 'lucide-react';
import { type NavItem } from '@/types';

interface ShopSectionProps {
    hasAnyCustomerPerm: boolean;
    hasAnyOrderPerm: boolean;
    hasAnySalePerm: boolean;
    hasAnyCitiesPerm: boolean;
    hasAnyCouponPerm: boolean;
    hasAnyOrderReviewPerm: boolean;
    hasAnyReturnRequestPerm?: boolean;
    hasAnyLoyaltyPerm?: boolean;
}

export function ShopSection({
    hasAnyCustomerPerm,
    hasAnyOrderPerm,
    hasAnySalePerm,
    hasAnyCitiesPerm,
    hasAnyCouponPerm,
    hasAnyOrderReviewPerm,
    hasAnyReturnRequestPerm = false,
    hasAnyLoyaltyPerm = false,
}: ShopSectionProps): NavItem | null {
    if (
        !hasAnyCustomerPerm &&
        !hasAnyOrderPerm &&
        !hasAnySalePerm &&
        !hasAnyCitiesPerm &&
        !hasAnyCouponPerm &&
        !hasAnyOrderReviewPerm &&
        !hasAnyReturnRequestPerm &&
        !hasAnyLoyaltyPerm
    ) {
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
        shopSubmenu.push({
            title: 'Track Orders',
            href: '/admin/orders/track',
            icon: MapPin,
        });
    }

    if (hasAnySalePerm) {
        shopSubmenu.push({
            title: 'Sales',
            href: '/admin/sales',
            icon: DollarSign,
        });
    }

    if (hasAnyCouponPerm) {
        shopSubmenu.push({
            title: 'Coupons',
            href: '/admin/coupons',
            icon: TicketPercent,
        });
    }

    if (hasAnyOrderReviewPerm) {
        shopSubmenu.push({
            title: 'Order Reviews',
            href: '/admin/order-reviews',
            icon: Star,
        });
    }

    if (hasAnyReturnRequestPerm) {
        shopSubmenu.push({
            title: 'Returns',
            href: '/admin/returns',
            icon: RotateCcw,
        });
    }

    if (hasAnyLoyaltyPerm) {
        shopSubmenu.push({
            title: 'Loyalty Points',
            href: '/admin/loyalty',
            icon: Coins,
        });
    }

    if (hasAnyCitiesPerm) {
        shopSubmenu.push({
            title: 'Cities',
            href: '/admin/cities',
            icon: User,
        });
    }

    return {
        title: 'Shop',
        href: '#',
        icon: ShoppingCart,
        children: shopSubmenu,
    };
}
