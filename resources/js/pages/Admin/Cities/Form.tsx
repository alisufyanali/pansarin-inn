import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import { MapPin, Save } from 'lucide-react';
import FieldError from '@/components/FieldError';
import PageHeader from '@/components/PageHeader';
import { inputClass, cardClass, labelClass, buttonPrimaryClass, buttonSecondaryClass } from '@/utils/formStyles';

type Province = { value: string; label: string };

export type CityFormData = {
    name: string;
    shipping_charges: string | number;
    province: string;
};

interface CityFormProps {
    city?: CityFormData & { id?: number };
    provinces: Province[];
    isEdit?: boolean;
}

export default function Form({ city, provinces, isEdit = false }: CityFormProps) {
    const { data, setData, errors, post, put, processing } = useForm<CityFormData>({
        name: city?.name || '',
        shipping_charges: city?.shipping_charges || '',
        province: city?.province || '',
    });

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (isEdit && city?.id) {
            put(`/admin/cities/${city.id}`);
        } else {
            post('/admin/cities');
        }
    }

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <PageHeader
                title={isEdit ? 'Edit City' : 'New City'}
                backUrl="/admin/cities"
            />

            <form onSubmit={submit}>
                <div className={cardClass}>
                    <div className="flex items-center gap-2 mb-4">
                        <MapPin className="w-5 h-5 text-gray-600" />
                        <h3 className="font-semibold text-lg">City Details</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className={labelClass}>
                                City Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Karachi"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className={inputClass(errors.name)}
                                required
                            />
                            <FieldError message={errors.name} />
                        </div>

                        <div>
                            <label className={labelClass}>
                                Province <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.province}
                                onChange={e => setData('province', e.target.value)}
                                className={inputClass(errors.province)}
                                required
                            >
                                <option value="">Select a province</option>
                                {provinces.map(p => (
                                    <option key={p.value} value={p.value}>
                                        {p.label}
                                    </option>
                                ))}
                            </select>
                            <FieldError message={errors.province} />
                        </div>

                        <div>
                            <label className={labelClass}>
                                Shipping Charges (PKR) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="e.g. 300"
                                value={data.shipping_charges}
                                onChange={e => setData('shipping_charges', e.target.value)}
                                className={inputClass(errors.shipping_charges)}
                                required
                            />
                            <FieldError message={errors.shipping_charges} />
                        </div>
                    </div>
                </div>

                <div className={cardClass + ' mt-6'}>
                    <div className="space-y-3">
                        <button type="submit" disabled={processing} className={buttonPrimaryClass}>
                            <Save className="w-4 h-4" />
                            {processing ? 'Saving...' : isEdit ? 'Update City' : 'Create City'}
                        </button>
                        <Link href="/admin/cities" className={buttonSecondaryClass}>
                            Cancel
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
}
