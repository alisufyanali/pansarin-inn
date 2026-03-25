import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import CustomerForm, { type CustomerFormData } from './Form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Customers', href: '/admin/customers' },
    { title: 'Edit', href: '#' },
];

type BasicModel = { id: number; name: string };

interface EditProps {
    customer: CustomerFormData & { 
        id: number;
        city?: { id: number; name: string; state_id: number };
    };
    countries: BasicModel[];
    states: BasicModel[];
    cities: BasicModel[];
    groups: BasicModel[];
    affiliates: BasicModel[];
}

export default function Edit({ customer, countries, states, cities, groups, affiliates }: EditProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Customer: ${customer.first_name} ${customer.last_name || ''}`} />
            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <CustomerForm 
                    customer={customer} 
                    countries={countries}
                    states={states}
                    cities={cities} 
                    groups={groups}
                    affiliates={affiliates}
                    isEdit={true} 
                />
            </div>
        </AppLayout>
    );
}