import React from 'react';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, Tag, Percent, DollarSign, Settings, Calendar, TrendingUp, Save } from 'lucide-react';
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
    <div className="p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/coupons"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <h1 className="text-2xl font-bold">
          {isEdit ? 'Edit Coupon' : 'New Coupon'}
        </h1>
      </div>

      <form onSubmit={submit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-lg">Basic Information</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Coupon Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="SUMMER2024"
                    value={data.code}
                    onChange={e => setData('code', e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border rounded-lg uppercase font-mono"
                    required
                  />
                  {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    placeholder="Describe this coupon..."
                    value={data.description}
                    onChange={e => setData('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg resize-none"
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={data.is_active}
                    onChange={e => setData('is_active', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium">
                    Active
                  </label>
                </div>
              </div>
            </div>

            {/* Discount Configuration */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-lg">Discount Configuration</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Discount Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setData('discount_type', 'percentage')}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                        data.discount_type === 'percentage'
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Percent className="w-5 h-5" />
                      <span className="font-medium">Percentage</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setData('discount_type', 'fixed')}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                        data.discount_type === 'fixed'
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <DollarSign className="w-5 h-5" />
                      <span className="font-medium">Fixed</span>
                    </button>
                  </div>
                  {errors.discount_type && <p className="text-red-500 text-sm mt-1">{errors.discount_type}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Discount Value <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={data.discount_type === 'percentage' ? '10' : '500'}
                      value={data.discount_value}
                      onChange={e => setData('discount_value', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {data.discount_type === 'percentage' ? '%' : 'PKR'}
                    </div>
                  </div>
                  {errors.discount_value && <p className="text-red-500 text-sm mt-1">{errors.discount_value}</p>}
                </div>

                {data.discount_type === 'percentage' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Max Discount Amount
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="1000 (optional)"
                        value={data.max_discount_amount}
                        onChange={e => setData('max_discount_amount', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        PKR
                      </div>
                    </div>
                    {errors.max_discount_amount && <p className="text-red-500 text-sm mt-1">{errors.max_discount_amount}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Application Scope */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-lg">Application Scope</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Apply To <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setData('apply_to', 'order')}
                      className={`px-3 py-2.5 rounded-lg border-2 transition-all font-medium text-sm ${
                        data.apply_to === 'order'
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      Order
                    </button>
                    <button
                      type="button"
                      onClick={() => setData('apply_to', 'product')}
                      className={`px-3 py-2.5 rounded-lg border-2 transition-all font-medium text-sm ${
                        data.apply_to === 'product'
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      Product
                    </button>
                    <button
                      type="button"
                      onClick={() => setData('apply_to', 'category')}
                      className={`px-3 py-2.5 rounded-lg border-2 transition-all font-medium text-sm ${
                        data.apply_to === 'category'
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      Category
                    </button>
                  </div>
                  {errors.apply_to && <p className="text-red-500 text-sm mt-1">{errors.apply_to}</p>}
                </div>

                {data.apply_to === 'product' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Select Product <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={data.product_id}
                      onChange={(e) => setData('product_id', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    >
                      <option value="">Select a product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                    {errors.product_id && <p className="text-red-500 text-sm mt-1">{errors.product_id}</p>}
                  </div>
                )}

                {data.apply_to === 'category' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Select Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={data.category_id}
                      onChange={(e) => setData('category_id', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id}</p>}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Minimum Purchase Amount
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="1000 (optional)"
                      value={data.min_purchase_amount}
                      onChange={e => setData('min_purchase_amount', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      PKR
                    </div>
                  </div>
                  {errors.min_purchase_amount && <p className="text-red-500 text-sm mt-1">{errors.min_purchase_amount}</p>}
                </div>
              </div>
            </div>

            {/* Validity Period */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-lg">Validity Period</h3>
              </div>

              <div className="flex space-x-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={data.start_date}
                    onChange={e => setData('start_date', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={data.end_date}
                    onChange={e => setData('end_date', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
                </div>
              </div>

            </div>

            

            {/* Usage Limits */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-lg">Usage Limits</h3>
              </div>

              <div className="flex space-x-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Total Usage Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={data.usage_limit}
                    onChange={e => setData('usage_limit', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  {errors.usage_limit && <p className="text-red-500 text-sm mt-1">{errors.usage_limit}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Per User Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={data.per_user_limit}
                    onChange={e => setData('per_user_limit', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  {errors.per_user_limit && <p className="text-red-500 text-sm mt-1">{errors.per_user_limit}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Link
            href="/admin/coupons"
            className="flex-1 text-center border py-2.5 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Link>
          
          <button
            type="submit"
            disabled={processing}
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {processing ? 'Saving...' : (isEdit ? 'Update Coupon' : 'Create Coupon')}
          </button>
        </div>
      </form>
    </div>
  );
}