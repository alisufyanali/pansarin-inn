import React, { useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Check, X } from 'lucide-react';

type Permission = {
    id: number;
    name: string;
    category?: string;
};

interface Props {
    permissions: Permission[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Roles', href: '/roles' },

];

type FormShape = {
    name: string;
    permission: string[];
};

export default function RoleCreate({ permissions }: Props) {
    const { data, setData, errors, post } = useForm<FormShape>({
        name: '',
        permission: [],
    });

    // group by category
    const grouped = useMemo(() => {
        const map = new Map<string, Permission[]>();
        permissions.forEach((p) => {
            const cat = p.category ?? 'General';
            const arr = map.get(cat) ?? [];
            arr.push(p);
            map.set(cat, arr);
        });
        return Array.from(map.entries());
    }, [permissions]);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/roles');
    }

    function handleCheckboxChange(permission: Permission, checked: boolean) {
        const name = permission.name;
        if (checked) {
            if (!data.permission.includes(name)) setData('permission', [...data.permission, name]);
        } else {
            setData('permission', data.permission.filter((n) => n !== name));
        }
    }

    const allSelected = permissions.length > 0 && permissions.every((p) => data.permission.includes(p.name));

    function handleSelectAll(checked: boolean) {
        if (checked) setData('permission', permissions.map((p) => p.name));
        else setData('permission', []);
    }

    const groupedMap = useMemo(() => new Map(grouped), [grouped]);

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

    function handleReset() {
        setData('name', '');
        setData('permission', []);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Role" />
            <div className="p-3">
                <Link
                    href="/roles"
                    className="inline-flex items-center justify-center rounded-md bg-gray-700 hover:bg-gray-600 text-white mb-4 w-10 h-10"
                >
                    <ArrowLeft />
                </Link>

                <div className="py-6">
                    <div className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">Create New Role</h2>

                        <form onSubmit={submit} className="space-y-6 font-sans text-sm">
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter Name"
                                    className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                            </div>

                            {/* description removed as requested */}

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-300">Permissions</label>
                                    <label className="inline-flex items-center space-x-2 text-sm text-gray-300">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={(e) => handleSelectAll(e.currentTarget.checked)}
                                            className="form-checkbox h-4 w-4 text-blue-600"
                                        />
                                        <span>Select All</span>
                                    </label>
                                </div>

                                <div className="space-y-6">
                                    {grouped.map(([category, perms]) => (
                                        <div key={category} className="bg-gray-700/30 rounded-md p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="text-sm font-semibold text-gray-200">{category}</div>
                                                <label className="inline-flex items-center space-x-2 text-sm text-gray-300">
                                                    <input
                                                        type="checkbox"
                                                        checked={categoryAllSelected(category)}
                                                        onChange={(e) => handleCategorySelect(category, e.currentTarget.checked)}
                                                        className="form-checkbox h-4 w-4 text-blue-600"
                                                    />
                                                    <span>Select Category</span>
                                                </label>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {perms.map((permission) => (
                                                    <label key={permission.id} className="inline-flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            value={permission.name}
                                                            checked={data.permission.includes(permission.name)}
                                                            onChange={(e) => handleCheckboxChange(permission, e.currentTarget.checked)}
                                                            id={`perm-${permission.id}`}
                                                            className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                                        />
                                                        <span className="text-sm text-white capitalize">{permission.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {errors.permission && <div className="text-red-500 text-sm mt-1">{errors.permission}</div>}
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10 shadow"
                                    title="Reset"
                                    aria-label="Reset form"
                                >
                                    <X />
                                </button>

                                <button
                                    type="submit"
                                    className="inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 shadow"
                                    title="Create"
                                    aria-label="Create role"
                                >
                                    <Check />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

            </div>

        </AppLayout>
    );
}
