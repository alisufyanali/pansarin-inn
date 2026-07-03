# Pansarin Inn - Laravel Project Comprehensive Inventory
**Generated:** June 30, 2026

---

## 1. CONTROLLERS - app/Http/Controllers

### Root Controllers
| Path | File Name | Purpose |
|------|-----------|---------|
| app/Http/Controllers/ | Controller.php | Base controller class |
| app/Http/Controllers/ | UserController.php | User management |
| app/Http/Controllers/ | TestController.php | Testing functionality |

### Admin Controllers (app/Http/Controllers/Admin)
| Path | File Name | Purpose |
|------|-----------|---------|
| app/Http/Controllers/Admin/ | AdminAffiliateController.php | Admin affiliate management |
| app/Http/Controllers/Admin/ | AffiliateController.php | General affiliate operations |
| app/Http/Controllers/Admin/ | BlogCategoryController.php | Blog category CRUD |
| app/Http/Controllers/Admin/ | BlogController.php | Blog post CRUD |
| app/Http/Controllers/Admin/ | BlogsCommentsController.php | Blog comments management |
| app/Http/Controllers/Admin/ | BlogTagController.php | Blog tag management |
| app/Http/Controllers/Admin/ | CategoryController.php | Product category CRUD |
| app/Http/Controllers/Admin/ | CityController.php | City/location management |
| app/Http/Controllers/Admin/ | ContactController.php | Contact submissions |
| app/Http/Controllers/Admin/ | CouponController.php | Discount coupon management |
| app/Http/Controllers/Admin/ | CustomerController.php | Customer management |
| app/Http/Controllers/Admin/ | FrontendContentController.php | Frontend content management |
| app/Http/Controllers/Admin/ | InventoryController.php | Inventory tracking |
| app/Http/Controllers/Admin/ | NewsletterController.php | Newsletter management |
| app/Http/Controllers/Admin/ | NotificationController.php | System notifications |
| app/Http/Controllers/Admin/ | OrderController.php | Order management |
| app/Http/Controllers/Admin/ | OrderReviewController.php | Order review management |
| app/Http/Controllers/Admin/ | PageController.php | Static pages management |
| app/Http/Controllers/Admin/ | PermissionController.php | Permission management |
| app/Http/Controllers/Admin/ | ProductAttributeController.php | Product attributes (sizes, colors) |
| app/Http/Controllers/Admin/ | ProductController.php | Product management |
| app/Http/Controllers/Admin/ | ProductsDealController.php | Deal/promotion management |
| app/Http/Controllers/Admin/ | ProductsReviewsController.php | Product reviews management |
| app/Http/Controllers/Admin/ | ProductVariantController.php | Product variant management |
| app/Http/Controllers/Admin/ | RoleController.php | User role management |
| app/Http/Controllers/Admin/ | SaleController.php | Sale/transaction management |
| app/Http/Controllers/Admin/ | SlideController.php | Homepage slider management |
| app/Http/Controllers/Admin/ | WhatsappController.php | WhatsApp messaging control |
| app/Http/Controllers/Admin/ | WishlistController.php | Customer wishlist management |

### Admin Sub-Controllers - Affiliate (app/Http/Controllers/Admin/Affiliate)
| Path | File Name | Purpose |
|------|-----------|---------|
| app/Http/Controllers/Admin/Affiliate/ | PayoutController.php | Affiliate payout management |

### Admin Sub-Controllers - Settings (app/Http/Controllers/Admin/Settings)
| Path | File Name | Purpose |
|------|-----------|---------|
| app/Http/Controllers/Admin/Settings/ | BusinessSettingController.php | Business configuration |
| app/Http/Controllers/Admin/Settings/ | GeneralSettingController.php | General system settings |
| app/Http/Controllers/Admin/Settings/ | UiSettingController.php | UI/UX configuration |

### Affiliate Controllers (app/Http/Controllers/Affiliate)
| Path | File Name | Purpose |
|------|-----------|---------|
| app/Http/Controllers/Affiliate/ | AffiliateController.php | Affiliate dashboard & operations |
| app/Http/Controllers/Affiliate/ | MarketingController.php | Affiliate marketing tools |
| app/Http/Controllers/Affiliate/ | PayoutController.php | Affiliate payout requests |

### API Controllers (app/Http/Controllers/API)
| Path | File Name | Purpose |
|------|-----------|---------|
| app/Http/Controllers/API/ | AuthApiController.php | Authentication endpoints |
| app/Http/Controllers/API/ | BlogApiController.php | Blog data API |
| app/Http/Controllers/API/ | CartApiController.php | Shopping cart API |
| app/Http/Controllers/API/ | ContactApiController.php | Contact form API |
| app/Http/Controllers/API/ | CouponApiController.php | Coupon validation API |
| app/Http/Controllers/API/ | FrontendController.php | General frontend API |
| app/Http/Controllers/API/ | HomepageApiController.php | Homepage data API |
| app/Http/Controllers/API/ | NewsletterApiController.php | Newsletter API |
| app/Http/Controllers/API/ | OrderApiController.php | Order placement API |
| app/Http/Controllers/API/ | ProductApiController.php | Product data API |
| app/Http/Controllers/API/ | WishlistApiController.php | Wishlist API |

### Settings Controllers (app/Http/Controllers/Settings)
| Path | File Name | Purpose |
|------|-----------|---------|
| app/Http/Controllers/Settings/ | PasswordController.php | Password change |
| app/Http/Controllers/Settings/ | ProfileController.php | User profile management |
| app/Http/Controllers/Settings/ | TwoFactorAuthenticationController.php | 2FA configuration |

---

## 2. SERVICES - app/Services

| Path | File Name | Purpose |
|------|-----------|---------|
| app/Services/ | AffiliateService.php | Affiliate program logic |
| app/Services/ | CourierService.php | Courier/shipping integration |
| app/Services/ | WhatsAppService.php | WhatsApp messaging service |

---

## 3. REPOSITORIES - app/Http/Repositories

