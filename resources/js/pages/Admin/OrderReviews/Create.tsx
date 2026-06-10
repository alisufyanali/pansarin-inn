import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import Form from './Form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Order Reviews', href: '/admin/order-reviews' },
    { title: 'Add Review', href: '#' },
];

export default function Create({ orders, customers }: any) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Review" />
            <Form orders={orders} customers={customers} isEdit={false} />
        </AppLayout>
    );
}
