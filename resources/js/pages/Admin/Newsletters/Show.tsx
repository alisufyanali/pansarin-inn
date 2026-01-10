import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit2, FolderTree, FileText, Search, Globe, Code } from 'lucide-react';

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
                {/* Header Actions */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Link
                            href="/admin/blogcategories"
                            className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Category Details
                        </h1>
                    </div>
                    
                    <Link
                        href={`/admin/blogcategories/${blogCategory.id}/edit`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit Category
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                                <FileText className="w-5 h-5 text-blue-600" />
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Basic Information
                                </h2>
                            </div>
                            
                            <div className="space-y-4">
                                <InfoRow label="Name" value={blogCategory.name} />
                                <InfoRow label="Slug" value={blogCategory.slug} mono />
                                <InfoRow 
                                    label="Parent Category" 
                                    value={blogCategory.parent?.name || 'Root Category'} 
                                />
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
                                <InfoRow label="Meta Title" value={blogCategory.meta_title} />
                                <InfoRow 
                                    label="Meta Description" 
                                    value={blogCategory.meta_description}
                                    multiline
                                />
                                <InfoRow label="Meta Keywords" value={blogCategory.meta_keywords} />
                                
                                {blogCategory.schema_markup && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                            Schema Markup
                                        </p>
                                        <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-xs font-mono text-gray-800 dark:text-gray-200">
                                            {blogCategory.schema_markup}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Social Media */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                                <Globe className="w-5 h-5 text-purple-600" />
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Social Media
                                </h2>
                            </div>
                            
                            <div className="space-y-4">
                                {blogCategory.social_image && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                            Social Image
                                        </p>
                                        <img 
                                            src={`/storage/${blogCategory.social_image}`} 
                                            alt="Social preview"
                                            className="rounded-lg border border-gray-200 dark:border-gray-700 max-w-md"
                                        />
                                    </div>
                                )}
                                
                                <InfoRow 
                                    label="Social Description" 
                                    value={blogCategory.social_description}
                                    multiline
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Category Stats
                            </h3>
                            <div className="space-y-3">
                                <StatItem 
                                    label="Sub Categories" 
                                    value={blogCategory.children?.length || 0} 
                                />
                                <StatItem 
                                    label="Type" 
                                    value={blogCategory.parent ? 'Sub Category' : 'Root Category'} 
                                />
                            </div>
                        </div>

                        {/* Timestamps */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Timestamps
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        {new Date(blogCategory.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Last Updated</p>
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        {new Date(blogCategory.updated_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Children Categories */}
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

// Helper Components
function InfoRow({ 
    label, 
    value, 
    mono = false, 
    multiline = false 
}: { 
    label: string; 
    value?: string | null; 
    mono?: boolean;
    multiline?: boolean;
}) {
    return (
        <div className={multiline ? '' : 'flex justify-between items-start gap-4'}>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[140px]">
                {label}
            </span>
            <span className={`text-sm text-gray-900 dark:text-white ${multiline ? 'mt-2 block' : 'text-right'} ${mono ? 'font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded' : ''}`}>
                {value || '-'}
            </span>
        </div>
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