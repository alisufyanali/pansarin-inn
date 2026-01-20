import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import SaleForm, { SaleFormData } from './Form';

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

interface EditProps {
    sale: SaleFormData & { id: number; sale_code: string };
    orders: Order[];
    customers: Customer[];
    products: Product[];
}

export default function Edit({ sale, orders, customers, products }: EditProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Sales', href: '/admin/sales' },
        { title: sale.sale_code, href: `/admin/sales/${sale.id}` },
        { title: 'Edit', href: `/admin/sales/${sale.id}/edit` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Sale - ${sale.sale_code}`} />
            <SaleForm sale={sale} orders={orders} customers={customers} products={products} isEdit={true} />
        </AppLayout>
    );
}