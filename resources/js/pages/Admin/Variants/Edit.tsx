import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import VariantForm, { type VariantFormData } from './Form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Variants', href: '/product-variants' },
    { title: 'Edit', href: '#' },
];

type Product = { id: number; name: string; price: number };
type AttributeValue = { id: number; value: string; slug: string };
type Attribute = { id: number; name: string; slug: string; values: AttributeValue[] };
type Variant = VariantFormData & { id: number };

export default function Edit({ variant, products, attributes }: { variant: Variant; products: Product[]; attributes: Attribute[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Variant ${variant.sku}`} />
            <VariantForm variant={variant} products={products} attributes={attributes} isEdit={true} />
        </AppLayout>
    );
}
