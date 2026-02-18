import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import Form, { type BlogTagFormData } from './Form';

// Database se is_active 0/1 aata hai, isliye number | boolean dono allow karo
interface EditProps {
    tag: Omit<BlogTagFormData, 'is_active'> & {
        id: number;
        is_active: boolean | number;
    };
}

export default function Edit({ tag }: EditProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Blog Tags', href: '/admin/blogstags' },
        { title: `Edit: ${tag.name}`, href: `/admin/blogstags/${tag.id}/edit` },
    ];

    // is_active ko explicitly boolean mein convert karo
    const initialData: BlogTagFormData & { id: number } = {
        ...tag,
        is_active: Boolean(tag.is_active),
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${tag.name}`} />
            <Form initialData={initialData} isEdit={true} />
        </AppLayout>
    );
}