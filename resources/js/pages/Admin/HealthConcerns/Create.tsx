import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import Form from './Form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Health Concerns', href: '/admin/health-concerns' },
    { title: 'Create', href: '/admin/health-concerns/create' },
];

export default function Create() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Health Concern" />
            <Form isEdit={false} />
        </AppLayout>
    );
}
