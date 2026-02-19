import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import Form from './Form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Product Deals', href: '/admin/deals' },
    { title: 'Create Deal', href: '/admin/deals/create' },
];

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

interface Props {
    products: Product[];
    dealTypes: DealType[];
    flash?: {
        success?: string;
        error?: string;
    };
}

interface SelectedProduct {
    id: number;
    custom_discount: number | null;
    stock_limit: number | null;
}

export default function Create({ products, dealTypes, flash }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        slug: '',
        description: '',
        image: null as File | null,
        deal_type: 'percentage',
        discount_value: '',
        min_quantity: 1,
        free_quantity: 0,
        min_purchase_amount: '',
        max_uses: '',
        max_uses_per_user: '',
        starts_at: '',
        ends_at: '',
        badge_text: '',
        badge_color: '#ff0000',
        display_order: 0,
        is_featured: false,
        is_active: true,
        products: [] as SelectedProduct[],
    });

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/deals', {
            forceFormData: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Deal" />

            <div className="mx-auto max-w-5xl">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold dark:text-white">
                            Create Product Deal
                        </h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            Set up a new discount or special offer
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
                    submitLabel="Create Deal"
                />
            </div>
        </AppLayout>
    );
}