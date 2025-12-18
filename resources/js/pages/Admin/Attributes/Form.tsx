import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, Check, Plus, Trash2 } from 'lucide-react';
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
            alert('Name likho');
            return;
        }
        
        if (values.every(v => !v.trim())) {
            alert('Kum az kum ek value add karo');
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
        <div className="p-3">
            <div className="flex items-center gap-2 mb-4">
                <Link
                    href="/admin/attributes"
                    className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10"
                >
                    <ArrowLeft />
                </Link>
            </div>

            <div className="py-6">
                <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                        {isEdit ? 'Edit Attribute' : 'Create Attribute'}
                    </h2>

                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Attribute Name *
                            </label>
                            <input
                                type="text"
                                placeholder="Size, Color, Type"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Values ({values.length})
                            </label>
                            <div className="space-y-2 bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4">
                                {values.map((val, i) => (
                                    <div key={i} className="flex gap-2 items-center">
                                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-bold">
                                            {i + 1}
                                        </span>
                                        <input
                                            type="text"
                                            placeholder="Value"
                                            value={val}
                                            onChange={(e) => updateValue(i, e.target.value)}
                                            className="flex-1 px-3 py-2 rounded-md bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                        {values.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeValue(i)}
                                                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {errors.values && <p className="text-red-500 text-xs mt-1">{errors.values}</p>}
                        </div>

                        <button
                            type="button"
                            onClick={addValue}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg transition"
                        >
                            <Plus size={18} />
                            Add Value
                        </button>

                        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Link
                                href="/admin/attributes"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg"
                            >
                                <ArrowLeft size={16} />
                                Back
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition"
                            >
                                <Check size={16} />
                                {isEdit ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
