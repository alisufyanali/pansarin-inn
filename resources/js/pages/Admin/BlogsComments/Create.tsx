import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import BlogCommentForm from './Form';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Blog Comments', href: '/admin/blogsComments' },
  { title: 'Create', href: '#' },
];

type Blog = { id: number; title: string };

interface Props {
  blogs?: Blog[];
}

export default function Create({ blogs = [] }: Props) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Blog Comment" />
      <BlogCommentForm blogs={blogs} isEdit={false} />
    </AppLayout>
  );
}