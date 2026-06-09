import { NavItem } from '@/types';
import { Users, CreditCard, ClipboardList, Settings2, Share2, LayoutDashboard, ShoppingBag, UserPlus } from 'lucide-react';

interface AffiliateSectionProps {
    isAdmin: boolean;
}

export const AffiliateSection = ({ isAdmin }: AffiliateSectionProps): NavItem => {
    const children: NavItem[] = [];

    if (isAdmin) {
        // --- Admin Specific Routes ---
        children.push(
            { title: 'Manage Affiliates', href: route('admin.affiliates.index'), icon: Users },
            { title: 'Payout Requests', href: route('admin.affiliate.payouts'), icon: CreditCard },
            { title: 'Referral Logs', href: route('admin.affiliate.logs'), icon: ClipboardList },
            { title: 'System Settings', href: route('admin.affiliate.settings'), icon: Settings2 }, 
            
            { title: 'My Dashboard', href: route('affiliate.dashboard'), icon: LayoutDashboard },
            { title: 'Product Catalog', href: route('affiliate.products'), icon: ShoppingBag },
            { title: 'My Payouts', href: route('affiliate.payouts.index'), icon: CreditCard },
            { title: 'Join Program', href: route('affiliate.join.page'), icon: UserPlus }
        );
    } else {
        // --- Regular Affiliate User Routes ---
        children.push(
            { title: 'My Dashboard', href: route('affiliate.dashboard'), icon: LayoutDashboard },
            { title: 'Product Catalog', href: route('affiliate.products'), icon: ShoppingBag },
            { title: 'My Payouts', href: route('affiliate.payouts.index'), icon: CreditCard },
            { title: 'Join Program', href: route('affiliate.join.page'), icon: UserPlus }
        );
    }

    return {
        title: 'Affiliate Program',
        href: '#',
        icon: Share2,
        children: children,
    };
};