import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import RoleForm, { type RoleFormData } from './Form';

type Permission = {
    id: number;
    name: string;
    category?: string;
};

type Role = RoleFormData & { id: number };

interface EditProps {
    role: Role;
    permissions: Permission[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Roles', href: '/admin/roles' },
    { title: 'Edit', href: '#' },
];

export default function Edit({ role, permissions }: EditProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${role.name}`} />
            <RoleForm role={role} permissions={permissions} isEdit={true} />
        </AppLayout>
    );
}