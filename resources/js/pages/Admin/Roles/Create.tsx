import React, { useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Check, X, ShieldCheck } from 'lucide-react';

type Permission = {
    id: number;
    name: string;
    category?: string;
};

interface Props {
    permissions: Permission[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Roles', href: '/admin/roles' },
    { title: 'Create', href: '/admin/roles/create' },
];

type FormShape = {
    name: string;
    permission: string[];
};

export default function RoleCreate({ permissions }: Props) {
    const { data, setData, errors, post, processing } = useForm<FormShape>({
        name: '',
        permission: [],
    });

    // --- Logic to Group Permissions by Name (e.g., "Create.Products" -> Group: Products) ---
    const grouped = useMemo(() => {
        const map = new Map<string, Permission[]>();
        
        permissions.forEach((p) => {
            // Agar backend se category nahi aa rahi, toh naam se extract karo
            // "Create.Products" split ho kar parts[1] yaani "Products" banega
            const parts = p.name.split('.');
            const cat = p.category || (parts.length > 1 ? parts[1] : 'General');
            
            const arr = map.get(cat) ?? [];
            arr.push(p);
            map.set(cat, arr);
        });
        
        // Groups ko alphabetical order mein sort karna (Optional)
        return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    }, [permissions]);

    const groupedMap = useMemo(() => new Map(grouped), [grouped]);

    // --- Helper Functions ---
    function handleCheckboxChange(permission: Permission, checked: boolean) {
        if (checked) {
            if (!data.permission.includes(permission.name)) 
                setData('permission', [...data.permission, permission.name]);
        } else {
            setData('permission', data.permission.filter((n) => n !== permission.name));
        }
    }

    const allSelected = permissions.length > 0 && permissions.every((p) => data.permission.includes(p.name));

    function handleSelectAll(checked: boolean) {
        if (checked) setData('permission', permissions.map((p) => p.name));
        else setData('permission', []);
    }

    function categoryAllSelected(category: string) {
        const list = groupedMap.get(category) ?? [];
        return list.length > 0 && list.every((p) => data.permission.includes(p.name));
    }

    function handleCategorySelect(category: string, checked: boolean) {
        const list = groupedMap.get(category) ?? [];
        const names = list.map((p) => p.name);
        if (checked) setData('permission', Array.from(new Set([...data.permission, ...names])));
        else setData('permission', data.permission.filter((n) => !names.includes(n)));
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/admin/roles');
    }

    function handleReset() {
        setData({ name: '', permission: [] });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Role" />
            
            <div className="max-w-6xl mx-auto p-4 md:p-6">
                {/* Top Action Bar */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/roles"
                            className="flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 w-10 h-10 transition-all shadow-sm"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Role</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Define role name and assign specific module permissions</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Role Name Card */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="max-w-md">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Role Name
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Content Manager"
                                className={`w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border ${errors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-2 font-medium">{errors.name}</p>}
                        </div>
                    </div>

                    {/* Permissions Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold text-lg">
                                <ShieldCheck className="text-blue-500" size={24} />
                                <h2>Permissions Assignment</h2>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-blue-500 transition-colors">Select All Permissions</span>
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={(e) => handleSelectAll(e.currentTarget.checked)}
                                    className="w-5 h-5 rounded border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                                />
                            </label>
                        </div>

                        {/* Grid of Categories */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {grouped.map(([category, perms]) => (
                                <div key={category} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col transition-all hover:border-blue-500/30">
                                    {/* Category Header */}
                                    <div className="px-5 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                        <span className="font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider text-xs">
                                            {category.replace('-', ' ')}
                                        </span>
                                        <input
                                            type="checkbox"
                                            checked={categoryAllSelected(category)}
                                            onChange={(e) => handleCategorySelect(category, e.currentTarget.checked)}
                                            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500 cursor-pointer"
                                        />
                                    </div>

                                    {/* Permissions List */}
                                    <div className="p-5 grid grid-cols-1 gap-3">
                                        {perms.map((permission) => (
                                            <label key={permission.id} className="flex items-center justify-between group cursor-pointer">
                                                <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors capitalize">
                                                    {/* Shows only the action like "Create", "View" etc */}
                                                    {permission.name.split('.')[0]}
                                                </span>
                                                <input
                                                    type="checkbox"
                                                    checked={data.permission.includes(permission.name)}
                                                    onChange={(e) => handleCheckboxChange(permission, e.currentTarget.checked)}
                                                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {errors.permission && <p className="text-red-500 text-sm font-medium px-2">{errors.permission}</p>}
                    </div>

                    {/* Bottom Sticky Actions */}
                    <div className="sticky bottom-6 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-6 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-lg flex items-center gap-2"
                        >
                            <X size={18} />
                            Reset Form
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Creating...' : <><Check size={18} /> Save New Role</>}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}