import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import Form from './Form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Blog Tags', href: '/admin/blogtags' }, // CHANGED
    { title: 'Create', href: '/admin/blogtags/create' }, // CHANGED
];

export default function Create() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Blog Tag" />
            <Form isEdit={false} />
        </AppLayout>
    );
}