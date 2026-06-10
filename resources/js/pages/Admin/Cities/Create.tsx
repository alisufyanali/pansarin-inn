import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import Form from './Form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Cities', href: '/admin/cities' },
    { title: 'Create', href: '/admin/cities/create' },
];

type Province = { value: string; label: string };

export default function Create({ provinces }: { provinces: Province[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create City" />
            <Form provinces={provinces} isEdit={false} />
        </AppLayout>
    );
}
