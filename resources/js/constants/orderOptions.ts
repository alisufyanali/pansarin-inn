/**
 * Shared constants for Orders and Sales modules.
 * Single source of truth for all dropdown options.
 */

export const PAYMENT_METHOD_OPTIONS = [
  { value: 'cash_on_delivery', label: 'Cash on Delivery' },
  { value: 'bank_transfer',    label: 'Bank Transfer' },
  { value: 'card_payment',     label: 'Card Payment' },
  { value: 'easypaisa',        label: 'EasyPaisa' },
  { value: 'jazzcash',         label: 'JazzCash' },
] as const;

// Leopards, PostEx and Movex are booked online when the sale is created
// (CourierService); the "(manual)" ones are arranged by hand.
export const SHIPPING_METHOD_OPTIONS = [
  { value: 'leopard', label: 'Leopards Courier' },
  { value: 'px',      label: 'PostEx' },
  { value: 'movex',   label: 'Movex' },
  { value: 'cc',      label: 'Call Courier (manual)' },
  { value: 'pp',      label: 'Pakistan Post (manual)' },
  { value: 'tcs',     label: 'TCS (manual)' },
  { value: 'trax',    label: 'TRAX (manual)' },
  { value: 'rider',   label: 'Rider (manual)' },
] as const;

export const PAYMENT_STATUS_OPTIONS = [
  { value: 'unpaid',          label: 'Unpaid' },
  { value: 'paid',            label: 'Paid' },
  { value: 'partially_paid',  label: 'Partially Paid' },
  { value: 'refunded',        label: 'Refunded' },
] as const;

export const ORDER_STATUS_OPTIONS = [
  { value: 'pending',    label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped',    label: 'Shipped' },
  { value: 'delivered',  label: 'Delivered' },
  { value: 'cancelled',  label: 'Cancelled' },
  { value: 'refunded',   label: 'Refunded' },
] as const;

export const DELIVERY_STATUS_OPTIONS = [
  { value: 'pending',    label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped',    label: 'Shipped' },
  { value: 'delivered',  label: 'Delivered' },
  { value: 'cancelled',  label: 'Cancelled' },
  { value: 'returned',   label: 'Returned' },
] as const;

/** Couriers that require a weight input field */
export const COURIERS_WITH_WEIGHT = ['leopard', 'cc', 'px', 'movex', 'tcs', 'trax', 'rider'] as const;
