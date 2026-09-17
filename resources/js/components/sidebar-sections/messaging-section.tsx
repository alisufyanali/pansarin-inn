// components/sidebar-sections/messaging-section.tsx
import { MessageSquare, Mail, MessageCircle, Bell } from 'lucide-react';
import { type NavItem } from '@/types';

interface MessagingSectionProps {
    hasAnyContactMsg: boolean;
    hasAnyNewsletter: boolean;
    hasAnyWhatsapp: boolean;
}

export function MessagingSection({
    hasAnyContactMsg,
    hasAnyNewsletter,
    hasAnyWhatsapp,
}: MessagingSectionProps): NavItem | null {
    if (!hasAnyContactMsg && !hasAnyNewsletter && !hasAnyWhatsapp) {
        return null;
    }

    const messagingSubmenu: NavItem[] = [];

    if (hasAnyContactMsg) {
        messagingSubmenu.push({
            title: 'Contact Messages',
            href: '/admin/contacts',
            icon: MessageSquare,
        });
    }

    if (hasAnyNewsletter) {
        messagingSubmenu.push({
            title: 'Newsletter',
            href: '/admin/newsletters',
            icon: Mail,
        });
    }

    if (hasAnyWhatsapp) {
        messagingSubmenu.push({
            title: 'WhatsApp Chat',
            href: '/admin/whatsapp/chat',
            icon: MessageCircle,
        });
        messagingSubmenu.push({
            title: 'Bulk WhatsApp',
            href: '/admin/whatsapp/broadcast',
            icon: MessageSquare,
        });
    }

    return {
        title: 'Messaging',
        href: '#',
        icon: Bell,
        children: messagingSubmenu,
    };
}
