import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Star, ShieldCheck, Save, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Product Reviews', href: '/admin/reviews' },
    { title: 'Edit Review', href: '#' },
];

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
}

export default function Edit({ review, products }: Props) {
    const [hoveredRating, setHoveredRating] = useState(0);
    const [selectedProduct, setSelectedProduct] = useState<Product>(review.product);

    const { data, setData, patch, processing, errors } = useForm({
        product_id: review.product_id.toString(),
        customer_name: review.customer_name,
        customer_email: review.customer_email || '',
        order_number: review.order_number || '',
        rating: review.rating,
        comment: review.comment,
        status: review.status,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/admin/reviews/${review.id}`);
    };

    const handleProductChange = (productId: string) => {
        setData('product_id', productId);
        const product = products.find(p => p.id === parseInt(productId));
        setSelectedProduct(product || review.product);
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
            5: 'Excellent'
        };
        return labels[rating as keyof typeof labels];
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Review - ${review.customer_name}`} />

            <div className="mx-auto max-w-3xl">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold dark:text-white">Edit Review</h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            Update review details
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

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        {/* Product Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                            <div className="flex items-center gap-4">
                                {selectedProduct?.image && (
                                    <img 
                                        src={selectedProduct.image} 
                                        alt={selectedProduct.name} 
                                        className="h-16 w-16 rounded-lg object-cover" 
                                    />
                                )}
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
                                    <div className="flex items-center gap-2">
                                        <p className="text-blue-100">Customer Review</p>
                                        {review.is_verified && (
                                            <div className="flex items-center gap-1 rounded-md bg-white/20 px-2 py-0.5 text-xs font-semibold">
                                                <CheckCircle size={12} /> Verified
                                            </div>
                                        )}
                                    </div>
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
                                    onChange={(e) => handleProductChange(e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                >
                                    <option value="">Select a product</option>
                                    {products.map((product) => (
                                        <option key={product.id} value={product.id}>
                                            {product.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.product_id && (
                                    <p className="mt-1 text-xs text-red-500">{errors.product_id}</p>
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
                                    onChange={(e) => setData('customer_name', e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    placeholder="John Doe"
                                />
                                {errors.customer_name && (
                                    <p className="mt-1 text-xs text-red-500">{errors.customer_name}</p>
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
                                    onChange={(e) => setData('customer_email', e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    placeholder="john@example.com"
                                />
                                {errors.customer_email && (
                                    <p className="mt-1 text-xs text-red-500">{errors.customer_email}</p>
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
                                    onChange={(e) => setData('order_number', e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    placeholder="e.g., ORD-12345"
                                />
                                <div className="mt-2 flex items-start gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                                    <ShieldCheck className="mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400" size={16} />
                                    <p className="text-xs text-blue-700 dark:text-blue-300">
                                        Changing order number will re-verify purchase status
                                    </p>
                                </div>
                                {errors.order_number && (
                                    <p className="mt-1 text-xs text-red-500">{errors.order_number}</p>
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
                                    <p className="mt-1 text-xs text-red-500">{errors.rating}</p>
                                )}
                            </div>

                            {/* Comment */}
                            <div>
                                <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Review Comment *
                                </label>
                                <textarea
                                    value={data.comment}
                                    onChange={(e) => setData('comment', e.target.value)}
                                    rows={6}
                                    className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    placeholder="Share your experience with this product... (minimum 10 characters)"
                                />
                                <div className="mt-2 flex items-center justify-between">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {data.comment.length} / 1000 characters
                                    </p>
                                    {errors.comment && (
                                        <p className="text-xs text-red-500">{errors.comment}</p>
                                    )}
                                </div>
                            </div>

                            {/* Status Toggle */}
                            <div>
                                <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Review Status
                                </label>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setData('status', !data.status)}
                                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                                            data.status ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-700'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                                                data.status ? 'translate-x-7' : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {data.status ? 'Approved' : 'Pending'}
                                    </span>
                                </div>
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    Only approved reviews are visible on the website
                                </p>
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 font-bold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Save size={20} />
                                    {processing ? 'Updating...' : 'Update Review'}
                                </button>
                                
                                <Link
                                    href="/admin/reviews"
                                    className="rounded-xl border border-gray-300 px-6 py-4 font-bold transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}