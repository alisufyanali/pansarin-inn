import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import AttributeForm from './Form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Attributes', href: '/admin/attributes' },
    { title: 'Create', href: '/admin/attributes/create' },
];

type Category = { id: number; name: string };

interface CreateProps {
    categories: Category[];
}

export default function Create({ categories }: CreateProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Attribute" />
            <AttributeForm isEdit={false} categories={categories} />
        </AppLayout>
    );
}
