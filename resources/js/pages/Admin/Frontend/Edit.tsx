import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import Form from './Form';
import { type BreadcrumbItem } from '@/types';

interface FrontendContent {
  id: number;
  type: 'carousel' | 'banner';
  title: string;
  order: number;
  is_active: boolean;
  link?: string;
  description?: string;
  image?: string;
}

interface Props {
  frontendContent: FrontendContent;
}

export default function Edit({ frontendContent }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Frontend', href: '/admin/frontend' },
    { title: frontendContent.title || 'Edit', href: '#' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit ${frontendContent.title || 'Content'}`} />
      <Form initialData={frontendContent} isEdit={true} />
    </AppLayout>
  );
}