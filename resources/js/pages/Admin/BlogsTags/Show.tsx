import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    ArrowLeft,
    Calendar,
    CheckCircle,
    FileText,
    Tag,
    XCircle,
} from 'lucide-react';

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
        { title: 'Blog Tags', href: '/admin/blogstags' }, // FIXED
        { title: tag.name, href: '#' },
    ];

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={tag.name} />

            <div className="p-3">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/blogstags" // FIXED
                            className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <span
                                    className="h-4 w-4 rounded-full"
                                    style={{ backgroundColor: tag.color }}
                                ></span>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {tag.name}
                                </h1>
                            </div>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Tag ID: #{tag.id} • Slug: {tag.slug}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={`/admin/blogstags/${tag.id}/edit`} // FIXED
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
                    >
                        Edit Tag
                    </Link>
                </div>

                <div className="mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Tag Information */}
                            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900">
                                <div className="mb-4 flex items-center gap-2">
                                    <Tag className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Tag Information
                                    </h2>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                                            Name
                                        </p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {tag.name}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                                            Slug
                                        </p>
                                        <code className="rounded bg-gray-100 px-2 py-1 text-sm dark:bg-gray-800">
                                            {tag.slug}
                                        </code>
                                    </div>
                                    {tag.description && (
                                        <div>
                                            <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                                                Description
                                            </p>
                                            <p className="text-gray-900 dark:text-white">
                                                {tag.description}
                                            </p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                            Color Preview
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="h-12 w-12 rounded-lg border-2 border-gray-200 dark:border-gray-700"
                                                style={{
                                                    backgroundColor: tag.color,
                                                }}
                                            ></div>
                                            <div>
                                                <span
                                                    className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-white"
                                                    style={{
                                                        backgroundColor:
                                                            tag.color,
                                                    }}
                                                >
                                                    <span className="h-2 w-2 rounded-full bg-white"></span>
                                                    {tag.name}
                                                </span>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {tag.color}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Associated Blogs */}
                            {tag.blogs && tag.blogs.length > 0 && (
                                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900">
                                    <div className="mb-4 flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Associated Blog Posts (
                                            {tag.blogs.length})
                                        </h2>
                                    </div>
                                    <div className="space-y-3">
                                        {tag.blogs.map((blog) => (
                                            <Link
                                                key={blog.id}
                                                href={`/admin/blogs/${blog.id}`}
                                                className="block rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="mb-1 font-medium text-gray-900 dark:text-white">
                                                            {blog.title}
                                                        </h3>
                                                        <p className="text-xs text-gray-500">
                                                            {formatDate(
                                                                blog.created_at,
                                                            )}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                            blog.status ===
                                                            'published'
                                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                        }`}
                                                    >
                                                        {blog.status}
                                                    </span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {tag.blogs && tag.blogs.length === 0 && (
                                <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-lg dark:border-gray-800 dark:bg-gray-900">
                                    <FileText className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                                    <p className="text-gray-600 dark:text-gray-400">
                                        No blog posts are using this tag yet.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Status Card */}
                            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900">
                                <div className="mb-4 flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Status
                                    </h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    {tag.is_active ? (
                                        <>
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                            <span className="font-medium text-green-700 dark:text-green-400">
                                                Active
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-5 w-5 text-gray-600" />
                                            <span className="font-medium text-gray-700 dark:text-gray-400">
                                                Inactive
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Statistics Card */}
                            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900">
                                <div className="mb-4 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Statistics
                                    </h2>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Total Blogs
                                        </span>
                                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                                            {tag.blogs?.length || 0}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Published
                                        </span>
                                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                            {tag.blogs?.filter(
                                                (b) => b.status === 'published',
                                            ).length || 0}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Drafts
                                        </span>
                                        <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                                            {tag.blogs?.filter(
                                                (b) => b.status === 'draft',
                                            ).length || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Timestamps */}
                            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900">
                                <div className="mb-4 flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Timeline
                                    </h2>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                                            Created At
                                        </p>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {formatDate(tag.created_at)}
                                        </p>
                                    </div>
                                    {tag.updated_at &&
                                        tag.updated_at !== tag.created_at && (
                                            <div>
                                                <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                                                    Last Updated
                                                </p>
                                                <p className="text-sm text-gray-900 dark:text-white">
                                                    {formatDate(tag.updated_at)}
                                                </p>
                                            </div>
                                        )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}