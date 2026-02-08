
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Edit, Mail, Phone, Calendar, User, MessageSquare, Send } from 'lucide-react';
import { useState } from 'react';

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
    { title: contact.subject, href: `/admin/contacts/${contact.id}` },
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
      },
    });
  };

  const updateStatus = (status: string) => {
    useForm().patch(`/admin/contacts/${contact.id}/status`, {
      status,
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Contact - ${contact.subject}`} />

      <div className="p-3">
        <div className="flex items-center justify-between gap-2 mb-4">
          <Link
            href="/admin/contacts"
            className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10"
            title="Back"
          >
            <ArrowLeft />
          </Link>

          <Link
            href={`/admin/contacts/${contact.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </Link>
        </div>

        <div className="max-w-5xl w-full mx-auto space-y-6">
          {/* Header Card */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {contact.subject}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Received: {new Date(contact.created_at).toLocaleString()}
                </p>
              </div>
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${statusColors[contact.status]}`}>
                {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Contact Information
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Name</label>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {contact.name}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email
                </label>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                    {contact.email}
                  </a>
                </p>
              </div>
              {contact.phone && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Phone
                  </label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">
                      {contact.phone}
                    </a>
                  </p>
                </div>
              )}
              {contact.ip_address && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">IP Address</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {contact.ip_address}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Message
              </h2>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {contact.message}
              </p>
            </div>
          </div>

          {/* Admin Reply */}
          {contact.admin_reply && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Send className="w-5 h-5 text-green-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Admin Reply
                </h2>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-3">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {contact.admin_reply}
                </p>
              </div>
              {contact.replied_by_user && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Replied by {contact.replied_by_user.name} on {new Date(contact.replied_at!).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Reply Form */}
          {!contact.admin_reply && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
              {!showReplyForm ? (
                <button
                  onClick={() => setShowReplyForm(true)}
                  className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Reply to this message
                </button>
              ) : (
                <form onSubmit={handleReply}>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
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
                  <div className="flex gap-3 mt-4">
                    <button
                      type="submit"
                      disabled={processing}
                      className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-lg font-medium"
                    >
                      Send Reply
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReplyForm(false)}
                      className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => updateStatus('read')}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium"
              >
                Mark as Read
              </button>
              <button
                onClick={() => updateStatus('resolved')}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium"
              >
                Mark as Resolved
              </button>
              <button
                onClick={() => updateStatus('spam')}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium"
              >
                Mark as Spam
              </button>
              <button
                onClick={() => updateStatus('new')}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium"
              >
                Mark as New
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}