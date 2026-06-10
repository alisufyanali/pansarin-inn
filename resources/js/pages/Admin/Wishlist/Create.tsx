import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Wishlists', href: '/admin/wishlist' },
    { title: 'Add Entry', href: '/admin/wishlist/create' },
];

interface Product { id: number; name: string; image?: string | null; }
interface User    { id: number; name: string; email: string; }
interface Variant { id: number; label: string; sku: string; }

interface Props {
    products: Product[];
    users:    User[];
    flash?:   { success?: string; error?: string };
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="mt-1 text-sm text-red-500 dark:text-red-400">{message}</p>;
}

const card = 'rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5';
const inputCls = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100';

export default function Create({ products, users, flash }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        user_id:            '',
        product_id:         '',
        product_variant_id: '',
    });

    const [showProductPicker, setShowProductPicker] = useState(false);
    const [showUserPicker,    setShowUserPicker]    = useState(false);
    const [productSearch,     setProductSearch]     = useState('');
    const [userSearch,        setUserSearch]        = useState('');
    const [variants,          setVariants]          = useState<Variant[]>([]);
    const [loadingVariants,   setLoadingVariants]   = useState(false);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error)   toast.error(flash.error);
    }, [flash]);

    // Load variants when product changes
    useEffect(() => {
        if (!data.product_id) {
            setVariants([]);
            setData('product_variant_id', '');
            return;
        }
        setLoadingVariants(true);
        setData('product_variant_id', '');
        fetch(`/admin/wishlist/variants-by-product?product_id=${data.product_id}`)
            .then(r => r.json())
            .then((v: Variant[]) => { setVariants(v); setLoadingVariants(false); })
            .catch(() => setLoadingVariants(false));
    }, [data.product_id]);

    const selectedProduct = products.find(p => p.id === parseInt(data.product_id));
    const selectedUser    = users.find(u => u.id === parseInt(data.user_id));

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));
    const filteredUsers    = users.filter(u =>
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase())
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Wishlist Entry" />
            <div className="mx-auto max-w-3xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold dark:text-white">Add Wishlist Entry</h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">Manually add a product to a user's wishlist</p>
                    </div>
                    <Link href="/admin/wishlist"
                        className="flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 font-semibold transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                        <ArrowLeft size={18} /> Back
                    </Link>
                </div>

                <form onSubmit={e => { e.preventDefault(); post('/admin/wishlist'); }} className="space-y-6">
                    {(errors as any).error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-400">
                            {(errors as any).error}
                        </div>
                    )}

                    {/* User */}
                    <div className={card}>
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                            User <span className="text-red-500">*</span>
                        </h3>
                        {selectedUser ? (
                            <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                    {selectedUser.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 dark:text-gray-100">{selectedUser.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                                </div>
                                <button type="button" onClick={() => setShowUserPicker(true)}
                                    className="text-sm text-blue-600 hover:underline dark:text-blue-400">Change</button>
                            </div>
                        ) : (
                            <button type="button" onClick={() => setShowUserPicker(true)}
                                className="w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-center text-sm text-gray-500 transition hover:border-blue-500 dark:border-gray-600">
                                Click to select a user
                            </button>
                        )}
                        <FieldError message={errors.user_id} />
                    </div>

                    {/* Product */}
                    <div className={card}>
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Product <span className="text-red-500">*</span>
                        </h3>
                        {selectedProduct ? (
                            <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                                {selectedProduct.image
                                    ? <img src={selectedProduct.image} alt={selectedProduct.name} className="h-12 w-12 rounded-lg object-cover" />
                                    : <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400 dark:bg-gray-700">IMG</div>
                                }
                                <p className="flex-1 font-medium text-gray-900 dark:text-gray-100">{selectedProduct.name}</p>
                                <button type="button" onClick={() => setShowProductPicker(true)}
                                    className="text-sm text-blue-600 hover:underline dark:text-blue-400">Change</button>
                            </div>
                        ) : (
                            <button type="button" onClick={() => setShowProductPicker(true)}
                                className="w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-center text-sm text-gray-500 transition hover:border-blue-500 dark:border-gray-600">
                                Click to select a product
                            </button>
                        )}
                        <FieldError message={errors.product_id} />
                    </div>

                    {/* Variant dropdown — shown only after product is selected */}
                    {data.product_id && (
                        <div className={card}>
                            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Product Variant{' '}
                                <span className="text-sm font-normal text-gray-400">(optional)</span>
                            </h3>
                            {loadingVariants ? (
                                <p className="text-sm text-gray-400">Loading variants...</p>
                            ) : variants.length === 0 ? (
                                <p className="text-sm text-gray-400 dark:text-gray-500">
                                    This product has no variants. The base product will be wishlisted.
                                </p>
                            ) : (
                                <select
                                    value={data.product_variant_id}
                                    onChange={e => setData('product_variant_id', e.target.value)}
                                    className={inputCls}
                                >
                                    <option value="">— No specific variant (base product) —</option>
                                    {variants.map(v => (
                                        <option key={v.id} value={v.id}>
                                            {v.label} ({v.sku})
                                        </option>
                                    ))}
                                </select>
                            )}
                            <FieldError message={errors.product_variant_id} />
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button type="submit" disabled={processing}
                            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 font-semibold text-white shadow-lg transition hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50">
                            {processing ? 'Saving...' : 'Add to Wishlist'}
                        </button>
                    </div>
                </form>
            </div>

            {/* User picker modal */}
            {showUserPicker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Select User</h3>
                            <button type="button" onClick={() => { setShowUserPicker(false); setUserSearch(''); }}
                                className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700"><X size={18} /></button>
                        </div>
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input type="text" value={userSearch} onChange={e => setUserSearch(e.target.value)}
                                placeholder="Search by name or email..." autoFocus
                                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                        </div>
                        <div className="max-h-72 space-y-1 overflow-y-auto">
                            {filteredUsers.map(u => (
                                <button key={u.id} type="button"
                                    onClick={() => { setData('user_id', u.id.toString()); setShowUserPicker(false); setUserSearch(''); }}
                                    className="flex w-full items-center gap-3 rounded-lg border border-gray-100 p-3 text-left transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                        {u.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{u.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                                    </div>
                                </button>
                            ))}
                            {filteredUsers.length === 0 && <p className="py-6 text-center text-sm text-gray-400">No users found</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* Product picker modal */}
            {showProductPicker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Select Product</h3>
                            <button type="button" onClick={() => { setShowProductPicker(false); setProductSearch(''); }}
                                className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700"><X size={18} /></button>
                        </div>
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input type="text" value={productSearch} onChange={e => setProductSearch(e.target.value)}
                                placeholder="Search products..." autoFocus
                                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                        </div>
                        <div className="max-h-72 space-y-1 overflow-y-auto">
                            {filteredProducts.map(p => (
                                <button key={p.id} type="button"
                                    onClick={() => { setData('product_id', p.id.toString()); setShowProductPicker(false); setProductSearch(''); }}
                                    className="flex w-full items-center gap-3 rounded-lg border border-gray-100 p-3 text-left transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700">
                                    {p.image
                                        ? <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                                        : <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400 dark:bg-gray-700">IMG</div>
                                    }
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{p.name}</span>
                                </button>
                            ))}
                            {filteredProducts.length === 0 && <p className="py-6 text-center text-sm text-gray-400">No products found</p>}
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
