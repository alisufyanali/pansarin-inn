import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import ProductForm from './Form';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Products', href: '/admin/products' },
    { title: 'Create', href: '/admin/products/create' },
];

type Category = { id: number; name: string };
type Attribute = { id: number; name: string; slug: string; category_id: number; values: any[] };

interface CreateProps {
    categories: Category[];
    attributes: Attribute[];
}

export default function Create({ categories, attributes }: CreateProps) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Product" />
            <ProductForm categories={categories} attributes={attributes} isEdit={false} />
        </AppLayout>
    );
}