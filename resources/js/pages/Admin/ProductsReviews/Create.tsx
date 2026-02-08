import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, ShieldCheck, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

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
}

export default function Create({ products }: Props) {
    const [hoveredRating, setHoveredRating] = useState(0);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(
        null,
    );

    // Debug - console mein check karo products aa rahe hain ya nahi
    useEffect(() => {
        console.log('Products received:', products);
    }, [products]);

    const { data, setData, post, processing, errors } = useForm({
        product_id: '',
        customer_name: '',
        customer_email: '',
        order_number: '',
        rating: 5,
        comment: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/reviews');
    };

    const handleProductChange = (productId: string) => {
        setData('product_id', productId);
        const product = products.find((p) => p.id === parseInt(productId));
        setSelectedProduct(product || null);
    };

    const renderStars = () => {
        return (
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setData('rating', star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="transition-transform hover:scale-110 focus:outline-none"
                    >
                        <Star
                            size={32}
                            className={
                                star <= (hoveredRating || data.rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300 dark:text-gray-600'
                            }
                        />
                    </button>
                ))}
            </div>
        );
    };

    const getRatingLabel = (rating: number) => {
        const labels = {
            1: 'Poor',
            2: 'Fair',
            3: 'Good',
            4: 'Very Good',
            5: 'Excellent',
        };
        return labels[rating as keyof typeof labels];
    };

    const getImageUrl = (image?: string) => {
        if (!image) return null;
        // Agar full URL hai
        if (image.startsWith('http')) return image;
        // Agar storage path hai
        if (image.startsWith('storage/')) return `/${image}`;
        // Default
        return `/storage/${image}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Review" />

            <div className="mx-auto max-w-3xl">
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

                {/* Debug Info - Remove in production */}
                {(!products || products.length === 0) && (
                    <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            ⚠️ No products found. Make sure products exist with
                            is_active = true
                        </p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        {/* Product Selection Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                            <div className="flex items-center gap-4">
                                {selectedProduct?.image && (
                                    <img
                                        src={getImageUrl(selectedProduct.image)}
                                        alt={selectedProduct.name}
                                        onError={(e) => {
                                            // Fallback if image fails to load
                                            e.currentTarget.style.display =
                                                'none';
                                        }}
                                        className="h-16 w-16 rounded-lg bg-white/10 object-cover"
                                    />
                                )}
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold">
                                        {selectedProduct
                                            ? selectedProduct.name
                                            : 'Select a Product'}
                                    </h2>
                                    <p className="text-blue-100">
                                        Customer Review Form
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 p-8">
                            {/* Product Selection */}
                            <div>
                                <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Product *
                                </label>
                                <select
                                    value={data.product_id}
                                    onChange={(e) =>
                                        handleProductChange(e.target.value)
                                    }
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                >
                                    <option value="">
                                        {products && products.length > 0
                                            ? 'Select a product'
                                            : 'No products available'}
                                    </option>
                                    {products &&
                                        products.map((product) => (
                                            <option
                                                key={product.id}
                                                value={product.id}
                                            >
                                                {product.name}
                                            </option>
                                        ))}
                                </select>
                                {errors.product_id && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.product_id}
                                    </p>
                                )}
                            </div>

                            {/* Customer Name */}
                            <div>
                                <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Customer Name *
                                </label>
                                <input
                                    type="text"
                                    value={data.customer_name}
                                    onChange={(e) =>
                                        setData('customer_name', e.target.value)
                                    }
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    placeholder="John Doe"
                                />
                                {errors.customer_name && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.customer_name}
                                    </p>
                                )}
                            </div>

                            {/* Customer Email */}
                            <div>
                                <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Email (Optional)
                                </label>
                                <input
                                    type="email"
                                    value={data.customer_email}
                                    onChange={(e) =>
                                        setData(
                                            'customer_email',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    placeholder="john@example.com"
                                />
                                {errors.customer_email && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.customer_email}
                                    </p>
                                )}
                            </div>

                            {/* Order Number */}
                            <div>
                                <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Order Number (Optional - For Verified Badge)
                                </label>
                                <input
                                    type="text"
                                    value={data.order_number}
                                    onChange={(e) =>
                                        setData('order_number', e.target.value)
                                    }
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    placeholder="e.g., ORD-12345"
                                />
                                <div className="mt-2 flex items-start gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                                    <ShieldCheck
                                        className="mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400"
                                        size={16}
                                    />
                                    <p className="text-xs text-blue-700 dark:text-blue-300">
                                        If order number matches a purchase of
                                        this product, review will be marked as
                                        "Verified Purchase"
                                    </p>
                                </div>
                                {errors.order_number && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.order_number}
                                    </p>
                                )}
                            </div>

                            {/* Rating */}
                            <div>
                                <label className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Rating *
                                </label>
                                {renderStars()}
                                <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                    {getRatingLabel(data.rating)}
                                </p>
                                {errors.rating && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.rating}
                                    </p>
                                )}
                            </div>

                            {/* Comment */}
                            <div>
                                <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Review Comment *
                                </label>
                                <textarea
                                    value={data.comment}
                                    onChange={(e) =>
                                        setData('comment', e.target.value)
                                    }
                                    rows={6}
                                    className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    placeholder="Share your experience with this product... (minimum 10 characters)"
                                />
                                <div className="mt-2 flex items-center justify-between">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {data.comment.length} / 1000 characters
                                    </p>
                                    {errors.comment && (
                                        <p className="text-xs text-red-500">
                                            {errors.comment}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 font-bold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Save size={20} />
                                    {processing
                                        ? 'Creating...'
                                        : 'Create Review'}
                                </button>

                                <Link
                                    href="/admin/reviews"
                                    className="rounded-xl border border-gray-300 px-6 py-4 font-bold transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                                >
                                    Cancel
                                </Link>
                            </div>

                            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                                Review will be set to "Pending" status by
                                default
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
