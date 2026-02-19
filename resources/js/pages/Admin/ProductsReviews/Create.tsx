import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import Form from './Form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Product Reviews', href: '/admin/reviews' },
    { title: 'Create Review', href: '/admin/reviews/create' },
];

interface Product {
    id: number;
    name: string;
    image?: string;
}

interface Props {
    products: Product[];
    flash?: {
        
        success?: string;
        error?: string;
    };
}

export default function Create({ products, flash }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        product_id: '',
        customer_name: '',
        customer_email: '',
        order_number: '',
        rating: 5,
        comment: '',
        status: false,
    });

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/reviews');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Review" />

            <div className="mx-auto max-w-5xl">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold dark:text-white">
                            Create Review
                        </h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            Add a new customer review
                        </p>
                    </div>
                    <Link
                        href="/admin/reviews"
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
                    submitLabel="Create Review"
                />
            </div>
        </AppLayout>
    );
}
