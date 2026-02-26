import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Edit2, Mail, Phone, User, MessageSquare, Send } from 'lucide-react';
import { useState } from 'react';
import InfoRow from '@/components/InfoRow';
import SectionCard from '@/components/SectionCard';
import PageHeader, { ActionButton } from '@/components/PageHeader';
import TimelineCard from '@/components/TimelineCard';

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  admin_reply: string | null;
  replied_at: string | null;
  replied_by: number | null;
  replied_by_user?: {
    id: number;
    name: string;
  };
  ip_address: string | null;
  user_agent: string | null;
  referrer: string | null;
  created_at: string;
  updated_at: string;
}

interface ShowProps {
  contact: Contact;
}

export default function Show({ contact }: ShowProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  
  const { data, setData, post, processing, errors } = useForm({
    admin_reply: '',
  });

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Contacts', href: '/admin/contacts' },
    { title: contact.subject, href: '#' },
  ];

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    read: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    replied: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    resolved: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    spam: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/admin/contacts/${contact.id}/reply`, {
      onSuccess: () => {
        setShowReplyForm(false);
        setData('admin_reply', '');
        window.location.reload();
      },
    });
  };

  const updateStatus = (status: string) => {
    const statusForm = useForm({ status });
    statusForm.patch(`/admin/contacts/${contact.id}/status`, {
      onSuccess: () => window.location.reload(),
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Contact - ${contact.subject}`} />

      <div className="p-3">
        <PageHeader
          title={contact.subject}
          backUrl="/admin/contacts"
          actions={<ActionButton href={`/admin/contacts/${contact.id}/edit`} icon={Edit2} label="Edit Contact" />}
        />

        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <SectionCard title="Contact Information" icon={User}>
                <div className="space-y-4">
                  <InfoRow label="Name" value={contact.name} />
                  <InfoRow 
                    label="Email" 
                    value={
                      <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline dark:text-blue-400">
                        {contact.email}
                      </a>
                    } 
                  />
                  {contact.phone && (
                    <InfoRow 
                      label="Phone" 
                      value={
                        <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline dark:text-blue-400">
                          {contact.phone}
                        </a>
                      } 
                    />
                  )}
                  {contact.ip_address && (
                    <InfoRow label="IP Address" value={contact.ip_address} mono />
                  )}
                </div>
              </SectionCard>

              <SectionCard title="Message" icon={MessageSquare}>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {contact.message}
                  </p>
                </div>
              </SectionCard>

              {contact.admin_reply && (
                <SectionCard title="Admin Reply" icon={Send}>
                  <div className="space-y-4">
                    <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                        {contact.admin_reply}
                      </p>
                    </div>
                    {contact.replied_by_user && contact.replied_at && (
                      <InfoRow 
                        label="Replied By" 
                        value={`${contact.replied_by_user.name} on ${new Date(contact.replied_at).toLocaleString()}`} 
                      />
                    )}
                  </div>
                </SectionCard>
              )}

              {!contact.admin_reply && (
                <SectionCard title="Reply" icon={Send}>
                  {!showReplyForm ? (
                    <button
                      onClick={() => setShowReplyForm(true)}
                      className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition"
                    >
                      <Send className="w-4 h-4" />
                      Reply to this message
                    </button>
                  ) : (
                    <form onSubmit={handleReply} className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Write Your Reply
                      </h3>
                      <textarea
                        value={data.admin_reply}
                        onChange={(e) => setData('admin_reply', e.target.value)}
                        rows={6}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Type your reply here..."
                        required
                      />
                      {errors.admin_reply && (
                        <p className="mt-1 text-sm text-red-600">{errors.admin_reply}</p>
                      )}
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={processing}
                          className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-lg font-medium transition"
                        >
                          Send Reply
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowReplyForm(false)}
                          className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </SectionCard>
              )}
            </div>

            <div className="space-y-6">
              <SectionCard title="Status" icon={Mail}>
                <span className={`inline-flex rounded-full px-4 py-2 text-sm font-medium ${statusColors[contact.status]}`}>
                  {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                </span>
              </SectionCard>

              <SectionCard title="Quick Actions" icon={MessageSquare}>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateStatus('read')}
                    className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-xs font-medium transition"
                  >
                    Mark as Read
                  </button>
                  <button
                    onClick={() => updateStatus('resolved')}
                    className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-xs font-medium transition"
                  >
                    Mark as Resolved
                  </button>
                  <button
                    onClick={() => updateStatus('spam')}
                    className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition"
                  >
                    Mark as Spam
                  </button>
                  <button
                    onClick={() => updateStatus('new')}
                    className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition"
                  >
                    Mark as New
                  </button>
                </div>
              </SectionCard>

              <TimelineCard
                createdAt={contact.created_at}
                updatedAt={contact.updated_at}
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
