import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import Form, { type CouponFormData } from './Form';

type Product = { id: number; name: string };
type Category = { id: number; name: string };

interface EditProps {
  coupon: CouponFormData & { id: number };
  products: Product[];
  categories: Category[];
}

export default function Edit({ coupon, products, categories }: EditProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Coupons', href: '/admin/coupons' },
    { title: coupon.code, href: `/admin/coupons/${coupon.id}` },
    { title: 'Edit', href: '#' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit Coupon: ${coupon.code}`} />
      <Form coupon={coupon} products={products} categories={categories} isEdit={true} />
    </AppLayout>
  );
}