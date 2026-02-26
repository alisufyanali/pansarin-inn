import { Sliders, Settings, Home, Mail, FileText, Contact, Cpu, Image } from 'lucide-react';
import { type NavItem } from '@/types';

export function SettingsSections(): NavItem[] {
    const footerNavItems: NavItem[] = [];

    // Slider Settings
    // footerNavItems.push({
    //     title: 'Slider Settings',
    //     href: '#',
    //     icon: Sliders,
    //     children: [
    //         {
    //             title: 'Slider Settings',
    //             href: '/admin/slides',
    //             icon: Image,
    //         }
    //     ],
    // });

    // Display Settings
    // footerNavItems.push({
    //     title: 'Display Settings',
    //     href: '#',
    //     icon: Settings,
    //     children: [
    //         {
    //             title: 'Home Page',
    //             href: '/admin/display/home',
    //             icon: Home,
    //         },
    //         {
    //             title: 'Contact Page',
    //             href: '/admin/display/contact',
    //             icon: Contact,
    //         },
    //         {
    //             title: 'Extra Pages',
    //             href: '/admin/display/pages',
    //             icon: FileText,
    //         },
    //     ],
    // });

    // Site Settings
    footerNavItems.push({
        title: 'Settings',
        href: '#',
        icon: Settings,
        children: [
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
           
        ],
    });

    return footerNavItems;
}