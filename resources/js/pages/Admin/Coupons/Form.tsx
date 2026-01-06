import React from 'react';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, Check, Percent, DollarSign } from 'lucide-react';
import { Link } from '@inertiajs/react';

type Product = { id: number; name: string };
type Category = { id: number; name: string };

export type CouponFormData = {
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: string | number;
  apply_to: 'order' | 'product' | 'category';
  product_id: string | number;
  category_id: string | number;
  min_purchase_amount: string | number;
  max_discount_amount: string | number;
  usage_limit: string | number;
  per_user_limit: string | number;
  start_date: string;
  end_date: string;
  is_active: boolean;
};

interface CouponFormProps {
  coupon?: CouponFormData & { id?: number };
  products?: Product[];
  categories?: Category[];
  isEdit?: boolean;
}

export default function CouponForm({ 
  coupon, 
  products = [], 
  categories = [], 
  isEdit = false 
}: CouponFormProps) {
  const { data, setData, errors, post, put, processing } = useForm<CouponFormData>({
    code: coupon?.code || '',
    description: coupon?.description || '',
    discount_type: coupon?.discount_type || 'percentage',
    discount_value: coupon?.discount_value || '',
    apply_to: coupon?.apply_to || 'order',
    product_id: coupon?.product_id || '',
    category_id: coupon?.category_id || '',
    min_purchase_amount: coupon?.min_purchase_amount || '',
    max_discount_amount: coupon?.max_discount_amount || '',
    usage_limit: coupon?.usage_limit || '',
    per_user_limit: coupon?.per_user_limit || '',
    start_date: coupon?.start_date || '',
    end_date: coupon?.end_date || '',
    is_active: coupon?.is_active ?? true,
  });

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if (isEdit && coupon?.id) {
      put(`/admin/coupons/${coupon.id}`);
    } else {
      post('/admin/coupons');
    }
  }

  return (
    <div className="p-3">
      <div className="flex items-center gap-2 mb-4">
        <Link
          href="/admin/coupons"
          className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10"
          title="Back"
        >
          <ArrowLeft />
        </Link>
      </div>

      <div className="py-6">
        <div className="max-w-3xl w-full mx-auto bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
            {isEdit ? 'Edit Coupon' : 'Create New Coupon'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 text-center">
            {isEdit ? 'Update the coupon details below.' : 'Fill the form below to add a new coupon.'}
          </p>

          <form onSubmit={submit} className="space-y-6 font-sans text-sm">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Basic Information
              </h3>

              {/* Coupon Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  placeholder="e.g., SUMMER2024"
                  className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                  value={data.code}
                  onChange={e => setData('code', e.target.value.toUpperCase())}
                  required
                />
                {errors.code && <div className="text-red-500 text-sm mt-1">{errors.code}</div>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  placeholder="Describe this coupon..."
                  className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={3}
                  value={data.description}
                  onChange={e => setData('description', e.target.value)}
                />
                {errors.description && <div className="text-red-500 text-sm mt-1">{errors.description}</div>}
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={data.is_active}
                  onChange={e => setData('is_active', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Active
                </label>
              </div>
            </div>

            {/* Discount Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Discount Configuration
              </h3>

              {/* Discount Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Discount Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setData('discount_type', 'percentage')}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md border-2 transition-all ${
                      data.discount_type === 'percentage'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Percent className="w-5 h-5" />
                    <span className="font-medium">Percentage</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setData('discount_type', 'fixed')}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md border-2 transition-all ${
                      data.discount_type === 'fixed'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <DollarSign className="w-5 h-5" />
                    <span className="font-medium">Fixed Amount</span>
                  </button>
                </div>
                {errors.discount_type && <div className="text-red-500 text-sm mt-1">{errors.discount_type}</div>}
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Discount Value *
                </label>
                <div className="relative mt-1">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={data.discount_type === 'percentage' ? 'e.g., 10' : 'e.g., 500'}
                    className="w-full px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={data.discount_value}
                    onChange={e => setData('discount_value', e.target.value)}
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {data.discount_type === 'percentage' ? '%' : 'PKR'}
                  </div>
                </div>
                {errors.discount_value && <div className="text-red-500 text-sm mt-1">{errors.discount_value}</div>}
              </div>

              {/* Max Discount (for percentage) */}
              {data.discount_type === 'percentage' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Maximum Discount Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g., 1000 (optional)"
                    className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={data.max_discount_amount}
                    onChange={e => setData('max_discount_amount', e.target.value)}
                  />
                  {errors.max_discount_amount && <div className="text-red-500 text-sm mt-1">{errors.max_discount_amount}</div>}
                </div>
              )}
            </div>

            {/* Application Scope */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Application Scope
              </h3>

              {/* Apply To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Apply To *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setData('apply_to', 'order')}
                    className={`px-4 py-3 rounded-md border-2 transition-all font-medium ${
                      data.apply_to === 'order'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    Order
                  </button>
                  <button
                    type="button"
                    onClick={() => setData('apply_to', 'product')}
                    className={`px-4 py-3 rounded-md border-2 transition-all font-medium ${
                      data.apply_to === 'product'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    Product
                  </button>
                  <button
                    type="button"
                    onClick={() => setData('apply_to', 'category')}
                    className={`px-4 py-3 rounded-md border-2 transition-all font-medium ${
                      data.apply_to === 'category'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    Category
                  </button>
                </div>
                {errors.apply_to && <div className="text-red-500 text-sm mt-1">{errors.apply_to}</div>}
              </div>

              {/* Product Selection */}
              {data.apply_to === 'product' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Product *
                  </label>
                  <select
                    value={data.product_id}
                    onChange={(e) => setData('product_id', e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  >
                    <option value="">Select a product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                  {errors.product_id && <div className="text-red-500 text-sm mt-1">{errors.product_id}</div>}
                </div>
              )}

              {/* Category Selection */}
              {data.apply_to === 'category' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Category *
                  </label>
                  <select
                    value={data.category_id}
                    onChange={(e) => setData('category_id', e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && <div className="text-red-500 text-sm mt-1">{errors.category_id}</div>}
                </div>
              )}

              {/* Minimum Purchase */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Minimum Purchase Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g., 1000 (optional)"
                  className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={data.min_purchase_amount}
                  onChange={e => setData('min_purchase_amount', e.target.value)}
                />
                {errors.min_purchase_amount && <div className="text-red-500 text-sm mt-1">{errors.min_purchase_amount}</div>}
              </div>
            </div>

            {/* Usage Limits */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Usage Limits
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Total Usage Limit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Total Usage Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={data.usage_limit}
                    onChange={e => setData('usage_limit', e.target.value)}
                  />
                  {errors.usage_limit && <div className="text-red-500 text-sm mt-1">{errors.usage_limit}</div>}
                </div>

                {/* Per User Limit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Per User Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={data.per_user_limit}
                    onChange={e => setData('per_user_limit', e.target.value)}
                  />
                  {errors.per_user_limit && <div className="text-red-500 text-sm mt-1">{errors.per_user_limit}</div>}
                </div>
              </div>
            </div>

            {/* Validity Period */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Validity Period
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={data.start_date}
                    onChange={e => setData('start_date', e.target.value)}
                  />
                  {errors.start_date && <div className="text-red-500 text-sm mt-1">{errors.start_date}</div>}
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={data.end_date}
                    onChange={e => setData('end_date', e.target.value)}
                  />
                  {errors.end_date && <div className="text-red-500 text-sm mt-1">{errors.end_date}</div>}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end items-center gap-2 pt-4">
              <Link
                href="/admin/coupons"
                className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10"
                title="Cancel"
              >
                <ArrowLeft />
              </Link>

              <button
                type="submit"
                disabled={processing}
                className="inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white w-10 h-10 shadow"
                title={isEdit ? 'Update' : 'Create'}
              >
                <Check />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}