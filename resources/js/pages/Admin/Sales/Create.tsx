import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import SaleForm from './Form';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Sales', href: '/admin/sales' },
  { title: 'Create', href: '/admin/sales/create' },
];

type Customer = { id: number; first_name: string; last_name: string; phone: string; email: string | null };
type Order = { id: number; order_number: string; customer_id: number; grand_total: number };
type Product = { 
  id: number; 
  name: string; 
  sku: string; 
  price: number; 
  stock: number;
  variants?: Array<{ id: number; name: string; price: number; stock: number }>;
};

interface CreateProps {
  orders: Order[];
  customers: Customer[];
  products: Product[];
}

export default function Create({ orders, customers, products }: CreateProps) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Sale" />
      <SaleForm orders={orders} customers={customers} products={products} isEdit={false} />
    </AppLayout>
  );
}