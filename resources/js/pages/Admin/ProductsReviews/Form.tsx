import { Search, Star, X } from 'lucide-react';
import { useState } from 'react';

interface Product {
    id: number;
    name: string;
    image?: string | null;
}

interface User {
    id: number;
    name: string;
    email: string;
}

export interface ReviewFormData {
    product_id: string;
    user_id:    string;
    rating:     number;
    review:     string;
    [key: string]: any;
}

interface FormProps {
    data:           ReviewFormData;
    setData:        (key: string, value: any) => void;
    errors:         Partial<Record<string, string>>;
    processing:     boolean;
    onSubmit:       (e: React.FormEvent) => void;
    products:       Product[];
    users:          User[];
    submitLabel:    string;
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="mt-1 text-sm text-red-500 dark:text-red-400">{message}</p>;
}

const inputCls = (err?: string) =>
    `w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
    placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors
    ${err ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'}`;

const card = 'rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5';
const label = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';

export default function Form({ data, setData, errors, processing, onSubmit, products, users, submitLabel }: FormProps) {
    const [hoveredStar,         setHoveredStar]         = useState(0);
    const [showProductPicker,   setShowProductPicker]   = useState(false);
    const [showUserPicker,      setShowUserPicker]       = useState(false);
    const [productSearch,       setProductSearch]       = useState('');
    const [userSearch,          setUserSearch]          = useState('');

    const selectedProduct = products.find(p => p.id === parseInt(data.product_id));
    const selectedUser    = users.find(u => u.id === parseInt(data.user_id));

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase())
    );
    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase())
    );

    const ratingLabels: Record<number, string> = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {errors.error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-400">
                    {errors.error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* ── Left column ── */}
                <div className="space-y-6 lg:col-span-2">

                    {/* Product picker */}
                    <div className={card}>
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Product *</h3>
                        {selectedProduct ? (
                            <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                                {selectedProduct.image && (
                                    <img src={selectedProduct.image} alt={selectedProduct.name}
                                        className="h-12 w-12 rounded-lg object-cover" />
                                )}
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

                    {/* User picker */}
                    <div className={card}>
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">User *</h3>
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

                    {/* Rating + Review */}
                    <div className={card}>
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Review</h3>
                        <div className="space-y-4">
                            <div>
                                <label className={label}>Rating *</label>
                                <div className="flex gap-1">
                                    {[1,2,3,4,5].map(star => (
                                        <button key={star} type="button"
                                            onClick={() => setData('rating', star)}
                                            onMouseEnter={() => setHoveredStar(star)}
                                            onMouseLeave={() => setHoveredStar(0)}
                                            className="transition-transform hover:scale-110 focus:outline-none">
                                            <Star size={28} className={
                                                star <= (hoveredStar || data.rating)
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-300 dark:text-gray-600'
                                            } />
                                        </button>
                                    ))}
                                </div>
                                {data.rating > 0 && (
                                    <p className="mt-1 text-sm font-medium text-gray-500">{ratingLabels[data.rating]}</p>
                                )}
                                <FieldError message={errors.rating} />
                            </div>

                            <div>
                                <label className={label}>Review Comment</label>
                                <textarea
                                    value={data.review}
                                    onChange={e => setData('review', e.target.value)}
                                    rows={5}
                                    className={inputCls(errors.review)}
                                    placeholder="Customer's review..."
                                />
                                <p className="mt-1 text-xs text-gray-400">{data.review?.length || 0} / 2000</p>
                                <FieldError message={errors.review} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right column ── */}
                <div>
                    <button type="submit" disabled={processing}
                        className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 font-semibold text-white shadow-lg transition hover:from-blue-700 hover:to-purple-700 disabled:opacity-50">
                        {processing ? 'Saving...' : submitLabel}
                    </button>
                </div>
            </div>

            {/* ── Product picker modal ── */}
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

            {/* ── User picker modal ── */}
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
        </form>
    );
}
