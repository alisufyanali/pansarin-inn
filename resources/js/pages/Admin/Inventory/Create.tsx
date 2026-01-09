import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import InventoryForm from './Form';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Inventory', href: '/admin/inventory' },
  { title: 'Add Stock Entry', href: '/admin/inventory/create' },
];

type Product = {
  id: number;
  name: string;
  sku: string;
  stock_qty: number;
  stock_alert: number;
  price: number;
  unit?: string;
  attribute_values?: Array<{
    id: number;
    attribute_id: number;
    value: string;
    attribute?: {
      id: number;
      name: string;
    };
  }>;
};

interface Props {
  products: Product[];
}

export default function Create({ products }: Props) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Add Stock Entry" />
      <InventoryForm products={products} />
    </AppLayout>
  );
}