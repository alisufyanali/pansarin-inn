import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import Form from './Form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Blog Comments', href: '/admin/blogscomments' },
    { title: 'Create', href: '/admin/blogscomments/create' },
];

type Blog = { id: number; title: string };

interface Props {
    blogs?: Blog[];
}

export default function Create({ blogs = [] }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Blog Comment" />
            <Form blogs={blogs} isEdit={false} />
        </AppLayout>
    );
}
