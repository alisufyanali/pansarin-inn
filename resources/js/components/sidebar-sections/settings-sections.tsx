// components/sidebar-sections/settings-sections.tsx
import { Settings, Mail, Image } from 'lucide-react';
import { type NavItem } from '@/types';
import { can } from '@/lib/can';

export function SettingsSections(): NavItem[] {
    const footerNavItems: NavItem[] = [];

    const canViewSettings = can('view.settings') || can('edit.settings');

    if (!canViewSettings) {
        return footerNavItems;
    }

    const settingsChildren: NavItem[] = [
        {
            title: 'General Settings',
            href: '/admin/settings/general',
            icon: Settings,
        },
        {
            title: 'Business Settings',
            href: '/admin/settings/business',
            icon: Settings,
        },
        {
            title: 'UI Settings',
            href: '/admin/settings/ui',
            icon: Settings,
        },
        {
            title: 'Email Templates',
            href: '/admin/settings/email-templates',
            icon: Mail,
        },
    ];

    footerNavItems.push({
        title: 'Settings',
        href: '#',
        icon: Settings,
        children: settingsChildren,
    });

    return footerNavItems;
}
