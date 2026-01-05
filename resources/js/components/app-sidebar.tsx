import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { can } from '@/lib/can';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    BookOpen,
    Folder,
    Image,
    LayoutGrid,
    Palette,
    Shield,
    ShieldCheck,
    Sprout,
    UsersRound,
    MessageCircleCode,
} from 'lucide-react';

import AppLogo from './app-logo';

function roles() {
    return '/admin/roles';
}

function createRole() {
    return '/admin/roles/create';
}

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    // Permission checks
    const canCreateRole = can('create.roles');
    const canEditRole = can('edit.roles');
    const canDeleteRole = can('delete.roles');
    const canViewRole = can('view.roles');
    const hasAnyRolePerm =
        canCreateRole || canEditRole || canDeleteRole || canViewRole;

    // User permissions
    const canCreateUser = can('create.users');
    const canEditUser = can('edit.users');
    const canDeleteUser = can('delete.users');
    const canViewUser = can('view.users');
    const hasAnyUserPerm =
        canCreateUser || canEditUser || canDeleteUser || canViewUser;

    // Product permissions
    const canCreateProduct = can('create.products');
    const canEditProduct = can('edit.products');
    const canDeleteProduct = can('delete.products');
    const canViewProduct = can('view.products');
    const hasAnyProductPerm =
        canCreateProduct ||
        canEditProduct ||
        canDeleteProduct ||
        canViewProduct;

    // Category permissions
    const canCreateCategory = can('create.categories');
    const canEditCategory = can('edit.categories');
    const canDeleteCategory = can('delete.categories');
    const canViewCategory = can('view.categories');
    const hasAnyCategoryPerm =
        canCreateCategory ||
        canEditCategory ||
        canDeleteCategory ||
        canViewCategory;

    // Variant permissions
    const canCreateVariant = can('create.variants');
    const canEditVariant = can('edit.variants');
    const canDeleteVariant = can('delete.variants');
    const canViewVariant = can('view.variants');
    const hasAnyVariantPerm =
        canCreateVariant ||
        canEditVariant ||
        canDeleteVariant ||
        canViewVariant;

    // Attribute permissions
    const canCreateAttribute = can('create.attributes');
    const canEditAttribute = can('edit.attributes');
    const canDeleteAttribute = can('delete.attributes');
    const canViewAttribute = can('view.attributes');
    const hasAnyAttributePerm =
        canCreateAttribute ||
        canEditAttribute ||
        canDeleteAttribute ||
        canViewAttribute;

    // Frontend permissions
    const canCreateFrontend = can('create.frontend');
    const canEditFrontend = can('edit.frontend');
    const canDeleteFrontend = can('delete.frontend');
    const canViewFrontend = can('view.frontend');
    const hasAnyFrontendPerm =
        canCreateFrontend ||
        canEditFrontend ||
        canDeleteFrontend ||
        canViewFrontend;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
    ];

    // Blog section
    mainNavItems.push({
        title: 'Blog',
        href: '#',
        icon: BookOpen,
        children: [
            {
                title: 'Blog List',
                href: '/admin/blogs',
                icon: BookOpen,
            },
            {
                title: 'Blog Categories',
                href: '/admin/blogcategories',
                icon: Folder,
            },
            {
                title: 'Blog Comments',
                href: '/admin/blogsComments',
                icon: MessageCircleCode,
            },
        ],
    });

    // Products section
    if (
        hasAnyProductPerm ||
        hasAnyCategoryPerm ||
        hasAnyVariantPerm ||
        hasAnyAttributePerm
    ) {
        const productSubmenu: NavItem[] = [];

        if (hasAnyProductPerm) {
            productSubmenu.push({
                title: 'Products',
                href: '/admin/products',
                icon: Sprout,
            });
        }

        if (hasAnyCategoryPerm) {
            productSubmenu.push({
                title: 'Categories',
                href: '/admin/categories',
                icon: Folder,
            });
        }

        if (hasAnyVariantPerm) {
            productSubmenu.push({
                title: 'Variants',
                href: '/admin/product-variants',
                icon: Shield,
            });
        }

        if (hasAnyAttributePerm) {
            productSubmenu.push({
                title: 'Attributes',
                href: '/admin/attributes',
                icon: Palette,
            });
        }

        if (productSubmenu.length > 0) {
            mainNavItems.push({
                title: 'Products Management',
                href: '#',
                icon: Sprout,
                children: productSubmenu,
            });
        }
    }
    if (hasAnyFrontendPerm) {
        mainNavItems.push({
            title: 'Frontend Management',
            href: '#',
            icon: LayoutGrid,
            children: [
                {
                    title: 'All Content',
                    href: '/admin/frontend',
                    icon: LayoutGrid,
                },
                {
                    title: 'create Content',
                    href: '/admin/frontend',
                    icon: Image,
                },
            ],
        });
    }

    if (hasAnyUserPerm) {
        mainNavItems.push({
            title: 'Users',
            href: '/admin/users',
            icon: UsersRound,
        });
    }

    if (hasAnyRolePerm) {
        mainNavItems.push({
            title: 'Roles',
            href: '/admin/roles',
            icon: ShieldCheck,
        });
    }

    mainNavItems.push({
        title: 'Orders',
        href: '/admin/orders',
        icon: ShieldCheck,
    });

    // Frontend section with dropdown
    

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
