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
// import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { LayoutGrid } from 'lucide-react';

import { usePermissionChecks } from '@/hooks/use-permission-checks';
import { BlogSection } from '@/components/sidebar-sections/blog-section';
import { ProductsSection } from '@/components/sidebar-sections/products-section';
import { ShopSection } from '@/components/sidebar-sections/shop-section';
import { MessagingSection } from '@/components/sidebar-sections/messaging-section';
import { UserManagementSection } from '@/components/sidebar-sections/user-management-section';
import { SettingsSections } from '@/components/sidebar-sections/settings-sections';
import AppLogo from './app-logo';
import { AffiliateSection } from './sidebar-sections/affiliate-section';

export function AppSidebar() {
  const permissions = usePermissionChecks();

  const mainNavItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: "/admin/dashboard",
      icon: LayoutGrid,
    },
  ];

  // Add Blog Section
  const blogSection = BlogSection();
  if (blogSection) {
    mainNavItems.push(blogSection);
  }

  // Add Products Section
  const productsSection = ProductsSection({
    hasAnyProductPerm: permissions.hasAnyProductPerm,
    hasAnyCategoryPerm: permissions.hasAnyCategoryPerm,
    hasAnyVariantPerm: permissions.hasAnyVariantPerm,
    hasAnyAttributePerm: permissions.hasAnyAttributePerm,
  });
  if (productsSection) {
    mainNavItems.push(productsSection);
  }

  // Add Shop Section
  const shopSection = ShopSection({
    hasAnyCustomerPerm: permissions.hasAnyCustomerPerm || true,
    hasAnyOrderPerm: permissions.hasAnyOrderPerm || true,
    hasAnySalePerm: permissions.hasAnySalePerm || true,
  });
  if (shopSection) {
    mainNavItems.push(shopSection);
  }

  // Add Messaging Section
  const messagingSection = MessagingSection({
    hasAnyContactMsg: permissions.hasAnyContactMsgPerm || true, // Temporary true - baad mein permission se replace karna
    hasAnyNewsletter: permissions.hasAnyNewsletterPerm || true,
    hasAnyWhatsapp: permissions.hasAnyWhatsappPerm || true,
  });
  if (messagingSection) {
    mainNavItems.push(messagingSection);
  }

  // Add User Management Section
  const userManagementSection = UserManagementSection({
    hasAnyUserPerm: permissions.hasAnyUserPerm,
    hasAnyRolePerm: permissions.hasAnyRolePerm,
    hasAnyPermissionPerm: permissions.hasAnyPermissionPerm|| true,
    hasAnyVendorPerm: permissions.hasAnyVendorPerm|| true,
  });
  if (userManagementSection) {
    mainNavItems.push(userManagementSection);
  }

  // Add Affiliate Section
  const affiliateSection = AffiliateSection();
  if (affiliateSection) {
    mainNavItems.push(affiliateSection);
  }

  // Get Footer Items (Settings)
  const footerNavItems = SettingsSections();

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              {/* <Link href={dashboard()} prefetch> */}
              <Link href={"dashboard"} prefetch>
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