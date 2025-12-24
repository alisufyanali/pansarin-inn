import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import ProductForm from './Form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Products', href: '/admin/products' },
    { title: 'Create', href: '/admin/products/create' },
];

type Category = { id: number; name: string };
type Attribute = { id: number; name: string; slug: string; values: any[] };

export default function Create({ categories, attributes }: { categories: Category[]; attributes: Attribute[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Product" />
            <ProductForm categories={categories} attributes={attributes} isEdit={false} />
        </AppLayout>
    );
}