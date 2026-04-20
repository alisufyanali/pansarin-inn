import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import Form from './Form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Slides', href: '/admin/slides' },
    { title: 'Edit Slide', href: '#' },
];

export default function Edit({ slide }: any) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Slide" />
            <Form slide={slide} isEdit={true} />
        </AppLayout>
    );
}
