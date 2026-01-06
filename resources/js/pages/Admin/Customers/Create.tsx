import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import CustomerForm from './Form';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Customers', href: '/admin/customers' },
  { title: 'Create', href: '/admin/customers/create' },
];

type City = { id: number; name: string };

export default function Create({ cities }: { cities: City[] }) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Customer" />
      <CustomerForm cities={cities} isEdit={false} />
    </AppLayout>
  );
}