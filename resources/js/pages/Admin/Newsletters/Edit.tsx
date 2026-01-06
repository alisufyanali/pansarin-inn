import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import BlogCategoryForm, { type BlogCategoryFormData } from './Form';

type BlogCategory = { id: number; name: string };

interface Props {
  blogCategory: BlogCategoryFormData & { id: number };
  parents: BlogCategory[];
}

export default function Edit({ blogCategory, parents }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Blog Categories', href: '/admin/blogcategories' },
    { title: blogCategory.name, href: '#' },
    { title: 'Edit', href: '#' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit ${blogCategory.name}`} />
      <BlogCategoryForm 
        blogCategory={blogCategory} 
        parents={parents} 
        isEdit={true} 
      />
    </AppLayout>
  );
}