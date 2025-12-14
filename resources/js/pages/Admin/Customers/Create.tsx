import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import CustomerForm from './Form';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Customers', href: '/admin/customers' },
  { title: 'Create', href: '/admin/customers/create' },
];

type User = { id: number; name: string; email: string };

export default function Create({ users }: { users: User[] }) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Customer" />
      <CustomerForm users={users} isEdit={false} />
    </AppLayout>
  );
}