import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import NewsletterForm from './Form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Newsletter', href: '/admin/newsletters' },
    { title: 'Add Subscriber', href: '#' },
];

export default function Create() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Newsletter Subscriber" />
            <div className="p-4">
                <NewsletterForm />
            </div>
        </AppLayout>
    );
}
