import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import SaleForm from './SaleForm';

interface Props {
    sale: any;
    customers: any[];
    products: any[];
}

export default function Edit({ sale, customers, products }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Sales', href: '/admin/sales' },
        { title: `Edit ${sale.sale_code}`, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Sale — ${sale.sale_code}`} />
            <SaleForm
                sale={sale}
                customers={customers}
                products={products}
                order={null}
                isEdit={true}
            />
        </AppLayout>
    );
}