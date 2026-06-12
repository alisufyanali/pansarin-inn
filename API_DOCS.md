# Pansarin Inn — REST API Documentation

> **Backend:** Laravel 12 + Sanctum  
> **Frontend:** Next.js  
> **Auth:** Bearer Token (Laravel Sanctum)

---

## BASE URL

```
http://localhost:8000/api
```

---

## HEADERS

```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token}   ← only for protected routes
```

---

## RESPONSE FORMAT

**Success:**
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": { ... }
}
```

---

## Next.js Axios Setup (recommended)

```javascript
// lib/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Auto-attach token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

---

# 🔐 AUTH ROUTES

---

## POST /api/login

**Description:** User login — returns Bearer token  
**Auth Required:** No

**Request Body:**
```json
{
  "email":    "string — required — user email",
  "password": "string — required — user password"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "1|abc123xyz...",
    "user": {
      "id":    1,
      "name":  "Ahmed Ali",
      "email": "ahmed@example.com",
      "phone": "03001234567"
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials."
}
```

**Error Response (422) — Validation:**
```json
{
  "message": "The email field is required.",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

**Example (Next.js):**
```javascript
const res = await api.post('/login', {
  email: 'ahmed@example.com',
  password: 'password123',
});
const { token, user } = res.data.data;
localStorage.setItem('token', token);
```

---

## POST /api/register

**Description:** New user registration — creates user + customer profile, returns Bearer token  
**Auth Required:** No

**Request Body:**
```json
{
  "name":                  "string — required — full name",
  "email":                 "string — required — unique email",
  "password":              "string — required — min 8 chars",
  "password_confirmation": "string — required — must match password",
  "phone":                 "string — optional — max 20 chars"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration successful.",
  "data": {
    "token": "2|def456uvw...",
    "user": {
      "id":    2,
      "name":  "Sara Khan",
      "email": "sara@example.com",
      "phone": "03211234567"
    }
  }
}
```

**Error Response (422) — Email taken:**
```json
{
  "message": "The email has already been taken.",
  "errors": {
    "email": ["The email has already been taken."]
  }
}
```

**Example (Next.js):**
```javascript
const res = await api.post('/register', {
  name: 'Sara Khan',
  email: 'sara@example.com',
  password: 'password123',
  password_confirmation: 'password123',
  phone: '03211234567',
});
const { token } = res.data.data;
localStorage.setItem('token', token);
```

---

## POST /api/logout

**Description:** Revoke current Bearer token  
**Auth Required:** Yes (Bearer Token)

**Request Body:** None

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

**Error Response (401) — Unauthenticated:**
```json
{
  "message": "Unauthenticated."
}
```

**Example (Next.js):**
```javascript
await api.post('/logout');
localStorage.removeItem('token');
```

---

## GET /api/user

**Description:** Get authenticated user profile with customer details  
**Auth Required:** Yes (Bearer Token)

**Request Body:** None

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id":    1,
    "name":  "Ahmed Ali",
    "email": "ahmed@example.com",
    "phone": "03001234567",
    "roles": ["customer"],
    "customer": {
      "id":         1,
      "first_name": "Ahmed",
      "last_name":  "Ali",
      "address":    "House 5, Block A, Lahore",
      "city_id":    3
    }
  }
}
```

**Example (Next.js):**
```javascript
const res = await api.get('/user');
const user = res.data.data;
```

---

# 🛍️ PRODUCT ROUTES

---

## GET /api/products

**Description:** Get paginated list of active products with optional filters  
**Auth Required:** No

**Query Parameters:**
```
search      string   — optional — search by name or SKU
category_id integer  — optional — filter by category ID
featured    any      — optional — only featured products (e.g. ?featured=1)
min_price   number   — optional — minimum price filter
max_price   number   — optional — maximum price filter
sort_by     string   — optional — price | name | created_at (default: created_at)
sort_order  string   — optional — asc | desc (default: desc)
per_page    integer  — optional — items per page (default: 15)
page        integer  — optional — page number (default: 1)
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id":         1,
      "name":       "Turmeric (Haldi)",
      "slug":       "turmeric-haldi",
      "sku":        "TUR-001",
      "price":      250.00,
      "sale_price": 200.00,
      "unit":       "gm",
      "featured":   true,
      "thumbnail":  "http://localhost:8000/storage/products/1-turmeric/turmeric.jpg",
      "category": {
        "id":   2,
        "name": "Spices",
        "slug": "spices"
      },
      "variants": [
        {
          "id":         3,
          "name":       "100 gm / Powder",
          "sku":        "TUR-001-V01",
          "price":      200.00,
          "stock":      50,
          "is_default": true
        }
      ]
    }
  ],
  "meta": {
    "total":        45,
    "per_page":     15,
    "current_page": 1,
    "last_page":    3
  }
}
```

