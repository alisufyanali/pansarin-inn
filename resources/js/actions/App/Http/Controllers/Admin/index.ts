import RoleController from './RoleController'
import CategoryController from './CategoryController'
import ProductController from './ProductController'
import ProductVariantController from './ProductVariantController'
import ProductAttributeController from './ProductAttributeController'
import OrderController from './OrderController'
import CustomerController from './CustomerController'
import CouponController from './CouponController'
import BlogCategoryController from './BlogCategoryController'
import BlogController from './BlogController'
import BlogsCommentsController from './BlogsCommentsController'
import BlogTagsController from './BlogTagsController'
import InventoryController from './InventoryController'
import NotificationController from './NotificationController'
import FrontendContentController from './FrontendContentController'
import AffiliateController from './AffiliateController'
const Admin = {
    RoleController: Object.assign(RoleController, RoleController),
CategoryController: Object.assign(CategoryController, CategoryController),
ProductController: Object.assign(ProductController, ProductController),
ProductVariantController: Object.assign(ProductVariantController, ProductVariantController),
ProductAttributeController: Object.assign(ProductAttributeController, ProductAttributeController),
OrderController: Object.assign(OrderController, OrderController),
CustomerController: Object.assign(CustomerController, CustomerController),
CouponController: Object.assign(CouponController, CouponController),
BlogCategoryController: Object.assign(BlogCategoryController, BlogCategoryController),
BlogController: Object.assign(BlogController, BlogController),
BlogsCommentsController: Object.assign(BlogsCommentsController, BlogsCommentsController),
BlogTagsController: Object.assign(BlogTagsController, BlogTagsController),
InventoryController: Object.assign(InventoryController, InventoryController),
NotificationController: Object.assign(NotificationController, NotificationController),
FrontendContentController: Object.assign(FrontendContentController, FrontendContentController),
AffiliateController: Object.assign(AffiliateController, AffiliateController),
}

export default Admin