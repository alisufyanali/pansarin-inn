// Create.tsx
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import CouponForm from './Form';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Coupons', href: '/admin/coupons' },
  { title: 'Create', href: '/admin/coupons/create' },
];

type Product = { id: number; name: string };
type Category = { id: number; name: string };

interface CreateProps {
  products: Product[];
  categories: Category[];
}

export default function Create({ products, categories }: CreateProps) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Coupon" />
      <CouponForm products={products} categories={categories} isEdit={false} />
    </AppLayout>
  );
}