**Example (Next.js):**
```javascript
// Basic
const res = await api.get('/products');

// With filters
const res = await api.get('/products', {
  params: {
    search: 'haldi',
    category_id: 2,
    min_price: 100,
    max_price: 500,
    sort_by: 'price',
    sort_order: 'asc',
    per_page: 20,
    page: 1,
  },
});
const { data, meta } = res.data;
```

---

## GET /api/products/featured

**Description:** Get up to 12 featured active products (no pagination)  
**Auth Required:** No

**Query Parameters:** None

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id":         1,
      "name":       "Turmeric (Haldi)",
      "slug":       "turmeric-haldi",
      "sku":        "TUR-001",
      "price":      250.00,
      "sale_price": 200.00,
      "unit":       "gm",
      "featured":   true,
      "thumbnail":  "http://localhost:8000/storage/products/1-turmeric/turmeric.jpg",
      "category": {
        "id":   2,
        "name": "Spices",
        "slug": "spices"
      },
      "variants": []
    }
  ]
}
```

**Example (Next.js):**
```javascript
const res = await api.get('/products/featured');
const featured = res.data.data;
```

---

## GET /api/products/{slug}

**Description:** Get single product by slug with full details (description, gallery, stock)  
**Auth Required:** No

**URL Parameter:**
```
slug  string — required — product slug e.g. turmeric-haldi
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id":          1,
    "name":        "Turmeric (Haldi)",
    "slug":        "turmeric-haldi",
    "sku":         "TUR-001",
    "price":       250.00,
    "sale_price":  200.00,
    "unit":        "gm",
    "featured":    true,
    "thumbnail":   "http://localhost:8000/storage/products/1-turmeric/turmeric.jpg",
    "description": "<p>Pure organic turmeric powder...</p>",
    "excerpt":     "Premium quality haldi",
    "gallery": [
      "http://localhost:8000/storage/products/1-turmeric/gallery/turmeric-1.jpg",
      "http://localhost:8000/storage/products/1-turmeric/gallery/turmeric-2.jpg"
    ],
    "stock":       150,
    "meta_title":  "Buy Turmeric (Haldi) Online",
    "meta_desc":   "Premium quality haldi",
    "category": {
      "id":   2,
      "name": "Spices",
      "slug": "spices"
    },
    "variants": [
      {
        "id":         3,
        "name":       "100 gm / Powder",
        "sku":        "TUR-001-V01",
        "price":      200.00,
        "stock":      50,
        "is_default": true
      },
      {
        "id":         4,
        "name":       "250 gm / Powder",
        "sku":        "TUR-001-V02",
        "price":      450.00,
        "stock":      30,
        "is_default": false
      }
    ]
  }
}
```

**Error Response (404):**
```json
{
  "message": "No query results for model [App\\Models\\Product]."
}
```

**Example (Next.js):**
```javascript
const res = await api.get(`/products/${slug}`);
const product = res.data.data;
```

---

## GET /api/categories

**Description:** Get all active top-level categories with their sub-categories  
**Auth Required:** No

**Query Parameters:** None

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id":    1,
      "name":  "Spices",
      "slug":  "spices",
      "image": "http://localhost:8000/storage/categories/spices.jpg",
      "children": [
        {
          "id":    5,
          "name":  "Ground Spices",
          "slug":  "ground-spices",
          "image": null
        }
      ]
    },
    {
      "id":       2,
      "name":     "Herbs",
      "slug":     "herbs",
      "image":    null,
      "children": []
    }
  ]
}
```

**Example (Next.js):**
```javascript
const res = await api.get('/categories');
const categories = res.data.data;
```

---

# 🛒 CART ROUTES

> **Note:** Cart is variant-based. You must pass `product_variant_id`. Products without variants cannot be added directly.

---

## GET /api/cart

