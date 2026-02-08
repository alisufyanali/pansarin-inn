import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Form from './Form';

interface Product {
    id: number;
    name: string;
    price: number;
    image?: string;
}

interface DealType {
    value: string;
    label: string;
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
    starts_at: string | null;
    ends_at: string | null;
    badge_text: string;
    badge_color: string;
    display_order: number;
    is_featured: boolean;
    is_active: boolean;
    products: Array<{
        id: number;
        custom_discount: number | null;
        stock_limit: number | null;
    }>;
}

interface Props {
    deal: Deal;
    products: Product[];
    dealTypes: DealType[];
}

interface SelectedProduct {
    id: number;
    custom_discount: number | null;
    stock_limit: number | null;
}

export default function Edit({ deal, products, dealTypes }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Product Deals', href: '/admin/deals' },
        { title: 'Edit Deal', href: `/admin/deals/${deal.id}/edit` },
    ];

    const { data, setData, post, processing, errors } = useForm({
        title: deal.title,
        slug: deal.slug,
        description: deal.description,
        image: null as File | null,
        deal_type: deal.deal_type,
        discount_value: deal.discount_value.toString(),
        min_quantity: deal.min_quantity,
        free_quantity: deal.free_quantity,
        min_purchase_amount: deal.min_purchase_amount?.toString() || '',
        max_uses: deal.max_uses?.toString() || '',
        max_uses_per_user: deal.max_uses_per_user?.toString() || '',
        starts_at: deal.starts_at || '',
        ends_at: deal.ends_at || '',
        badge_text: deal.badge_text,
        badge_color: deal.badge_color,
        display_order: deal.display_order,
        is_featured: deal.is_featured,
        is_active: deal.is_active,
        products: deal.products as SelectedProduct[],
        _method: 'PUT',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/deals/${deal.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${deal.title}`} />

            <div className="mx-auto max-w-5xl">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold dark:text-white">
                            Edit Product Deal
                        </h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            Update deal: {deal.title}
                        </p>
                    </div>
                    <Link
                        href="/admin/deals"
                        className="flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 font-bold transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                    >
                        <ArrowLeft size={20} />
                        Back
                    </Link>
                </div>

                {/* Form Component */}
                <Form
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    onSubmit={handleSubmit}
                    products={products}
                    dealTypes={dealTypes}
                    submitLabel="Update Deal"
                    initialImage={deal.image}
                />
            </div>
        </AppLayout>
    );
}