import { NavItem } from '@/types';
import { Users, CreditCard, ClipboardList, Settings2, Share2, LayoutDashboard, ShoppingBag, UserPlus } from 'lucide-react';

interface AffiliateSectionProps {
    isAffiliate: boolean;   // user has affiliate role / view.affiliates permission
    isAdmin: boolean;       // user can manage affiliates (admin/super-admin only)
}

export const AffiliateSection = ({ isAffiliate, isAdmin }: AffiliateSectionProps): NavItem | null => {
    // Hide entirely if user has neither affiliate nor affiliate-management permissions
    if (!isAffiliate && !isAdmin) {
        return null;
    }

    const children: NavItem[] = [];

    if (isAdmin) {
        // Admin-only management routes
        children.push(
            { title: 'Manage Affiliates', href: route('admin.affiliates.index'), icon: Users },
            { title: 'Payout Requests', href: route('admin.affiliate.payouts'), icon: CreditCard },
            { title: 'Referral Logs', href: route('admin.affiliate.logs'), icon: ClipboardList },
            { title: 'System Settings', href: route('admin.affiliate.settings'), icon: Settings2 },
        );
    }

    if (isAffiliate || isAdmin) {
        // Affiliate-facing routes (visible to affiliate users and admins)
        children.push(
            { title: 'My Dashboard', href: route('affiliate.dashboard'), icon: LayoutDashboard },
            { title: 'Product Catalog', href: route('affiliate.products'), icon: ShoppingBag },
            { title: 'My Payouts', href: route('affiliate.payouts.index'), icon: CreditCard },
            { title: 'Join Program', href: route('affiliate.join.page'), icon: UserPlus },
        );
    }

    if (children.length === 0) {
        return null;
    }

    return {
        title: 'Affiliate Program',
        href: '#',
        icon: Share2,
        children,
    };
};
