import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import Form from './Form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Slides', href: '/admin/slides' },
    { title: 'Add Slide', href: '#' },
];

export default function Create() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Slide" />
            <Form isEdit={false} />
        </AppLayout>
    );
}
