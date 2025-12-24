import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import CategoryForm, { type CategoryFormData } from './Form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Categories', href: '/categories' },
    { title: 'Edit', href: '#' },
];

type Category = CategoryFormData & { id: number };

export default function Edit({ category, categories }: { category: Category; categories: Category[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${category.name}`} />
            <CategoryForm category={category} categories={categories} isEdit={true} />
        </AppLayout>
    );
}
