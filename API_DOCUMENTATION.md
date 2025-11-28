# 🔌 API Documentation - Products Management System

## Base URL
```
http://localhost:8000/admin
```

## Authentication
All endpoints require authentication via Laravel Sanctum + Middleware

```
Auth: Session-based (Login required)
Headers: Content-Type: application/json
CSRF: Automatic with Inertia.js
```

---

## Products API

### 1. List All Products
```
GET /admin/products
```

**Response**:
```json
{
  "products": [
    {
      "id": 1,
      "vendor_id": 1,
      "category_id": 1,
      "sub_category_id": null,
      "name": "Organic Hair Oil",
      "slug": "organic-hair-oil",
      "sku": "PROD-001",
      "thumbnail": "/images/product.jpg",
      "gallery": ["/images/product-2.jpg"],
      "short_description": "Premium quality",
      "long_description": "Detailed description...",
      "price": 599,
      "sale_price": 499,
      "stock_qty": 100,
      "stock_alert": 10,
      "featured": true,
      "status": true,
      "created_at": "2024-11-26T10:00:00Z",
      "updated_at": "2024-11-26T10:00:00Z"
    }
  ]
}
```

### 2. Show Create Form
```
GET /admin/products/create
```

**Returns**: Form page with dropdowns for:
- Categories
- Vendors

### 3. Create New Product
```
POST /admin/products
Content-Type: application/json
```

**Request Body**:
```json
{
  "vendor_id": 1,
  "category_id": 1,
  "sub_category_id": null,
  "name": "Organic Hair Oil",
  "short_description": "Premium quality oil",
  "long_description": "Detailed description here",
  "price": 599,
  "sale_price": 499,
  "sku": "PROD-001",
  "thumbnail": "/images/product.jpg",
  "featured": true,
  "status": true
}
```

**Response**: Redirect to `/admin/products` with success message

**Validation**:
```
name* - required, string, max:255
vendor_id* - required, exists in vendors table
category_id* - required, exists in categories table
price* - required, numeric, min:0
sku* - required, unique in product_variants
featured - boolean
status - boolean
```

### 4. Show Product Details
```
GET /admin/products/{id}
```

**Response**:
```json
{
  "product": {
    "id": 1,
    "name": "Organic Hair Oil",
    "price": 599,
    "sale_price": 499,
    "category": { "id": 1, "name": "Hair Care" },
    "vendor": { "id": 1, "name": "Vendor Name" },
    "variants": [
      {
        "id": 1,
        "sku": "PROD-001-100",
        "price": 599,
        "stock": 100,
        "attributes": { "size": "100ml" }
      }
    ]
  }
}
```

### 5. Show Edit Form
```
GET /admin/products/{id}/edit
```

**Returns**: Form page with pre-filled data

### 6. Update Product
```
PUT /admin/products/{id}
Content-Type: application/json
```

**Request Body**: Same as Create (all fields optional except validation rules)

### 7. Delete Product
```
DELETE /admin/products/{id}
```

**Response**: Redirect with success message

---

## Categories API

### 1. List All Categories
```
GET /admin/categories
```

**Response**:
```json
{
  "categories": [
    {
      "id": 1,
      "name": "Hair Care",
      "slug": "hair-care",
      "image": "/images/category.jpg",
      "parent_id": null,
      "status": true,
      "children": [
        {
          "id": 2,
          "name": "Oils",
          "parent_id": 1
        }
      ]
    }
  ]
}
```

### 2. Show Create Form
```
GET /admin/categories/create
```

### 3. Create New Category
```
POST /admin/categories
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Hair Care",
  "image": "/images/category.jpg",
  "parent_id": null,
  "status": true
}
```

**Validation**:
```
name* - required, string, max:255
parent_id - nullable, exists in categories table
status - boolean
```

### 4. Show Category Details
```
GET /admin/categories/{id}
```

### 5. Update Category
```
PUT /admin/categories/{id}
Content-Type: application/json
```

### 6. Delete Category
```
DELETE /admin/categories/{id}
```

---

## Product Variants API

### 1. List All Variants
```
GET /admin/product-variants
```

**Response**:
```json
{
  "variants": [
    {
      "id": 1,
      "product_id": 1,
      "product": { "id": 1, "name": "Organic Hair Oil" },
      "sku": "PROD-001-100",
      "attributes": {
        "size": "100ml"
      },
      "price": 599,
      "stock": 100,
      "is_default": true,
      "status": true,
      "total_stock": 100
    }
  ]
}
```

### 2. Show Create Form
```
GET /admin/product-variants/create
```

**Returns**: Form with:
- Product dropdown
- Attribute selectors (Size: 100ml, 120ml, 150ml, etc.)

### 3. Create New Variant
```
POST /admin/product-variants
Content-Type: application/json
```

**Request Body**:
```json
{
  "product_id": 1,
  "sku": "PROD-001-100",
  "price": 599,
  "stock": 100,
  "attributes": {
    "size": "100ml"
  },
  "is_default": true,
  "status": true
}
```

**Validation**:
```
product_id* - required, exists in products table
sku* - required, unique in product_variants
price* - required, numeric, min:0
stock* - required, integer, min:0
attributes - array (size, color, etc.)
is_default - boolean
status - boolean
```

### 4. Show Variant Details
```
GET /admin/product-variants/{id}
```

