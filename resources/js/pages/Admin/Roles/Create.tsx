import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import RoleForm from './Form';

type Permission = {
    id: number;
    name: string;
    category?: string;
};

interface CreateProps {
    permissions: Permission[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Roles', href: '/admin/roles' },
    { title: 'Create', href: '/admin/roles/create' },
];

export default function Create({ permissions }: CreateProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Role" />
            <RoleForm permissions={permissions} isEdit={false} />
        </AppLayout>
    );
}