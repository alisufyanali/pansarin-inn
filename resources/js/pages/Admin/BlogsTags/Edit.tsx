import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import Form, { type BlogTagFormData } from './Form';

interface EditProps {
    tag: BlogTagFormData & { id: number };
}

export default function Edit({ tag }: EditProps) {
    const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Blog Tags', href: '/admin/blogstags' }, // CHANGED
    { title: `Edit: ${tag.name}`, href: `/admin/blogstags/${tag.id}/edit` }, // CHANGED

    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${tag.name}`} />
            <Form initialData={tag} isEdit={true} />
        </AppLayout>
    );
}