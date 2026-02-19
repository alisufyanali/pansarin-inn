import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import PermissionForm from './Form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Permissions', href: '/admin/permissions' },
    { title: 'Create', href: '/admin/permissions/create' },
];

export default function Create() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Permission" />
            <PermissionForm isEdit={false} />
        </AppLayout>
    );
}
