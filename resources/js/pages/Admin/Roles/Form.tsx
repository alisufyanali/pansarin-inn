import React, { useMemo } from 'react';
import { useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Check, X, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

type Permission = {
    id: number;
    name: string;
    category?: string;
};

export type RoleFormData = {
    name: string;
    permission: string[];
};

interface RoleFormProps {
    role?: RoleFormData & { id?: number };
    permissions: Permission[];
    isEdit?: boolean;
}

export default function RoleForm({ role, permissions, isEdit = false }: RoleFormProps) {
    const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(new Set());

    const { data, setData, errors, post, put, processing } = useForm<RoleFormData>({
        name: role?.name || '',
        permission: role?.permission || [],
    });

    // Group permissions by category and action type
    const grouped = useMemo(() => {
        const map = new Map<string, Permission[]>();
        
        permissions.forEach((p) => {
            const parts = p.name.split('.');
            const cat = p.category || (parts.length > 1 ? parts[1] : 'General');
            
            const arr = map.get(cat) ?? [];
            arr.push(p);
            map.set(cat, arr);
        });
        
        return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    }, [permissions]);

    const groupedMap = useMemo(() => new Map(grouped), [grouped]);

    // Get all action types (view, create, edit, delete)
    const actionTypes = useMemo(() => {
        const types = new Set<string>();
        permissions.forEach(p => {
            const action = p.name.split('.')[0];
            types.add(action);
        });
        return Array.from(types).sort();
    }, [permissions]);

    // Toggle category expansion
    const toggleCategory = (category: string) => {
        const newSet = new Set(expandedCategories);
        if (newSet.has(category)) {
            newSet.delete(category);
        } else {
            newSet.add(category);
        }
        setExpandedCategories(newSet);
    };

    // Expand/Collapse all
    const expandAll = () => {
        setExpandedCategories(new Set(grouped.map(([cat]) => cat)));
    };

    const collapseAll = () => {
        setExpandedCategories(new Set());
    };

    // Helper Functions
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
        if (checked) {
            setData('permission', permissions.map((p) => p.name));
        } else {
            setData('permission', []);
        }
    }

    function categoryAllSelected(category: string) {
        const list = groupedMap.get(category) ?? [];
        return list.length > 0 && list.every((p) => data.permission.includes(p.name));
    }

    function handleCategorySelect(category: string, checked: boolean) {
        const list = groupedMap.get(category) ?? [];
        const names = list.map((p) => p.name);
        if (checked) {
            setData('permission', Array.from(new Set([...data.permission, ...names])));
        } else {
            setData('permission', data.permission.filter((n) => !names.includes(n)));
        }
    }

    // Select all permissions of a specific action type (e.g., all "view" permissions)
    function handleActionTypeSelect(actionType: string, checked: boolean) {
        const actionPerms = permissions.filter(p => p.name.startsWith(actionType + '.'));
        const names = actionPerms.map(p => p.name);
        
        if (checked) {
            setData('permission', Array.from(new Set([...data.permission, ...names])));
        } else {
            setData('permission', data.permission.filter((n) => !names.includes(n)));
        }
    }

    // Check if all permissions of an action type are selected
    function isActionTypeSelected(actionType: string) {
        const actionPerms = permissions.filter(p => p.name.startsWith(actionType + '.'));
        return actionPerms.length > 0 && actionPerms.every(p => data.permission.includes(p.name));
    }

    // Get permissions by action type for a category
    function getPermissionsByAction(category: string, actionType: string) {
        const list = groupedMap.get(category) ?? [];
        return list.filter(p => p.name.startsWith(actionType + '.'));
    }

    // Check if all permissions of an action type in a category are selected
    function isCategoryActionSelected(category: string, actionType: string) {
        const perms = getPermissionsByAction(category, actionType);
        return perms.length > 0 && perms.every(p => data.permission.includes(p.name));
    }

    // Select/deselect all permissions of an action type in a category
    function handleCategoryActionSelect(category: string, actionType: string, checked: boolean) {
        const perms = getPermissionsByAction(category, actionType);
        const names = perms.map(p => p.name);
        
        if (checked) {
            setData('permission', Array.from(new Set([...data.permission, ...names])));
        } else {
            setData('permission', data.permission.filter((n) => !names.includes(n)));
        }
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        
        if (isEdit && role?.id) {
            post(`/admin/roles/${role.id}?_method=PUT`);
        } else {
            post('/admin/roles');
        }
    }

    function handleReset() {
        setData({ name: '', permission: [] });
    }

    return (
        <div className="max-w-7xl mx-auto p-4">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link
                    href="/admin/roles"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isEdit ? 'Edit Role' : 'Create New Role'}
                </h1>
            </div>

            <form onSubmit={submit} className="space-y-6">
                {/* Role Name */}
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Role Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. Content Manager"
                        className={`w-full px-4 py-2 rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none`}
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* Permissions */}
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    {/* Permissions Header */}
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-blue-500" />
                                <h2 className="font-semibold text-lg text-gray-900 dark:text-white">Permissions</h2>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    ({data.permission.length}/{permissions.length} selected)
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={expandAll}
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    Expand All
                                </button>
                                <button
                                    type="button"
                                    onClick={collapseAll}
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    Collapse All
                                </button>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Select All</span>
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Action Type Selectors */}
                        <div className="flex flex-wrap gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Select:</span>
                            {actionTypes.map(actionType => (
                                <label 
                                    key={actionType}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        checked={isActionTypeSelected(actionType)}
                                        onChange={(e) => handleActionTypeSelect(actionType, e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                                        All {actionType}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Categories List */}
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {grouped.map(([category, perms]) => {
                            const isExpanded = expandedCategories.has(category);
                            const isAllSelected = categoryAllSelected(category);
                            
                            return (
                                <div key={category}>
                                    {/* Category Header */}
                                    <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <button
                                                type="button"
                                                onClick={() => toggleCategory(category)}
                                                className="flex items-center gap-2 flex-1 text-left"
                                            >
                                                {isExpanded ? (
                                                    <ChevronUp className="w-4 h-4 text-gray-500" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                                )}
                                                <span className="font-semibold text-sm text-gray-900 dark:text-white uppercase">
                                                    {category.replace('-', ' ')}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    ({perms.filter(p => data.permission.includes(p.name)).length}/{perms.length})
                                                </span>
                                            </button>
                                            <label className="flex items-center gap-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                                <span className="text-xs text-gray-600 dark:text-gray-400">Select All</span>
                                                <input
                                                    type="checkbox"
                                                    checked={isAllSelected}
                                                    onChange={(e) => handleCategorySelect(category, e.target.checked)}
                                                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                                                />
                                            </label>
                                        </div>

                                        {/* Action Type Selectors for Category */}
                                        {isExpanded && (
                                            <div className="flex flex-wrap gap-2 mt-2 pl-6">
                                                {actionTypes.map(actionType => {
                                                    const actionPerms = getPermissionsByAction(category, actionType);
                                                    if (actionPerms.length === 0) return null;
                                                    
                                                    return (
                                                        <label 
                                                            key={actionType}
                                                            className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isCategoryActionSelected(category, actionType)}
                                                                onChange={(e) => handleCategoryActionSelect(category, actionType, e.target.checked)}
                                                                className="w-3 h-3 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                                                            />
                                                            <span className="text-gray-700 dark:text-gray-300 capitalize">
                                                                {actionType}
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Permissions Grid */}
                                    {isExpanded && (
                                        <div className="px-6 py-4">
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                {perms.map((permission) => (
                                                    <label 
                                                        key={permission.id} 
                                                        className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer group"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={data.permission.includes(permission.name)}
                                                            onChange={(e) => handleCheckboxChange(permission, e.target.checked)}
                                                            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white capitalize">
                                                            {permission.name.split('.')[0]}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    
                    {errors.permission && (
                        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-red-500 text-sm">{errors.permission}</p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors"
                    >
                        <X className="w-4 h-4" />
                        Reset
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
                    >
                        <Check className="w-4 h-4" />
                        {processing ? 'Saving...' : (isEdit ? 'Update Role' : 'Create Role')}
                    </button>
                </div>
            </form>
        </div>
    );
}