**Description:** Get all cart items for the authenticated user  
**Auth Required:** Yes (Bearer Token)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id":         1,
      "quantity":   2,
      "unit_price": 200.00,
      "subtotal":   400.00,
      "product": {
        "id":        1,
        "name":      "Turmeric (Haldi)",
        "slug":      "turmeric-haldi",
        "thumbnail": "http://localhost:8000/storage/products/1-turmeric/turmeric.jpg"
      },
      "variant": {
        "id":   3,
        "name": "100 gm / Powder",
        "sku":  "TUR-001-V01"
      }
    }
  ]
}
```

**Example (Next.js):**
```javascript
const res = await api.get('/cart');
const cartItems = res.data.data;
```

---

## POST /api/cart

**Description:** Add item to cart. If the same variant already exists, quantity is incremented  
**Auth Required:** Yes (Bearer Token)

**Request Body:**
```json
{
  "product_variant_id": "integer — required — variant ID",
  "quantity":           "integer — required — min 1"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Item added to cart.",
  "data": {
    "id":         1,
    "quantity":   2,
    "unit_price": 200.00,
    "subtotal":   400.00,
    "product": {
      "id":        1,
      "name":      "Turmeric (Haldi)",
      "slug":      "turmeric-haldi",
      "thumbnail": "http://localhost:8000/storage/products/1-turmeric/turmeric.jpg"
    },
    "variant": {
      "id":   3,
      "name": "100 gm / Powder",
      "sku":  "TUR-001-V01"
    }
  }
}
```

**Error Response (422) — Out of stock:**
```json
{
  "success": false,
  "message": "Only 15 units available in stock."
}
```

**Example (Next.js):**
```javascript
const res = await api.post('/cart', {
  product_variant_id: 3,
  quantity: 2,
});
```

---

## PATCH /api/cart/{id}

**Description:** Update quantity of a specific cart item  
**Auth Required:** Yes (Bearer Token)

**URL Parameter:**
```
id  integer — required — cart item ID
```

**Request Body:**
```json
{
  "quantity": "integer — required — min 1 — new quantity"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Cart updated.",
  "data": {
    "id":         1,
    "quantity":   5,
    "unit_price": 200.00,
    "subtotal":   1000.00,
    "product": {
      "id":        1,
      "name":      "Turmeric (Haldi)",
      "slug":      "turmeric-haldi",
      "thumbnail": "http://localhost:8000/storage/products/1-turmeric/turmeric.jpg"
    },
    "variant": {
      "id":   3,
      "name": "100 gm / Powder",
      "sku":  "TUR-001-V01"
    }
  }
}
```

**Error Response (422) — Exceeds stock:**
```json
{
  "success": false,
  "message": "Only 15 units available in stock."
}
```

**Error Response (404) — Not found / not owned:**
```json
{
  "message": "No query results for model [App\\Models\\Cart]."
}
```

**Example (Next.js):**
```javascript
const res = await api.patch(`/cart/${cartItemId}`, {
  quantity: 5,
});
```

---

## DELETE /api/cart/{id}

**Description:** Remove a single item from cart  
**Auth Required:** Yes (Bearer Token)

**URL Parameter:**
```
id  integer — required — cart item ID
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Item removed from cart."
}
```

**Error Response (404):**
```json
{
  "message": "No query results for model [App\\Models\\Cart]."
}
```

**Example (Next.js):**
```javascript
await api.delete(`/cart/${cartItemId}`);
```

---

## DELETE /api/cart

**Description:** Clear entire cart for the authenticated user  
**Auth Required:** Yes (Bearer Token)

**Request Body:** None

**Success Response (200):**
```json
{
  "success": true,
  "message": "Cart cleared."
}
```

**Example (Next.js):**
```javascript
await api.delete('/cart');
```

---

# 📦 ORDER ROUTES

---

## GET /api/orders

**Description:** Get paginated list of orders for the authenticated customer  
**Auth Required:** Yes (Bearer Token)

**Query Parameters:**
```
per_page  integer — optional — items per page (default: 10)
page      integer — optional — page number (default: 1)
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id":             1,
      "order_number":   "ORD-20241201-0001",
      "status":         "pending",
      "payment_status": "unpaid",
      "payment_method": "Cash on Delivery",
      "grand_total":    850.00,
      "subtotal":       800.00,
      "shipping":       50.00,
      "discount":       0.00,
      "tax":            0.00,
      "city":           "Lahore",
      "created_at":     "2024-12-01T10:30:00.000000Z"
    }
  ],
  "meta": {
    "total":        5,
    "per_page":     10,
    "current_page": 1,
    "last_page":    1
  }
}
```

**Error Response (404) — No customer profile:**
```json
{
  "success": false,
  "message": "Customer profile not found."
}
```

**Example (Next.js):**
```javascript
const res = await api.get('/orders', { params: { page: 1, per_page: 10 } });
const { data, meta } = res.data;
```

---

## GET /api/orders/{id}

**Description:** Get single order detail with all items (only own orders)  
**Auth Required:** Yes (Bearer Token)

**URL Parameter:**
```
id  integer — required — order ID
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id":               1,
    "order_number":     "ORD-20241201-0001",
    "status":           "pending",
    "payment_status":   "unpaid",
    "payment_method":   "Cash on Delivery",
    "grand_total":      850.00,
    "subtotal":         800.00,
    "shipping":         50.00,
    "discount":         0.00,
    "tax":              0.00,
    "city":             "Lahore",
    "shipping_address": "House 5, Block A, Lahore",
    "billing_address":  "House 5, Block A, Lahore",
    "order_note":       "Please deliver before evening",
    "tracking":         null,
    "created_at":       "2024-12-01T10:30:00.000000Z",
    "items": [
      {
        "id":           1,
        "product_name": "Turmeric (Haldi)",
        "variant":      "100 gm / Powder",
        "quantity":     4,
        "price":        200.00,
        "discount":     0.00,
        "subtotal":     800.00
      }
    ]
  }
}
```

**Error Response (404):**
```json
{
  "message": "No query results for model [App\\Models\\Order]."
}
```

**Example (Next.js):**
```javascript
const res = await api.get(`/orders/${orderId}`);
const order = res.data.data;
```

---

## POST /api/orders

**Description:** Place a new order. Stock is validated before order creation  
**Auth Required:** Yes (Bearer Token)

**Request Body:**
```json
{
  "city_id":          "integer  — optional  — city ID for shipping",
  "shipping_address": "string   — optional  — delivery address",
  "billing_address":  "string   — optional  — billing address",
  "payment_method":   "string   — optional  — e.g. Cash on Delivery",
  "order_note":       "string   — optional  — special instructions",
  "invoice_discount": "number   — optional  — flat discount on invoice",
  "shipping_charges": "number   — optional  — shipping cost",
  "items": [
    {
      "product_id":         "integer — required — product ID",
      "product_variant_id": "integer — optional — variant ID (null for no-variant products)",
      "quantity":           "integer — required — min 1",
      "price":              "number  — required — unit price",
      "discount":           "number  — optional — item-level discount"
    }
  ]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Order placed successfully.",
  "data": {
    "id":             1,
    "order_number":   "ORD-20241201-0001",
    "status":         "pending",
    "payment_status": "unpaid",
    "payment_method": "Cash on Delivery",
    "grand_total":    850.00,
    "subtotal":       800.00,
    "shipping":       50.00,
    "discount":       0.00,
    "tax":            0.00,
    "city":           "Lahore",
    "created_at":     "2024-12-01T10:30:00.000000Z"
  }
}
```

**Error Response (422) — Insufficient stock:**
```json
{
  "success": false,
  "message": "Insufficient stock for Turmeric (Haldi) (100 gm / Powder). Requested: 21, Available: 15",
  "errors": {
    "items": ["Insufficient stock for Turmeric (Haldi) (100 gm / Powder). Requested: 21, Available: 15"]
  }
}
```

**Error Response (422) — Validation:**
```json
{
  "message": "The items field is required.",
  "errors": {
    "items": ["The items field is required."]
  }
}
```

**Example (Next.js):**
```javascript
const res = await api.post('/orders', {
  city_id: 3,
  shipping_address: 'House 5, Block A, Lahore',
  payment_method: 'Cash on Delivery',
  order_note: 'Please deliver before evening',
  shipping_charges: 50,
  items: [
    {
      product_id:         1,
      product_variant_id: 3,
      quantity:           4,
      price:              200.00,
      discount:           0,
    },
  ],
});
```

---

# ❤️ WISHLIST ROUTES

---

## GET /api/wishlist

**Description:** Get all wishlist items for the authenticated user  
**Auth Required:** Yes (Bearer Token)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id":         1,
      "product": {
        "id":         1,
        "name":       "Turmeric (Haldi)",
        "slug":       "turmeric-haldi",
        "price":      250.00,
        "sale_price": 200.00,
        "thumbnail":  "http://localhost:8000/storage/products/1-turmeric/turmeric.jpg"
      },
      "variant": {
        "id":   3,
        "name": "100 gm / Powder",
        "sku":  "TUR-001-V01"
      },
      "created_at": "2024-12-01T10:30:00.000000Z"
    }
  ]
}
```

