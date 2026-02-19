import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import PermissionForm, { type PermissionFormData } from './Form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Permissions', href: '/admin/permissions' },
    { title: 'Edit', href: '#' },
];

type Permission = PermissionFormData & { id: number };

export default function Edit({ permission }: { permission: Permission }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${permission.name}`} />
            <PermissionForm permission={permission} isEdit={true} />
        </AppLayout>
    );
}
