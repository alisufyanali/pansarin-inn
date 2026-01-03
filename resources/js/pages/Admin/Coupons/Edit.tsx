// Edit.tsx
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import CouponForm, { type CouponFormData } from './Form';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Coupons', href: '/admin/coupons' },
  { title: 'Edit', href: '#' },
];

type Product = { id: number; name: string };
type Category = { id: number; name: string };

interface EditProps {
  coupon: CouponFormData & { id: number };
  products: Product[];
  categories: Category[];
}

export default function Edit({ coupon, products, categories }: EditProps) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit Coupon: ${coupon.code}`} />
      <CouponForm coupon={coupon} products={products} categories={categories} isEdit={true} />
    </AppLayout>
  );
}