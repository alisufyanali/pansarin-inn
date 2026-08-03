// hooks/use-permission-checks.ts
import { can } from '@/lib/can';

export function usePermissionChecks() {
    // Products
    const canCreateProduct = can('create.products');
    const canEditProduct = can('edit.products');
    const canDeleteProduct = can('delete.products');
    const canViewProduct = can('view.products');
    const hasAnyProductPerm = canCreateProduct || canEditProduct || canDeleteProduct || canViewProduct;

    // Categories
    const canCreateCategory = can('create.categories');
    const canEditCategory = can('edit.categories');
    const canDeleteCategory = can('delete.categories');
    const canViewCategory = can('view.categories');
    const hasAnyCategoryPerm = canCreateCategory || canEditCategory || canDeleteCategory || canViewCategory;

    // Variants
    const canCreateVariant = can('create.variants');
    const canEditVariant = can('edit.variants');
    const canDeleteVariant = can('delete.variants');
    const canViewVariant = can('view.variants');
    const hasAnyVariantPerm = canCreateVariant || canEditVariant || canDeleteVariant || canViewVariant;

    // Attributes
    const canCreateAttribute = can('create.attributes');
    const canEditAttribute = can('edit.attributes');
    const canDeleteAttribute = can('delete.attributes');
    const canViewAttribute = can('view.attributes');
    const hasAnyAttributePerm = canCreateAttribute || canEditAttribute || canDeleteAttribute || canViewAttribute;

    // Users
    const canCreateUser = can('create.users');
    const canEditUser = can('edit.users');
    const canDeleteUser = can('delete.users');
    const canViewUser = can('view.users');
    const hasAnyUserPerm = canCreateUser || canEditUser || canDeleteUser || canViewUser;

    // Roles
    const canCreateRole = can('create.roles');
    const canEditRole = can('edit.roles');
    const canDeleteRole = can('delete.roles');
    const canViewRole = can('view.roles');
    const hasAnyRolePerm = canCreateRole || canEditRole || canDeleteRole || canViewRole;

    // Permissions
    const canCreatePermission = can('create.permissions');
    const canEditPermission = can('edit.permissions');
    const canDeletePermission = can('delete.permissions');
    const canViewPermission = can('view.permissions');
    const hasAnyPermissionPerm = canCreatePermission || canEditPermission || canDeletePermission || canViewPermission;

    // Customers
    const canCreateCustomer = can('create.customers');
    const canEditCustomer = can('edit.customers');
    const canDeleteCustomer = can('delete.customers');
    const canViewCustomer = can('view.customers');
    const hasAnyCustomerPerm = canCreateCustomer || canEditCustomer || canDeleteCustomer || canViewCustomer;

    // Orders
    const canCreateOrder = can('create.orders');
    const canEditOrder = can('edit.orders');
    const canDeleteOrder = can('delete.orders');
    const canViewOrder = can('view.orders');
    const hasAnyOrderPerm = canCreateOrder || canEditOrder || canDeleteOrder || canViewOrder;

    // Sales
    const canCreateSale = can('create.sales');
    const canEditSale = can('edit.sales');
    const canDeleteSale = can('delete.sales');
    const canViewSale = can('view.sales');
    const hasAnySalePerm = canCreateSale || canEditSale || canDeleteSale || canViewSale;

    // Coupons
    const canViewCoupon = can('view.coupons');
    const canCreateCoupon = can('create.coupons');
    const canEditCoupon = can('edit.coupons');
    const canDeleteCoupon = can('delete.coupons');
    const hasAnyCouponPerm = canViewCoupon || canCreateCoupon || canEditCoupon || canDeleteCoupon;

    // Cities
    const canCreateCities = can('create.cities');
    const canEditCities = can('edit.cities');
    const canDeleteCities = can('delete.cities');
    const canViewCities = can('view.cities');
    const hasAnyCitiesPerm = canCreateCities || canEditCities || canDeleteCities || canViewCities;

    // Deals
    const canViewDeal = can('view.deals');
    const canCreateDeal = can('create.deals');
    const canEditDeal = can('edit.deals');
    const canDeleteDeal = can('delete.deals');
    const hasAnyDealPerm = canViewDeal || canCreateDeal || canEditDeal || canDeleteDeal;

    // Inventory
    const canViewInventory = can('view.inventory');
    const canCreateInventory = can('create.inventory');
    const canEditInventory = can('edit.inventory');
    const canDeleteInventory = can('delete.inventory');
    const hasAnyInventoryPerm = canViewInventory || canCreateInventory || canEditInventory || canDeleteInventory;

    // Wishlists
    const canViewWishlist = can('view.wishlists');
    const canCreateWishlist = can('create.wishlists');
    const canDeleteWishlist = can('delete.wishlists');
    const hasAnyWishlistPerm = canViewWishlist || canCreateWishlist || canDeleteWishlist;

    // Blogs
    const canViewBlog = can('view.blogs');
    const canCreateBlog = can('create.blogs');
    const canEditBlog = can('edit.blogs');
    const canDeleteBlog = can('delete.blogs');
    const hasAnyBlogPerm = canViewBlog || canCreateBlog || canEditBlog || canDeleteBlog;

    // Blog Categories
    const canViewBlogCategory = can('view.blog-categories');
    const hasAnyBlogCategoryPerm = canViewBlogCategory || can('create.blog-categories') || can('edit.blog-categories') || can('delete.blog-categories');

    // Blog Comments
    const canViewBlogComment = can('view.blogcomments');
    const hasAnyBlogCommentPerm = canViewBlogComment || can('create.blogcomments') || can('edit.blogcomments') || can('delete.blogcomments');

    // Blog Tags
    const canViewBlogTag = can('view.blogtags');
    const hasAnyBlogTagPerm = canViewBlogTag || can('create.blogtags') || can('edit.blogtags') || can('delete.blogtags');

    // Order Reviews
    const canViewOrderReview = can('view.order-reviews');
    const hasAnyOrderReviewPerm = canViewOrderReview || can('create.order-reviews') || can('edit.order-reviews') || can('delete.order-reviews');

    // Reviews (Product)
    const canViewReview = can('view.reviews');
    const hasAnyReviewPerm = canViewReview || can('create.reviews') || can('edit.reviews') || can('delete.reviews');

    // Slides
    const canViewSlide = can('view.slides');
    const hasAnySlidePerm = canViewSlide || can('create.slides') || can('edit.slides') || can('delete.slides');

    // Newsletters — fixed permission name (was 'view.Newsletters', should be 'view.newsletters')
    const canViewNewsletter = can('view.newsletters');
    const hasAnyNewsletterPerm = canViewNewsletter || can('create.newsletters') || can('edit.newsletters') || can('delete.newsletters');

    // Contacts — fixed permission name (was 'view.ContactMsgs', should be 'view.contacts')
    const canViewContact = can('view.contacts');
    const hasAnyContactMsgPerm = canViewContact || can('create.contacts') || can('edit.contacts') || can('delete.contacts');

    // WhatsApp — fixed permission name (was 'view.Whatsapps', should be 'view.whatsapp')
    const canViewWhatsapp = can('view.whatsapp');
    const canSendWhatsapp = can('send.whatsapp');
    const hasAnyWhatsappPerm = canViewWhatsapp || canSendWhatsapp;

    // Notifications
    const canViewNotification = can('view.notifications');
    const hasAnyNotificationPerm = canViewNotification || can('delete.notifications');

    // Settings
    const canViewSettings = can('view.settings');
    const canEditSettings = can('edit.settings');
    const hasAnySettingsPerm = canViewSettings || canEditSettings;

    // Affiliates
    const canViewAffiliate = can('view.affiliates');
    const canManageAffiliate = can('manage.affiliates');
    const hasAnyAffiliatePerm = canViewAffiliate || canManageAffiliate || can('create.affiliates') || can('edit.affiliates');

    // Payout requests
    const canViewPayout = can('view.payout.requests');
    const canApprovePayout = can('approve.payout.requests');
    const hasAnyPayoutPerm = canViewPayout || canApprovePayout;

    // Health Concerns
    const canViewHealthConcern   = can('view.health-concerns');
    const canCreateHealthConcern = can('create.health-concerns');
    const canEditHealthConcern   = can('edit.health-concerns');
    const canDeleteHealthConcern = can('delete.health-concerns');
    const hasAnyHealthConcernPerm = canViewHealthConcern || canCreateHealthConcern || canEditHealthConcern || canDeleteHealthConcern;

    // Vendors
    const canCreateVendor = can('create.vendors');
    const canEditVendor = can('edit.vendors');
    const canDeleteVendor = can('delete.vendors');
    const canViewVendor = can('view.vendors');
    const hasAnyVendorPerm = canCreateVendor || canEditVendor || canDeleteVendor || canViewVendor;

    // Frontend Content
    const canViewFrontend = can('view.frontend');
    const hasAnyFrontendPerm = canViewFrontend || can('create.frontend') || can('edit.frontend') || can('delete.frontend');

    // Returns
    const canViewReturnRequests = can('view.return-requests');
    const canEditReturnRequests = can('edit.return-requests');
    const hasAnyReturnRequestPerm = canViewReturnRequests || canEditReturnRequests || can('delete.return-requests');

    // Loyalty Points
    const canViewLoyalty = can('view.loyalty');
    const canEditLoyalty = can('edit.loyalty');
    const canViewLoyaltySettings = can('view.loyalty-settings');
    const hasAnyLoyaltyPerm = canViewLoyalty || canEditLoyalty || canViewLoyaltySettings || can('edit.loyalty-settings');

    // Reports
    const canViewReports = can('view.reports');
    const canExportReports = can('export.reports');
    const hasAnyReportsPerm = canViewReports || canExportReports;

    return {
        // Aggregate flags
        hasAnyProductPerm,
        hasAnyCategoryPerm,
        hasAnyVariantPerm,
        hasAnyAttributePerm,
        hasAnyUserPerm,
        hasAnyRolePerm,
        hasAnyPermissionPerm,
        hasAnyCustomerPerm,
        hasAnyOrderPerm,
        hasAnySalePerm,
        hasAnyCouponPerm,
        hasAnyCitiesPerm,
        hasAnyDealPerm,
        hasAnyInventoryPerm,
        hasAnyWishlistPerm,
        hasAnyHealthConcernPerm,
        hasAnyBlogPerm,
        hasAnyBlogCategoryPerm,
        hasAnyBlogCommentPerm,
        hasAnyBlogTagPerm,
        hasAnyOrderReviewPerm,
        hasAnyReviewPerm,
        hasAnySlidePerm,
        hasAnyNewsletterPerm,
        hasAnyContactMsgPerm,
        hasAnyWhatsappPerm,
        hasAnyNotificationPerm,
        hasAnySettingsPerm,
        hasAnyAffiliatePerm,
        hasAnyPayoutPerm,
        hasAnyVendorPerm,
        hasAnyFrontendPerm,
        hasAnyReturnRequestPerm,
        hasAnyLoyaltyPerm,
        hasAnyReportsPerm,

        // Individual view permissions
        canViewProduct,
        canViewCategory,
        canViewVariant,
        canViewAttribute,
        canViewUser,
        canViewRole,
        canViewPermission,
        canViewCustomer,
        canViewOrder,
        canViewSale,
        canViewCoupon,
        canViewCities,
        canViewDeal,
        canViewInventory,
        canViewWishlist,
        canViewHealthConcern,
        canViewBlog,
        canViewBlogCategory,
        canViewBlogComment,
        canViewBlogTag,
        canViewOrderReview,
        canViewReview,
        canViewSlide,
        canViewNewsletter,
        canViewContact,
        canViewWhatsapp,
        canSendWhatsapp,
        canViewNotification,
        canViewSettings,
        canEditSettings,
        canViewAffiliate,
        canManageAffiliate,
        canViewPayout,
        canApprovePayout,
        canViewVendor,
        canViewFrontend,
        // Returns
        canViewReturnRequests,
        canEditReturnRequests,
        // Loyalty
        canViewLoyalty,
        canEditLoyalty,
        canViewLoyaltySettings,
        // Reports
        canViewReports,
        canExportReports,
    };
}
