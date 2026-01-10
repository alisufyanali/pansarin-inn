import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import InventoryForm, { type InventoryFormData } from './Form';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Inventory', href: '/admin/inventory' },
  { title: 'Edit Entry', href: '#' },
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
  inventory: Omit<InventoryFormData, 'quantity' | 'unit'> & {
    id: number;
    quantity: number;
    unit?: string;
  };
  products: Product[];
}

export default function Edit({ inventory, products }: Props) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit Inventory Entry" />
      <InventoryForm inventory={inventory} products={products} isEdit />
    </AppLayout>
  );
}