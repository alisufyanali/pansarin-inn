import { NavItem } from '@/types';
import { Users, CreditCard, ClipboardList, Settings2, Share2, LayoutDashboard } from 'lucide-react';

interface AffiliateSectionProps {
    isAdmin: boolean; // Ye check karne ke liye ke user Admin hai ya aam Vendor
}

// components/sidebar-sections/affiliate-section.tsx

export const AffiliateSection = ({ isAdmin }: AffiliateSectionProps): NavItem => {
    const children: NavItem[] = [];

    if (isAdmin) {
        children.push(
            { title: 'Manage Affiliates', href: '/admin/affiliates', icon: Users },
            { title: 'Payout Requests', href: '/admin/affiliates/payouts', icon: CreditCard },
            { title: 'Referral Logs', href: '/admin/affiliates/logs', icon: ClipboardList },
            { title: 'System Settings', href: '/admin/affiliates/settings', icon: Settings2 },
            
            { title: 'My Dashboard', href: '/affiliates/dashboard', icon: LayoutDashboard },
            { title: 'My Payouts', href: '/affiliates/payouts', icon: CreditCard },
            { title: 'My Referrals', href: '/affiliates/referral', icon: Share2 },
            { title: 'Registration', href: '/affiliates/registration', icon: Settings2 }
        );
    } else {
        children.push(
            
        );
    }

    return {
        title: 'Affiliate Program',
        href: '#',
        icon: Share2,
        children: children,
    };
};