// components/sidebar-sections/user-management-section.tsx
import { UserCog, UsersRound, ShieldCheck, Key, Store } from 'lucide-react';
import { type NavItem } from '@/types';

interface UserManagementSectionProps {
    hasAnyUserPerm: boolean;
    hasAnyRolePerm: boolean;
    hasAnyPermissionPerm: boolean;
    hasAnyVendorPerm: boolean;
}

export function UserManagementSection({
    hasAnyUserPerm,
    hasAnyRolePerm,
    hasAnyPermissionPerm,
    hasAnyVendorPerm,
}: UserManagementSectionProps): NavItem | null {
    if (!hasAnyUserPerm && !hasAnyRolePerm && !hasAnyPermissionPerm && !hasAnyVendorPerm) {
        return null;
    }

    const userManagementSubmenu: NavItem[] = [];

    if (hasAnyUserPerm) {
        userManagementSubmenu.push({
            title: 'Users',
            href: '/admin/users',
            icon: UsersRound,
        });
    }

    if (hasAnyRolePerm) {
        userManagementSubmenu.push({
            title: 'Roles',
            href: '/admin/roles',
            icon: ShieldCheck,
        });
    }

    if (hasAnyPermissionPerm) {
        userManagementSubmenu.push({
            title: 'Permissions',
            href: '/admin/permissions',
            icon: Key,
        });
    }

    if (hasAnyVendorPerm) {
        userManagementSubmenu.push({
            title: 'Vendors',
            href: '/admin/vendors',
            icon: Store,
        });
    }

    return {
        title: 'User Management',
        href: '#',
        icon: UserCog,
        children: userManagementSubmenu,
    };
}