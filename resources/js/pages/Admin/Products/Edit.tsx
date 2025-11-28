import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import ProductForm, { type ProductFormData } from './Form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Products', href: '/Products' },
    { title: 'Edit', href: '#' },
];

type Category = { id: number; name: string };
type Vendor = { id: number; shop_name: string };

interface Product extends ProductFormData {
    id: number;
}

export default function Edit({ product, categories, vendors }: { product: Product; categories: Category[]; vendors: Vendor[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${product.name}`} />
            <ProductForm product={product} categories={categories} vendors={vendors} isEdit={true} />
        </AppLayout>
    );
}