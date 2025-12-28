import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import BlogForm, { type BlogFormData } from './Form';

type BlogCategory = { id: number; name: string };

interface Props {
  blog: BlogFormData & { 
    id: number; 
    thumbnail?: string; 
    social_image?: string;
  };
  categories: BlogCategory[];
}

export default function Edit({ blog, categories }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Blogs', href: '/admin/blogs' },
    { title: blog.title, href: `/admin/blogs/${blog.id}` },
    { title: 'Edit', href: '#' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit ${blog.title}`} />
      <BlogForm 
        blog={blog} 
        categories={categories} 
        isEdit={true} 
      />
    </AppLayout>
  );
}