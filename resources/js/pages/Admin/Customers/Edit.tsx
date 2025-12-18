import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import CustomerForm, { type CustomerFormData } from './Form';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Customers', href: '/admin/customers' },
  { title: 'Edit', href: '#' },
];

export default function Edit({ customer }: { customer: CustomerFormData & { id: number } }) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit Customer`} />
      <CustomerForm customer={customer} isEdit={true} />
    </AppLayout>
  );
}