**Example (Next.js):**
```javascript
const res = await api.get('/wishlist');
const wishlist = res.data.data;
```

---

## POST /api/wishlist

**Description:** Add a product (with optional variant) to wishlist. Duplicate entries are rejected  
**Auth Required:** Yes (Bearer Token)

**Request Body:**
```json
{
  "product_id":         "integer — required — product ID",
  "product_variant_id": "integer — optional — variant ID"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Added to wishlist.",
  "data": {
    "id": 1
  }
}
```

**Error Response (422) — Already in wishlist:**
```json
{
  "success": false,
  "message": "This product is already in the user's wishlist."
}
```

**Example (Next.js):**
```javascript
const res = await api.post('/wishlist', {
  product_id: 1,
  product_variant_id: 3,
});
```

---

## DELETE /api/wishlist/{id}

**Description:** Remove an item from wishlist (only own items)  
**Auth Required:** Yes (Bearer Token)

**URL Parameter:**
```
id  integer — required — wishlist item ID
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Removed from wishlist."
}
```

**Error Response (404):**
```json
{
  "message": "No query results for model [App\\Models\\Wishlist]."
}
```

**Example (Next.js):**
```javascript
await api.delete(`/wishlist/${wishlistItemId}`);
```

---

# 🏷️ COUPON ROUTES

