import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import Form, { type BlogFormData } from './Form';

interface BlogTag {
    id: number;
    name: string;
    slug: string;
    color: string;
}

type BlogCategory = { id: number; name: string };

interface Props {
    blog: BlogFormData & {
        id: number;
        thumbnail?: string;
        social_image?: string;
        tags?: BlogTag[];
    };
    categories: BlogCategory[];
    tags: BlogTag[];
}

export default function Edit({ blog, categories, tags }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Blogs', href: '/admin/blogs' },
        { title: blog.title, href: `/admin/blogs/${blog.id}` },
        { title: 'Edit', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${blog.title}`} />
            <Form
                initialData={blog}
                categories={categories}
                tags={tags}
                isEdit={true}
            />
        </AppLayout>
    );
}