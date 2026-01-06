import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import NewsletterForm from './Form';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Newsletter', href: '/admin/newsletters' },
  { title: 'Create', href: '#' },
];

export default function Create() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Newsletter Subscriber" />
      <NewsletterForm isEdit={false} />
    </AppLayout>
  );
}