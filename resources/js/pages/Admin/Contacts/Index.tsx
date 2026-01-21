import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Mail, MailOpen, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { useEffect } from 'react';
import DataTableWrapper from '@/components/DataTableWrapper';
import { CommonColumns } from '@/components/TableColumns';
import StatCard from '@/components/StatCard';
import toast from "react-hot-toast";

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Contacts', href: '/admin/contacts' },
];

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'resolved' | 'spam';
  admin_reply: string | null;
  replied_at: string | null;
  replied_by: number | null;
  replied_by_user?: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

interface Stats {
  total: number;
  new: number;
  read: number;
  replied: number;
  resolved: number;
}

interface Props {
  stats: Stats;
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function Index({ stats, flash }: Props) {
  const canEdit = true;
  const canDelete = true;

  // Define columns
  const columns = [
    CommonColumns.id(),
    {
      name: 'Name',
      selector: (row: Contact) => row.name,
      sortable: true,
      cell: (row: Contact) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {row.name}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {row.email}
          </span>
        </div>
      ),
      grow: 1.5,
    },
    {
      name: 'Phone',
      selector: (row: Contact) => row.phone || '-',
      sortable: true,
      cell: (row: Contact) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {row.phone || '-'}
        </span>
      ),
    },
    {
      name: 'Subject',
      selector: (row: Contact) => row.subject,
      sortable: true,
      cell: (row: Contact) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-white">
            {row.subject}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
            {row.message.substring(0, 50)}...
          </span>
        </div>
      ),
      grow: 2,
    },
    {
      name: 'Status',
      selector: (row: Contact) => row.status,
      sortable: true,
      cell: (row: Contact) => {
        const statusColors: Record<string, string> = {
          new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
          read: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
          replied: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
          resolved: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
          spam: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        };
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[row.status]}`}>
            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          </span>
        );
      },
    },
    {
      name: 'Replied By',
      selector: (row: Contact) => row.replied_by_user?.name || '-',
      sortable: false,
      cell: (row: Contact) => (
        <div className="flex flex-col">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {row.replied_by_user?.name || '-'}
          </span>
          {row.replied_at && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(row.replied_at).toLocaleDateString()}
            </span>
          )}
        </div>
      ),
    },
    CommonColumns.createdAt(true),
    CommonColumns.actions({
      baseUrl: '/admin/contacts',
      canEdit,
      canDelete,
      showView: true,
    }),
  ];

  const csvHeaders = [
    { label: 'ID', key: 'id' },
    { label: 'Name', key: 'name' },
    { label: 'Email', key: 'email' },
    { label: 'Phone', key: 'phone' },
    { label: 'Subject', key: 'subject' },
    { label: 'Message', key: 'message' },
    { label: 'Status', key: 'status' },
    { label: 'Admin Reply', key: 'admin_reply' },
    { label: 'Replied By', key: 'replied_by_user.name' },
    { label: 'Replied At', key: 'replied_at' },
    { label: 'Created At', key: 'created_at' },
  ];

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Contact Messages" />

      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Contact Messages
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage customer inquiries and messages
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Total Messages" value={stats.total} color="blue" icon={Mail} />
          <StatCard title="New" value={stats.new} color="blue" icon={AlertCircle} />
          <StatCard title="Read" value={stats.read} color="amber" icon={MailOpen} />
          <StatCard title="Replied" value={stats.replied} color="emerald" icon={MessageSquare} />
          <StatCard title="Resolved" value={stats.resolved} color="blue" icon={CheckCircle} />
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <DataTableWrapper
            fetchUrl="/admin/contacts-data"
            columns={columns}
            csvHeaders={csvHeaders}
            searchableKeys={['name', 'email', 'phone', 'subject', 'message', 'status']}
          />
        </div>
      </div>
    </AppLayout>
  );
}