### Admin Repositories (app/Http/Repositories/Admin)
| Path | File Name | Purpose |
|------|-----------|---------|
| app/Http/Repositories/Admin/ | BlogCategoryRepository.php | Blog category data access |
| app/Http/Repositories/Admin/ | BlogCommentsRepository.php | Blog comments data access |
| app/Http/Repositories/Admin/ | BlogRepository.php | Blog posts data access |
| app/Http/Repositories/Admin/ | BlogTagRepository.php | Blog tags data access |
| app/Http/Repositories/Admin/ | CategoryRepository.php | Product categories data access |
| app/Http/Repositories/Admin/ | CityRepository.php | Cities data access |
| app/Http/Repositories/Admin/ | ContactRepository.php | Contact submissions data access |
| app/Http/Repositories/Admin/ | CouponRepository.php | Coupons data access |
| app/Http/Repositories/Admin/ | CustomerRepository.php | Customer data access |
| app/Http/Repositories/Admin/ | CustomerRepository2.php | Alternative customer repository |
| app/Http/Repositories/Admin/ | InventoryRepository.php | Inventory data access |
| app/Http/Repositories/Admin/ | NewsletterRepository.php | Newsletter data access |
| app/Http/Repositories/Admin/ | OrderRepository.php | Order data access |
| app/Http/Repositories/Admin/ | OrderReviewRepository.php | Order review data access |
| app/Http/Repositories/Admin/ | PermissionRepository.php | Permission data access |
| app/Http/Repositories/Admin/ | ProductAttributeRepository.php | Product attributes data access |
| app/Http/Repositories/Admin/ | ProductDealRepository.php | Product deals data access |
| app/Http/Repositories/Admin/ | ProductRepository.php | Product data access |
| app/Http/Repositories/Admin/ | ProductReviewRepository.php | Product reviews data access |
| app/Http/Repositories/Admin/ | ProductVariantRepository.php | Product variants data access |
| app/Http/Repositories/Admin/ | SaleRepository.php | Sales data access |
| app/Http/Repositories/Admin/ | SlideRepository.php | Slides data access |
| app/Http/Repositories/Admin/ | WishlistRepository.php | Wishlist data access |

---

## 4. MODELS - app/Models

| Path | File Name | Purpose |
|------|-----------|---------|
| app/Models/ | Affiliate.php | Affiliate user model |
| app/Models/ | AffiliateClick.php | Affiliate click tracking |
| app/Models/ | AffiliateCommission.php | Affiliate commission tracking |
| app/Models/ | AffiliateSetting.php | Affiliate system settings |
| app/Models/ | Attribute.php | Product attribute definition |
| app/Models/ | AttributeValue.php | Product attribute values |
| app/Models/ | AuditLog.php | System audit logging |
| app/Models/ | Backup.php | Database backup tracking |
| app/Models/ | Blog.php | Blog post model |
| app/Models/ | BlogCategory.php | Blog category model |
| app/Models/ | BlogComments.php | Blog comment model |
| app/Models/ | BlogTag.php | Blog tag model |
| app/Models/ | BusinessSetting.php | Business configuration |
| app/Models/ | Cart.php | Shopping cart model |
| app/Models/ | Category.php | Product category model |
| app/Models/ | Chatbot.php | Chatbot configuration |
| app/Models/ | City.php | City/location model |
| app/Models/ | Contact.php | Contact submission model |
| app/Models/ | Country.php | Country model |
| app/Models/ | Coupon.php | Discount coupon model |
| app/Models/ | Customer.php | Customer user model |
| app/Models/ | CustomerAddress.php | Customer address model |
| app/Models/ | CustomerGroup.php | Customer group/tier model |
| app/Models/ | Deal.php | Deal/promotion model |
| app/Models/ | EmailTemplate.php | Email template model |
| app/Models/ | FrontendContent.php | Frontend content model |
| app/Models/ | GeneralSetting.php | General system settings |
| app/Models/ | HomepageCategoryProduct.php | Homepage category product linking |
| app/Models/ | Inventory.php | Inventory tracking model |
| app/Models/ | LoyaltyPoint.php | Loyalty point model |
| app/Models/ | Media.php | Media/file model |
| app/Models/ | Newsletter.php | Newsletter subscription model |
| app/Models/ | Notification.php | System notification model |
| app/Models/ | Order.php | Order model |
| app/Models/ | OrderItem.php | Individual order item model |
| app/Models/ | OrderReview.php | Order review model |
| app/Models/ | OrderStatusHistory.php | Order status change history |
| app/Models/ | Page.php | Static page model |
| app/Models/ | PaymentGateway.php | Payment gateway configuration |
| app/Models/ | PaymentMethod.php | Payment method model |
| app/Models/ | PaymentSetting.php | Payment system settings |
| app/Models/ | PayoutRequest.php | Affiliate/vendor payout request |
| app/Models/ | PointTransaction.php | Loyalty point transaction |
| app/Models/ | Product.php | Product model |
| app/Models/ | ProductsReviews.php | Product review model |
| app/Models/ | ProductStock.php | Product stock tracking |
| app/Models/ | ProductVariant.php | Product variant model |
| app/Models/ | Referral.php | Referral program model |
| app/Models/ | Remedy.php | Remedy/solution model |
| app/Models/ | Review.php | Generic review model |
| app/Models/ | Sale.php | Sale/transaction model |
| app/Models/ | SaleItem.php | Individual sale item model |
| app/Models/ | SecuritySetting.php | Security configuration |
| app/Models/ | Slide.php | Homepage slider slide model |
| app/Models/ | SmsTemplate.php | SMS template model |
| app/Models/ | State.php | State/province model |
| app/Models/ | SubCategory.php | Product subcategory model |
| app/Models/ | SystemSetting.php | System settings model |
| app/Models/ | Ticket.php | Support ticket model |
| app/Models/ | TicketReply.php | Support ticket reply model |
| app/Models/ | Transaction.php | Financial transaction model |
| app/Models/ | UiSetting.php | UI/theme configuration |
| app/Models/ | User.php | Base user model |
| app/Models/ | Vendor.php | Vendor user model |
| app/Models/ | VendorWallet.php | Vendor wallet balance |
| app/Models/ | Wallet.php | User wallet balance |
| app/Models/ | WalletTransaction.php | Wallet transaction history |
| app/Models/ | WhatsappMessage.php | WhatsApp message model |
| app/Models/ | WhatsappMessageLog.php | WhatsApp message log |
| app/Models/ | Wishlist.php | Customer wishlist model |

