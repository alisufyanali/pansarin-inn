import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import Form, { type ReviewFormData } from './Form';

interface Product { id: number; name: string; image?: string | null; }
interface User    { id: number; name: string; email: string; }

interface Review {
    id:         number;
    product_id: number;
    user_id:    number;
    rating:     number;
    review:     string | null;
    product:    Product;
    user:       User;
}

interface Props {
    review:   Review;
    products: Product[];
    users:    User[];
    flash?:   { success?: string; error?: string };
}

export default function Edit({ review, products, users, flash }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Product Reviews', href: '/admin/reviews' },
        { title: 'Edit Review', href: `/admin/reviews/${review.id}/edit` },
    ];

    const { data, setData, post, processing, errors } = useForm<ReviewFormData>({
        product_id: review.product_id.toString(),
        user_id:    review.user_id.toString(),
        rating:     review.rating,
        review:     review.review ?? '',
        _method:    'PUT',
    });

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error)   toast.error(flash.error);
    }, [flash]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/reviews/${review.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Review" />
            <div className="mx-auto max-w-5xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold dark:text-white">Edit Review</h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            {review.user?.name} — {review.product?.name}
                        </p>
                    </div>
                    <Link href="/admin/reviews"
                        className="flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 font-bold transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                        <ArrowLeft size={20} /> Back
                    </Link>
                </div>
                <Form data={data} setData={setData} errors={errors} processing={processing}
                    onSubmit={handleSubmit} products={products} users={users} submitLabel="Update Review" />
            </div>
        </AppLayout>
    );
}
