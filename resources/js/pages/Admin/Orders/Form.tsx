import React, { useState, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { toast } from 'sonner';
import { SearchableCustomerSelect, SearchableProductSelect } from '@/components/SearchableSelect';
import CityDropdown, { type CityOption } from '@/components/CityDropdown';

type Customer = { 
  id: number; 
  first_name: string; 
  last_name: string; 
  phone: string; 
  email: string | null;
  address: string | null;
  address2: string | null;
  city_id: number | null;
};
type Variant = { id: number; name: string; price: number; stock: number };
type Product = { 
  id: number; 
  name: string; 
  sku: string; 
  price: number; 
  stock: number;
  variants?: Variant[];
};
type City = CityOption;

type OrderItem = {
  product_id: number | string;
  product_variant_id: number | string;
  quantity: number;
  price: number;
  discount: number;
};

export type OrderFormData = {
  customer_id: string | number;
  city_id: string | number;
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
  courier_weight: string | number;
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
  const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
  const { data, setData, errors, post, put, processing } = useForm<OrderFormData>({
    customer_id: order?.customer_id || '',
    city_id: order?.city_id || '',
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
    courier_weight: order?.courier_weight || '',
  });

  // FIX: selectedProducts ko properly initialize karo agar edit mode mein hain
  const [selectedProducts, setSelectedProducts] = useState<{[key: number]: Product}>(() => {
    if (order?.items) {
      const initial: {[key: number]: Product} = {};
      order.items.forEach((item, index) => {
        const product = products.find(p => p.id === Number(item.product_id));
        if (product) initial[index] = product;
      });
      return initial;
    }
    return {};
  });

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Subtotal aur grand total calculate karo
  const subtotal = data.items.reduce((sum, item) => {
    return sum + (Number(item.price) * Number(item.quantity));
  }, 0);

  const productDiscount = data.items.reduce((sum, item) => {
    return sum + Number(item.discount);
  }, 0);

  const grandTotal = subtotal - productDiscount - Number(data.invoice_discount) + Number(data.shipping_charges) + Number(data.tax);

  // Flash messages (success/error from backend)
  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error)   toast.error(flash.error);
  }, [flash]);

  // Customer select hone par details load karo
  useEffect(() => {
    if (data.customer_id) {
      const customer = customers.find(c => c.id === Number(data.customer_id));
      setSelectedCustomer(customer || null);
      if (customer) {
        const city = cities.find(c => c.id === Number(customer.city_id));
        setData('shipping_address', customer.address || '');
        setData('billing_address', customer.address2 || '');
        setData('city_id', customer.city_id ?? '');
        if (city?.shipping_charges != null) {
          setData('shipping_charges', Number(city.shipping_charges));
        }
      }
    } else {
      setSelectedCustomer(null);
    }
  }, [data.customer_id, customers, cities]);

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
    // selectedProducts bhi update karo
    const newSelected = { ...selectedProducts };
    delete newSelected[index];
    // Reindex
    const reindexed: {[key: number]: Product} = {};
    Object.entries(newSelected).forEach(([key, val]) => {
      const k = Number(key);
      reindexed[k > index ? k - 1 : k] = val;
    });
    setSelectedProducts(reindexed);
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
      setSelectedProducts(prev => ({ ...prev, [index]: product }));
      const newItems = [...data.items];
      newItems[index] = {
        ...newItems[index],
        product_id: productId,
        product_variant_id: '',
        price: product.price,
      };
      setData('items', newItems);
    } else {
      // Clear karo agar koi product select nahi
      setSelectedProducts(prev => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });
      const newItems = [...data.items];
      newItems[index] = { ...newItems[index], product_id: '', product_variant_id: '', price: 0 };
      setData('items', newItems);
    }
  };

  const handleVariantChange = (index: number, variantId: string) => {
    const product = selectedProducts[index];
    if (product && variantId) {
      const variant = product.variants?.find(v => v.id === Number(variantId));
      if (variant) {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], product_variant_id: variantId, price: variant.price };
        setData('items', newItems);
      }
    } else {
      const newItems = [...data.items];
      newItems[index] = {
        ...newItems[index],
        product_variant_id: '',
        price: product?.price || 0,
      };
      setData('items', newItems);
    }
  };

  // Items level errors helper - backend se "items.0.product_id" jaise errors handle karo
  const getItemError = (index: number, field: string): string | undefined => {
    const key = `items.${index}.${field}` as keyof typeof errors;
    return errors[key] as string | undefined;
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

              {/* General errors (non-field) */}
              {errors && Object.keys(errors).length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-4">
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
                    Please fix the following errors:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    {Object.entries(errors).map(([key, msg]) => (
                      <li key={key} className="text-sm text-red-600 dark:text-red-400">{msg as string}</li>
                    ))}
                  </ul>
                </div>
              )}

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
                    {[
                      { label: 'First Name', value: selectedCustomer?.first_name || '' },
                      { label: 'Last Name', value: selectedCustomer?.last_name || '' },
                      { label: 'Phone', value: selectedCustomer?.phone || '' },
                      { label: 'Email', value: selectedCustomer?.email || '' },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</label>
                        <input
                          type="text"
                          value={value}
                          disabled
                          className="w-full px-3 py-2 text-sm rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
                        />
                      </div>
                    ))}
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
                      {errors.payment_status && <p className="text-red-500 text-xs mt-1">{errors.payment_status}</p>}
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
                      {errors.payment_method && <p className="text-red-500 text-xs mt-1">{errors.payment_method}</p>}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Payment Date</label>
                      <input
                        type="date"
                        value={data.payment_date}
                        onChange={e => setData('payment_date', e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      {errors.payment_date && <p className="text-red-500 text-xs mt-1">{errors.payment_date}</p>}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Shipping Method</label>
                      <select
                        value={data.shipping_method}
                        onChange={(e) => setData('shipping_method', e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">Select One</option>
                        <option value="leopard">Leopard Courier</option>
                        <option value="cc">Call Courier</option>
                        <option value="pp">Pakistan Post</option>
                        <option value="px">PostEx</option>
                        <option value="movex">Movex</option>
                      </select>
                      {errors.shipping_method && <p className="text-red-500 text-xs mt-1">{errors.shipping_method}</p>}

                      {/* Conditional weight field */}
                      {data.shipping_method === 'leopard' && (
                        <div className="mt-2">
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Leopard Weight (kg)</label>
                          <input
                            type="number" min="0" step="0.5"
                            value={data.courier_weight}
                            onChange={e => setData('courier_weight', e.target.value)}
                            className="w-full px-3 py-2 text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="0.5"
                          />
                        </div>
                      )}
                      {data.shipping_method === 'cc' && (
                        <div className="mt-2">
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Call Courier Weight</label>
                          <input
                            type="text"
                            value={data.courier_weight}
                            onChange={e => setData('courier_weight', e.target.value)}
                            className="w-full px-3 py-2 text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. 500g"
                          />
                        </div>
                      )}
                      {data.shipping_method === 'px' && (
                        <div className="mt-2">
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">PostEx Weight (kg)</label>
                          <input
                            type="number" min="0" step="0.5"
                            value={data.courier_weight}
                            onChange={e => setData('courier_weight', e.target.value)}
                            className="w-full px-3 py-2 text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="0.5"
                          />
                        </div>
                      )}
                      {data.shipping_method === 'movex' && (
                        <div className="mt-2">
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Movex Weight (kg)</label>
                          <input
                            type="number" min="0" step="0.5"
                            value={data.courier_weight}
                            onChange={e => setData('courier_weight', e.target.value)}
                            className="w-full px-3 py-2 text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="0.5"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Address */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Client Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Address 1</label>
                    <input
                      type="text"
                      value={data.shipping_address}
                      onChange={e => setData('shipping_address', e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    {errors.shipping_address && <p className="text-red-500 text-xs mt-1">{errors.shipping_address}</p>}
                  </div>
                  <div>
                    <CityDropdown
                      cities={cities}
                      value={data.city_id ?? ''}
                      onChange={val => {
                        const city = cities.find(c => String(c.id) === String(val));
                        console.log('City selected:', city);
                        console.log('shipping_charges:', city?.shipping_charges);
                        setData('city_id', val);
                        if (city?.shipping_charges != null) {
                          setData('shipping_charges', Number(city.shipping_charges));
                        }
                      }}
                      error={errors.city_id}
                      label="City"
                    />
                    {data.city_id && (() => {
                      const city = cities.find(c => String(c.id) === String(data.city_id));
                      if (!city?.shipping_charges) return null;
                      return (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          Shipping: Rs. {Number(city.shipping_charges).toFixed(0)} (auto-set)
                        </p>
                      );
                    })()}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Address 2</label>
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
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 min-w-[200px]">Item *</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 min-w-[140px]">Variant</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 w-24">Quantity *</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 w-28">Rate *</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 w-28">Discount</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 w-28">Total *</th>
                        <th className="px-3 py-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {data.items.map((item, index) => (
                        <tr key={index} className="bg-white dark:bg-gray-900">
                          {/* Product Select */}
                          <td className="px-3 py-2">
                            <SearchableProductSelect
                              products={products}
                              value={item.product_id}
                              onChange={(id) => handleProductChange(index, String(id))}
                              required
                              allowOutOfStock={true}
                            />
                            {/* Stock badge for selected product (no variant) */}
                            {item.product_id && !item.product_variant_id && selectedProducts[index] && (
                              <p className={`text-xs mt-0.5 font-medium ${
                                selectedProducts[index].stock > 10 ? 'text-green-600' :
                                selectedProducts[index].stock > 0  ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                Stock: {selectedProducts[index].stock}
                              </p>
                            )}
                            {getItemError(index, 'product_id') && (
                              <p className="text-red-500 text-xs mt-1">{getItemError(index, 'product_id')}</p>
                            )}
                          </td>

                          {/* Variant Select */}
                          <td className="px-3 py-2">
                            <select
                              value={item.product_variant_id}
                              onChange={(e) => {
                                const variantId = e.target.value;
                                const product = selectedProducts[index];
                                if (variantId && product) {
                                  const variant = product.variants?.find(v => v.id === Number(variantId));
                                  if (variant && variant.stock <= 0) {
                                    alert(`Variant "${variant.name}" is out of stock. Please add stock first.`);
                                    return;
                                  }
                                }
                                handleVariantChange(index, variantId);
                              }}
                              className="w-full px-2 py-1 text-xs rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-400"
                              disabled={!selectedProducts[index]?.variants?.length}
                            >
                              <option value="">None</option>
                              {selectedProducts[index]?.variants?.map((variant) => (
                                <option key={variant.id} value={variant.id}
                                  disabled={variant.stock <= 0}
                                  style={variant.stock <= 0 ? { color: '#ef4444' } : {}}>
                                  {variant.name} — Stock: {variant.stock}{variant.stock <= 0 ? ' ⚠ Out' : ''}
                                </option>
                              ))}
                            </select>
                            {/* Stock badge for selected variant */}
                            {item.product_variant_id && selectedProducts[index]?.variants && (() => {
                              const v = selectedProducts[index].variants?.find(v => v.id === Number(item.product_variant_id));
                              if (!v) return null;
                              return (
                                <p className={`text-xs mt-0.5 font-medium ${v.stock > 10 ? 'text-green-600' : v.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                                  Stock: {v.stock}
                                </p>
                              );
                            })()}
                            {getItemError(index, 'product_variant_id') && (
                              <p className="text-red-500 text-xs mt-1">{getItemError(index, 'product_variant_id')}</p>
                            )}
                          </td>

                          {/* Quantity */}
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                              className={`w-20 px-2 py-1 text-xs rounded bg-white dark:bg-gray-800 border focus:ring-1 focus:ring-blue-500 outline-none text-center ${
                                getItemError(index, 'quantity') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                              }`}
                              required
                            />
                            {getItemError(index, 'quantity') && (
                              <p className="text-red-500 text-xs mt-1">{getItemError(index, 'quantity')}</p>
                            )}
                          </td>

                          {/* Price / Rate */}
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              step="0.01"
                              value={item.price}
                              onChange={(e) => updateItem(index, 'price', e.target.value)}
                              className={`w-24 px-2 py-1 text-xs rounded bg-white dark:bg-gray-800 border focus:ring-1 focus:ring-blue-500 outline-none text-right ${
                                getItemError(index, 'price') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                              }`}
                              required
                            />
                            {getItemError(index, 'price') && (
                              <p className="text-red-500 text-xs mt-1">{getItemError(index, 'price')}</p>
                            )}
                          </td>

                          {/* Discount */}
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              step="0.01"
                              value={item.discount}
                              onChange={(e) => updateItem(index, 'discount', e.target.value)}
                              className="w-24 px-2 py-1 text-xs rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500 outline-none text-right"
                            />
                          </td>

                          {/* Row Total */}
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={((Number(item.price) * Number(item.quantity)) - Number(item.discount)).toFixed(2)}
                              disabled
                              className="w-24 px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-right font-medium"
                            />
                          </td>

                          {/* Delete Row Button */}
                          <td className="px-2 py-2 text-center">
                            {data.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Remove item"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                </svg>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Items general error */}
                {errors.items && (
                  <div className="px-3 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-700">
                    <p className="text-red-500 text-xs">{errors.items as string}</p>
                  </div>
                )}

                {/* Order Note */}
                <div className="px-3 py-3 border-t border-gray-200 dark:border-gray-700">
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Order Note</label>
                  <textarea
                    rows={3}
                    value={data.order_note}
                    onChange={e => setData('order_note', e.target.value)}
                    placeholder="Details"
                    className="w-full px-3 py-2 text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Totals */}
                <div className="px-3 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-end">
                    <div className="w-80 space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 dark:text-gray-300">Subtotal:</span>
                        <input
                          type="text"
                          value={subtotal.toFixed(2)}
                          disabled
                          className="w-24 px-2 py-1 text-xs rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-right"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 dark:text-gray-300">Product discount:</span>
                        <input
                          type="text"
                          value={productDiscount.toFixed(2)}
                          disabled
                          className="w-24 px-2 py-1 text-xs rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-right"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 dark:text-gray-300">Invoice discount:</span>
                        <input
                          type="number"
                          step="0.01"
                          value={data.invoice_discount}
                          onChange={e => setData('invoice_discount', e.target.value)}
                          className="w-24 px-2 py-1 text-xs rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500 outline-none text-right"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 dark:text-gray-300">Shipping charges:</span>
                        <input
                          type="number"
                          step="0.01"
                          value={Number(data.shipping_charges)}
                          onChange={e => setData('shipping_charges', e.target.value)}
                          className="w-24 px-2 py-1 text-xs rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500 outline-none text-right"
                        />
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-300 dark:border-gray-600">
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

              {/* Submit */}
              <div className="flex justify-start pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  disabled={processing}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded text-sm font-medium"
                >
                  {processing ? 'Saving...' : 'Save Order'}
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
}