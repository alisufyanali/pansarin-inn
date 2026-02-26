import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Edit,
    Package,
    Percent,
    Tag,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react';
import InfoRow from '@/components/InfoRow';
import SectionCard from '@/components/SectionCard';
import PageHeader from '@/components/PageHeader';

interface Product {
    id: number;
    name: string;
    price: number;
    image?: string;
    custom_discount: number | null;
    stock_limit: number | null;
}

interface Deal {
    id: number;
    title: string;
    slug: string;
    description: string;
    image?: string;
    deal_type: string;
    discount_value: number;
    min_quantity: number;
    free_quantity: number;
    min_purchase_amount: number | null;
    max_uses: number | null;
    max_uses_per_user: number | null;
    current_uses: number;
    starts_at: string | null;
    ends_at: string | null;
    badge_text: string;
    badge_color: string;
    display_order: number;
    is_featured: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    products: Product[];
}

interface Props {
    deal: Deal;
}

export default function Show({ deal }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Product Deals', href: '/admin/deals' },
        { title: deal.title, href: `/admin/deals/${deal.id}` },
    ];

    const getDealTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            percentage: 'Percentage Discount',
            fixed: 'Fixed Amount Discount',
            buy_x_get_y: 'Buy X Get Y Free',
            bundle: 'Bundle Deal',
            flash_sale: 'Flash Sale',
        };
        return types[type] || type;
    };

    const getDealTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            percentage:
                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            fixed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            buy_x_get_y:
                'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            bundle: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
            flash_sale:
                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };

    const usagePercentage = deal.max_uses
        ? Math.min((deal.current_uses / deal.max_uses) * 100, 100)
        : 0;

    const actions = (
        <div className="flex gap-3">
            <Link
                href={`/admin/deals/${deal.id}/edit`}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-bold text-white transition hover:bg-blue-700"
            >
                <Edit size={20} />
                Edit Deal
            </Link>
            <Link
                href="/admin/deals"
                className="flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 font-bold transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
                <ArrowLeft size={20} />
                Back
            </Link>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={deal.title} />

            <div className="mx-auto max-w-6xl">
                <PageHeader
                    title={
                        <div className="flex items-center gap-3">
                            <span>{deal.title}</span>
                            {deal.is_featured && (
                                <span className="flex items-center gap-1 rounded-lg bg-yellow-100 px-3 py-1 text-sm font-bold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                    <Zap size={16} /> Featured
                                </span>
                            )}
                            <span
                                className={`rounded-lg px-3 py-1 text-sm font-bold ${deal.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}
                            >
                                {deal.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    }
                    backUrl="/admin/deals"
                    actions={actions}
                />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Basic Info Card */}
                        <SectionCard
                            title="Deal Information"
                            icon={Tag}
                        >
                            {deal.image && (
                                <img
                                    src={deal.image}
                                    alt={deal.title}
                                    className="mb-4 h-48 w-full rounded-xl object-cover"
                                />
                            )}

                            <div className="space-y-4">
                                <InfoRow
                                    label="Slug"
                                    value={deal.slug}
                                />

                                <div>
                                    <label className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                        Deal Type
                                    </label>
                                    <div className="mt-1">
                                        <span
                                            className={`inline-block rounded-lg px-3 py-1 text-sm font-bold ${getDealTypeColor(deal.deal_type)}`}
                                        >
                                            {getDealTypeLabel(deal.deal_type)}
                                        </span>
                                    </div>
                                </div>

                                {deal.description && (
                                    <div>
                                        <label className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                            Description
                                        </label>
                                        <p className="mt-1 text-gray-900 dark:text-gray-100">
                                            {deal.description}
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <label className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                        Badge
                                    </label>
                                    <div className="mt-1 flex items-center gap-3">
                                        <span
                                            className="inline-block rounded-lg px-3 py-1 text-sm font-bold text-white"
                                            style={{
                                                backgroundColor:
                                                    deal.badge_color,
                                            }}
                                        >
                                            {deal.badge_text}
                                        </span>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {deal.badge_color}
                                        </span>
                                    </div>
                                </div>

                                <InfoRow
                                    label="Display Order"
                                    value={deal.display_order.toString()}
                                />
                            </div>
                        </SectionCard>

                        {/* Discount Settings Card */}
                        <SectionCard
                            title="Discount Settings"
                            icon={Percent}
                        >
                            <div className="grid grid-cols-2 gap-4">
                                {(deal.deal_type === 'percentage' ||
                                    deal.deal_type === 'fixed') && (
                                    <div>
                                        <label className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                            Discount Value
                                        </label>
                                        <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                                            {deal.deal_type === 'percentage'
                                                ? `${deal.discount_value}%`
                                                : `Rs. ${deal.discount_value}`}
                                        </p>
                                    </div>
                                )}

                                {deal.deal_type === 'buy_x_get_y' && (
                                    <>
                                        <div>
                                            <label className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                                Buy Quantity
                                            </label>
                                            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                {deal.min_quantity}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                                Get Free
                                            </label>
                                            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                {deal.free_quantity}
                                            </p>
                                        </div>
                                    </>
                                )}

                                {deal.min_purchase_amount && (
                                    <div>
                                        <label className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                            Min Purchase
                                        </label>
                                        <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">
                                            Rs. {deal.min_purchase_amount}
                                        </p>
                                    </div>
                                )}

                                {deal.max_uses && (
                                    <div>
                                        <label className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                            Max Total Uses
                                        </label>
                                        <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">
                                            {deal.max_uses}
                                        </p>
                                    </div>
                                )}

                                {deal.max_uses_per_user && (
                                    <div>
                                        <label className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                            Max Uses Per User
                                        </label>
                                        <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">
                                            {deal.max_uses_per_user}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </SectionCard>

                        {/* Products Card */}
                        <SectionCard
                            title={`Products (${deal.products.length})`}
                            icon={Package}
                        >
                            <div className="space-y-3">
                                {deal.products.map((product) => (
                                    <div
                                        key={product.id}
                                        className="flex items-center gap-4 rounded-xl border border-gray-200 p-4 dark:border-gray-700"
                                    >
                                        {product.image && (
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="h-16 w-16 rounded-lg object-cover"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 dark:text-gray-100">
                                                {product.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Base Price: Rs. {product.price}
                                            </p>
                                        </div>

                                        <div className="flex gap-6 text-sm">
                                            {product.custom_discount && (
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400">
                                                        Custom Discount
                                                    </label>
                                                    <p className="mt-1 font-bold text-green-600 dark:text-green-400">
                                                        {
                                                            product.custom_discount
                                                        }
                                                        %
                                                    </p>
                                                </div>
                                            )}
                                            {product.stock_limit && (
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400">
                                                        Stock Limit
                                                    </label>
                                                    <p className="mt-1 font-bold text-gray-900 dark:text-gray-100">
                                                        {product.stock_limit}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Stats Card */}
                        <SectionCard
                            title="Statistics"
                            icon={TrendingUp}
                        >
                            <div className="space-y-4">
                                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                        <Users size={20} />
                                        <span className="text-sm font-bold">
                                            Total Uses
                                        </span>
                                    </div>
                                    <p className="mt-2 text-2xl font-bold text-blue-700 dark:text-blue-300">
                                        {deal.current_uses}
                                        {deal.max_uses && ` / ${deal.max_uses}`}
                                    </p>
                                    {deal.max_uses && (
                                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-200 dark:bg-blue-900">
                                            <div
                                                className="h-full bg-blue-600 transition-all"
                                                style={{
                                                    width: `${usagePercentage}%`,
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </SectionCard>

                        {/* Timing Card */}
                        <SectionCard
                            title="Duration"
                            icon={Calendar}
                        >
                            <div className="space-y-4">
                                {deal.starts_at ? (
                                    <div>
                                        <label className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                            Start Date
                                        </label>
                                        <p className="mt-1 text-gray-900 dark:text-gray-100">
                                            {new Date(
                                                deal.starts_at,
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400">
                                        No start date set
                                    </p>
                                )}

                                {deal.ends_at ? (
                                    <div>
                                        <label className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                            End Date
                                        </label>
                                        <p className="mt-1 text-gray-900 dark:text-gray-100">
                                            {new Date(
                                                deal.ends_at,
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400">
                                        No end date set
                                    </p>
                                )}

                                <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                                    <label className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                        Created
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                        {new Date(
                                            deal.created_at,
                                        ).toLocaleString()}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                        Last Updated
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                        {new Date(
                                            deal.updated_at,
                                        ).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </SectionCard>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
