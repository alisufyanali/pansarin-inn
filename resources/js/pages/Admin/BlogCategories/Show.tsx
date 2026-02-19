import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Edit2, FolderTree, FileText, Search, Globe, Link } from 'lucide-react';
import InfoRow from '@/components/InfoRow';
import SectionCard from '@/components/SectionCard';
import PageHeader, { ActionButton } from '@/components/PageHeader';
import { formatDate } from '@/utils/dateFormat';

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  schema_markup?: string;
  social_image?: string;
  social_description?: string;
  parent?: { id: number; name: string } | null;
  children?: BlogCategory[];
  created_at: string;
  updated_at: string;
}

export default function Show({ blogCategory }: { blogCategory: BlogCategory }) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Blog Categories', href: '/admin/blogcategories' },
    { title: blogCategory.name, href: '#' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={blogCategory.name} />
      
      <div className="p-3">
        <PageHeader
          title="Category Details"
          backUrl="/admin/blogcategories"
          actions={
            <ActionButton
              href={`/admin/blogcategories/${blogCategory.id}/edit`}
              icon={Edit2}
              label="Edit Category"
            />
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <SectionCard title="Basic Information" icon={FileText}>
              <div className="space-y-4">
                <InfoRow label="Name" value={blogCategory.name} />
                <InfoRow label="Slug" value={blogCategory.slug} mono />
                <InfoRow label="Parent Category" value={blogCategory.parent?.name || 'Root Category'} />
              </div>
            </SectionCard>

            <SectionCard title="SEO Settings" icon={Search} iconColor="text-green-600">
              <div className="space-y-4">
                <InfoRow label="Meta Title" value={blogCategory.meta_title} />
                <InfoRow label="Meta Description" value={blogCategory.meta_description} multiline />
                <InfoRow label="Meta Keywords" value={blogCategory.meta_keywords} />
                
                {blogCategory.schema_markup && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Schema Markup</p>
                    <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-xs font-mono text-gray-800 dark:text-gray-200">
                      {blogCategory.schema_markup}
                    </pre>
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Social Media" icon={Globe} iconColor="text-purple-600">
              <div className="space-y-4">
                {blogCategory.social_image && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Social Image</p>
                    <img 
                      src={`/storage/${blogCategory.social_image}`} 
                      alt="Social preview"
                      className="rounded-lg border border-gray-200 dark:border-gray-700 max-w-md"
                    />
                  </div>
                )}
                <InfoRow label="Social Description" value={blogCategory.social_description} multiline />
              </div>
            </SectionCard>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category Stats</h3>
              <div className="space-y-3">
                <StatItem label="Sub Categories" value={blogCategory.children?.length || 0} />
                <StatItem label="Type" value={blogCategory.parent ? 'Sub Category' : 'Root Category'} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Timestamps</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                  <p className="text-sm text-gray-900 dark:text-white">{formatDate(blogCategory.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Last Updated</p>
                  <p className="text-sm text-gray-900 dark:text-white">{formatDate(blogCategory.updated_at)}</p>
                </div>
              </div>
            </div>

            {blogCategory.children && blogCategory.children.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FolderTree className="w-5 h-5" />
                  Sub Categories
                </h3>
                <ul className="space-y-2">
                  {blogCategory.children.map((child) => (
                    <li key={child.id}>
                      <Link
                        href={`/admin/blogcategories/${child.id}`}
                        className="block p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 transition"
                      >
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}