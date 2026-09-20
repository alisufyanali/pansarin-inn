# UI / UX Design — Pansari Inn

> Storefront (Next.js / pansariinn.com) design: see frontend repo docs.
> This file covers the **admin panel** (React + Inertia) and **email templates** (Blade).

---

## Admin Panel

### Component Library
- **Radix UI** primitives: Avatar, Checkbox, Collapsible, Dialog, DropdownMenu, Label, NavigationMenu, Select, Separator, Slot, Toggle, ToggleGroup, Tooltip
- **Headless UI** (`@headlessui/react`) for accessible overlays and transitions
- **Lucide React** for icons
- **TanStack Table** + **react-data-table-component** for data grids
- Custom `DataTableWrapper` component wraps react-data-table-component with server-side pagination, search, CSV/PDF export
- Custom `StatCard` component for KPI tiles on index pages
- Custom `SearchableCustomerSelect`, `SearchableProductSelect`, `CityDropdown` for form selects with search

### Layout Patterns
- **`app-layout.tsx`** — authenticated admin shell (sidebar + topbar + main content area)
- **`auth-layout.tsx`** — login / register / password pages (centered card)
- **`settings/` layout** — TODO: confirm structure

Pages are organized in `resources/js/pages/Admin/{Module}/` with `Index.tsx`, `Show.tsx`, `Create.tsx`, `Edit.tsx` per resource.

### Tables & DataTable Conventions
- Every list page fetches from `GET /admin/{resource}-data` (JSON)
- `DataTableWrapper` prop: `fetchUrl`, `columns`, `csvHeaders`, `searchableKeys`, `onDataLoaded`
- Columns defined as `react-data-table-component` column objects
- Bulk actions (select checkboxes, Print, Email, WhatsApp) rendered conditionally when `selectedIds.size > 0`
- Row actions via `CommonColumns.actions()` helper: View, Edit, Delete links

### Forms
- Admin forms use Inertia `useForm()` hook
- Validation errors rendered as `<p className="text-red-500 text-xs mt-1">{error}</p>` inline under each field
- Submit button shows `processing` spinner state
- Flash messages (`flash.success`, `flash.error`) from Inertia shared props → rendered via `react-hot-toast` or `sonner`

### Colors / Typography
- **Primary green**: `#2e7d32` (Tailwind `green-800` equivalent — used in buttons, headers)
- **Light green backgrounds**: `#f0fdf4` (Tailwind `green-50`) for cards, highlights
- **Dark green**: `#1b4332` for headings, strong accents
- **Typography**: System font stack via Tailwind default; `font-sans` throughout
- Dark mode: supported via Tailwind `dark:` variants; toggle stored in cookie `appearance`
- Sidebar state stored in cookie `sidebar_state`

### Print / Dispatch List
- Orders print is a client-side popup window (no Blade template)
- Generated HTML: orders dispatch table (Order #, Name, Phone, City, Product Detail nested table, Total Price)
- Print-only styles with `@media print` + `@page { margin: 10mm; size: A4 }`

---

## Email Templates

All email templates extend `<x-mail-layout>` blade component. Table-based HTML for email client compatibility.

### `mail-layout.blade.php` Structure
- **Background**: `#f2f7f2`, max-width 800px (responsive)
- **Header**: Dark green `#1b5e20` background, logo image (`/logo.png`), tagline "House of Herbs & Spices"
- **Title bar** (if `$heading` prop set): Medium green `#2e7d32`, white text
- **Body**: White `#ffffff`, 32px padding, `{{ $slot }}`
- **Footer**: Light green `#e8f5e9`, contact info (email, phone, WhatsApp link), copyright

### Email Template Inventory

| Template | Purpose | Key content |
|---|---|---|
| `emails/order/confirmation.blade.php` | Order confirmation to customer | Order #, items table (product + variant + unit), totals, shipping address, Track Order button |
| `emails/sale/confirmation.blade.php` | Sale confirmation | Similar to order confirmation |
| `emails/sale/review-request.blade.php` | Post-delivery review request | CTA to leave review |
| `emails/admin/new-order.blade.php` | Admin notification on new order | Order summary, customer info |
| `emails/customer/welcome.blade.php` | Welcome email on registration | Account details |
| `emails/guest/account-created.blade.php` | Guest auto-account credentials | Login email, password (phone number), "Login to Your Account" button → `config('app.frontend_url')/login` |
| `emails/newsletter/campaign.blade.php` | Newsletter broadcast | `{{ $slot }}` content |
| `emails/newsletter/verification.blade.php` | Email verification | Verify link |
| `emails/newsletter/welcome.blade.php` | Newsletter welcome | Welcome message |
| `emails/custom-newsletter.blade.php` | Admin compose/send | Free-form content |

### Email Tone & Style
- Friendly, warm — "Thank you for your order!", "We are getting it ready"
- Green brand color throughout; product info in clean tables
- Call-to-action buttons: green `#2e7d32`, white text, 6px border-radius, bold
- Variant/unit shown below product name in `<small>` gray text
- Footer includes WhatsApp link for support queries

---

## Storefront Design

See frontend repo (Next.js) documentation. Not managed in this repo.
