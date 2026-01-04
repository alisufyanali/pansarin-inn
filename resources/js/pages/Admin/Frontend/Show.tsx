import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft, Edit2, Layout, Calendar, Eye, Image as ImageIcon, Link as LinkIcon, Trash2 } from 'lucide-react';
import { router } from '@inertiajs/react';

interface FrontendContent {
  id: number;
  type: 'carousel' | 'banner';
  title: string;
  order: number;
  is_active: boolean;
  link?: string;
  description?: string;
  image?: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  frontendContent: FrontendContent;
}

export default function Show({ frontendContent }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Frontend', href: '/admin/frontend' },
    { title: frontendContent.title || 'View', href: '#' },
  ];

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this content?')) {
      router.delete(`/admin/frontend/${frontendContent.id}`);
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={frontendContent.title || 'View Content'} />
      
      <div className="p-3">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Link
              href="/admin/frontend"
              className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {frontendContent.title || 'Untitled'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Content Details
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Link
              href={`/admin/frontend/${frontendContent.id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Preview */}
            {frontendContent.image && (
              <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={`/storage/${frontendContent.image}`} 
                  alt={frontendContent.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* Content Section */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                <Layout className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Content Information
                </h2>
              </div>
              
              <div className="space-y-4">
                {/* Title */}
                <InfoRow 
                  label="Title" 
                  value={frontendContent.title} 
                />

                {/* Link */}
                {frontendContent.link && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Link URL
                    </p>
                    <a 
                      href={frontendContent.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all flex items-center gap-2"
                    >
                      <LinkIcon className="w-4 h-4" />
                      {frontendContent.link}
                    </a>
                  </div>
                )}

                {/* Description */}
                {frontendContent.description && (
                  <InfoRow 
                    label="Description" 
                    value={frontendContent.description}
                    multiline
                  />
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Status & Meta Info */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Content Settings
              </h3>
              <div className="space-y-3">
                {/* Type */}
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Type</p>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full font-medium ${
                    frontendContent.type === 'carousel'
                      ? 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
                      : 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400'
                  }`}>
                    <Layout className="w-3 h-3" />
                    {frontendContent.type}
                  </span>
                </div>

                {/* Status */}
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full font-medium ${
                    frontendContent.is_active
                      ? 'bg-green-500/10 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                      : 'bg-gray-500/10 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400'
                  }`}>
                    <Eye className="w-3 h-3" />
                    {frontendContent.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Order */}
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Display Order</p>
                  <span className="text-sm text-gray-900 dark:text-white font-mono">
                    {frontendContent.order}
                  </span>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5" />
                Timestamps
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(frontendContent.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Last Updated</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(frontendContent.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Link
                  href={`/admin/frontend/${frontendContent.id}/edit`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Content
                </Link>
                <button
                  onClick={handleDelete}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Content
                </button>
                <Link
                  href="/admin/frontend"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to List
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// Helper Components
function InfoRow({ 
  label, 
  value, 
  multiline = false 
}: { 
  label: string; 
  value?: string | null; 
  multiline?: boolean;
}) {
  return (
    <div className={multiline ? '' : 'flex justify-between items-start gap-4'}>
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[140px]">
        {label}
      </span>
      <span className={`text-sm text-gray-900 dark:text-white ${multiline ? 'mt-2 block' : 'text-right'}`}>
        {value || <span className="text-gray-400 italic">Not set</span>}
      </span>
    </div>
  );
}