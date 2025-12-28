import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit2, FileText, Calendar, FolderOpen, Eye, Image as ImageIcon, Globe, Search } from 'lucide-react';

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
    created_at: string;
    updated_at: string;
}

export default function Show({ blog }: { blog: Blog }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Blogs', href: '/admin/blogs' },
        { title: blog.title, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={blog.title} />
            
            <div className="p-3">
                {/* Header Actions */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Link
                            href="/admin/blogs"
                            className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {blog.title}
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Blog Post Details
                            </p>
                        </div>
                    </div>
                    
                    <Link
                        href={`/admin/blogs/${blog.id}/edit`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit Post
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - 2 columns */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Featured Image */}
                        {blog.thumbnail && (
                            <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-lg">
                                <img 
                                    src={`/storage/${blog.thumbnail}`} 
                                    alt={blog.title}
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        )}

                        {/* Content Section */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                                <FileText className="w-5 h-5 text-blue-600" />
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Content
                                </h2>
                            </div>
                            
                            {/* Excerpt */}
                            {blog.excerpt && (
                                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-600">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Excerpt
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400 italic">
                                        {blog.excerpt}
                                    </p>
                                </div>
                            )}

                            {/* Main Content */}
                            <div className="prose prose-gray dark:prose-invert max-w-none">
                                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                    {blog.content || <span className="text-gray-400 italic">No content available</span>}
                                </div>
                            </div>
                        </div>

                        {/* SEO Information */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                                <Search className="w-5 h-5 text-green-600" />
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    SEO Settings
                                </h2>
                            </div>
                            
                            <div className="space-y-4">
                                <InfoRow label="Meta Title" value={blog.meta_title} />
                                <InfoRow 
                                    label="Meta Description" 
                                    value={blog.meta_description}
                                    multiline
                                />
                                <InfoRow label="Meta Keywords" value={blog.meta_keywords} />
                                
                                {blog.schema_markup && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                            Schema Markup
                                        </p>
                                        <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-xs font-mono text-gray-800 dark:text-gray-200">
                                            {blog.schema_markup}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Social Media Section */}
                        {(blog.social_image || blog.social_description) && (
                            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                                    <Globe className="w-5 h-5 text-purple-600" />
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Social Media
                                    </h2>
                                </div>
                                
                                <div className="space-y-4">
                                    {blog.social_image && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                                Social Image
                                            </p>
                                            <img 
                                                src={`/storage/${blog.social_image}`} 
                                                alt="Social preview"
                                                className="rounded-lg border border-gray-200 dark:border-gray-700 max-w-md"
                                            />
                                        </div>
                                    )}
                                    
                                    <InfoRow 
                                        label="Social Description" 
                                        value={blog.social_description}
                                        multiline
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - 1 column */}
                    <div className="space-y-6">
                        {/* Status & Meta Info */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Post Information
                            </h3>
                            <div className="space-y-3">
                                {/* Status */}
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full font-medium ${
                                        blog.status === 'published'
                                            ? 'bg-green-500/10 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                                            : 'bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
                                    }`}>
                                        <Eye className="w-3 h-3" />
                                        {blog.status === 'published' ? 'Published' : 'Draft'}
                                    </span>
                                </div>

                                {/* Category */}
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Category</p>
                                    <div className="flex items-center gap-2">
                                        <FolderOpen className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm text-gray-900 dark:text-white font-medium">
                                            {blog.category?.name || 'Uncategorized'}
                                        </span>
                                    </div>
                                </div>

                                {/* Slug */}
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Slug</p>
                                    <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-800 dark:text-gray-200 font-mono">
                                        {blog.slug}
                                    </code>
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
                                        {new Date(blog.created_at).toLocaleDateString('en-US', {
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
                                        {new Date(blog.updated_at).toLocaleDateString('en-US', {
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
                                    href={`/admin/blogs/${blog.id}/edit`}
                                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit Post
                                </Link>
                                <Link
                                    href="/admin/blogs"
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