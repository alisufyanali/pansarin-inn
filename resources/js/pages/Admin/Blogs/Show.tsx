import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Edit2, FileText, FolderOpen, Globe, Search } from 'lucide-react';
import InfoRow from '@/components/InfoRow';
import SectionCard from '@/components/SectionCard';
import PageHeader, { ActionButton } from '@/components/PageHeader';
import TimelineCard from '@/components/TimelineCard';

interface Blog {
    id: number;
    title: string;
    slug: string;
    content?: string;
    excerpt?: string;
    status: 'draft' | 'published';
    thumbnail?: string;
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
    schema_markup?: string;
    social_image?: string;
    social_description?: string;
    category?: { id: number; name: string } | null;
    tags?: Array<{ id: number; name: string; color: string }>;
    created_at: string;
    updated_at: string;
}

interface Props {
    blog: Blog;
}

export default function Show({ blog }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Blogs', href: '/admin/blogs' },
        { title: blog.title, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={blog.title} />

            <div className="p-3">
                <PageHeader
                    title={blog.title}
                    backUrl="/admin/blogs"
                    actions={<ActionButton href={`/admin/blogs/${blog.id}/edit`} icon={Edit2} label="Edit Post" />}
                />

                <div className="mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                            {blog.thumbnail && (
                                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900">
                                    <img
                                        src={`/storage/${blog.thumbnail}`}
                                        alt={blog.title}
                                        className="h-auto w-full object-cover"
                                    />
                                </div>
                            )}

                            <SectionCard title="Content" icon={FileText}>
                                <div className="space-y-4">
                                    {blog.excerpt && (
                                        <div className="rounded-lg border-l-4 border-blue-600 bg-blue-50 p-4 dark:bg-blue-900/20">
                                            <InfoRow label="Excerpt" value={blog.excerpt} multiline />
                                        </div>
                                    )}
                                    <div className="prose prose-gray dark:prose-invert max-w-none">
                                        <div className="whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300">
                                            {blog.content || <span className="italic text-gray-400">No content available</span>}
                                        </div>
                                    </div>
                                </div>
                            </SectionCard>

                            <SectionCard title="SEO Settings" icon={Search}>
                                <div className="space-y-4">
                                    <InfoRow label="Meta Title" value={blog.meta_title} />
                                    <InfoRow label="Meta Description" value={blog.meta_description} multiline />
                                    <InfoRow label="Meta Keywords" value={blog.meta_keywords} />
                                    {blog.schema_markup && (
                                        <div>
                                            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Schema Markup</p>
                                            <pre className="overflow-x-auto rounded-lg bg-gray-50 p-4 text-xs font-mono text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                                {blog.schema_markup}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </SectionCard>

                            {(blog.social_image || blog.social_description) && (
                                <SectionCard title="Social Media" icon={Globe}>
                                    <div className="space-y-4">
                                        {blog.social_image && (
                                            <div>
                                                <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Social Image</p>
                                                <img
                                                    src={`/storage/${blog.social_image}`}
                                                    alt="Social preview"
                                                    className="max-w-md rounded-lg border border-gray-200 dark:border-gray-700"
                                                />
                                            </div>
                                        )}
                                        <InfoRow label="Social Description" value={blog.social_description} multiline />
                                    </div>
                                </SectionCard>
                            )}
                        </div>

                        <div className="space-y-6">
                            <SectionCard title="Post Information" icon={FolderOpen}>
                                <div className="space-y-4">
                                    <InfoRow label="Status" value={blog.status === 'published' ? 'Published' : 'Draft'} />
                                    <InfoRow label="Category" value={blog.category?.name || 'Uncategorized'} />
                                    <InfoRow label="Slug" value={blog.slug} mono />
                                </div>
                            </SectionCard>

                            <TimelineCard
                                createdAt={blog.created_at}
                                updatedAt={blog.updated_at}
                            />

                            <div className="flex flex-col gap-2">
                                <Link
                                    href={`/admin/blogs/${blog.id}/edit`}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
                                >
                                    <Edit2 className="h-4 w-4" />
                                    Edit Post
                                </Link>
                                <Link
                                    href="/admin/blogs"
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                                >
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