---

## 5. MIDDLEWARE - app/Http/Middleware

| Path | File Name | Purpose |
|------|-----------|---------|
| app/Http/Middleware/ | HandleAppearance.php | Theme/appearance handling |
| app/Http/Middleware/ | HandleInertiaRequests.php | Inertia.js request handling |
| app/Http/Middleware/ | TrackAffiliate.php | Affiliate tracking middleware |

---

## 6. POLICIES - app/Policies

| Path | File Name | Purpose |
|------|-----------|---------|
| app/Policies/ | AttributePolicy.php | Authorization for attribute operations |

---

## 7. EVENTS - app/Events

| Path | File Name | Purpose |
|------|-----------|---------|
| app/Events/ | LowStockAlert.php | Low stock inventory event |

---

## 8. LISTENERS - app/Listeners

| Path | File Name | Purpose |
|------|-----------|---------|
| app/Listeners/ | SendLowStockNotification.php | Low stock notification listener |

---

## 9. JOBS - app/Jobs

| Path | File Name | Purpose |
|------|-----------|---------|
| app/Jobs/ | SendCustomerWelcomeWhatsApp.php | Welcome WhatsApp to new customers |
| app/Jobs/ | SendOrderConfirmationEmail.php | Order confirmation email |
| app/Jobs/ | SendOrderWhatsAppNotification.php | Order status WhatsApp notification |
| app/Jobs/ | SendSaleConfirmationEmail.php | Sale confirmation email |
| app/Jobs/ | SendSaleReviewEmail.php | Request sale review email |
| app/Jobs/ | SendSaleReviewWhatsApp.php | Request sale review via WhatsApp |
| app/Jobs/ | SendSaleWhatsAppNotification.php | Sale notification via WhatsApp |

---

## 10. NOTIFICATIONS - app/Notifications

| Path | File Name | Purpose |
|------|-----------|---------|
| app/Notifications/ | LowStockNotification.php | Low stock alert notification |
| app/Notifications/ | OrderShipped.php | Order shipped notification |

---

## 11. MAIL - app/Mail

| Path | File Name | Purpose |
|------|-----------|---------|
| app/Mail/ | CustomerWelcomeMail.php | Welcome email for new customers |
| app/Mail/ | CustomNewsletterMail.php | Custom newsletter email |
| app/Mail/ | GuestAccountCreatedMail.php | Guest account creation email |
| app/Mail/ | NewsletterMail.php | Newsletter mailing class |
| app/Mail/ | NewsletterVerification.php | Newsletter subscription verification |
| app/Mail/ | NewsletterWelcome.php | Newsletter welcome email |
| app/Mail/ | OrderConfirmation.php | Order confirmation email |
| app/Mail/ | SaleConfirmationMail.php | Sale confirmation email |
| app/Mail/ | SaleReviewRequest.php | Request for sale review email |

---

## 12. ROUTES

| Path | File Name | Purpose |
|------|-----------|---------|
| routes/ | web.php | Frontend web routes |
| routes/ | api.php | API routes (Sanctum protected) |
| routes/ | admin.php | Admin dashboard routes |
| routes/ | affiliate.php | Affiliate portal routes |
| routes/ | settings.php | User settings routes |
| routes/ | frontend.php | Frontend public routes |
| routes/ | channels.php | Broadcasting channels |
| routes/ | console.php | Artisan console commands |
| routes/ | test.php | Testing routes |

---

## 13. MIGRATIONS - database/migrations

