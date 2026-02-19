import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import Form from './Form';

interface Category {
    id: number;
    name: string;
    slug: string;
    parent_id?: string | number | null;
    image?: string;
    status: boolean;
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
    schema_markup?: string;
    social_image?: string;
    social_description?: string;
}

type CategoryOption = { id: number; name: string };

export default function Edit({ category, categories }: { category: Category; categories: CategoryOption[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Categories', href: '/admin/categories' },
        { title: category.name, href: `/admin/categories/${category.id}` },
        { title: 'Edit', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${category.name}`} />
            <Form 
                category={{
                    id: category.id,
                    name: category.name,
                    slug: category.slug,
                    parent_id: category.parent_id ?? '',
                    image: category.image as any,
                    status: category.status,
                    meta_title: category.meta_title,
                    meta_description: category.meta_description,
                    meta_keywords: category.meta_keywords,
                    schema_markup: category.schema_markup,
                    social_image: category.social_image as any,
                    social_description: category.social_description,
                }}
                categories={categories} 
                isEdit={true} 
            />
        </AppLayout>
    );
}
