import { Search, Star, X } from 'lucide-react';
import { useState } from 'react';

interface Product {
    id: number;
    name: string;
    image?: string;
}

interface FormData {
    product_id: string;
    customer_name: string;
    customer_email: string;
    order_number: string;
    rating: number;
    comment: string;
    status?: boolean;
}

interface FormProps {
    data: FormData;
    setData: (key: keyof FormData | string, value: any) => void;
    errors: Partial<Record<string, string>>;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    products: Product[];
    submitLabel: string;
    initialProduct?: Product;
    isVerified?: boolean;
}

// Reusable error message component
function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="text-red-500 dark:text-red-400 text-sm mt-1">{message}</p>;
}

export default function Form({
    data,
    setData,
    errors,
    processing,
    onSubmit,
    products,
    submitLabel,
    initialProduct,
    isVerified = false,
}: FormProps) {
    const [hoveredRating, setHoveredRating] = useState(0);
    const [showProductSelector, setShowProductSelector] = useState(false);
    const [productSearch, setProductSearch] = useState('');

    const selectedProduct = products.find((p) => p.id === parseInt(data.product_id)) || initialProduct;

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(productSearch.toLowerCase())
    );

    const selectProduct = (product: Product) => {
        setData('product_id', product.id.toString());
        setShowProductSelector(false);
        setProductSearch('');
    };

    const renderStars = () => {
        return (
            <div className="flex gap-1">
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
                            size={28}
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
        const labels: Record<number, string> = {
            1: 'Poor',
            2: 'Fair',
            3: 'Good',
            4: 'Very Good',
            5: 'Excellent',
        };
        return labels[rating] || '';
    };

    const inputClass = (hasError?: string) =>
        `w-full px-3 py-2 border rounded-lg bg-white text-gray-900 placeholder-gray-400
        dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400
        focus:outline-none focus:ring-2 transition-colors
        ${hasError
            ? 'border-red-400 dark:border-red-500 focus:ring-red-400'
            : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400'
        }`;

    const cardClass =
        'bg-white rounded-lg border border-gray-200 p-5 dark:bg-gray-800 dark:border-gray-700';
    const labelClass = 'block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300';

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {/* Global error banner */}
            {errors.error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400">
                    {errors.error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Product Selection Card */}
                    <div className={cardClass}>
                        <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-gray-100">
                            Product
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className={labelClass}>Select Product *</label>
                                {selectedProduct ? (
                                    <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                                        {selectedProduct.image && (
                                            <img
                                                src={selectedProduct.image}
                                                alt={selectedProduct.name}
                                                className="h-12 w-12 rounded-lg object-cover"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                {selectedProduct.name}
                                            </p>
                                            {isVerified && (
                                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                                    ✓ Verified Purchase
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowProductSelector(true)}
                                            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                        >
                                            Change
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setShowProductSelector(true)}
                                        className="w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition hover:border-blue-500 dark:border-gray-600"
                                    >
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Click to select a product
                                        </p>
                                    </button>
                                )}
                                <FieldError message={errors.product_id} />
                            </div>
                        </div>
                    </div>

                    {/* Review Content Card */}
                    <div className={cardClass}>
                        <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-gray-100">
                            Review Content
                        </h3>
                        <div className="space-y-4">
                            {/* Rating */}
                            <div>
                                <label className={labelClass}>Rating *</label>
                                {renderStars()}
                                <p className="mt-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                                    {getRatingLabel(data.rating)}
                                </p>
                                <FieldError message={errors.rating} />
                            </div>

                            {/* Comment */}
                            <div>
                                <label className={labelClass}>Review Comment *</label>
                                <textarea
                                    value={data.comment || ''}
                                    onChange={(e) => setData('comment', e.target.value)}
                                    rows={5}
                                    className={inputClass(errors.comment)}
                                    placeholder="Share your experience with this product..."
                                />
                                <div className="mt-1 flex items-center justify-between">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {data.comment?.length || 0} / 1000 characters
                                    </p>
                                </div>
                                <FieldError message={errors.comment} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                    {/* Customer Info Card */}
                    <div className={cardClass}>
                        <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-gray-100">
                            Customer Info
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className={labelClass}>Name *</label>
                                <input
                                    type="text"
                                    value={data.customer_name || ''}
                                    onChange={(e) => setData('customer_name', e.target.value)}
                                    className={inputClass(errors.customer_name)}
                                    placeholder="John Doe"
                                />
                                <FieldError message={errors.customer_name} />
                            </div>

                            <div>
                                <label className={labelClass}>Email</label>
                                <input
                                    type="email"
                                    value={data.customer_email || ''}
                                    onChange={(e) => setData('customer_email', e.target.value)}
                                    className={inputClass(errors.customer_email)}
                                    placeholder="john@example.com"
                                />
                                <FieldError message={errors.customer_email} />
                            </div>

                            <div>
                                <label className={labelClass}>Order Number</label>
                                <input
                                    type="text"
                                    value={data.order_number || ''}
                                    onChange={(e) => setData('order_number', e.target.value)}
                                    className={inputClass(errors.order_number)}
                                    placeholder="ORD-12345"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    For verified purchase badge
                                </p>
                                <FieldError message={errors.order_number} />
                            </div>

                            {data.status !== undefined && (
                                <div className="pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.status}
                                            onChange={(e) => setData('status', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Approved
                                        </span>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {processing ? 'Processing...' : submitLabel}
                    </button>
                </div>
            </div>

            {/* Product Selector Modal */}
            {showProductSelector && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                Select Product
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowProductSelector(false);
                                    setProductSearch('');
                                }}
                                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="mb-4 relative">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                size={20}
                            />
                            <input
                                type="text"
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                                placeholder="Search products..."
                                className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div className="max-h-[60vh] space-y-2 overflow-y-auto">
                            {filteredProducts.map((product) => (
                                <button
                                    key={product.id}
                                    type="button"
                                    onClick={() => selectProduct(product)}
                                    className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                                >
                                    {product.image && (
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="h-12 w-12 rounded-lg object-cover"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                            {product.name}
                                        </p>
                                    </div>
                                </button>
                            ))}
                            {filteredProducts.length === 0 && (
                                <p className="py-8 text-center text-gray-500">
                                    No products found
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
}