---

## POST /api/coupons/validate

**Description:** Validate a coupon code and calculate the discount amount  
**Auth Required:** No

**Request Body:**
```json
{
  "code":       "string  — required — coupon code (case-insensitive)",
  "amount":     "number  — required — cart total to apply discount on",
  "product_id": "integer — optional — for product-specific coupon validation"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Coupon applied successfully.",
  "data": {
    "code":            "SAVE20",
    "discount_type":   "percentage",
    "discount_value":  20.00,
    "discount_amount": 160.00,
    "apply_to":        "all",
    "product_id":      null,
    "category_id":     null
  }
}
```

**Error Response (404) — Not found:**
```json
{
  "success": false,
  "message": "Coupon not found."
}
```

**Error Response (422) — Expired/inactive:**
```json
{
  "success": false,
  "message": "This coupon is expired or inactive."
}
```

**Error Response (422) — Min purchase:**
```json
{
  "success": false,
  "message": "Minimum purchase of 500.00 required."
}
```

**Discount Types:**
| `discount_type` | Meaning |
|---|---|
| `percentage` | `discount_value`% off — capped at `max_discount_amount` |
| `fixed`      | flat `discount_value` Rs off |

**Example (Next.js):**
```javascript
const res = await api.post('/coupons/validate', {
  code:   'SAVE20',
  amount: 800.00,
});
const { discount_amount } = res.data.data;
```

---

# 📝 BLOG ROUTES

---

## GET /api/blogs

**Description:** Get paginated list of published blog posts  
**Auth Required:** No

**Query Parameters:**
```
search      string  — optional — search in title and excerpt
category_id integer — optional — filter by blog category ID
tag         string  — optional — filter by tag slug
per_page    integer — optional — items per page (default: 10)
page        integer — optional — page number (default: 1)
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id":        1,
      "title":     "Benefits of Turmeric",
      "slug":      "benefits-of-turmeric",
      "excerpt":   "Turmeric has been used for centuries...",
      "thumbnail": "http://localhost:8000/storage/blogs/benefits-of-turmeric.jpg",
      "category": {
        "id":   1,
        "name": "Health Tips",
        "slug": "health-tips"
      },
      "tags": [
        { "id": 1, "name": "Spices", "color": "#FFA500" },
        { "id": 2, "name": "Health", "color": "#00C853" }
      ],
      "created_at": "2024-11-20T08:00:00.000000Z"
    }
  ],
  "meta": {
    "total":        12,
    "per_page":     10,
    "current_page": 1,
    "last_page":    2
  }
}
```

