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

    // cities
    const canCreateCities = can('create.cities');
    const canEditCities = can('edit.cities');
    const canDeleteCities = can('delete.cities');
    const canViewCities = can('view.cities');
    const hasAnyCitiesPerm = canCreateCities || canEditCities || canDeleteCities || canViewCities;



    // Permissions
    const canCreatePermission = can('create.permissions');
    const canEditPermission = can('edit.permissions');
    const canDeletePermission = can('delete.permissions');
    const canViewPermission = can('view.permissions');
    const hasAnyPermissionPerm = canCreatePermission || canEditPermission || canDeletePermission || canViewPermission;

    // Vendors
    const canCreateVendor =  can('create.vendors');
    const canEditVendor = can('edit.vendors');
    const canDeleteVendor = can('delete.vendors');
    const canViewVendor = can('view.vendors');
    const hasAnyVendorPerm = canCreateVendor || canEditVendor || canDeleteVendor || canViewVendor;


    // Mesageing
    const canCreateContactMsg =  can('create.ContactMsgs');
    const canEditContactMsg = can('edit.ContactMsgs');
    const canDeleteContactMsg = can('delete.ContactMsgs');
    const canViewContactMsg = can('view.ContactMsgs');
    const hasAnyContactMsgPerm = canCreateContactMsg || canEditContactMsg || canDeleteContactMsg || canViewContactMsg;

    // Newsletter
    const canCreateNewsletter =  can('create.Newsletters');
    const canEditNewsletter = can('edit.Newsletters');
    const canDeleteNewsletter = can('delete.Newsletters');
    const canViewNewsletter = can('view.Newsletters');
    const hasAnyNewsletterPerm = canCreateNewsletter || canEditNewsletter || canDeleteNewsletter || canViewNewsletter;

    // Whatsapp
    const canCreateWhatsapp =  can('create.Whatsapps');
    const canEditWhatsapp = can('edit.Whatsapps');
    const canDeleteWhatsapp = can('delete.Whatsapps');
    const canViewWhatsapp = can('view.Whatsapps');
    const hasAnyWhatsappPerm = canCreateWhatsapp || canEditWhatsapp || canDeleteWhatsapp || canViewWhatsapp;




    return {
        hasAnyProductPerm,
        hasAnyCategoryPerm,
        hasAnyVariantPerm,
        hasAnyAttributePerm,
        hasAnyUserPerm,
        hasAnyRolePerm,
        hasAnyCustomerPerm,
        hasAnyOrderPerm,
        hasAnySalePerm,
        hasAnyCitiesPerm,
        hasAnyPermissionPerm,
        hasAnyVendorPerm,
        hasAnyContactMsgPerm,
        hasAnyNewsletterPerm,
        hasAnyWhatsappPerm,
        // Individual permissions agar zaroori hon to
        canViewProduct,
        canViewCategory,
        canViewVariant,
        canViewAttribute,
        canViewUser,
        canViewRole,
        canViewCustomer,
        canViewOrder,
        canViewSale,
        canViewPermission,
        canViewVendor,

    };
}