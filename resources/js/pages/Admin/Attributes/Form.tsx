import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, Check, Plus, X } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface AttributeFormProps {
    attribute?: { id: number; name: string; values: Array<{ id: number; value: string }> };
    isEdit?: boolean;
}

export default function AttributeForm({ attribute, isEdit = false }: AttributeFormProps) {
    const [values, setValues] = useState<string[]>(attribute?.values?.map(v => v.value) || ['']);
    
    const { data, setData, post, put, processing, errors } = useForm({
        name: attribute?.name || '',
        values: attribute?.values?.map(v => v.value) || [''],
    });

    const addValue = () => {
        const newValues = [...values, ''];
        setValues(newValues);
        setData('values', newValues);
    };

    const removeValue = (index: number) => {
        const newValues = values.filter((_, i) => i !== index);
        setValues(newValues);
        setData('values', newValues);
    };

    const updateValue = (index: number, value: string) => {
        const newValues = [...values];
        newValues[index] = value;
        setValues(newValues);
        setData('values', newValues);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!data.name.trim()) {
            alert('Write Attribute Name');
            return;
        }
        
        if (values.every(v => !v.trim())) {
            alert('Add at least one attribute value');
            return;
        }

        const filledValues = values.filter(v => v.trim());
        
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Attribute Name *
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., Size, Color, Type"
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
                        
                        <div className="space-y-2">
                            {values.map((val, i) => (
                                <div key={i} className="flex gap-2 items-center">
                                    <span className="w-7 h-7 flex items-center justify-center rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium">
                                        {i + 1}
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Enter value"
                                        value={val}
                                        onChange={(e) => updateValue(i, e.target.value)}
                                        className="flex-1 px-3 py-2 rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                    {values.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeValue(i)}
                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md transition"
                                        >
                                            <X size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
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