import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import ContactForm from './Form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Contacts', href: '/admin/contacts' },
    { title: 'Create', href: '/admin/contacts/create' },
];

export default function Create() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Contact" />
            <ContactForm isEdit={false} />
        </AppLayout>
    );
}