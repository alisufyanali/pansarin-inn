import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import NewsletterForm from './Form';

interface Newsletter {
    id: number;
    email: string;
    name?: string;
    status: 'active' | 'unsubscribed' | 'bounced';
    source?: string;
    verified_at?: string | null;
}

interface Props {
    newsletter: Newsletter;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Newsletter', href: '/admin/newsletters' },
    { title: 'Edit Subscriber', href: '#' },
];

export default function Edit({ newsletter }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Newsletter Subscriber" />
            <div className="p-4">
                <NewsletterForm newsletter={newsletter} isEdit={true} />
            </div>
        </AppLayout>
    );
}
