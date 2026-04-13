import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { MapPin, Pencil } from 'lucide-react';
import { cardClass } from '@/utils/formStyles';

interface City {
    id: number;
    name: string;
    shipping_charges: number;
    province: string;
    created_at: string;
    updated_at: string;
}

const provinceLabel: Record<string, string> = {
    sindh: 'Sindh',
    punjab: 'Punjab',
    balochistan: 'Balochistan',
    kpk: 'KPK',
    gilgit: 'Gilgit-Baltistan',
    azad_kashmir: 'Azad Kashmir',
};

export default function Show({ city }: { city: City }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Cities', href: '/admin/cities' },
        { title: city.name, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`City: ${city.name}`} />

            <div className="p-4 max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <MapPin className="w-6 h-6" />
                        {city.name}
                    </h1>
                    <Link
                        href={`/admin/cities/${city.id}/edit`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <Pencil className="w-4 h-4" />
                        Edit
                    </Link>
                </div>

                <div className={cardClass}>
                    <dl className="divide-y divide-gray-200 dark:divide-gray-700">
                        <div className="py-3 flex justify-between">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">City Name</dt>
                            <dd className="text-sm font-semibold text-gray-900 dark:text-white">{city.name}</dd>
                        </div>
                        <div className="py-3 flex justify-between">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Province</dt>
                            <dd className="text-sm font-semibold text-gray-900 dark:text-white">
                                {provinceLabel[city.province] ?? city.province}
                            </dd>
                        </div>
                        <div className="py-3 flex justify-between">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Shipping Charges</dt>
                            <dd className="text-sm font-semibold text-green-600 dark:text-green-400">
                                PKR {Number(city.shipping_charges).toLocaleString()}
                            </dd>
                        </div>
                        <div className="py-3 flex justify-between">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</dt>
                            <dd className="text-sm text-gray-700 dark:text-gray-300">
                                {new Date(city.created_at).toLocaleDateString()}
                            </dd>
                        </div>
                    </dl>
                </div>

                <div className="mt-4">
                    <Link href="/admin/cities" className="text-sm text-blue-600 hover:underline">
                        ← Back to Cities
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
