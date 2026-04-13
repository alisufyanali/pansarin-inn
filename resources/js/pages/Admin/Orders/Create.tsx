import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import OrderForm from './Form';
import { type CityOption } from '@/components/CityDropdown';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Orders', href: '/admin/orders' },
  { title: 'Create', href: '/admin/orders/create' },
];

type Customer = { id: number; first_name: string; last_name: string; phone: string; email: string | null; address: string | null; address2: string | null; city_id: number | null };
type Product = { 
  id: number; 
  name: string; 
  sku: string; 
  price: number; 
  stock: number;
  variants?: Array<{ id: number; name: string; price: number; stock: number }>;
};

interface CreateProps {
  customers: Customer[];
  products: Product[];
  cities: CityOption[];
}

export default function Create({ customers, products, cities }: CreateProps) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Order" />
      <OrderForm customers={customers} products={products} cities={cities} isEdit={false} />
    </AppLayout>
  );
}