| Path | File Name | Purpose |
|------|-----------|---------|
| database/migrations/ | 0001_01_01_000000_create_users_table.php | Users table |
| database/migrations/ | 0001_01_01_000001_create_cache_table.php | Cache table |
| database/migrations/ | 0001_01_01_000002_create_jobs_table.php | Job queue table |
| database/migrations/ | 2025_11_15_054310_create_vendors_table.php | Vendor users table |
| database/migrations/ | 2025_11_15_054406_create_categories_table.php | Product categories |
| database/migrations/ | 2025_11_15_054610_create_products_table.php | Products table |
| database/migrations/ | 2025_11_15_054659_create_attributes_table.php | Product attributes |
| database/migrations/ | 2025_11_15_054743_create_attribute_values_table.php | Attribute values |
| database/migrations/ | 2025_11_15_054821_create_product_variants_table.php | Product variants |
| database/migrations/ | 2025_11_15_054912_create_product_stocks_table.php | Product stock tracking |
| database/migrations/ | 2025_11_15_054913_create_inventories_table.php | Inventory management |
| database/migrations/ | 2025_11_15_055424_create_cities_table.php | Cities/locations |
| database/migrations/ | 2025_11_15_055425_create_customers_table.php | Customer users |
| database/migrations/ | 2025_11_15_055426_create_orders_table.php | Customer orders |
| database/migrations/ | 2025_11_15_055438_create_transactions_table.php | Financial transactions |
| database/migrations/ | 2025_11_15_055555_create_reviews_table.php | Product/order reviews |
| database/migrations/ | 2025_11_15_055645_create_affiliates_table.php | Affiliate users |
| database/migrations/ | 2025_11_15_055730_create_referrals_table.php | Referral tracking |
| database/migrations/ | 2025_11_15_055933_create_tickets_table.php | Support tickets |
| database/migrations/ | 2025_11_15_060010_create_wishlists_table.php | Customer wishlists |
| database/migrations/ | 2025_11_15_060050_create_carts_table.php | Shopping carts |
| database/migrations/ | 2025_11_15_060060_create_order_items_table.php | Order line items |
| database/migrations/ | 2025_11_15_103815_create_blog_categoryts_table.php | Blog categories |
| database/migrations/ | 2025_11_15_103926_create_blogs_table.php | Blog posts |
| database/migrations/ | 2025_11_15_104010_create_remedies_table.php | Remedies/solutions |
| database/migrations/ | 2025_11_15_104048_create_contacts_table.php | Contact form submissions |
| database/migrations/ | 2025_11_15_104223_create_chatbots_table.php | Chatbot configurations |
| database/migrations/ | 2025_11_15_104345_create_email_templates_table.php | Email templates |
| database/migrations/ | 2025_11_15_104423_create_sms_templates_table.php | SMS templates |
| database/migrations/ | 2025_11_15_104515_create_media_table.php | Media/file storage |
| database/migrations/ | 2025_11_15_104556_create_backups_table.php | Backup tracking |
| database/migrations/ | 2025_11_15_105006_create_audit_logs_table.php | Audit logging |
| database/migrations/ | 2025_11_15_105138_create_vendor_wallets_table.php | Vendor wallet system |
| database/migrations/ | 2025_11_15_105215_create_ticket_replies_table.php | Support ticket replies |
| database/migrations/ | 2025_11_15_105254_create_system_settings_table.php | System configuration |
| database/migrations/ | 2025_11_15_105545_create_payment_settings_table.php | Payment settings |
| database/migrations/ | 2025_11_15_105637_create_security_settings_table.php | Security settings |
| database/migrations/ | 2025_11_17_193401_create_permission_tables.php | Spatie permissions |
| database/migrations/ | 2025_11_18_054813_create_personal_access_tokens_table.php | Laravel Sanctum tokens |
| database/migrations/ | 2025_11_26_102445_create_notifications_table.php | Database notifications |
| database/migrations/ | 2025_11_26_102446_create_newsletters_table.php | Newsletter subscriptions |
| database/migrations/ | 2026_01_02_202027_create_coupons_table.php | Discount coupons |
| database/migrations/ | 2026_01_04_062425_create_payout_requests.php | Payout request tracking |
| database/migrations/ | 2026_01_04_062648_create_affiliate_clicks.php | Affiliate click tracking |
| database/migrations/ | 2026_01_04_062908_create_affiliate_settings.php | Affiliate program settings |
| database/migrations/ | 2026_01_05_061328_create_blog_comments_table.php | Blog comments |
| database/migrations/ | 2026_01_06_120225_create_blog_tags_table.php | Blog tags |
| database/migrations/ | 2026_01_06_121913_create_blog_blog_tag_pivot_table.php | Blog-tag relationships |
| database/migrations/ | 2026_01_12_181721_create_product_reviews_table.php | Product reviews |
| database/migrations/ | 2026_01_14_163509_create_deals_table.php | Sales/deals |
| database/migrations/ | 2026_01_14_163837_create_deal_product_table.php | Deal-product relationships |
| database/migrations/ | 2026_01_16_034030_create_general_settings_table.php | General app settings |
| database/migrations/ | 2026_01_16_034038_create_ui_settings_table.php | UI/theme settings |
| database/migrations/ | 2026_01_16_034045_create_business_settings_table.php | Business configuration |
| database/migrations/ | 2026_01_16_034109_create_pages_table.php | Static pages |
| database/migrations/ | 2026_01_19_081144_create_settings_table.php | General settings table (1) |
| database/migrations/ | 2026_01_19_084314_create_settings_table.php | General settings table (2) |
| database/migrations/ | 2026_01_19_084315_create_whatsapp_message_logs_table.php | WhatsApp message logs |
| database/migrations/ | 2026_01_19_084316_create_whatsapp_messages_table.php | WhatsApp messages |
| database/migrations/ | 2026_01_20_195908_create_sales_table.php | Sale transactions |
| database/migrations/ | 2026_01_20_195917_create_sale_items_table.php | Sale line items |
| database/migrations/ | 2026_02_22_093656_create_telescope_entries_table.php | Laravel Telescope monitoring |
| database/migrations/ | 2026_02_28_125949_create_affiliate_commissions_table.php | Affiliate commissions |
| database/migrations/ | 2026_02_28_125950_create_frontend_contents_table.php | Frontend content management |
| database/migrations/ | 2026_03_01_024126_create_customer_groups_table.php | Customer groups/tiers |
| database/migrations/ | 2026_03_01_024132_create_customer_addresses_table.php | Customer addresses |
| database/migrations/ | 2026_03_01_024139_create_wallets_table.php | Customer wallet system |
| database/migrations/ | 2026_03_01_024145_create_wallet_transactions_table.php | Wallet transactions |
| database/migrations/ | 2026_03_01_024151_create_loyalty_points_table.php | Loyalty points |
| database/migrations/ | 2026_03_01_024158_create_point_transactions_table.php | Loyalty point transactions |
| database/migrations/ | 2026_03_01_024204_create_order_status_histories_table.php | Order status change history |
| database/migrations/ | 2026_03_01_024211_create_payment_methods_table.php | Payment methods |
| database/migrations/ | 2026_03_01_024221_create_payment_gateways_table.php | Payment gateways |
| database/migrations/ | 2026_04_14_000001_create_order_reviews_table.php | Order reviews |
| database/migrations/ | 2026_04_14_000002_create_slides_table.php | Homepage slides |
| database/migrations/ | 2026_04_14_192622_add_courier_weight_to_orders_table.php | Add courier weight column |
| database/migrations/ | 2026_04_25_000001_add_cost_price_to_order_items_table.php | Add cost price tracking |
| database/migrations/ | 2026_06_10_000001_make_attribute_value_id_nullable_in_product_variants.php | Make attribute value nullable |
| database/migrations/ | 2026_06_16_000001_add_performance_indexes.php | Performance optimization indexes |
| database/migrations/ | 2026_06_22_000001_create_homepage_category_products_table.php | Homepage category products |
| database/migrations/ | 2026_06_22_100001_add_show_on_homepage_to_product_reviews_table.php | Show review on homepage flag |

---

## 14. DATABASE SEEDERS - database/seeders

