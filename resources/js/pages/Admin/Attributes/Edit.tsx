import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import AttributeForm from './Form';

type AttributeValue = { id: number; value: number; slug: string };
type Attribute = { id: number; name: string; category_id: number; values: AttributeValue[] };
type Category = { id: number; name: string };

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Attributes', href: '/admin/attributes' },
    { title: 'Edit', href: '/admin/attributes/:id/edit' },
];

interface EditProps {
    attribute: Attribute;
    categories: Category[];
}

export default function Edit({ attribute, categories }: EditProps) {
    const breadcrumbsWithId = [
        { title: 'Attributes', href: '/admin/attributes' },
        { title: `Edit: ${attribute.name}`, href: `/admin/attributes/${attribute.id}/edit` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbsWithId}>
            <Head title={`Edit ${attribute.name}`} />
            <AttributeForm attribute={attribute} isEdit={true} categories={categories} />
        </AppLayout>
    );
}
