import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import SaleForm from './SaleForm';

interface Props {
    customers: any[];
    products: any[];
    order: any | null;
}

export default function Create({ customers, products, order }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Sales', href: '/admin/sales' },
        { title: order ? `Create from #${order.order_number}` : 'Create Sale', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={order ? `Sale from ${order.order_number}` : 'Create Sale'} />
            <SaleForm
                customers={customers}
                products={products}
                order={order}
                isEdit={false}
            />
        </AppLayout>
    );
}