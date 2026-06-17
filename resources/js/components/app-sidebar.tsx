// components/app-sidebar.tsx
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
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { LayoutGrid, Image, Monitor } from 'lucide-react';

import { usePermissionChecks } from '@/hooks/use-permission-checks';
import { BlogSection } from '@/components/sidebar-sections/blog-section';
import { ProductsSection } from '@/components/sidebar-sections/products-section';
import { ShopSection } from '@/components/sidebar-sections/shop-section';
import { MessagingSection } from '@/components/sidebar-sections/messaging-section';
import { UserManagementSection } from '@/components/sidebar-sections/user-management-section';
import { SettingsSections } from '@/components/sidebar-sections/settings-sections';
import { AffiliateSection } from '@/components/sidebar-sections/affiliate-section';
import AppLogo from './app-logo';

export function AppSidebar() {
    const permissions = usePermissionChecks();

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: route('admin.dashboard'),
            icon: LayoutGrid,
        },
    ];

    // Blog Section — fully permission-gated
    const blogSection = BlogSection({
        hasAnyBlogPerm: permissions.hasAnyBlogPerm,
        hasAnyBlogCategoryPerm: permissions.hasAnyBlogCategoryPerm,
        hasAnyBlogCommentPerm: permissions.hasAnyBlogCommentPerm,
        hasAnyBlogTagPerm: permissions.hasAnyBlogTagPerm,
    });
    if (blogSection) {
        mainNavItems.push(blogSection);
    }

    // Products Section — fully permission-gated
    const productsSection = ProductsSection({
        hasAnyProductPerm: permissions.hasAnyProductPerm,
        hasAnyCategoryPerm: permissions.hasAnyCategoryPerm,
        hasAnyVariantPerm: permissions.hasAnyVariantPerm,
        hasAnyAttributePerm: permissions.hasAnyAttributePerm,
        hasAnyDealPerm: permissions.hasAnyDealPerm,
        hasAnyInventoryPerm: permissions.hasAnyInventoryPerm,
        hasAnyWishlistPerm: permissions.hasAnyWishlistPerm,
        hasAnyReviewPerm: permissions.hasAnyReviewPerm,
    });
    if (productsSection) {
        mainNavItems.push(productsSection);
    }

    // Shop Section — fully permission-gated (no more || true)
    const shopSection = ShopSection({
        hasAnyCustomerPerm: permissions.hasAnyCustomerPerm,
        hasAnyOrderPerm: permissions.hasAnyOrderPerm,
        hasAnySalePerm: permissions.hasAnySalePerm,
        hasAnyCitiesPerm: permissions.hasAnyCitiesPerm,
        hasAnyCouponPerm: permissions.hasAnyCouponPerm,
        hasAnyOrderReviewPerm: permissions.hasAnyOrderReviewPerm,
    });
    if (shopSection) {
        mainNavItems.push(shopSection);
    }

    // Messaging Section — fully permission-gated (no more || true)
    const messagingSection = MessagingSection({
        hasAnyContactMsg: permissions.hasAnyContactMsgPerm,
        hasAnyNewsletter: permissions.hasAnyNewsletterPerm,
        hasAnyWhatsapp: permissions.hasAnyWhatsappPerm,
    });
    if (messagingSection) {
        mainNavItems.push(messagingSection);
    }

    // User Management Section — fully permission-gated (no more || true)
    const userManagementSection = UserManagementSection({
        hasAnyUserPerm: permissions.hasAnyUserPerm,
        hasAnyRolePerm: permissions.hasAnyRolePerm,
        hasAnyPermissionPerm: permissions.hasAnyPermissionPerm,
        hasAnyVendorPerm: permissions.hasAnyVendorPerm,
    });
    if (userManagementSection) {
        mainNavItems.push(userManagementSection);
    }

    // Affiliate Section
    // isAffiliate: user has view.affiliates (affiliate role users)
    // isAdmin: user can manage affiliates — only super-admin / admin (manage.affiliates permission)
    // managers, customers, and regular users see nothing
    const affiliateSection = AffiliateSection({
        isAffiliate: permissions.canViewAffiliate,
        isAdmin: permissions.canManageAffiliate,
    });
    if (affiliateSection) {
        mainNavItems.push(affiliateSection);
    }

    // Slides — permission-gated
    if (permissions.hasAnySlidePerm) {
        mainNavItems.push({
            title: 'Slides',
            href: '/admin/slides',
            icon: Image,
        });
    }

    // Display / UI Settings quick link — permission-gated
    if (permissions.hasAnySettingsPerm) {
        mainNavItems.push({
            title: 'Display Settings',
            href: '/admin/settings/ui',
            icon: Monitor,
        });
    }

    // Footer: Settings — shown only if user has settings permissions
    const footerNavItems = SettingsSections();

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={route('admin.dashboard')} prefetch>
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
