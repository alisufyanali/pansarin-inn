import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, Check, Plus, Trash2, Package } from 'lucide-react';
import { Link } from '@inertiajs/react';

type Customer = { id: number; first_name: string; last_name: string; phone: string };
type Product = { 
  id: number; 
  name: string; 
  sku: string; 
  price: number; 
  stock: number;
  variants?: Variant[];
};
type Variant = { id: number; name: string; price: number; stock: number };

type OrderItem = {
  product_id: number | string;
  product_variant_id: number | string;
  quantity: number;
  price: number;
  discount: number;
};

export type OrderFormData = {
  customer_id: string | number;
  items: OrderItem[];
  invoice_discount: string | number;
  shipping_charges: string | number;
  tax: string | number;
  status: string;
  payment_status: string;
  payment_method: string;
  payment_date: string;
  shipping_method: string;
  shipping_address: string;
  billing_address: string;
  order_note: string;
};

interface OrderFormProps {
  order?: OrderFormData & { id?: number; order_number?: string };
  customers?: Customer[];
  products?: Product[];
  isEdit?: boolean;
}

export default function OrderForm({ 
  order, 
  customers = [], 
  products = [], 
  isEdit = false 
}: OrderFormProps) {
  const { data, setData, errors, post, put, processing } = useForm<OrderFormData>({
    customer_id: order?.customer_id || '',
    items: order?.items || [{ product_id: '', product_variant_id: '', quantity: 1, price: 0, discount: 0 }],
    invoice_discount: order?.invoice_discount || 0,
    shipping_charges: order?.shipping_charges || 0,
    tax: order?.tax || 0,
    status: order?.status || 'pending',
    payment_status: order?.payment_status || 'unpaid',
    payment_method: order?.payment_method || '',
    payment_date: order?.payment_date || '',
    shipping_method: order?.shipping_method || '',
    shipping_address: order?.shipping_address || '',
    billing_address: order?.billing_address || '',
    order_note: order?.order_note || '',
  });

  const [selectedProducts, setSelectedProducts] = useState<{[key: number]: Product}>({});

  // Calculate totals
  const subtotal = data.items.reduce((sum, item) => {
    return sum + (Number(item.price) * Number(item.quantity));
  }, 0);

  const productDiscount = data.items.reduce((sum, item) => {
    return sum + Number(item.discount);
  }, 0);

  const grandTotal = subtotal - productDiscount - Number(data.invoice_discount) + Number(data.shipping_charges) + Number(data.tax);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if (isEdit && order?.id) {
      put(`/admin/orders/${order.id}`);
    } else {
      post('/admin/orders');
    }
  }

  const addItem = () => {
    setData('items', [...data.items, { product_id: '', product_variant_id: '', quantity: 1, price: 0, discount: 0 }]);
  };

  const removeItem = (index: number) => {
    const newItems = data.items.filter((_, i) => i !== index);
    setData('items', newItems);
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...data.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setData('items', newItems);
  };

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find(p => p.id === Number(productId));
    if (product) {
      setSelectedProducts({ ...selectedProducts, [index]: product });
      updateItem(index, 'product_id', productId);
      updateItem(index, 'product_variant_id', '');
      updateItem(index, 'price', product.price);
    }
  };

  const handleVariantChange = (index: number, variantId: string) => {
    const product = selectedProducts[index];
    if (product && variantId) {
      const variant = product.variants?.find(v => v.id === Number(variantId));
      if (variant) {
        updateItem(index, 'product_variant_id', variantId);
        updateItem(index, 'price', variant.price);
      }
    } else {
      updateItem(index, 'product_variant_id', '');
      if (product) {
        updateItem(index, 'price', product.price);
      }
    }
  };

  return (
    <div className="p-3">
      <div className="flex items-center gap-2 mb-4">
        <Link
          href="/admin/orders"
          className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10"
          title="Back"
        >
          <ArrowLeft />
        </Link>
      </div>

      <div className="py-6">
        <div className="max-w-5xl w-full mx-auto bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
            {isEdit ? `Edit Order ${order?.order_number || ''}` : 'Create New Order'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 text-center">
            {isEdit ? 'Update the order details below.' : 'Fill the form below to create a new order.'}
          </p>

          <form onSubmit={submit} className="space-y-6 font-sans text-sm">
            {/* Customer Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Customer Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Customer *
                </label>
                <select
                  value={data.customer_id}
                  onChange={(e) => setData('customer_id', e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">Select a customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.first_name} {customer.last_name} - {customer.phone}
                    </option>
                  ))}
                </select>
                {errors.customer_id && <div className="text-red-500 text-sm mt-1">{errors.customer_id}</div>}
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Order Items
                </h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>

              <div className="space-y-3">
                {data.items.map((item, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                      {/* Product */}
                      <div className="md:col-span-4">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Product *
                        </label>
                        <select
                          value={item.product_id}
                          onChange={(e) => handleProductChange(index, e.target.value)}
                          className="w-full px-2 py-1.5 text-sm rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                          required
                        >
                          <option value="">Select product</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name} ({product.sku})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Variant (if applicable) */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Variant
                        </label>
                        <select
                          value={item.product_variant_id}
                          onChange={(e) => handleVariantChange(index, e.target.value)}
                          className="w-full px-2 py-1.5 text-sm rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                          disabled={!selectedProducts[index]?.variants?.length}
                        >
                          <option value="">Default</option>
                          {selectedProducts[index]?.variants?.map((variant) => (
                            <option key={variant.id} value={variant.id}>
                              {variant.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Qty *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                          required
                        />
                      </div>

                      {/* Price */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Price *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.price}
                          onChange={(e) => updateItem(index, 'price', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                          required
                        />
                      </div>

                      {/* Discount */}
                      <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Disc.
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.discount}
                          onChange={(e) => updateItem(index, 'discount', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      {/* Remove Button */}
                      <div className="md:col-span-1 flex items-end">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="w-full px-2 py-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          disabled={data.items.length === 1}
                        >
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      </div>
                    </div>

                    {/* Item Subtotal */}
                    <div className="mt-2 text-right text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal: </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        PKR {((Number(item.price) * Number(item.quantity)) - Number(item.discount)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Totals */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Order Totals
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Invoice Discount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={data.invoice_discount}
                    onChange={e => setData('invoice_discount', e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Shipping Charges
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={data.shipping_charges}
                    onChange={e => setData('shipping_charges', e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tax
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={data.tax}
                    onChange={e => setData('tax', e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className="font-medium">PKR {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Product Discount:</span>
                    <span className="font-medium text-red-600">- PKR {productDiscount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Invoice Discount:</span>
                    <span className="font-medium text-red-600">- PKR {Number(data.invoice_discount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                    <span className="font-medium">+ PKR {Number(data.shipping_charges).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                    <span className="font-medium">+ PKR {Number(data.tax).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300 dark:border-gray-600">
                    <span className="font-bold text-gray-900 dark:text-white text-lg">Grand Total:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">PKR {grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Order Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Order Status *
                  </label>
                  <select
                    value={data.status}
                    onChange={(e) => setData('status', e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Payment Status *
                  </label>
                  <select
                    value={data.payment_status}
                    onChange={(e) => setData('payment_status', e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Payment Method
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Cash, Card, Bank Transfer"
                    value={data.payment_method}
                    onChange={e => setData('payment_method', e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={data.payment_date}
                    onChange={e => setData('payment_date', e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Shipping Method
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Standard, Express"
                    value={data.shipping_method}
                    onChange={e => setData('shipping_method', e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Shipping Address
                </label>
                <textarea
                  placeholder="Enter shipping address"
                  rows={3}
                  value={data.shipping_address}
                  onChange={e => setData('shipping_address', e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Billing Address
                </label>
                <textarea
                  placeholder="Enter billing address"
                  rows={3}
                  value={data.billing_address}
                  onChange={e => setData('billing_address', e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Order Note
                </label>
                <textarea
                  placeholder="Any special instructions..."
                  rows={3}
                  value={data.order_note}
                  onChange={e => setData('order_note', e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end items-center gap-2 pt-4">
              <Link
                href="/admin/orders"
                className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white px-4 py-2"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={processing}
                className="inline-flex items-center gap-2 justify-center rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 shadow"
              >
                <Check className="w-4 h-4" />
                {isEdit ? 'Update Order' : 'Create Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}