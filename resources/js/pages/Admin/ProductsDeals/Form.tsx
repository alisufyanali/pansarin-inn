import {
    ArrowLeft,
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
    errors: Partial<Record<keyof FormData, string>>;
    processing: boolean;
    onSubmit: FormEventHandler;
    products: Product[];
    dealTypes: DealType[];
    submitLabel: string;
    initialImage?: string | null;
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

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {/* Basic Info Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h2 className="mb-6 flex items-center gap-2 text-xl font-bold dark:text-white">
                    <Tag size={24} className="text-blue-600" />
                    Basic Information
                </h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Title */}
                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                            Deal Title *
                        </label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            placeholder="Summer Sale 2024"
                        />
                        {errors.title && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.title}
                            </p>
                        )}
                    </div>

                    {/* Slug */}
                    <div>
                        <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                            Slug (Optional)
                        </label>
                        <input
                            type="text"
                            value={data.slug}
                            onChange={(e) => setData('slug', e.target.value)}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            placeholder="summer-sale-2024"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Auto-generated if left empty
                        </p>
                    </div>

                    {/* Deal Type */}
                    <div>
                        <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                            Deal Type *
                        </label>
                        <select
                            value={data.deal_type}
                            onChange={(e) =>
                                setData('deal_type', e.target.value)
                            }
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        >
                            {dealTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                            Description
                        </label>
                        <textarea
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            rows={3}
                            className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            placeholder="Describe this deal..."
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                            Deal Banner (Optional)
                        </label>
                        <div className="flex items-start gap-4">
                            <label className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 transition hover:border-blue-500 dark:border-gray-700">
                                <ImageIcon
                                    size={32}
                                    className="text-gray-400"
                                />
                                <span className="mt-2 text-xs text-gray-500">
                                    Upload Image
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                            {imagePreview && (
                                <div className="relative h-32 w-32 overflow-hidden rounded-xl">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="h-full w-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImagePreview(null);
                                            setData('image', null);
                                        }}
                                        className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white transition hover:bg-red-600"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Discount Settings Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h2 className="mb-6 flex items-center gap-2 text-xl font-bold dark:text-white">
                    <Percent size={24} className="text-green-600" />
                    Discount Settings
                </h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Discount Value */}
                    {(data.deal_type === 'percentage' ||
                        data.deal_type === 'fixed') && (
                        <div>
                            <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Discount Value *
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={data.discount_value}
                                    onChange={(e) =>
                                        setData('discount_value', e.target.value)
                                    }
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    placeholder="20"
                                    min="0"
                                    step="0.01"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                                    {data.deal_type === 'percentage' ? '%' : 'Rs.'}
                                </span>
                            </div>
                            {errors.discount_value && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.discount_value}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Buy X Get Y */}
                    {data.deal_type === 'buy_x_get_y' && (
                        <>
                            <div>
                                <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Buy Quantity (X) *
                                </label>
                                <input
                                    type="number"
                                    value={data.min_quantity}
                                    onChange={(e) =>
                                        setData(
                                            'min_quantity',
                                            parseInt(e.target.value)
                                        )
                                    }
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    min="1"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Get Free (Y) *
                                </label>
                                <input
                                    type="number"
                                    value={data.free_quantity}
                                    onChange={(e) =>
                                        setData(
                                            'free_quantity',
                                            parseInt(e.target.value)
                                        )
                                    }
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    min="0"
                                />
                            </div>
                        </>
                    )}

                    {/* Min Purchase */}
                    <div>
                        <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                            Min Purchase Amount (Optional)
                        </label>
                        <input
                            type="number"
                            value={data.min_purchase_amount}
                            onChange={(e) =>
                                setData('min_purchase_amount', e.target.value)
                            }
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            placeholder="1000"
                            min="0"
                            step="0.01"
                        />
                    </div>

                    {/* Max Uses */}
                    <div>
                        <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                            Max Total Uses (Optional)
                        </label>
                        <input
                            type="number"
                            value={data.max_uses}
                            onChange={(e) => setData('max_uses', e.target.value)}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            placeholder="100"
                            min="1"
                        />
                    </div>

                    {/* Max Uses Per User */}
                    <div>
                        <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                            Max Uses Per User (Optional)
                        </label>
                        <input
                            type="number"
                            value={data.max_uses_per_user}
                            onChange={(e) =>
                                setData('max_uses_per_user', e.target.value)
                            }
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            placeholder="1"
                            min="1"
                        />
                    </div>
                </div>
            </div>

            {/* Timing Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h2 className="mb-6 flex items-center gap-2 text-xl font-bold dark:text-white">
                    <Calendar size={24} className="text-purple-600" />
                    Duration & Timing
                </h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                            Start Date (Optional)
                        </label>
                        <input
                            type="datetime-local"
                            value={data.starts_at}
                            onChange={(e) => setData('starts_at', e.target.value)}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                            End Date (Optional)
                        </label>
                        <input
                            type="datetime-local"
                            value={data.ends_at}
                            onChange={(e) => setData('ends_at', e.target.value)}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                    </div>
                </div>
            </div>

            {/* Products Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-xl font-bold dark:text-white">
                        <Package size={24} className="text-orange-600" />
                        Products ({data.products.length})
                    </h2>
                    <button
                        type="button"
                        onClick={() => setShowProductSelector(true)}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
                    >
                        <Plus size={16} />
                        Add Products
                    </button>
                </div>

                {errors.products && (
                    <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20">
                        {errors.products}
                    </div>
                )}

                {data.products.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
                        <Package size={48} className="mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-600 dark:text-gray-400">
                            No products added yet
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            Click "Add Products" to select products for this deal
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {data.products.map((selectedProduct) => {
                            const product = getProductById(selectedProduct.id);
                            if (!product) return null;

                            return (
                                <div
                                    key={product.id}
                                    className="flex items-center gap-4 rounded-xl border border-gray-200 p-4 dark:border-gray-700"
                                >
                                    {product.image && (
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="h-16 w-16 rounded-lg object-cover"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 dark:text-gray-100">
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Base Price: Rs. {product.price}
                                        </p>
                                    </div>

                                    <div className="flex gap-3">
                                        <div>
                                            <label className="block text-xs text-gray-600 dark:text-gray-400">
                                                Custom Discount
                                            </label>
                                            <input
                                                type="number"
                                                value={
                                                    selectedProduct.custom_discount ||
                                                    ''
                                                }
                                                onChange={(e) =>
                                                    updateProductField(
                                                        product.id,
                                                        'custom_discount',
                                                        e.target.value
                                                            ? parseFloat(
                                                                  e.target.value
                                                              )
                                                            : null
                                                    )
                                                }
                                                className="mt-1 w-28 rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                                                placeholder="Optional"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 dark:text-gray-400">
                                                Stock Limit
                                            </label>
                                            <input
                                                type="number"
                                                value={selectedProduct.stock_limit || ''}
                                                onChange={(e) =>
                                                    updateProductField(
                                                        product.id,
                                                        'stock_limit',
                                                        e.target.value
                                                            ? parseInt(e.target.value)
                                                            : null
                                                    )
                                                }
                                                className="mt-1 w-28 rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                                                placeholder="Optional"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => removeProduct(product.id)}
                                        className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Display Settings Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h2 className="mb-6 flex items-center gap-2 text-xl font-bold dark:text-white">
                    <Info size={24} className="text-indigo-600" />
                    Display Settings
                </h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                            Badge Text
                        </label>
                        <input
                            type="text"
                            value={data.badge_text}
                            onChange={(e) => setData('badge_text', e.target.value)}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            placeholder="50% OFF"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                            Badge Color
                        </label>
                        <input
                            type="color"
                            value={data.badge_color}
                            onChange={(e) => setData('badge_color', e.target.value)}
                            className="h-12 w-full rounded-xl border border-gray-300 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                            Display Order
                        </label>
                        <input
                            type="number"
                            value={data.display_order}
                            onChange={(e) =>
                                setData('display_order', parseInt(e.target.value))
                            }
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={data.is_featured}
                                onChange={(e) =>
                                    setData('is_featured', e.target.checked)
                                }
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                Featured Deal
                            </span>
                        </label>

                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(e) =>
                                    setData('is_active', e.target.checked)
                                }
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                Active
                            </span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={processing}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 font-bold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Save size={20} />
                    {processing ? 'Processing...' : submitLabel}
                </button>
            </div>

            {/* Product Selector Modal */}
            {showProductSelector && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold dark:text-white">
                                Select Products
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowProductSelector(false)}
                                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                <X />
                            </button>
                        </div>

                        <div className="max-h-[60vh] space-y-2 overflow-y-auto">
                            {products.map((product) => (
                                <button
                                    key={product.id}
                                    type="button"
                                    onClick={() => addProduct(product)}
                                    disabled={data.products.some(
                                        (p) => p.id === product.id
                                    )}
                                    className="flex w-full items-center gap-4 rounded-xl border border-gray-200 p-3 text-left transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
                                >
                                    {product.image && (
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="h-12 w-12 rounded-lg object-cover"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <p className="font-bold dark:text-white">
                                            {product.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Rs. {product.price}
                                        </p>
                                    </div>
                                    {data.products.some((p) => p.id === product.id) && (
                                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                                            Added
                                        </span>
                                    )}
                                </button>
                            ))}

                            {products.length === 0 && (
                                <p className="py-6 text-center text-gray-500">
                                    No products available
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
}