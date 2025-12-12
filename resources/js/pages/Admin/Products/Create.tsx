import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import ProductForm from './Form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Products', href: '/admin/products' },
    { title: 'Create', href: '/admin/products/create' },
];

type Category = { id: number; name: string };
type Vendor = { id: number; shop_name: string };

export default function Create({ categories, vendors }: { categories: Category[]; vendors: Vendor[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Product" />
            <ProductForm categories={categories} vendors={vendors} isEdit={false} />
        </AppLayout>
    );
}