| Path | File Name | Purpose |
|------|-----------|---------|
| database/seeders/ | DatabaseSeeder.php | Main seeder runner |
| database/seeders/ | AdminSeeder.php | Admin user data |
| database/seeders/ | AffiliateSeeder.php | Affiliate program data |
| database/seeders/ | AffiliateTestSeeder.php | Test affiliate data |
| database/seeders/ | AttributeSeeder.php | Product attributes |
| database/seeders/ | BlogCategorySeeder.php | Blog categories |
| database/seeders/ | BlogSeeder.php | Blog posts |
| database/seeders/ | BusinessSettingSeeder.php | Business configuration |
| database/seeders/ | CategorySeeder.php | Product categories |
| database/seeders/ | CitySeeder.php | Cities/locations |
| database/seeders/ | ContactSeeder.php | Contact entries |
| database/seeders/ | CountrySeeder.php | Countries |
| database/seeders/ | CouponSeeder.php | Discount coupons |
| database/seeders/ | CustomerSeeder.php | Customer users |
| database/seeders/ | DealSeeder.php | Sales/deals |
| database/seeders/ | GeneralSettingSeeder.php | General settings |
| database/seeders/ | NewsletterSeeder.php | Newsletter data |
| database/seeders/ | OldProductsImportSeeder.php | Legacy product import |
| database/seeders/ | OrderSeeder.php | Test orders |
| database/seeders/ | ProductReviewSeeder.php | Product reviews |
| database/seeders/ | ProductsSeeder.php | Products catalog |
| database/seeders/ | RolePermissionSeeder.php | User roles and permissions |
| database/seeders/ | SaleSeeder.php | Sale data |
| database/seeders/ | SlideSeeder.php | Homepage slides |
| database/seeders/ | StateSeeder.php | States/provinces |
| database/seeders/ | TestRunMessageSeeder.php | Test messaging data |
| database/seeders/ | TestRunOrderDeliver.php | Test delivery orders |
| database/seeders/ | TestRunPlaceOrder.php | Test order placement |
| database/seeders/ | UiSettingSeeder.php | UI theme settings |
| database/seeders/ | WhatsAppMediaSeeder.php | WhatsApp media |
| database/seeders/ | WhatsAppSeeder.php | WhatsApp data |
| database/seeders/data/ | products_clean.json | Product data JSON |
| database/seeders/data/ | products_clean copy.json | Product data JSON (backup) |

---

## 15. CONFIGURATION FILES - config/

| Path | File Name | Purpose |
|------|-----------|---------|
| config/ | app.php | Application configuration |
| config/ | auth.php | Authentication drivers |
| config/ | cache.php | Cache configuration |
| config/ | cors.php | CORS settings |
| config/ | database.php | Database connections |
| config/ | dompdf.php | PDF generation settings |
| config/ | filesystems.php | File storage systems |
| config/ | fortify.php | Laravel Fortify settings |
| config/ | inertia.php | Inertia.js configuration |
| config/ | logging.php | Logging configuration |
| config/ | mail.php | Mail driver configuration |
| config/ | permission.php | Spatie permission settings |
| config/ | queue.php | Queue driver configuration |
| config/ | reverb.php | Laravel Reverb (WebSocket) settings |
| config/ | sanctum.php | Laravel Sanctum API settings |
| config/ | services.php | Third-party services |
| config/ | session.php | Session driver settings |
| config/ | telescope.php | Laravel Telescope debug tool |

---

## 16. REACT COMPONENTS - resources/js/components

### Core Layout Components
| Path | File Name | Purpose |
|------|-----------|---------|
| resources/js/components/ | Layout.tsx | Main layout component |
| resources/js/components/ | app-shell.tsx | App shell wrapper |
| resources/js/components/ | app-header.tsx | Header navigation |
| resources/js/components/ | app-sidebar.tsx | Sidebar navigation |
| resources/js/components/ | app-logo.tsx | Logo component |
| resources/js/components/ | app-logo-icon.tsx | Logo icon only |
| resources/js/components/ | app-content.tsx | Main content area |
| resources/js/components/ | app-sidebar-header.tsx | Sidebar header |
| resources/js/components/ | breadcrumbs.tsx | Breadcrumb navigation |
| resources/js/components/ | PageHeader.tsx | Page header with title |

### Navigation & Menu Components
| Path | File Name | Purpose |
|------|-----------|---------|
| resources/js/components/ | nav-main.tsx | Main navigation menu |
| resources/js/components/ | nav-footer.tsx | Footer navigation |
| resources/js/components/ | nav-user.tsx | User menu in nav |
| resources/js/components/ | user-menu-content.tsx | User menu dropdown content |

### UI Components
| Path | File Name | Purpose |
|------|-----------|---------|
| resources/js/components/ | appearance-dropdown.tsx | Theme selector dropdown |
| resources/js/components/ | appearance-tabs.tsx | Appearance settings tabs |
| resources/js/components/ | NotificationBell.tsx | Notification bell icon |
| resources/js/components/ | CityDropdown.tsx | City selection dropdown |
| resources/js/components/ | SearchableSelect.tsx | Searchable select input |
| resources/js/components/ | RichTextEditor.tsx | Rich text editor |
| resources/js/components/ | RoleForm.tsx | Role form component |
| resources/js/components/ | DataTableWrapper.tsx | Data table wrapper |
| resources/js/components/ | TanStackDataTableWrapper.tsx | TanStack table wrapper |
| resources/js/components/ | TableColumns.tsx | Table column definitions |

### Typography Components
| Path | File Name | Purpose |
|------|-----------|---------|
| resources/js/components/ | heading.tsx | Main heading |
| resources/js/components/ | heading-small.tsx | Small heading |
| resources/js/components/ | text-link.tsx | Styled link text |

### Status & Info Components
| Path | File Name | Purpose |
|------|-----------|---------|
| resources/js/components/ | StatusCard.tsx | Status card display |
| resources/js/components/ | StatsCard.tsx | Statistics card |
| resources/js/components/ | StatCard.tsx | Single stat card |
| resources/js/components/ | TimelineCard.tsx | Timeline event card |
| resources/js/components/ | InfoRow.tsx | Info row display |
| resources/js/components/ | SectionCard.tsx | Section wrapper card |

