import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import Form from './Form';

type Blog = { id: number; title: string };

interface BlogComment {
    id: number;
    blog_id?: number | null;
    comments: string;
    status: 'pending' | 'approved' | 'rejected';
}

interface Props {
    blogComment: BlogComment;
    blogs?: Blog[];
}

export default function Edit({ blogComment, blogs = [] }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Blog Comments', href: '/admin/blogscomments' },
        { title: `Edit #${blogComment.id}`, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Blog Comment" />
            <Form
                initialData={blogComment}
                blogs={blogs}
                isEdit={true}
            />
        </AppLayout>
    );
}
