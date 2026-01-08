import { NavItem } from '@/types';
import { Users, CreditCard, ClipboardList, Settings2, Share2 } from 'lucide-react';

export const AffiliateSection = (): NavItem => {
    return {
        title: 'Affiliate Program',
        href: '#',
        icon: Share2,
        children: [
            {
                title: 'Manage Affiliates',
                href: '/admin/affiliates', // Matches Route::get('/')
                icon: Users,
            },
            {
                title: 'Payout Requests',
                href: '/admin/affiliates/payouts', // Matches Route::get('/payouts')
                icon: CreditCard,
            },
            {
                title: 'Referral Logs',
                href: '/admin/affiliates/logs', // Matches Route::get('/logs')
                icon: ClipboardList,
            },
            {
                title: 'System Settings',
                href: '/admin/affiliates/settings', // Matches Route::get('/settings')
                icon: Settings2,
            },
            {
                title: 'Vendor Dashboard',
                href: '/affiliates/dashboard', 
                icon: Settings2,
            },
            {
                title: 'Vendor Payouts',
                href: '/affiliates/payouts', 
                icon: CreditCard,
            },
            {
                title: 'Vendor Referral',
                href: '/affiliates/referral', 
                icon: Share2,
            },
            {
                title: 'Vendor Registration',
                href: '/affiliates/registration', 
                icon: Settings2,
            },
        ],
    };
};