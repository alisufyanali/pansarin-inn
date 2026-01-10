import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PlusCircle, FileText, Eye, Edit, Tag } from 'lucide-react';
import { useEffect } from 'react';
import DataTableWrapper from '@/components/DataTableWrapper';
import { CommonColumns, CodeBadge } from '@/components/TableColumns';
import toast from "react-hot-toast";

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Blogs', href: '/admin/blogs' },
];

interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  status: 'draft' | 'published';
  category?: { id: number; name: string } | null;
   tags?: Array<{ id: number; name: string; color: string }>;
  thumbnail?: string;
  created_at: string;
}

interface Props {
  stats?: {
    total: number;
    published: number;
    draft: number;
    with_category: number;
  };
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function Index({ stats, flash }: Props) {
  const canCreate = true;
  const canEdit = true;
  const canDelete = true;

  // Use stats from props with defaults
  const blogStats = stats || {
    total: 0,
    published: 0,
    draft: 0,
    with_category: 0,
  };

  // Define columns
  const columns = [
    CommonColumns.id(),
    {
      name: 'Thumbnail',
      selector: (row: Blog) => row.thumbnail || '',
      sortable: false,
      width: '80px',
      cell: (row: Blog) => (
        row.thumbnail ? (
          <img 
            src={`/storage/${row.thumbnail}`} 
            alt={row.title}
            className="w-12 h-12 rounded-lg object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <FileText className="w-5 h-5 text-gray-400" />
          </div>
        )
      ),
    },
    {
      name: 'Title',
      selector: (row: Blog) => row.title,
      sortable: true,
      cell: (row: Blog) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 dark:text-white">
            {row.title}
          </span>
          {row.excerpt && (
            <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
              {row.excerpt}
            </span>
          )}
        </div>
      ),
      width: '250px',
    },
    {
      name: 'Slug',
      selector: (row: Blog) => row.slug || '-',
      sortable: true,
      cell: (row: Blog) => (
        row.slug ? <CodeBadge text={row.slug} /> : <span className="text-gray-400">-</span>
      ),
    },
    {
      name: 'Category',
      selector: (row: Blog) => row.category?.name || '-',
      sortable: true,
      cell: (row: Blog) => (
        <span className="text-gray-600 dark:text-gray-400">
          {row.category?.name || <span className="text-gray-400">Uncategorized</span>}
        </span>
      ),
    },
    {
      name: 'Tags',
      selector: (row: Blog) => row.tags?.length || 0,
      sortable: false,
      cell: (row: Blog) => (
        <div className="flex flex-wrap gap-1">
          {row.tags && row.tags.length > 0 ? (
            <>
              {row.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
              {row.tags.length > 2 && (
                <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400">
                  +{row.tags.length - 2}
                </span>
              )}
            </>
          ) : (
            <span className="text-xs text-gray-400 italic">No tags</span>
          )}
        </div>
      ),
      width: '200px',
    },
    
    {
      name: 'Status',
      selector: (row: Blog) => row.status,
      sortable: true,
      cell: (row: Blog) => (
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
          row.status === 'published'
            ? 'bg-green-500/10 dark:bg-green-500/20 text-green-700 dark:text-green-400'
            : 'bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
        }`}>
          {row.status === 'published' ? 'Published' : 'Draft'}
        </span>
      ),
      width: '120px',
      center: true,
    },
    CommonColumns.createdAt(true),
    CommonColumns.actions({
      baseUrl: '/admin/blogs',
      canEdit,
      canDelete,
    }),
  ];


  const csvHeaders = [
    { label: 'ID', key: 'id' },
    { label: 'Title', key: 'title' },
    { label: 'Slug', key: 'slug' },
    { label: 'Category', key: 'category.name' },
    { label: 'Tags', key: 'tags_list' },
    { label: 'Status', key: 'status' },
    { label: 'Created At', key: 'created_at' },
  ];

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  // Additional filters for blogs
  const additionalFilters = [
    {
      name: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'published', label: 'Published' },
        { value: 'draft', label: 'Draft' },
      ],
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Blogs" />

      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Blog Posts
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your blog content and articles
            </p>
          </div>

          {canCreate && (
            <Link
              href="/admin/blogs/create"
              className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Create Blog Post</span>
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Posts" 
            value={blogStats.total} 
            color="blue" 
            icon={FileText} 
          />
          <StatCard 
            title="Published" 
            value={blogStats.published} 
            color="emerald" 
            icon={Eye} 
          />
          <StatCard 
            title="Drafts" 
            value={blogStats.draft} 
            color="amber" 
            icon={Edit} 
          />
          <StatCard 
            title="Categorized" 
            value={blogStats.with_category} 
            color="purple" 
            icon={FileText} 
          />
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <DataTableWrapper
            fetchUrl="/admin/blogs-data"
            columns={columns}
            csvHeaders={csvHeaders}
            searchableKeys={['title', 'slug', 'content', 'category.name']}
            additionalFilters={additionalFilters}
          />
        </div>
      </div>
    </AppLayout>
  );
}

// Reusable Stat Card Component
function StatCard({ 
  title, 
  value, 
  color,
  icon: Icon 
}: { 
  title: string; 
  value: number; 
  color: 'blue' | 'emerald' | 'purple' | 'amber';
  icon: any;
}) {
  const colorClasses = {
    blue: {
      bg: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
      border: 'border-blue-200 dark:border-blue-700',
      text: 'text-blue-700 dark:text-blue-300',
      value: 'text-blue-900 dark:text-blue-100',
      icon: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300',
    },
    emerald: {
      bg: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20',
      border: 'border-emerald-200 dark:border-emerald-700',
      text: 'text-emerald-700 dark:text-emerald-300',
      value: 'text-emerald-900 dark:text-emerald-100',
      icon: 'bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-300',
    },
    purple: {
      bg: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
      border: 'border-purple-200 dark:border-purple-700',
      text: 'text-purple-700 dark:text-purple-300',
      value: 'text-purple-900 dark:text-purple-100',
      icon: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-300',
    },
    amber: {
      bg: 'from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20',
      border: 'border-amber-200 dark:border-amber-700',
      text: 'text-amber-700 dark:text-amber-300',
      value: 'text-amber-900 dark:text-amber-100',
      icon: 'bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-300',
    },
  };

  const classes = colorClasses[color];

  return (
    <div className={`bg-gradient-to-br ${classes.bg} border ${classes.border} rounded-2xl p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${classes.text}`}>{title}</p>
          <p className={`mt-2 text-3xl font-bold ${classes.value}`}>{value}</p>
        </div>
        <div className={`p-3 ${classes.icon} rounded-lg`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}