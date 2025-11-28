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
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Shield, PlusCircle, Sprout, UsersRound ,ShieldCheck, ChevronDown, Palette } from 'lucide-react';
import { can } from '@/lib/can';

import AppLogo from './app-logo';
import users from '@/routes/users';

function roles() {
  return '/admin/roles';
}

function createRole() {
  return '/admin/roles/create';
}

// main nav items are computed at render time so we can conditionally include items
// based on the current user's permissions (hide Roles if user has none of the role perms).

const footerNavItems: NavItem[] = [
    // {
    //     title: 'Repository',
    //     href: 'https://github.com/laravel/react-starter-kit',
    //     icon: Folder,
    // },
    // {
    //     title: 'Documentation',
    //     href: 'https://laravel.com/docs/starter-kits#react',
    //     icon: BookOpen,
    // },
];

export function AppSidebar() {
    // permission checks (hook wrapper `can` uses a hook internally)
    const canCreateRole = can('create.roles');
    const canEditRole = can('edit.roles');
    const canDeleteRole = can('delete.roles');
    const canViewRole = can('view.roles');

    const hasAnyRolePerm = canCreateRole || canEditRole || canDeleteRole || canViewRole;

    // compute user permissions and conditionally include nav items
    const canCreateUser = can('create.users');
    const canEditUser = can('edit.users');
    const canDeleteUser = can('delete.users');
    const canViewUser = can('view.users');

    const hasAnyUserPerm = canCreateUser || canEditUser || canDeleteUser || canViewUser;

    // Product permissions
    const canCreateProduct = can('create.products');
    const canEditProduct = can('edit.products');
    const canDeleteProduct = can('delete.products');
    const canViewProduct = can('view.products');

    const hasAnyProductPerm = canCreateProduct || canEditProduct || canDeleteProduct || canViewProduct;

    // Category permissions
    const canCreateCategory = can('create.categories');
    const canEditCategory = can('edit.categories');
    const canDeleteCategory = can('delete.categories');
    const canViewCategory = can('view.categories');

    const hasAnyCategoryPerm = canCreateCategory || canEditCategory || canDeleteCategory || canViewCategory;

    // Variant permissions
    const canCreateVariant = can('create.variants');
    const canEditVariant = can('edit.variants');
    const canDeleteVariant = can('delete.variants');
    const canViewVariant = can('view.variants');

    const hasAnyVariantPerm = canCreateVariant || canEditVariant || canDeleteVariant || canViewVariant;

    const mainNavItems: NavItem[] = [
      {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
      },
    ];

    // Products اور اس کے submenu
    if (hasAnyProductPerm || hasAnyCategoryPerm || hasAnyVariantPerm) {
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

      // Add Attributes to submenu
      productSubmenu.push({
        title: 'Attributes',
        href: '/admin/attributes',
        icon: Palette,
      });

      if (productSubmenu.length > 0) {
        mainNavItems.push({
          title: 'Products Management',
          href: '#',
          icon: Sprout,
          children: productSubmenu,
        });
      }
    }

    if (hasAnyUserPerm) {
      mainNavItems.push({ title: 'Users', href: '/users', icon: UsersRound });
    }

    if (hasAnyRolePerm) {
      mainNavItems.push({ title: 'Roles', href: '/roles', icon: ShieldCheck });
    }

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