### Alert & Message Components
| Path | File Name | Purpose |
|------|-----------|---------|
| resources/js/components/ | alert-error.tsx | Error alert |
| resources/js/components/ | FieldError.tsx | Form field error |
| resources/js/components/ | input-error.tsx | Input field error |
| resources/js/components/ | DeleteConfirm.tsx | Delete confirmation dialog |
| resources/js/components/ | delete-user.tsx | Delete user component |

### User Components
| Path | File Name | Purpose |
|------|-----------|---------|
| resources/js/components/ | user-info.tsx | User information display |
| resources/js/components/ | icon.tsx | Icon component |
| resources/js/components/ | two-factor-recovery-codes.tsx | 2FA recovery codes |
| resources/js/components/ | two-factor-setup-modal.tsx | 2FA setup modal |

### Sidebar Sections (resources/js/components/sidebar-sections)
| Path | File Name | Purpose |
|------|-----------|---------|
| resources/js/components/sidebar-sections/ | affiliate-section.tsx | Affiliate nav section |
| resources/js/components/sidebar-sections/ | blog-section.tsx | Blog management section |
| resources/js/components/sidebar-sections/ | frontend-management-section.tsx | Frontend content section |
| resources/js/components/sidebar-sections/ | messaging-section.tsx | Messaging/WhatsApp section |
| resources/js/components/sidebar-sections/ | products-section.tsx | Products management section |
| resources/js/components/sidebar-sections/ | settings-sections.tsx | Settings section |
| resources/js/components/sidebar-sections/ | shop-section.tsx | Shop/Orders section |
| resources/js/components/sidebar-sections/ | user-management-section.tsx | User management section |

### UI Library Components (resources/js/components/ui)
| Path | File Name | Purpose |
|------|-----------|---------|
| resources/js/components/ui/ | alert.tsx | Alert component |
| resources/js/components/ui/ | avatar.tsx | User avatar |
| resources/js/components/ui/ | badge.tsx | Badge component |
| resources/js/components/ui/ | breadcrumb.tsx | Breadcrumb component |
| resources/js/components/ui/ | button.tsx | Button component |
| resources/js/components/ui/ | card.tsx | Card component |
| resources/js/components/ui/ | checkbox.tsx | Checkbox component |
| resources/js/components/ui/ | collapsible.tsx | Collapsible panel |
| resources/js/components/ui/ | dialog.tsx | Modal dialog |
| resources/js/components/ui/ | dropdown-menu.tsx | Dropdown menu |
| resources/js/components/ui/ | icon.tsx | Icon component |
| resources/js/components/ui/ | input-otp.tsx | OTP input |
| resources/js/components/ui/ | input.tsx | Text input |
| resources/js/components/ui/ | label.tsx | Form label |
| resources/js/components/ui/ | navigation-menu.tsx | Navigation menu |
| resources/js/components/ui/ | placeholder-pattern.tsx | Placeholder pattern |
| resources/js/components/ui/ | select.tsx | Select dropdown |
| resources/js/components/ui/ | separator.tsx | Separator/divider |
| resources/js/components/ui/ | sheet.tsx | Side sheet panel |
| resources/js/components/ui/ | sidebar.tsx | Sidebar layout |
| resources/js/components/ui/ | skeleton.tsx | Loading skeleton |
| resources/js/components/ui/ | spinner.tsx | Loading spinner |
| resources/js/components/ui/ | switch.tsx | Toggle switch |
| resources/js/components/ui/ | textarea.tsx | Textarea input |
| resources/js/components/ui/ | toggle-group.tsx | Toggle button group |
| resources/js/components/ui/ | toggle.tsx | Toggle button |
| resources/js/components/ui/ | tooltip.tsx | Tooltip component |

---

## 17. REACT PAGES - resources/js/pages

### Root Pages
| Path | File Name | Purpose |
|------|-----------|---------|
| resources/js/pages/ | Frontend.tsx | Frontend page wrapper |
| resources/js/pages/ | dashboard.tsx | Dashboard home page |
| resources/js/pages/ | welcome.tsx | Welcome page |
| resources/js/pages/ | 403.tsx | 403 forbidden error page |

### Authentication Pages (resources/js/pages/auth)
| Path | File Name | Purpose |
|------|-----------|---------|
| resources/js/pages/auth/ | login.tsx | Login page |
| resources/js/pages/auth/ | register.tsx | Registration page |
| resources/js/pages/auth/ | forgot-password.tsx | Forgot password page |
| resources/js/pages/auth/ | reset-password.tsx | Password reset page |
| resources/js/pages/auth/ | confirm-password.tsx | Password confirmation |
| resources/js/pages/auth/ | two-factor-challenge.tsx | 2FA challenge |
| resources/js/pages/auth/ | verify-email.tsx | Email verification |

### Settings Pages (resources/js/pages/settings)
| Path | File Name | Purpose |
|------|-----------|---------|
| resources/js/pages/settings/ | profile.tsx | User profile settings |
| resources/js/pages/settings/ | password.tsx | Password change |
| resources/js/pages/settings/ | appearance.tsx | Appearance/theme settings |
| resources/js/pages/settings/ | two-factor.tsx | 2FA settings |

### Error Pages (resources/js/pages/errors)
| Path | File Name | Purpose |
|------|-----------|---------|
| resources/js/pages/errors/ | 403.tsx | 403 forbidden page |

### Test Pages (resources/js/pages/Test)
| Path | File Name | Purpose |
|------|-----------|---------|
| resources/js/pages/Test/ | SeederDashboard.tsx | Seeder testing dashboard |
| resources/js/pages/Test/ | SeederButton.tsx | Seeder test buttons |

### Users Pages (resources/js/pages/Users)
| Path | File Name | Purpose |
|------|-----------|---------|
| resources/js/pages/Users/ | Index.tsx | Users list |
| resources/js/pages/Users/ | Create.tsx | Create user |
| resources/js/pages/Users/ | Edit.tsx | Edit user |
| resources/js/pages/Users/ | Show.tsx | User details |

