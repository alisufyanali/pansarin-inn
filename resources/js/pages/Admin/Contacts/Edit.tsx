import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import Form from './Form';

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  admin_reply: string | null;
}

interface EditProps {
  contact: Contact;
}

export default function Edit({ contact }: EditProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Contacts', href: '/admin/contacts' },
    { title: contact.subject, href: `/admin/contacts/${contact.id}` },
    { title: 'Edit', href: '#' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit Contact - ${contact.subject}`} />
      <Form 
        contact={{
          id: contact.id,
          name: contact.name,
          email: contact.email,
          phone: contact.phone || '',
          subject: contact.subject,
          message: contact.message,
          status: contact.status,
          admin_reply: contact.admin_reply || '',
        }}
        isEdit={true} 
      />
    </AppLayout>
  );
}