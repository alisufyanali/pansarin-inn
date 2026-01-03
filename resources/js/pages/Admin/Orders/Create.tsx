// Create.tsx
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import OrderForm from './Form';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Orders', href: '/admin/orders' },
  { title: 'Create', href: '/admin/orders/create' },
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

interface CreateProps {
  customers: Customer[];
  products: Product[];
}

export default function Create({ customers, products }: CreateProps) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Order" />
      <OrderForm customers={customers} products={products} isEdit={false} />
    </AppLayout>
  );
}
