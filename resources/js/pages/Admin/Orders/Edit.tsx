
// Edit.tsx
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import OrderForm, { type OrderFormData } from './Form';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Orders', href: '/admin/orders' },
  { title: 'Edit', href: '#' },
];

type Customer = { id: number; first_name: string; last_name: string; phone: string };
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
}

export default function Edit({ order, customers, products }: EditProps) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit Order: ${order.order_number}`} />
      <OrderForm order={order} customers={customers} products={products} isEdit={true} />
    </AppLayout>
  );
}