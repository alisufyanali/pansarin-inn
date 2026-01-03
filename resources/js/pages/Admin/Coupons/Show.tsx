// Show.tsx
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit2, Ticket, Percent, DollarSign, Calendar, Users, ShoppingCart } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Coupons', href: '/admin/coupons' },
    { title: 'Details', href: '#' },
];

interface Coupon {
    id: number;
    code: string;
    description: string | null;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    apply_to: 'order' | 'product' | 'category';
    product_id: number | null;
    category_id: number | null;
    min_purchase_amount: number | null;
    max_discount_amount: number | null;
    usage_limit: number | null;
    usage_count: number;
    per_user_limit: number | null;
    start_date: string | null;
    end_date: string | null;
    is_active: boolean;
    product?: {
        id: number;
        name: string;
    };
    category?: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
}

export default function Show({ coupon }: { coupon: Coupon }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Coupon: ${coupon.code}`} />

            <div className="p-3">
                <div className="flex items-center justify-between mb-4">
                    <Link
                        href="/admin/coupons"
                        className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10"
                        title="Back"
                    >
                        <ArrowLeft />
                    </Link>

                    <Link
                        href={`/admin/coupons/${coupon.id}/edit`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit
                    </Link>
                </div>

                <div className="max-w-4xl mx-auto">
                    {/* Header Card */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-2xl p-8 text-white mb-6 shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                <Ticket className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">{coupon.code}</h1>
                                {coupon.description && (
                                    <p className="text-blue-100 mt-2">{coupon.description}</p>
                                )}
                                <div className="flex items-center gap-4 mt-3">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                        coupon.is_active
                                            ? 'bg-green-500/20 text-green-100'
                                            : 'bg-red-500/20 text-red-100'
                                    }`}>
                                        {coupon.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Discount Details */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                {coupon.discount_type === 'percentage' ? <Percent className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                                Discount Details
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Discount Type</label>
                                    <p className="text-gray-900 dark:text-white font-medium capitalize">{coupon.discount_type}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Discount Value</label>
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `PKR ${coupon.discount_value}`}
                                    </p>
                                </div>

                                {coupon.max_discount_amount && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Maximum Discount</label>
                                        <p className="text-gray-900 dark:text-white font-medium">PKR {coupon.max_discount_amount}</p>
                                    </div>
                                )}

                                {coupon.min_purchase_amount && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Minimum Purchase</label>
                                        <p className="text-gray-900 dark:text-white font-medium">PKR {coupon.min_purchase_amount}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Application Scope */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5" />
                                Application Scope
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Apply To</label>
                                    <p className="text-gray-900 dark:text-white font-medium capitalize">{coupon.apply_to}</p>
                                </div>

                                {coupon.apply_to === 'product' && coupon.product && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Product</label>
                                        <p className="text-gray-900 dark:text-white font-medium">{coupon.product.name}</p>
                                    </div>
                                )}

                                {coupon.apply_to === 'category' && coupon.category && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</label>
                                        <p className="text-gray-900 dark:text-white font-medium">{coupon.category.name}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Usage Statistics */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Usage Statistics
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Times Used</label>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {coupon.usage_count} {coupon.usage_limit ? `/ ${coupon.usage_limit}` : ''}
                                    </p>
                                    {coupon.usage_limit && (
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                                            <div 
                                                className="bg-blue-500 h-2 rounded-full" 
                                                style={{ width: `${Math.min((coupon.usage_count / coupon.usage_limit) * 100, 100)}%` }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {coupon.per_user_limit && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Per User Limit</label>
                                        <p className="text-gray-900 dark:text-white font-medium">{coupon.per_user_limit} times</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Validity Period */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                Validity Period
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</label>
                                    <p className="text-gray-900 dark:text-white font-medium">
                                        {coupon.start_date ? new Date(coupon.start_date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }) : 'No start date'}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">End Date</label>
                                    <p className="text-gray-900 dark:text-white font-medium">
                                        {coupon.end_date ? new Date(coupon.end_date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }) : 'No expiry'}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</label>
                                    <p className="text-gray-900 dark:text-white">
                                        {new Date(coupon.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}