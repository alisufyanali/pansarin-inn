import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import CategoryForm from './Form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Categories', href: '/categories' },
    { title: 'Create', href: '/categories/create' },
];

type Category = { id: number; name: string };

export default function Create({ categories }: { categories: Category[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Category" />
            <CategoryForm categories={categories} isEdit={false} />
        </AppLayout>
    );
}
