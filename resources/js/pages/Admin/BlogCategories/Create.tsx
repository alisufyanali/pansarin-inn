import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import BlogCategoryForm from './Form';
const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Blog Categories', href: '/admin/blogcategories' },
  { title: 'Create', href: '#' },
];

type BlogCategory = { id: number; name: string };

interface Props {
  parents: BlogCategory[];
}

export default function Create({ parents }: Props) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Blog Category" />
      <BlogCategoryForm parents={parents} isEdit={false} />
    </AppLayout>
  );
}