### Frontend Shop Pages (resources/js/pages/Frontend)
| Path | File Name | Purpose |
|------|-----------|---------|
| resources/js/pages/Frontend/ | Products.tsx | Products listing page |
| resources/js/pages/Frontend/ | SingleProduct.tsx | Product detail page |

### Affiliate Portal Pages (resources/js/pages/Affiliate)
| Path | File Name | Purpose |
|------|-----------|---------|
| resources/js/pages/Affiliate/ | Dashboard.tsx | Affiliate dashboard |
| resources/js/pages/Affiliate/ | Referrals.tsx | Affiliate referrals |
| resources/js/pages/Affiliate/ | ReferralDetails.tsx | Referral details |
| resources/js/pages/Affiliate/ | ProductCatalog.tsx | Affiliate product links |
| resources/js/pages/Affiliate/ | Registration.tsx | Affiliate registration |
| resources/js/pages/Affiliate/ | RegisterAffiliate.tsx | Register as affiliate |
| resources/js/pages/Affiliate/ | Payouts.tsx | Payout requests |

### Admin Pages (resources/js/pages/Admin) - 30+ categories

**Core Admin Components:**
| Path | File Name | Purpose |
|------|-----------|---------|
| resources/js/pages/Admin/Attributes/ | Index.tsx, Create.tsx, Edit.tsx, Show.tsx, Form.tsx | Product attributes CRUD |
| resources/js/pages/Admin/BlogCategories/ | Index.tsx, Create.tsx, Edit.tsx, Show.tsx, Form.tsx | Blog categories CRUD |
| resources/js/pages/Admin/Blogs/ | Index.tsx, Create.tsx, Edit.tsx, Show.tsx, Form.tsx | Blog posts CRUD |
| resources/js/pages/Admin/BlogTags/ | Index.tsx, Create.tsx, Edit.tsx, Show.tsx, Form.tsx | Blog tags CRUD |
| resources/js/pages/Admin/BlogsComments/ | Index.tsx, Create.tsx, Edit.tsx, Show.tsx, Form.tsx | Blog comments CRUD |
| resources/js/pages/Admin/Categories/ | Index.tsx, Create.tsx, Edit.tsx, Show.tsx, Form.tsx | Product categories CRUD |
| resources/js/pages/Admin/Cities/ | Index.tsx, Create.tsx, Edit.tsx, Show.tsx, Form.tsx | Cities CRUD |
| resources/js/pages/Admin/Contacts/ | Index.tsx, Create.tsx, Edit.tsx, Show.tsx, Form.tsx | Contact forms CRUD |
| resources/js/pages/Admin/Coupons/ | Index.tsx, Create.tsx, Edit.tsx, Show.tsx, Form.tsx | Coupons CRUD |
| resources/js/pages/Admin/Customers/ | Index.tsx, Create.tsx, Edit.tsx, Show.tsx, Form.tsx | Customers CRUD |
| resources/js/pages/Admin/Inventory/ | Index.tsx, Create.tsx, Edit.tsx, Show.tsx, Form.tsx | Inventory CRUD |
| resources/js/pages/Admin/Newsletters/ | Index.tsx, Create.tsx, Edit.tsx, Show.tsx, Form.tsx, Compose.tsx | Newsletter CRUD |
| resources/js/pages/Admin/Notifications/ | Index.tsx | Notifications list |
| resources/js/pages/Admin/OrderReviews/ | Index.tsx, Create.tsx, Edit.tsx, Show.tsx, Form.tsx | Order reviews CRUD |
| resources/js/pages/Admin/Orders/ | Index.tsx, Create.tsx, Edit.tsx, Show.tsx, Form.tsx, Track.tsx | Orders CRUD with tracking |
| resources/js/pages/Admin/Pages/ | Index.tsx, Create.tsx, Edit.tsx, Form.tsx | Static pages CRUD |
| resources/js/pages/Admin/Permissions/ | Index.tsx, Create.tsx, Edit.tsx, Form.tsx | Permissions CRUD |
| resources/js/pages/Admin/Products/ | Index.tsx, Create.tsx, Edit.tsx, Show.tsx, Form.tsx | Products CRUD |
| resources/js/pages/Admin/ProductsDeals/ | Index.tsx, Create.tsx, Edit.tsx, Show.tsx, Form.tsx | Deals CRUD |
| resources/js/pages/Admin/ProductsReviews/ | Index.tsx, Create.tsx, Edit.tsx, Show.tsx, Form.tsx | Product reviews CRUD |
| resources/js/pages/Admin/Roles/ | Index.tsx, Create.tsx, Edit.tsx, Show.tsx, Form.tsx | Roles CRUD |
| resources/js/pages/Admin/Sales/ | Index.tsx, Create.tsx, Edit.tsx, Show.tsx, Form.tsx, SaleForm.tsx | Sales CRUD |
| resources/js/pages/Admin/Slides/ | Index.tsx, Create.tsx, Edit.tsx, Show.tsx, Form.tsx | Slides CRUD |
| resources/js/pages/Admin/Variants/ | Index.tsx, Show.tsx | Product variants |
| resources/js/pages/Admin/Wishlist/ | Index.tsx, Create.tsx, Edit.tsx, Show.tsx, Form.tsx | Wishlist CRUD |
| resources/js/pages/Admin/WhatsApp/ | Chat.tsx | WhatsApp messaging |

**Admin Settings Pages:**
| Path | Category | Purpose |
|------|----------|---------|
| resources/js/pages/Admin/Settings/business/ | Payments, Gateways, Shipping, Vendor, Currency, FAQs, Advanced, Index | Business configuration |
| resources/js/pages/Admin/Settings/general/ | Auth, Contact, Email, SEO, Security, System, Legal, Integrations, Advanced, Index, ecommerce | General system settings |
| resources/js/pages/Admin/Settings/ui/ | Branding, Categories, Category-products, Email, Header, Homepage, Marketing, Products, Index | UI/theme settings |

