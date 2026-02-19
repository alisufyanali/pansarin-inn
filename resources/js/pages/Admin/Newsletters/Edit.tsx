import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import NewsletterForm, { type NewsletterFormData } from './Form';

interface Props {
    newsletter: NewsletterFormData & { id: number };
}

export default function Edit({ newsletter }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Newsletter Subscribers', href: '/admin/newsletters' },
        { title: newsletter.email, href: '#' },
        { title: 'Edit', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${newsletter.email}`} />
            <NewsletterForm newsletter={newsletter} isEdit={true} />
        </AppLayout>
    );
}
