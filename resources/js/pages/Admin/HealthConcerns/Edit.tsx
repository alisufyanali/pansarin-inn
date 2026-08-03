import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import Form from './Form';

interface HealthConcern {
    id: number;
    name: string;
    slug: string;
    icon?: string;
    status: boolean;
    sort_order: number;
}

interface Props {
    concern: HealthConcern;
}

export default function Edit({ concern }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Health Concerns', href: '/admin/health-concerns' },
        { title: concern.name, href: '#' },
        { title: 'Edit', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${concern.name}`} />
            <Form
                concern={{
                    id:         concern.id,
                    name:       concern.name,
                    slug:       concern.slug,
                    icon:       concern.icon as any,
                    status:     concern.status,
                    sort_order: concern.sort_order,
                }}
                isEdit={true}
            />
        </AppLayout>
    );
}
