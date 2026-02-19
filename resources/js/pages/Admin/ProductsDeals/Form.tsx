import {
    Calendar,
    Image as ImageIcon,
    Info,
    Package,
    Percent,
    Plus,
    Save,
    Tag,
    Trash2,
    X,
} from 'lucide-react';
import { FormEventHandler, useState } from 'react';

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

interface SelectedProduct {
    id: number;
    custom_discount: number | null;
    stock_limit: number | null;
}

interface FormData {
    title: string;
    slug: string;
    description: string;
    image: File | null;
    deal_type: string;
    discount_value: string;
    min_quantity: number;
    free_quantity: number;
    min_purchase_amount: string;
    max_uses: string;
    max_uses_per_user: string;
    starts_at: string;
    ends_at: string;
    badge_text: string;
    badge_color: string;
    display_order: number;
    is_featured: boolean;
    is_active: boolean;
    products: SelectedProduct[];
}

interface FormProps {
    data: FormData;
    setData: (key: keyof FormData | string, value: any) => void;
    errors: Partial<Record<string, string>>; // Changed to accept any string key for nested errors
    processing: boolean;
    onSubmit: FormEventHandler;
    products: Product[];
    dealTypes: DealType[];
    submitLabel: string;
    initialImage?: string | null;
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
    dealTypes,
    submitLabel,
    initialImage,
}: FormProps) {
    const [imagePreview, setImagePreview] = useState<string | null>(
        initialImage || null
    );
    const [showProductSelector, setShowProductSelector] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const addProduct = (product: Product) => {
        if (!data.products.find((p) => p.id === product.id)) {
            setData('products', [
                ...data.products,
                {
                    id: product.id,
                    custom_discount: null,
                    stock_limit: null,
                },
            ]);
        }
        setShowProductSelector(false);
    };

    const removeProduct = (productId: number) => {
        setData(
            'products',
            data.products.filter((p) => p.id !== productId)
        );
    };

    const updateProductField = (
        productId: number,
        field: 'custom_discount' | 'stock_limit',
        value: number | null
    ) => {
        setData(
            'products',
            data.products.map((p) =>
                p.id === productId ? { ...p, [field]: value } : p
            )
        );
    };

    const getProductById = (id: number) => {
        return products.find((p) => p.id === id);
    };

    const inputClass = (hasError?: string) =>
        `w-full px-3 py-2 border rounded-lg bg-white text-gray-900 placeholder-gray-400
        dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400
        focus:outline-none focus:ring-2 transition-colors
        ${hasError
            ? 'border-red-400 dark:border-red-500 focus:ring-red-400'
            : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400'
        }`;

    const cardClass = 'bg-white rounded-lg border border-gray-200 p-5 dark:bg-gray-800 dark:border-gray-700';
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
                    {/* Basic Info Card */}
                    <div className={cardClass}>
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                            <Tag size={20} className="text-blue-600" />
                            Basic Information
                        </h3>
                        <div className="space-y-4">
                            {/* Title */}
                            <div>
                                <label className={labelClass}>Deal Title *</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className={inputClass(errors.title)}
                                    placeholder="Summer Sale 2024"
                                />
                                <FieldError message={errors.title} />
                            </div>

                            {/* Slug */}
                            <div>
                                <label className={labelClass}>Slug (Optional)</label>
                                <input
                                    type="text"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    className={inputClass(errors.slug)}
                                    placeholder="summer-sale-2024"
                                />
                                <p className="text-xs text-gray-500 mt-1">Auto-generated if left empty</p>
                                <FieldError message={errors.slug} />
                            </div>

                            {/* Description */}
                            <div>
                                <label className={labelClass}>Description</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={3}
                                    className={inputClass(errors.description)}
                                    placeholder="Describe this deal..."
                                />
                                <FieldError message={errors.description} />
                            </div>
                        </div>
                    </div>

                    {/* Discount Settings Card */}
                    <div className={cardClass}>
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                            <Percent size={20} className="text-green-600" />
                            Discount Settings
                        </h3>
                        <div className="space-y-4">
                            {/* Deal Type */}
                            <div>
                                <label className={labelClass}>Deal Type *</label>
                                <select
                                    value={data.deal_type}
                                    onChange={(e) => setData('deal_type', e.target.value)}
                                    className={inputClass(errors.deal_type)}
                                >
                                    {dealTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                                <FieldError message={errors.deal_type} />
                            </div>

                            {/* Discount Value */}
                            {(data.deal_type === 'percentage' || data.deal_type === 'fixed') && (
                                <div>
                                    <label className={labelClass}>Discount Value *</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={data.discount_value}
                                            onChange={(e) => setData('discount_value', e.target.value)}
                                            className={inputClass(errors.discount_value)}
                                            placeholder="20"
                                            min="0"
                                            step="0.01"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                            {data.deal_type === 'percentage' ? '%' : 'Rs.'}
                                        </span>
                                    </div>
                                    <FieldError message={errors.discount_value} />
                                </div>
                            )}

                            {/* Buy X Get Y */}
                            {data.deal_type === 'buy_x_get_y' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Buy Quantity (X) *</label>
                                        <input
                                            type="number"
                                            value={data.min_quantity}
                                            onChange={(e) => setData('min_quantity', parseInt(e.target.value))}
                                            className={inputClass(errors.min_quantity)}
                                            min="1"
                                        />
                                        <FieldError message={errors.min_quantity} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Get Free (Y) *</label>
                                        <input
                                            type="number"
                                            value={data.free_quantity}
                                            onChange={(e) => setData('free_quantity', parseInt(e.target.value))}
                                            className={inputClass(errors.free_quantity)}
                                            min="0"
                                        />
                                        <FieldError message={errors.free_quantity} />
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                {/* Min Purchase */}
                                <div>
                                    <label className={labelClass}>Min Purchase (Optional)</label>
                                    <input
                                        type="number"
                                        value={data.min_purchase_amount}
                                        onChange={(e) => setData('min_purchase_amount', e.target.value)}
                                        className={inputClass(errors.min_purchase_amount)}
                                        placeholder="1000"
                                        min="0"
                                        step="0.01"
                                    />
                                    <FieldError message={errors.min_purchase_amount} />
                                </div>

                                {/* Max Uses */}
                                <div>
                                    <label className={labelClass}>Max Uses (Optional)</label>
                                    <input
                                        type="number"
                                        value={data.max_uses}
                                        onChange={(e) => setData('max_uses', e.target.value)}
                                        className={inputClass(errors.max_uses)}
                                        placeholder="100"
                                        min="1"
                                    />
                                    <FieldError message={errors.max_uses} />
                                </div>
                            </div>

                            {/* Max Uses Per User */}
                            <div>
                                <label className={labelClass}>Max Uses Per User (Optional)</label>
                                <input
                                    type="number"
                                    value={data.max_uses_per_user}
                                    onChange={(e) => setData('max_uses_per_user', e.target.value)}
                                    className={inputClass(errors.max_uses_per_user)}
                                    placeholder="1"
                                    min="1"
                                />
                                <FieldError message={errors.max_uses_per_user} />
                            </div>
                        </div>
                    </div>

                    {/* Products Card */}
                    <div className={cardClass}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                <Package size={20} className="text-orange-600" />
                                Products ({data.products.length})
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowProductSelector(true)}
                                className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700"
                            >
                                <Plus size={16} />
                                Add
                            </button>
                        </div>

                        <FieldError message={errors.products} />

                        {data.products.length === 0 ? (
                            <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center dark:border-gray-600">
                                <Package size={40} className="mx-auto mb-2 text-gray-400" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    No products added yet
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {data.products.map((selectedProduct) => {
                                    const product = getProductById(selectedProduct.id);
                                    if (!product) return null;

                                    return (
                                        <div
                                            key={product.id}
                                            className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                                        >
                                            {product.image && (
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="h-12 w-12 rounded-lg object-cover"
                                                />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                                                    {product.name}
                                                </h4>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    Rs. {product.price}
                                                </p>
                                            </div>

                                            <div className="flex gap-2">
                                                <div>
                                                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                        Discount
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={selectedProduct.custom_discount || ''}
                                                        onChange={(e) =>
                                                            updateProductField(
                                                                product.id,
                                                                'custom_discount',
                                                                e.target.value ? parseFloat(e.target.value) : null
                                                            )
                                                        }
                                                        className="w-20 rounded border px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-700"
                                                        placeholder="0"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                        Stock
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={selectedProduct.stock_limit || ''}
                                                        onChange={(e) =>
                                                            updateProductField(
                                                                product.id,
                                                                'stock_limit',
                                                                e.target.value ? parseInt(e.target.value) : null
                                                            )
                                                        }
                                                        className="w-20 rounded border px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-700"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => removeProduct(product.id)}
                                                className="rounded-lg p-1.5 text-red-600 transition hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                    {/* Timing Card */}
                    <div className={cardClass}>
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                            <Calendar size={20} className="text-purple-600" />
                            Duration
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className={labelClass}>Start Date</label>
                                <input
                                    type="datetime-local"
                                    value={data.starts_at}
                                    onChange={(e) => setData('starts_at', e.target.value)}
                                    className={inputClass(errors.starts_at)}
                                />
                                <FieldError message={errors.starts_at} />
                            </div>

                            <div>
                                <label className={labelClass}>End Date</label>
                                <input
                                    type="datetime-local"
                                    value={data.ends_at}
                                    onChange={(e) => setData('ends_at', e.target.value)}
                                    className={inputClass(errors.ends_at)}
                                />
                                <FieldError message={errors.ends_at} />
                            </div>
                        </div>
                    </div>

                    {/* Image Upload Card */}
                    <div className={cardClass}>
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                            <ImageIcon size={20} className="text-indigo-600" />
                            Banner Image
                        </h3>
                        <div className="space-y-3">
                            <label className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition hover:border-blue-500 dark:border-gray-600">
                                <ImageIcon size={28} className="text-gray-400" />
                                <span className="mt-2 text-xs text-gray-500">Upload Image</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                            {imagePreview && (
                                <div className="relative overflow-hidden rounded-lg">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="h-32 w-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImagePreview(null);
                                            setData('image', null);
                                        }}
                                        className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white transition hover:bg-red-600"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                            <FieldError message={errors.image} />
                        </div>
                    </div>

                    {/* Display Settings Card */}
                    <div className={cardClass}>
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                            <Info size={20} className="text-pink-600" />
                            Display
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className={labelClass}>Badge Text</label>
                                <input
                                    type="text"
                                    value={data.badge_text}
                                    onChange={(e) => setData('badge_text', e.target.value)}
                                    className={inputClass(errors.badge_text)}
                                    placeholder="50% OFF"
                                />
                                <FieldError message={errors.badge_text} />
                            </div>

                            <div>
                                <label className={labelClass}>Badge Color</label>
                                <input
                                    type="color"
                                    value={data.badge_color}
                                    onChange={(e) => setData('badge_color', e.target.value)}
                                    className="h-10 w-full rounded-lg border border-gray-300 dark:border-gray-600"
                                />
                                <FieldError message={errors.badge_color} />
                            </div>

                            <div>
                                <label className={labelClass}>Display Order</label>
                                <input
                                    type="number"
                                    value={data.display_order}
                                    onChange={(e) => setData('display_order', parseInt(e.target.value))}
                                    className={inputClass(errors.display_order)}
                                />
                                <FieldError message={errors.display_order} />
                            </div>

                            <div className="space-y-2 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.is_featured}
                                        onChange={(e) => setData('is_featured', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Featured Deal
                                    </span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Active
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Save size={18} />
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
                                Select Products
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowProductSelector(false)}
                                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="max-h-[60vh] space-y-2 overflow-y-auto">
                            {products.map((product) => (
                                <button
                                    key={product.id}
                                    type="button"
                                    onClick={() => addProduct(product)}
                                    disabled={data.products.some((p) => p.id === product.id)}
                                    className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-700"
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
                                        <p className="text-sm text-gray-500">Rs. {product.price}</p>
                                    </div>
                                    {data.products.some((p) => p.id === product.id) && (
                                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                            Added
                                        </span>
                                    )}
                                </button>
                            ))}
                            {products.length === 0 && (
                                <p className="py-8 text-center text-gray-500">No products available</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
}
