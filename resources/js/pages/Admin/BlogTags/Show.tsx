import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { FileText, Tag, Edit2 } from 'lucide-react';
import InfoRow from '@/components/InfoRow';
import SectionCard from '@/components/SectionCard';
import PageHeader, { ActionButton } from '@/components/PageHeader';
import StatusCard from '@/components/StatusCard';
import StatsCard from '@/components/StatsCard';
import TimelineCard from '@/components/TimelineCard';
import { formatDate } from '@/utils/dateFormat';

interface Blog {
  id: number;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  created_at: string;
}

interface BlogTag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color: string;
  is_active: boolean;
  blogs?: Blog[];
  created_at?: string;
  updated_at?: string;
}

interface Props {
  tag: BlogTag;
}

export default function Show({ tag }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Blog Tags', href: '/admin/blogtags' },
    { title: tag.name, href: '#' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={tag.name} />

      <div className="p-3">
        <PageHeader
          title={
            <div className="flex items-center gap-3">
              <span className="h-4 w-4 rounded-full" style={{ backgroundColor: tag.color }}></span>
              <span>{tag.name}</span>
            </div>
          }
          backUrl="/admin/blogtags"
          actions={<ActionButton href={`/admin/blogtags/${tag.id}/edit`} icon={Edit2} label="Edit Tag" />}
        />

        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <SectionCard title="Tag Information" icon={Tag}>
                <div className="space-y-4">
                  <InfoRow label="Name" value={tag.name} />
                  <InfoRow label="Slug" value={tag.slug} mono />
                  {tag.description && <InfoRow label="Description" value={tag.description} multiline />}
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Color Preview</p>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg border-2 border-gray-200 dark:border-gray-700" style={{ backgroundColor: tag.color }}></div>
                      <div>
                        <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-white" style={{ backgroundColor: tag.color }}>
                          <span className="h-2 w-2 rounded-full bg-white"></span>
                          {tag.name}
                        </span>
                        <p className="mt-1 text-xs text-gray-500">{tag.color}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>

              {tag.blogs && tag.blogs.length > 0 && (
                <SectionCard title={`Associated Blog Posts (${tag.blogs.length})`} icon={FileText}>
                  <div className="space-y-3">
                    {tag.blogs.map((blog) => (
                      <Link
                        key={blog.id}
                        href={`/admin/blogs/${blog.id}`}
                        className="block rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="mb-1 font-medium text-gray-900 dark:text-white">{blog.title}</h3>
                            <p className="text-xs text-gray-500">{formatDate(blog.created_at)}</p>
                          </div>
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                            blog.status === 'published'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {blog.status}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </SectionCard>
              )}

              {tag.blogs && tag.blogs.length === 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-lg dark:border-gray-800 dark:bg-gray-900">
                  <FileText className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400">No blog posts are using this tag yet.</p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <StatusCard isActive={tag.is_active} />

              <StatsCard 
                stats={[
                  { label: 'Total Blogs', value: tag.blogs?.length || 0 },
                  { 
                    label: 'Published', 
                    value: tag.blogs?.filter((b) => b.status === 'published').length || 0,
                    color: 'text-green-600 dark:text-green-400'
                  },
                  { 
                    label: 'Drafts', 
                    value: tag.blogs?.filter((b) => b.status === 'draft').length || 0,
                    color: 'text-yellow-600 dark:text-yellow-400'
                  },
                ]}
              />

              <TimelineCard createdAt={tag.created_at || ''} updatedAt={tag.updated_at} />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