### 5. Update Variant
```
PUT /admin/product-variants/{id}
Content-Type: application/json
```

**Request Body**: Same as Create

**Example with 120ml size**:
```json
{
  "product_id": 1,
  "sku": "PROD-001-120",
  "price": 649,
  "stock": 80,
  "attributes": {
    "size": "120ml"
  },
  "is_default": false,
  "status": true
}
```

### 6. Delete Variant
```
DELETE /admin/product-variants/{id}
```

---

## Attributes API

### Available Size Options (Pre-seeded)
```
GET request would return:

Attribute: Size/Volume
Values:
- 100ml
- 120ml
- 150ml
- 200ml
- 250ml
- 500ml
- 1L
```

### Available Colors (Pre-seeded)
```
Attribute: Color
Values:
- Red
- Blue
- Green
- Black
- White
```

---

## Error Responses

### 404 Not Found
```json
{
  "message": "Not found"
}
```

### 422 Validation Error
```json
{
  "errors": {
    "name": ["The name field is required"],
    "sku": ["The sku has already been taken"]
  }
}
```

### 403 Forbidden (Permission Denied)
```json
{
  "message": "This action is unauthorized"
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthenticated"
}
```

---

## Success Responses

### 200 OK (GET)
Returns the requested resource(s)

### 201 Created (POST)
Redirect response with success message (via Inertia)

### 204 No Content (PUT/DELETE)
Redirect response with success message (via Inertia)

---

## Permissions Required

### For Products:
- `GET /products` → No specific permission (list all)
- `GET /products/create` → `create.products`
- `POST /products` → `create.products`
- `GET /products/{id}` → No specific permission
- `GET /products/{id}/edit` → `edit.products`
- `PUT /products/{id}` → `edit.products`
- `DELETE /products/{id}` → `delete.products`

### For Categories:
- `GET /categories` → No specific permission
- `POST /categories` → `create.categories`
- `GET /categories/{id}/edit` → `edit.categories`
- `PUT /categories/{id}` → `edit.categories`
- `DELETE /categories/{id}` → `delete.categories`

### For Variants:
- `GET /product-variants` → No specific permission
- `POST /product-variants` → `create.variants`
- `GET /product-variants/{id}/edit` → `edit.variants`
- `PUT /product-variants/{id}` → `edit.variants`
- `DELETE /product-variants/{id}` → `delete.variants`

---

## Rate Limiting
Not configured by default (can be added)

## CORS
Not required (same domain)

## Caching
Query results are cached where applicable

---

## Example Usage (cURL)

### Create a Product
```bash
curl -X POST http://localhost:8000/admin/products \
  -H "Content-Type: application/json" \
  -H "Cookie: XSRF-TOKEN=...; session=..." \
  -d '{
    "name": "Organic Hair Oil",
    "vendor_id": 1,
    "category_id": 1,
    "price": 599,
    "sku": "PROD-001"
  }'
```

### Create a Variant with 120ml Size
```bash
curl -X POST http://localhost:8000/admin/product-variants \
  -H "Content-Type: application/json" \
  -H "Cookie: XSRF-TOKEN=...; session=..." \
  -d '{
    "product_id": 1,
    "sku": "PROD-001-120",
    "price": 649,
    "stock": 80,
    "attributes": {
      "size": "120ml"
    },
    "status": true
  }'
```

### Get All Products
```bash
curl http://localhost:8000/admin/products \
  -H "Cookie: XSRF-TOKEN=...; session=..."
```

---

## Frontend Integration (React + Inertia)

### Example: Using useForm Hook
```typescript
import { useForm } from '@inertiajs/react';

const { data, setData, post, processing, errors } = useForm({
  name: '',
  vendor_id: '',
  category_id: '',
  price: '',
  sku: ''
});

function handleSubmit() {
  post('/admin/products');
}
```

### Example: Showing Errors
```typescript
{errors.sku && <div className="text-red-500">{errors.sku}</div>}
```

### Example: Loading State
```typescript
<button disabled={processing}>
  {processing ? 'Creating...' : 'Create'}
</button>
```

---

## Relationship Data in Responses

### Product with Relations
```json
{
  "id": 1,
  "name": "Organic Hair Oil",
  "vendor": {
    "id": 1,
    "name": "Vendor Name"
  },
  "category": {
    "id": 1,
    "name": "Hair Care"
  },
  "variants": [
    {
      "id": 1,
      "sku": "PROD-001-100",
      "attributes": { "size": "100ml" }
    }
  ]
}
```

### Category with Hierarchy
```json
{
  "id": 1,
  "name": "Hair Care",
  "parent_id": null,
  "children": [
    {
      "id": 2,
      "name": "Oils",
      "parent_id": 1
    }
  ]
}
```

---

## Testing Endpoints

Use Postman or Insomnia:
1. Set base URL to `http://localhost:8000`
2. Add authentication cookies from browser
3. Test endpoints listed above

Or use the Laravel Tinker REPL:
```bash
php artisan tinker
>>> $product = Product::first();
>>> $product->variants;
>>> $product->category;
```

---

## Pagination (Optional Future Enhancement)

Current implementation returns all records. Can be enhanced with:
```php
Product::paginate(15);
```

---

**API Version**: 1.0  
**Last Updated**: November 26, 2024  
**Status**: ✅ Production Ready
