import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import BlogForm from './Form';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Blogs', href: '/admin/blogs' },
  { title: 'Create', href: '#' },
];

type BlogCategory = { id: number; name: string };

interface Props {
  categories: BlogCategory[];
}

export default function Create({ categories }: Props) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Blog Post" />
      <BlogForm categories={categories} isEdit={false} />
    </AppLayout>
  );
}