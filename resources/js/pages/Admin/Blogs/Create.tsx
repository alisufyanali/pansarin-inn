import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import Form from './Form';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Blogs', href: '/admin/blogs' },
  { title: 'Create', href: '/admin/blogs/create' },
];

interface BlogTag {
    id: number;
    name: string;
    slug: string;
    color: string;
}

type BlogCategory = { id: number; name: string };

interface Props {
    categories: BlogCategory[];
    tags: BlogTag[];
}

export default function Create({ categories, tags }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Blog Post" />
            <Form categories={categories} tags={tags} isEdit={false} />
        </AppLayout>
    );
}