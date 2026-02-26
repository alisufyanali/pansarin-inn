import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, Check, Plus, X } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface AttributeFormProps {
    attribute?: { id: number; name: string; values: Array<{ id: number; value: number; slug: string }> };
    isEdit?: boolean;
}

export default function AttributeForm({ attribute, isEdit = false }: AttributeFormProps) {
    const [values, setValues] = useState<Array<{ value: string; slug: string }>>(
        attribute?.values?.map(v => ({ value: v.value.toString(), slug: v.slug })) || [{ value: '', slug: '' }]
    );
    
    const { data, setData, post, put, processing, errors } = useForm({
        name: attribute?.name || '',
        values: attribute?.values?.map(v => ({ value: v.value.toString(), slug: v.slug })) || [{ value: '', slug: '' }],
    });

    const addValue = () => {
        const newValues = [...values, { value: '', slug: '' }];
        setValues(newValues);
        setData('values', newValues);
    };

    const removeValue = (index: number) => {
        const newValues = values.filter((_, i) => i !== index);
        setValues(newValues);
        setData('values', newValues);
    };

    const updateValue = (index: number, field: 'value' | 'slug', val: string) => {
        const newValues = [...values];
        newValues[index][field] = val;
        setValues(newValues);
        setData('values', newValues);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!data.name.trim()) {
            alert('Write Attribute Name');
            return;
        }
        
        if (values.every(v => !v.value.trim())) {
            alert('Add at least one attribute value');
            return;
        }

        const filledValues = values.filter(v => v.value.trim() && v.slug.trim());
        
        if (isEdit && attribute?.id) {
            put(`/admin/attributes/${attribute.id}`, {
                name: data.name,
                values: filledValues,
            } as any);
        } else {
            post('/admin/attributes', {
                name: data.name,
                values: filledValues,
            } as any);
        }
    };

    return (
        <div className="p-4 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
                <Link
                    href="/admin/attributes"
                    className="inline-flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 w-10 h-10 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                    <ArrowLeft size={18} />
                </Link>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {isEdit ? 'Edit Attribute' : 'Create Attribute'}
                </h1>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <form onSubmit={submit} className="p-5 space-y-5">
                    {/* General error message */}
                    {Object.keys(errors).length > 0 && (
                        <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                                Please fix the following errors:
                            </p>
                            <ul className="mt-1 text-xs text-red-600 dark:text-red-400 list-disc list-inside">
                                {Object.entries(errors).map(([key, message]) => (
                                    <li key={key}>{message}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Attribute Name *
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., Size, Weight, Volume"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full px-3 py-2 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Values ({values.length})
                            </label>
                            <button
                                type="button"
                                onClick={addValue}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
                            >
                                <Plus size={14} />
                                Add
                            </button>
                        </div>
                        
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="w-12 px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">#</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Value (Number)</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Slug</th>
                                        <th className="w-12 px-3 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {values.map((val, i) => (
                                        <tr key={i} className="bg-white dark:bg-gray-800">
                                            <td className="px-3 py-2">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">{i + 1}</span>
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    placeholder="e.g., 100"
                                                    value={val.value}
                                                    onChange={(e) => updateValue(i, 'value', e.target.value)}
                                                    className={`w-full px-2 py-1.5 rounded border ${errors[`values.${i}.value`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                                                />
                                                {errors[`values.${i}.value`] && (
                                                    <p className="text-red-500 text-xs mt-0.5">{errors[`values.${i}.value`]}</p>
                                                )}
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="text"
                                                    placeholder="e.g., small, medium"
                                                    value={val.slug}
                                                    onChange={(e) => updateValue(i, 'slug', e.target.value)}
                                                    className={`w-full px-2 py-1.5 rounded border ${errors[`values.${i}.slug`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                                                />
                                                {errors[`values.${i}.slug`] && (
                                                    <p className="text-red-500 text-xs mt-0.5">{errors[`values.${i}.slug`]}</p>
                                                )}
                                            </td>
                                            <td className="px-3 py-2">
                                                {values.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeValue(i)}
                                                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded transition"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {errors.values && <p className="text-red-500 text-xs mt-1">{errors.values}</p>}
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Link
                            href="/admin/attributes"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium"
                        >
                            <ArrowLeft size={16} />
                            Back
                        </Link>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium"
                        >
                            <Check size={16} />
                            {isEdit ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}