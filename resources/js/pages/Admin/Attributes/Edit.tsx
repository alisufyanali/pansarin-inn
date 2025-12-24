import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import AttributeForm from './Form';

type AttributeValue = { id: number; value: string };
type Attribute = { id: number; name: string; values: AttributeValue[] };

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Attributes', href: '/admin/attributes' },
    { title: 'Edit', href: '/admin/attributes/:id/edit' },
];

export default function Edit({ attribute }: { attribute: Attribute }) {
    const breadcrumbsWithId = [
        { title: 'Attributes', href: '/admin/attributes' },
        { title: `Edit: ${attribute.name}`, href: `/admin/attributes/${attribute.id}/edit` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbsWithId}>
            <Head title={`Edit ${attribute.name}`} />
            <AttributeForm attribute={attribute} isEdit={true} />
        </AppLayout>
    );
}
