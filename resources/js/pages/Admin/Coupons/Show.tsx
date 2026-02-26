import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Edit2, Ticket, Percent, DollarSign, Calendar, Users, ShoppingCart } from 'lucide-react';
import InfoRow from '@/components/InfoRow';
import SectionCard from '@/components/SectionCard';
import PageHeader, { ActionButton } from '@/components/PageHeader';
import StatusCard from '@/components/StatusCard';
import StatsCard from '@/components/StatsCard';
import TimelineCard from '@/components/TimelineCard';

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

interface Props {
    coupon: Coupon;
}

export default function Show({ coupon }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Coupons', href: '/admin/coupons' },
        { title: coupon.code, href: '#' },
    ];

    const stats = [
        { label: 'Discount Type', value: coupon.discount_type === 'percentage' ? 'Percentage' : 'Fixed Amount' },
        { label: 'Apply To', value: coupon.apply_to.charAt(0).toUpperCase() + coupon.apply_to.slice(1) },
        { label: 'Usage', value: `${coupon.usage_count}${coupon.usage_limit ? ` / ${coupon.usage_limit}` : ''}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Coupon: ${coupon.code}`} />

            <div className="p-3">
                <PageHeader
                    title={
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                                <Ticket className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">{coupon.code}</span>
                                {coupon.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{coupon.description}</p>
                                )}
                            </div>
                        </div>
                    }
                    backUrl="/admin/coupons"
                    actions={<ActionButton href={`/admin/coupons/${coupon.id}/edit`} icon={Edit2} label="Edit Coupon" />}
                />

                <div className="mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                            <SectionCard title="Discount Details" icon={coupon.discount_type === 'percentage' ? Percent : DollarSign}>
                                <div className="space-y-4">
                                    <InfoRow label="Discount Type" value={coupon.discount_type === 'percentage' ? 'Percentage' : 'Fixed Amount'} />
                                    <div>
                                        <InfoRow label="Discount Value" value="" />
                                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                                            {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `PKR ${coupon.discount_value}`}
                                        </p>
                                    </div>
                                    {coupon.max_discount_amount && (
                                        <InfoRow label="Maximum Discount" value={`PKR ${coupon.max_discount_amount}`} />
                                    )}
                                    {coupon.min_purchase_amount && (
                                        <InfoRow label="Minimum Purchase" value={`PKR ${coupon.min_purchase_amount}`} />
                                    )}
                                </div>
                            </SectionCard>

                            <SectionCard title="Application Scope" icon={ShoppingCart}>
                                <div className="space-y-4">
                                    <InfoRow label="Apply To" value={coupon.apply_to.charAt(0).toUpperCase() + coupon.apply_to.slice(1)} />
                                    {coupon.apply_to === 'product' && coupon.product && (
                                        <InfoRow label="Product" value={coupon.product.name} />
                                    )}
                                    {coupon.apply_to === 'category' && coupon.category && (
                                        <InfoRow label="Category" value={coupon.category.name} />
                                    )}
                                </div>
                            </SectionCard>

                            <SectionCard title="Usage Statistics" icon={Users}>
                                <div className="space-y-4">
                                    <div>
                                        <InfoRow label="Times Used" value="" />
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                                            {coupon.usage_count}{coupon.usage_limit ? ` / ${coupon.usage_limit}` : ''}
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
                                        <InfoRow label="Per User Limit" value={`${coupon.per_user_limit} times`} />
                                    )}
                                </div>
                            </SectionCard>
                        </div>

                        <div className="space-y-6">
                            <StatusCard isActive={coupon.is_active} />

                            <StatsCard stats={stats} />

                            <SectionCard title="Validity Period" icon={Calendar}>
                                <div className="space-y-4">
                                    <InfoRow 
                                        label="Start Date" 
                                        value={coupon.start_date ? new Date(coupon.start_date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }) : 'No start date'} 
                                    />
                                    <InfoRow 
                                        label="End Date" 
                                        value={coupon.end_date ? new Date(coupon.end_date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }) : 'No expiry'} 
                                    />
                                </div>
                            </SectionCard>

                            <TimelineCard
                                createdAt={coupon.created_at}
                                updatedAt={coupon.updated_at}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
