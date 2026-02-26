import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import { Tag, Percent, DollarSign, Settings, Calendar, TrendingUp, Save } from 'lucide-react';
import FieldError from '@/components/FieldError';
import PageHeader from '@/components/PageHeader';
import { inputClass, cardClass, labelClass, buttonPrimaryClass, buttonSecondaryClass } from '@/utils/formStyles';

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

export default function Form({ 
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
      <PageHeader
        title={isEdit ? 'Edit Coupon' : 'New Coupon'}
        backUrl="/admin/coupons"
      />

      <form onSubmit={submit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className={cardClass}>
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-lg">Basic Information</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>
                    Coupon Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="SUMMER2024"
                    value={data.code}
                    onChange={e => setData('code', e.target.value.toUpperCase())}
                    className={inputClass(errors.code) + ' uppercase font-mono'}
                    required
                  />
                  <FieldError message={errors.code} />
                </div>

                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    placeholder="Describe this coupon..."
                    value={data.description}
                    onChange={e => setData('description', e.target.value)}
                    rows={3}
                    className={inputClass(errors.description) + ' resize-none'}
                  />
                  <FieldError message={errors.description} />
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
            <div className={cardClass}>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-lg">Discount Configuration</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>
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
                  <FieldError message={errors.discount_type} />
                </div>

                <div>
                  <label className={labelClass}>
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
                      className={inputClass(errors.discount_value)}
                      required
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {data.discount_type === 'percentage' ? '%' : 'PKR'}
                    </div>
                  </div>
                  <FieldError message={errors.discount_value} />
                </div>

                {data.discount_type === 'percentage' && (
                  <div>
                    <label className={labelClass}>
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
                        className={inputClass(errors.max_discount_amount)}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        PKR
                      </div>
                    </div>
                    <FieldError message={errors.max_discount_amount} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Application Scope */}
            <div className={cardClass}>
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-lg">Application Scope</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>
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
                  <FieldError message={errors.apply_to} />
                </div>

                {data.apply_to === 'product' && (
                  <div>
                    <label className={labelClass}>
                      Select Product <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={data.product_id}
                      onChange={(e) => setData('product_id', e.target.value)}
                      className={inputClass(errors.product_id)}
                      required
                    >
                      <option value="">Select a product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                    <FieldError message={errors.product_id} />
                  </div>
                )}

                {data.apply_to === 'category' && (
                  <div>
                    <label className={labelClass}>
                      Select Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={data.category_id}
                      onChange={(e) => setData('category_id', e.target.value)}
                      className={inputClass(errors.category_id)}
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <FieldError message={errors.category_id} />
                  </div>
                )}

                <div>
                  <label className={labelClass}>
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
                      className={inputClass(errors.min_purchase_amount)}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      PKR
                    </div>
                  </div>
                  <FieldError message={errors.min_purchase_amount} />
                </div>
              </div>
            </div>

            {/* Validity Period */}
            <div className={cardClass}>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-lg">Validity Period</h3>
              </div>

              <div className="flex space-x-4">
                <div>
                  <label className={labelClass}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={data.start_date}
                    onChange={e => setData('start_date', e.target.value)}
                    className={inputClass(errors.start_date)}
                  />
                  <FieldError message={errors.start_date} />
                </div>

                <div>
                  <label className={labelClass}>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={data.end_date}
                    onChange={e => setData('end_date', e.target.value)}
                    className={inputClass(errors.end_date)}
                  />
                  <FieldError message={errors.end_date} />
                </div>
              </div>

            </div>

            

            {/* Usage Limits */}
            <div className={cardClass}>
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-lg">Usage Limits</h3>
              </div>

              <div className="flex space-x-4">
                <div>
                  <label className={labelClass}>
                    Total Usage Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={data.usage_limit}
                    onChange={e => setData('usage_limit', e.target.value)}
                    className={inputClass(errors.usage_limit)}
                  />
                  <FieldError message={errors.usage_limit} />
                </div>

                <div>
                  <label className={labelClass}>
                    Per User Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={data.per_user_limit}
                    onChange={e => setData('per_user_limit', e.target.value)}
                    className={inputClass(errors.per_user_limit)}
                  />
                  <FieldError message={errors.per_user_limit} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={cardClass + ' mt-6'}>
          <div className="space-y-3">
            <button type="submit" disabled={processing} className={buttonPrimaryClass}>
              <Save className="w-4 h-4" />
              {processing ? 'Saving...' : (isEdit ? 'Update Coupon' : 'Create Coupon')}
            </button>
            <Link href="/admin/coupons" className={buttonSecondaryClass}>
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}