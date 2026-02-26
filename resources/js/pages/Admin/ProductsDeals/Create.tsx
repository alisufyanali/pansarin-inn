import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import Form from './Form';
import PageHeader from '@/components/PageHeader';

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
                <PageHeader
                    title="Create Product Deal"
                    backUrl="/admin/deals"
                />

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