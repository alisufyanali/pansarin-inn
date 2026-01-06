import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import CustomerForm, { type CustomerFormData } from './Form';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Customers', href: '/admin/customers' },
  { title: 'Edit', href: '#' },
];

type City = { id: number; name: string };

interface EditProps {
  customer: CustomerFormData & { 
    id: number;
    city?: City;
  };
  cities: City[];
}

export default function Edit({ customer, cities }: EditProps) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit Customer: ${customer.first_name} ${customer.last_name || ''}`} />
      <CustomerForm customer={customer} cities={cities} isEdit={true} />
    </AppLayout>
  );
}