import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import Form, { type BlogTagFormData } from './Form';

// Database se is_active 0/1 aata hai, isliye number | boolean dono allow karo
interface EditProps {
    blogTag: Omit<BlogTagFormData, 'is_active'> & {
        id: number;
        is_active: boolean | number;
    };
}

export default function Edit({ blogTag }: EditProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Blog Tags', href: '/admin/blogtags' },
        { title: `Edit: ${blogTag.name}`, href: `/admin/blogtags/${blogTag.id}/edit` },
    ];

    // is_active ko explicitly boolean mein convert karo
    const initialData: BlogTagFormData & { id: number } = {
        ...blogTag,
        is_active: Boolean(blogTag.is_active),
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${blogTag.name}`} />
            <Form initialData={initialData} isEdit={true} />
        </AppLayout>
    );
}