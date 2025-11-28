import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import VariantForm from './Form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Variants', href: '/product-variants' },
    { title: 'Create', href: '/product-variants/create' },
];

type Product = { id: number; name: string; price: number };
type AttributeValue = { id: number; value: string; slug: string };
type Attribute = { id: number; name: string; slug: string; values: AttributeValue[] };

export default function Create({ products, attributes }: { products: Product[]; attributes: Attribute[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Variant" />
            <VariantForm products={products} attributes={attributes} isEdit={false} />
        </AppLayout>
    );
}
