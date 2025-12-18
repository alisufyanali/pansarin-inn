import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import ProductForm, { type ProductFormData } from './Form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Products', href: '/Products' },
    { title: 'Edit', href: '#' },
];

type Category = { id: number; name: string };
type Attribute = { id: number; name: string; slug: string; values: any[] };

interface Product extends ProductFormData {
    id: number;
}

export default function Edit({ product, categories, attributes }: { product: Product; categories: Category[]; attributes: Attribute[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${product.name}`} />
            <ProductForm product={product} categories={categories} attributes={attributes} isEdit={true} />
        </AppLayout>
    );
}