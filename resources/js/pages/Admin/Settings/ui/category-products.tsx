import { useState } from 'react';
import { LayoutGrid, Save, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

interface Product {
    id: number;
    name: string;
    sku: string;
    thumbnail: string | null;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    products: Product[];
}

interface Props {
    categories: Category[];
    categoryProducts: Record<number, number[]>;
}

function CategorySection({ category, initialSelected }: { category: Category; initialSelected: number[] }) {
    const [selected, setSelected] = useState<number[]>(initialSelected);
    const [search, setSearch] = useState('');
    const [saving, setSaving] = useState(false);

    const available = category.products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
    );

    const selectedProducts = selected
        .map(id => category.products.find(p => p.id === id))
        .filter(Boolean) as Product[];

    const toggle = (productId: number) => {
        setSelected(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const moveUp = (index: number) => {
        if (index === 0) return;
        const updated = [...selected];
        [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
        setSelected(updated);
    };

    const moveDown = (index: number) => {
        if (index === selected.length - 1) return;
        const updated = [...selected];
        [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
        setSelected(updated);
    };

    const save = async () => {
        setSaving(true);
        try {
            await axios.post('/admin/settings/ui/category-products', {
                category_id: category.id,
                products: selected,
            });
            toast.success(`${category.name} products saved!`);
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? 'Failed to save.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 flex items-center justify-between">
                <h4 className="text-white font-bold text-sm flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4" />
                    {category.name}
                    <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                        {selected.length} selected
                    </span>
                </h4>
                <button
                    onClick={save}
                    disabled={saving}
                    className="flex items-center gap-1.5 bg-white text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-60"
                >
                    <Save className="w-3.5 h-3.5" />
                    {saving ? 'Saving...' : 'Save'}
                </button>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Product picker */}
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                        Available Products ({category.products.length})
                    </p>
                    <div className="relative mb-2">
                        <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                        {available.length === 0 && (
                            <p className="text-xs text-gray-400 text-center py-4">No products found</p>
                        )}
                        {available.map(product => {
                            const isSelected = selected.includes(product.id);
                            return (
                                <button
                                    key={product.id}
                                    type="button"
                                    onClick={() => toggle(product.id)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition ${
                                        isSelected
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-300 dark:border-indigo-700'
                                            : 'bg-gray-50 dark:bg-gray-800 border border-transparent hover:border-gray-300'
                                    }`}
                                >
                                    {product.thumbnail ? (
                                        <img src={product.thumbnail} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                                    ) : (
                                        <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
                                        <p className="text-gray-400 truncate">{product.sku}</p>
                                    </div>
                                    {isSelected && (
                                        <span className="text-indigo-600 font-bold text-xs">✓</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Selected + ordering */}
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                        Selected & Order ({selectedProducts.length})
                    </p>
                    <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                        {selectedProducts.length === 0 && (
                            <p className="text-xs text-gray-400 text-center py-4">No products selected</p>
                        )}
                        {selectedProducts.map((product, index) => (
                            <div
                                key={product.id}
                                className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2"
                            >
                                <span className="text-xs text-gray-400 font-mono w-5 text-center">{index + 1}</span>
                                {product.thumbnail ? (
                                    <img src={product.thumbnail} alt="" className="w-7 h-7 rounded object-cover flex-shrink-0" />
                                ) : (
                                    <div className="w-7 h-7 rounded bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                                )}
                                <span className="flex-1 text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                                    {product.name}
                                </span>
                                <div className="flex items-center gap-0.5">
                                    <button
                                        type="button"
                                        onClick={() => moveUp(index)}
                                        disabled={index === 0}
                                        className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30 transition"
                                        title="Move up"
                                    >▲</button>
                                    <button
                                        type="button"
                                        onClick={() => moveDown(index)}
                                        disabled={index === selectedProducts.length - 1}
                                        className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30 transition"
                                        title="Move down"
                                    >▼</button>
                                    <button
                                        type="button"
                                        onClick={() => toggle(product.id)}
                                        className="p-1 text-gray-400 hover:text-red-500 transition"
                                        title="Remove"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CategoryProductsTab({ categories, categoryProducts }: Props) {
    return (
        <div className="space-y-6">
            <h3 className="flex items-center gap-2 border-b pb-3 text-xl font-bold text-gray-800 dark:text-white">
                <LayoutGrid className="h-6 w-6 text-indigo-600" />
                Homepage Category Sections
            </h3>
            <p className="text-sm text-gray-500">
                Select which products appear under each category on the homepage. Use ▲▼ to reorder.
            </p>
            <div className="space-y-4">
                {categories.length === 0 && (
                    <p className="text-center text-gray-400 py-8">No active categories with products found.</p>
                )}
                {categories.map(category => (
                    <CategorySection
                        key={category.id}
                        category={category}
                        initialSelected={categoryProducts[category.id] ?? []}
                    />
                ))}
            </div>
        </div>
    );
}
