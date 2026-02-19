import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import Form from './Form';

interface Product {
    id: number;
    name: string;
    image?: string;
}

interface Review {
    id: number;
    product_id: number;
    customer_name: string;
    customer_email: string;
    order_number: string;
    rating: number;
    comment: string;
    is_verified: boolean;
    status: boolean;
    product: Product;
}

interface Props {
    review: Review;
    products: Product[];
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Edit({ review, products, flash }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Product Reviews', href: '/admin/reviews' },
        { title: 'Edit Review', href: `/admin/reviews/${review.id}/edit` },
    ];

    const { data, setData, post, processing, errors } = useForm({
        product_id: review.product_id.toString(),
        customer_name: review.customer_name,
        customer_email: review.customer_email || '',
        order_number: review.order_number || '',
        rating: review.rating,
        comment: review.comment,
        status: review.status,
        _method: 'PUT',
    });

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/reviews/${review.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Review - ${review.customer_name}`} />

            <div className="mx-auto max-w-5xl">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold dark:text-white">
                            Edit Review
                        </h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            Update review: {review.customer_name}
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
                    submitLabel="Update Review"
                    initialProduct={review.product}
                    isVerified={review.is_verified}
                />
            </div>
        </AppLayout>
    );
}