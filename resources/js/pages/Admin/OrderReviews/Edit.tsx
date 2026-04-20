import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import Form from './Form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Order Reviews', href: '/admin/order-reviews' },
    { title: 'Edit Review', href: '#' },
];

export default function Edit({ review, orders, customers }: any) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Review" />
            <Form review={review} orders={orders} customers={customers} isEdit={true} />
        </AppLayout>
    );
}
