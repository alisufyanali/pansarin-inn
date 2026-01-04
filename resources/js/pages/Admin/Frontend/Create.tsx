import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import Form from './Form';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Frontend', href: '/admin/frontend' },
  { title: 'Create', href: '/admin/frontend/create' },
];

export default function Create() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Frontend Content" />
      <Form isEdit={false} />
    </AppLayout>
  );
}