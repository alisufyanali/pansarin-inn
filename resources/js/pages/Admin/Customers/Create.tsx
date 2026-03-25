import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import CustomerForm from './Form';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Customers', href: '/admin/customers' },
  { title: 'Create', href: '/admin/customers/create' },
];

// Types ko update karein taake TypeScript error na de
interface LocationItem { id: number; name: string; country_id?: number; state_id?: number; }
interface SimpleItem { id: number; name: string; }

interface CreateProps {
  countries: LocationItem[];
  states: LocationItem[];
  cities: LocationItem[];
  groups: SimpleItem[];
  affiliates: SimpleItem[];
}

export default function Create({ countries, states, cities, groups, affiliates }: CreateProps) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Customer" />
      <CustomerForm 
        countries={countries}
        states={states}
        cities={cities}
        groups={groups}
        affiliates={affiliates}
        isEdit={false} 
      />
    </AppLayout>
  );
}