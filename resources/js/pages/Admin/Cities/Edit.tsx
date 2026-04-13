import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import Form, { type CityFormData } from './Form';

type Province = { value: string; label: string };

interface EditProps {
    city: CityFormData & { id: number };
    provinces: Province[];
}

export default function Edit({ city, provinces }: EditProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Cities', href: '/admin/cities' },
        { title: city.name, href: `/admin/cities/${city.id}` },
        { title: 'Edit', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit City: ${city.name}`} />
            <Form city={city} provinces={provinces} isEdit={true} />
        </AppLayout>
    );
}
