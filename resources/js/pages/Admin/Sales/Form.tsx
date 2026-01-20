import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { SearchableCustomerSelect, SearchableProductSelect } from '@/components/SearchableSelect';

type Customer = { id: number; first_name: string; last_name: string; phone: string; email: string | null };
type Order = { id: number; order_number: string; customer_id: number; grand_total: number };
type Product = {
    id: number;
    name: string;
    sku: string;
    price: number;
    stock: number;
    variants?: Variant[];
};
type Variant = { id: number; name: string; price: number; stock: number };

type SaleItem = {
    product_id: number | string;
    product_variant_id: number | string;
    quantity: number;
    price: number;
    discount: number;
};

export type SaleFormData = {
    order_id: string | number;
    customer_id: string | number;
    items: SaleItem[];
    invoice_discount: string | number;
    vat: string | number;
    vat_percent: string;
    shipping_charges: string | number;
    delivery_status: string;
    payment_status: string;
    payment_type: string;
    payment_timestamp: string;
    shipping_method: string;
    shipping_address: string;
    shipping_response: string;
    delivery_datetime: string;
    remarks: string;
    review: string;
};

interface SaleFormProps {
    sale?: SaleFormData & { id?: number; sale_code?: string };
    orders?: Order[];
    customers?: Customer[];
    products?: Product[];
    isEdit?: boolean;
}

export default function SaleForm({
    sale,
    orders = [],
    customers = [],
    products = [],
    isEdit = false
}: SaleFormProps) {
    const { data, setData, errors, post, put, processing } = useForm<SaleFormData>({
        order_id: sale?.order_id || '',
        customer_id: sale?.customer_id || '',
        items: sale?.items || [{ product_id: '', product_variant_id: '', quantity: 1, price: 0, discount: 0 }],
        invoice_discount: sale?.invoice_discount || 0,
        vat: sale?.vat || 0,
        vat_percent: sale?.vat_percent || '',
        shipping_charges: sale?.shipping_charges || 0,
        delivery_status: sale?.delivery_status || 'pending',
        payment_status: sale?.payment_status || 'unpaid',
        payment_type: sale?.payment_type || '',
        payment_timestamp: sale?.payment_timestamp || '',
        shipping_method: sale?.shipping_method || '',
        shipping_address: sale?.shipping_address || '',
        shipping_response: sale?.shipping_response || '',
        delivery_datetime: sale?.delivery_datetime || '',
        remarks: sale?.remarks || '',
        review: sale?.review || '',
    });

    const [selectedProducts, setSelectedProducts] = useState<{ [key: number]: Product }>({});
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => {
        return sum + (Number(item.price) * Number(item.quantity));
    }, 0);

    const productDiscount = data.items.reduce((sum, item) => {
        return sum + Number(item.discount);
    }, 0);

    const grandTotal = subtotal - productDiscount - Number(data.invoice_discount) + Number(data.vat) + Number(data.shipping_charges);

    // Load customer when order selected
    useEffect(() => {
        if (data.order_id) {
            const order = orders.find(o => o.id === Number(data.order_id));
            if (order) {
                setSelectedOrder(order);
                setData('customer_id', order.customer_id);
            }
        }
    }, [data.order_id, orders]);

    // Load customer details
    useEffect(() => {
        if (data.customer_id) {
            const customer = customers.find(c => c.id === Number(data.customer_id));
            setSelectedCustomer(customer || null);
        }
    }, [data.customer_id, customers]);

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (isEdit && sale?.id) {
            put(`/admin/sales/${sale.id}`);
        } else {
            post('/admin/sales');
        }
    }

    const addItem = () => {
        setData('items', [...data.items, { product_id: '', product_variant_id: '', quantity: 1, price: 0, discount: 0 }]);
    };

    const removeItem = (index: number) => {
        const newItems = data.items.filter((_, i) => i !== index);
        setData('items', newItems);
    };

    const updateItem = (index: number, field: keyof SaleItem, value: any) => {
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
                    href="/admin/sales"
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
                                {isEdit ? `Edit Sale ${sale?.sale_code || ''}` : 'Create New Sale'}
                            </h2>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Order Selection */}
                            {!isEdit && (
                                <div>
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                                        Select Order
                                    </h3>
                                    <select
                                        value={data.order_id}
                                        onChange={(e) => setData('order_id', e.target.value)}
                                        className="w-full px-3 py-2 text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    >
                                        <option value="">Select an Order</option>
                                        {orders.map((order) => (
                                            <option key={order.id} value={order.id}>
                                                {order.order_number} - PKR {order.grand_total.toFixed(2)}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.order_id && (
                                        <p className="mt-1 text-xs text-red-600">{errors.order_id}</p>
                                    )}
                                </div>
                            )}

                            {/* Customer & Payment/Shipping Details */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Customer Information */}
                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                                        Customer Information
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
                                                <option value="refunded">Refunded</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Payment Type</label>
                                            <select
                                                value={data.payment_type}
                                                onChange={(e) => setData('payment_type', e.target.value)}
                                                className="w-full px-3 py-2 text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                            >
                                                <option value="">Select One</option>
                                                <option value="cash_on_delivery">Cash On Delivery</option>
                                                <option value="bank_transfer">Bank Transfer</option>
                                                <option value="card_payment">Card Payment</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Delivery Status</label>
                                            <select
                                                value={data.delivery_status}
                                                onChange={(e) => setData('delivery_status', e.target.value)}
                                                className="w-full px-3 py-2 text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                                <option value="returned">Returned</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Shipping Method</label>
                                            <select
                                                value={data.shipping_method}
                                                onChange={(e) => setData('shipping_method', e.target.value)}
                                                className="w-full px-3 py-2 text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                            >
                                                <option value="">Select One</option>
                                                <option value="leopard">Leopard</option>
                                                <option value="tcs">TCS</option>
                                                <option value="trax">TRAX</option>
                                                <option value="rider">Rider</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                                    Shipping Address
                                </h3>
                                <textarea
                                    rows={3}
                                    value={data.shipping_address}
                                    onChange={e => setData('shipping_address', e.target.value)}
                                    className="w-full px-3 py-2 text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Enter shipping address..."
                                />
                            </div>

                            {/* Sale Items Table */}
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                <div className="">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 dark:bg-gray-800">
                                            <tr>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Product *</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Variant</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Quantity *</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Rate *</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Discount</th>
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

                                {/* Remarks textarea */}
                                <div className="px-3 py-3 border-t border-gray-200 dark:border-gray-700">
                                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Remarks</label>
                                    <textarea
                                        rows={3}
                                        value={data.remarks}
                                        onChange={e => setData('remarks', e.target.value)}
                                        placeholder="Remarks..."
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
                                                <span className="text-gray-700 dark:text-gray-300">VAT:</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={data.vat}
                                                    onChange={e => setData('vat', e.target.value)}
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
                                    Save Sale
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}