**Example (Next.js):**
```javascript
const res = await api.get('/blogs', {
  params: { page: 1, per_page: 10, category_id: 1 },
});
const { data, meta } = res.data;
```

---

## GET /api/blogs/{slug}

**Description:** Get single published blog post with full content  
**Auth Required:** No

**URL Parameter:**
```
slug  string — required — blog slug e.g. benefits-of-turmeric
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id":         1,
    "title":      "Benefits of Turmeric",
    "slug":       "benefits-of-turmeric",
    "excerpt":    "Turmeric has been used for centuries...",
    "content":    "<h2>What is Turmeric?</h2><p>Turmeric is a golden spice...</p>",
    "thumbnail":  "http://localhost:8000/storage/blogs/benefits-of-turmeric.jpg",
    "meta_title": "Benefits of Turmeric — Pansarin Inn",
    "meta_desc":  "Turmeric has been used for centuries...",
    "category": {
      "id":   1,
      "name": "Health Tips",
      "slug": "health-tips"
    },
    "tags": [
      { "id": 1, "name": "Spices", "color": "#FFA500" }
    ],
    "created_at": "2024-11-20T08:00:00.000000Z"
  }
}
```

**Error Response (404):**
```json
{
  "message": "No query results for model [App\\Models\\Blog]."
}
```

**Example (Next.js):**
```javascript
const res = await api.get(`/blogs/${slug}`);
const blog = res.data.data;
```

---

# 📬 CONTACT ROUTES

---

## POST /api/contact

**Description:** Submit a contact form message  
**Auth Required:** No

**Request Body:**
```json
{
  "name":    "string — required — sender's name, max 255",
  "email":   "string — required — valid email, max 255",
  "phone":   "string — optional — phone number, max 20",
  "subject": "string — optional — message subject, max 255",
  "message": "string — required — message body"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Your message has been sent successfully.",
  "data": {
    "id": 5
  }
}
```

**Error Response (422) — Validation:**
```json
{
  "message": "The message field is required.",
  "errors": {
    "message": ["The message field is required."]
  }
}
```

**Example (Next.js):**
```javascript
const res = await api.post('/contact', {
  name:    'Ahmed Ali',
  email:   'ahmed@example.com',
  phone:   '03001234567',
  subject: 'Order enquiry',
  message: 'I would like to know about bulk orders.',
});
```

---

# 📋 QUICK REFERENCE

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/login` | No | Login |
| POST | `/api/register` | No | Register |
| POST | `/api/logout` | **Yes** | Logout |
| GET | `/api/user` | **Yes** | Auth user profile |
| GET | `/api/products` | No | Product list (paginated + filters) |
| GET | `/api/products/featured` | No | Featured products |
| GET | `/api/products/{slug}` | No | Single product |
| GET | `/api/categories` | No | Category tree |
| GET | `/api/cart` | **Yes** | View cart |
| POST | `/api/cart` | **Yes** | Add to cart |
| PATCH | `/api/cart/{id}` | **Yes** | Update cart item |
| DELETE | `/api/cart/{id}` | **Yes** | Remove cart item |
| DELETE | `/api/cart` | **Yes** | Clear cart |
| GET | `/api/orders` | **Yes** | My orders |
| GET | `/api/orders/{id}` | **Yes** | Order detail |
| POST | `/api/orders` | **Yes** | Place order |
| GET | `/api/wishlist` | **Yes** | My wishlist |
| POST | `/api/wishlist` | **Yes** | Add to wishlist |
| DELETE | `/api/wishlist/{id}` | **Yes** | Remove from wishlist |
| POST | `/api/coupons/validate` | No | Validate coupon |
| GET | `/api/blogs` | No | Blog list |
| GET | `/api/blogs/{slug}` | No | Single blog post |
| POST | `/api/contact` | No | Submit contact form |

---

## HTTP Status Codes Used

| Code | Meaning |
|------|---------|
| 200 | OK — successful GET / action |
| 201 | Created — resource created successfully |
| 401 | Unauthorized — invalid credentials |
| 404 | Not Found — resource not found |
| 422 | Unprocessable — validation error or business rule failure |
| 500 | Server Error — unexpected error |

---

*Last updated: June 2025*