**Admin Affiliate Pages:**
| Path | File Name | Purpose |
|------|-----------|---------|
| resources/js/pages/Admin/Affiliate/ | AffiliateManager.tsx, SystemSettings.tsx, ReferralLogs.tsx, PendingPayouts.tsx | Affiliate management |

**Admin Frontend Pages:**
| Path | File Name | Purpose |
|------|-----------|---------|
| resources/js/pages/Admin/Frontend/ | BusinessSettings.tsx, GeneralSettings.tsx, UiSettings.tsx | Frontend content settings |

---

## 18. REACT UTILITIES & SUPPORT FILES

### Actions (resources/js/actions)
| Path | File Name | Purpose |
|------|-----------|---------|
| resources/js/actions/App/ | Http/index.ts | App HTTP actions |
| resources/js/actions/Laravel/ | Fortify/index.ts, Sanctum/index.ts | Laravel auth actions |
| resources/js/actions/Illuminate/ | - | Illuminate utilities |

### Hooks (resources/js/hooks)
| Path | File Name | Purpose |
|------|-----------|---------|
| resources/js/hooks/ | use-permission-checks.ts | Permission checking hook |
| resources/js/hooks/ | use-two-factor-auth.ts | 2FA hook |
| resources/js/hooks/ | use-mobile.tsx | Mobile detection |
| resources/js/hooks/ | use-mobile-navigation.ts | Mobile nav hook |
| resources/js/hooks/ | use-clipboard.ts | Clipboard operations |
| resources/js/hooks/ | use-initials.tsx | User initials generation |
| resources/js/hooks/ | use-appearance.tsx | Theme/appearance hook |

### Layouts (resources/js/layouts)
| Path | File Name | Purpose |
|------|-----------|---------|
| resources/js/layouts/ | app-layout.tsx | Main app layout |
| resources/js/layouts/app/ | - | App layout components |
| resources/js/layouts/ | auth-layout.tsx | Auth layout |
| resources/js/layouts/auth/ | - | Auth layout components |
| resources/js/layouts/settings/ | - | Settings layout components |

### Utilities & Libraries (resources/js/lib & resources/js/utils)
| Path | File Name | Purpose |
|------|-----------|---------|
| resources/js/lib/ | can.ts | Permission checking utility |
| resources/js/lib/ | utils.ts | General utilities |
| resources/js/utils/ | dateFormat.ts | Date formatting |
| resources/js/utils/ | formStyles.ts | Form styling utilities |

### Constants & Types (resources/js/constants & resources/js/types)
| Path | File Name | Purpose |
|------|-----------|---------|
| resources/js/constants/ | orderOptions.ts | Order status options |
| resources/js/types/ | index.d.ts | Global TypeScript types |
| resources/js/types/ | global.d.ts | Global type definitions |
| resources/js/types/ | notification.ts | Notification types |
| resources/js/types/ | affiliate.ts | Affiliate types |
| resources/js/types/ | vite-env.d.ts | Vite environment types |
| resources/js/types/ | ziggy.d.ts | Ziggy route types |

### Core React Files
| Path | File Name | Purpose |
|------|-----------|---------|
| resources/js/ | app.tsx | Main React app component |
| resources/js/ | bootstrap.ts | Bootstrap/initialization |
| resources/js/ | ssr.tsx | Server-side rendering |
| resources/js/ | echo.ts | Laravel Echo (broadcasting) |
| resources/js/ | ziggy-generated.js | Generated route helper |
| resources/js/ | ziggy.js | Route helper initialization |
| resources/js/ | ziggy.ts | TypeScript route types |

---

## SUMMARY STATISTICS

| Category | Count |
|----------|-------|
| Controllers | 38 |
| Services | 3 |
| Repositories | 23 |
| Models | 68 |
| Middleware | 3 |
| Policies | 1 |
| Events | 1 |
| Listeners | 1 |
| Jobs | 7 |
| Notifications | 2 |
| Mail Classes | 9 |
| Routes Files | 9 |
| Migrations | 78 |
| Database Seeders | 32 |
| Config Files | 18 |
| React Components | 90+ |
| React Pages | 156+ |
| React Hooks | 7 |
| React Utilities/Types | 15+ |
| **TOTAL** | **~600+ files** |

---

## KEY SYSTEM FEATURES IDENTIFIED

### E-Commerce Core
- Product management (with attributes, variants, stock)
- Shopping cart and orders
- Customer management
- Payment processing (multiple gateways)
- Order reviews and ratings

### Affiliate System
- Affiliate user management
- Click tracking and commissions
- Referral program
- Payout requests
- Commission tracking

### Content Management
- Blog system (posts, categories, tags, comments)
- Static pages
- Homepage slider/deals
- Newsletter system
- Email templates

### Business Operations
- Inventory management
- Coupon/discount system
- Sales transactions
- Support tickets
- Audit logging

### Communications
- WhatsApp integration (messages, notifications)
- Email notifications (orders, reviews, welcome)
- SMS templates
- Chatbot configuration
- In-app notifications

### User Management
- Role-based access control (RBAC)
- Permission management
- Two-factor authentication
- User profiles and settings
- Customer groups/tiers

### Payment & Wallet
- Multiple payment gateways
- Vendor wallets
- Customer loyalty points
- Wallet transactions
- Payout management

### Frontend Features
- Product search and filtering
- Wishlist functionality
- Customer reviews
- Affiliate marketing links
- Responsive UI with React/Inertia

---

## TECHNOLOGY STACK

**Backend:** Laravel 11 with Sanctum API authentication
**Frontend:** React 18 with TypeScript and Inertia.js
**Database:** MySQL/MariaDB with 78+ migrations
**UI Framework:** Shadcn/ui components
**State Management:** React hooks and Inertia shared data
**Admin Panel:** Full-featured React-based admin dashboard
**Authentication:** Laravel Fortify + Sanctum + 2FA
**Job Queue:** Laravel queue system
**Broadcasting:** Laravel Reverb (WebSockets)
**Monitoring:** Laravel Telescope
**Testing:** Pest framework
