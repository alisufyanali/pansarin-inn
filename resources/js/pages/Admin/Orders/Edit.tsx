import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import OrderForm, { type OrderFormData } from './Form';
import { type CityOption } from '@/components/CityDropdown';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Orders', href: '/admin/orders' },
  { title: 'Edit', href: '#' },
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

interface EditProps {
  order: OrderFormData & { 
    id: number;
    order_number: string;
  };
  customers: Customer[];
  products: Product[];
  cities: CityOption[];
}

export default function Edit({ order, customers, products, cities }: EditProps) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit Order: ${order.order_number}`} />
      <OrderForm order={order} customers={customers} products={products} cities={cities} isEdit={true} />
    </AppLayout>
  );
}