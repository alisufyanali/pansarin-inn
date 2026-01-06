import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, Check, Plus, Trash2, Search } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { SearchableCustomerSelect, SearchableProductSelect } from '@/components/SearchableSelect';

type Customer = { id: number; first_name: string; last_name: string; phone: string; email: string | null };
type Product = { 
  id: number; 
  name: string; 
  sku: string; 
  price: number; 
  stock: number;
  variants?: Variant[];
};
type Variant = { id: number; name: string; price: number; stock: number };
type City = { id: number; name: string };

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
  cities?: City[];
  isEdit?: boolean;
}

export default function OrderForm({ 
  order, 
  customers = [], 
  products = [], 
  cities = [],
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
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearches, setProductSearches] = useState<{[key: number]: string}>({});
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Filter customers based on search
  const filteredCustomers = customers.filter(c => 
    customerSearch === '' || 
    c.first_name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.last_name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch)
  );

  // Filter products for each item
  const getFilteredProducts = (index: number) => {
    const search = productSearches[index] || '';
    if (search === '') return products;
    return products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
    );
  };

  // Calculate totals
  const subtotal = data.items.reduce((sum, item) => {
    return sum + (Number(item.price) * Number(item.quantity));
  }, 0);

  const productDiscount = data.items.reduce((sum, item) => {
    return sum + Number(item.discount);
  }, 0);

  const grandTotal = subtotal - productDiscount - Number(data.invoice_discount) + Number(data.shipping_charges) + Number(data.tax);

  // Load customer details when selected
  useEffect(() => {
    if (data.customer_id) {
      const customer = customers.find(c => c.id === Number(data.customer_id));
      setSelectedCustomer(customer || null);
    }
  }, [data.customer_id, customers]);

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
        <div className="max-w-7xl w-full mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg">
          <form onSubmit={submit} className="font-sans text-sm">
            {/* Header */}
            <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {isEdit ? `Edit Order ${order?.order_number || ''}` : 'Create New Order'}
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Selection */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                  Select existing customer
                </h3>
                <SearchableCustomerSelect
                  customers={customers}
                  value={data.customer_id}
                  onChange={(id) => setData('customer_id', id)}
                  error={errors.customer_id}
                  required
                />
              </div>

              {/* Client Information & Payment/Shipping Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Client Information */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                    Client Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">First Name</label>
                      <input
                        type="text"
                        value={selectedCustomer?.first_name || ''}
                        disabled
                        className="w-full px-3 py-2 text-sm rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={selectedCustomer?.last_name || ''}
                        disabled
                        className="w-full px-3 py-2 text-sm rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Phone</label>
                      <input
                        type="text"
                        value={selectedCustomer?.phone || ''}
                        disabled
                        className="w-full px-3 py-2 text-sm rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Email</label>
                      <input
                        type="text"
                        value={selectedCustomer?.email || ''}
                        disabled
                        className="w-full px-3 py-2 text-sm rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment/Shipping Details */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                    Payment/Shipping Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Payment Status</label>
                      <select
                        value={data.payment_status}
                        onChange={(e) => setData('payment_status', e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="unpaid">Due</option>
                        <option value="paid">Paid</option>
                        <option value="partially_paid">Partially Paid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Payment Method</label>
                      <select
                        value={data.payment_method}
                        onChange={(e) => setData('payment_method', e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">Select One</option>
                        <option value="Cash On Delivery">Cash On Delivery</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Card Payment">Card Payment</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Payment Date</label>
                      <input
                        type="date"
                        value={data.payment_date}
                        onChange={e => setData('payment_date', e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Shipping Method</label>
                      <select
                        value={data.shipping_method}
                        onChange={(e) => setData('shipping_method', e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">Select One</option>
                        <option value="Standard">Standard</option>
                        <option value="Express">Express</option>
                        <option value="Same Day">Same Day</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Address */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                  Client Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Address1</label>
                    <input
                      type="text"
                      value={data.shipping_address}
                      onChange={e => setData('shipping_address', e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">City</label>
                    <select
                      className="w-full px-3 py-2 text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select One</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>{city.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Address2</label>
                    <input
                      type="text"
                      value={data.billing_address}
                      onChange={e => setData('billing_address', e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Item Information *</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Variant *</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Unit</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Weight/Quantity *</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Rate *</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Disc</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Form</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Total *</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {data.items.map((item, index) => (
                        <tr key={index} className="bg-white dark:bg-gray-900">
                          <td className="px-3 py-2">
                            <SearchableProductSelect
                              products={products}
                              value={item.product_id}
                              onChange={(id) => handleProductChange(index, String(id))}
                              required
                            />
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={item.product_variant_id}
                              onChange={(e) => handleVariantChange(index, e.target.value)}
                              className="w-full px-2 py-1 text-xs rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500 outline-none"
                              disabled={!selectedProducts[index]?.variants?.length}
                            >
                              <option value="">None</option>
                              {selectedProducts[index]?.variants?.map((variant) => (
                                <option key={variant.id} value={variant.id}>
                                  {variant.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value="None"
                              disabled
                              className="w-20 px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                              className="w-20 px-2 py-1 text-xs rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500 outline-none text-center"
                              required
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              step="0.01"
                              value={item.price}
                              onChange={(e) => updateItem(index, 'price', e.target.value)}
                              className="w-24 px-2 py-1 text-xs rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500 outline-none text-right"
                              required
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              step="0.01"
                              value={item.discount}
                              onChange={(e) => updateItem(index, 'discount', e.target.value)}
                              className="w-24 px-2 py-1 text-xs rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500 outline-none text-right"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <select className="w-20 px-2 py-1 text-xs rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                              <option>-</option>
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={((Number(item.price) * Number(item.quantity)) - Number(item.discount)).toFixed(2)}
                              disabled
                              className="w-24 px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-right font-medium"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Details textarea */}
                <div className="px-3 py-3 border-t border-gray-200 dark:border-gray-700">
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Details</label>
                  <textarea
                    rows={3}
                    value={data.order_note}
                    onChange={e => setData('order_note', e.target.value)}
                    placeholder="Details"
                    className="w-full px-3 py-2 text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Totals Section */}
                <div className="px-3 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-end">
                    <div className="w-80 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Product discount:</span>
                        <input
                          type="text"
                          value={productDiscount.toFixed(2)}
                          disabled
                          className="w-24 px-2 py-1 text-xs rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-right"
                        />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Invoice discount:</span>
                        <input
                          type="number"
                          step="0.01"
                          value={data.invoice_discount}
                          onChange={e => setData('invoice_discount', e.target.value)}
                          className="w-24 px-2 py-1 text-xs rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500 outline-none text-right"
                        />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Shipping charges:</span>
                        <input
                          type="number"
                          step="0.01"
                          value={data.shipping_charges}
                          onChange={e => setData('shipping_charges', e.target.value)}
                          className="w-24 px-2 py-1 text-xs rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500 outline-none text-right"
                        />
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-300 dark:border-gray-600">
                        <span className="font-semibold text-gray-900 dark:text-white">Grand total:</span>
                        <input
                          type="text"
                          value={grandTotal.toFixed(2)}
                          disabled
                          className="w-24 px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-right font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={addItem}
                  className="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded"
                >
                  Add new item
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(data.items.length - 1)}
                  disabled={data.items.length === 1}
                  className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded"
                >
                  Delete item
                </button>
              </div>

              {/* Submit Button */}
              <div className="flex justify-start pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  disabled={processing}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded text-sm font-medium"
                >
                  Save Order
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}