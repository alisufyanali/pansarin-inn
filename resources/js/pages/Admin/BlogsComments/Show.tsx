import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    Edit2,
    FileText,
    Image as ImageIcon,
    MessageSquare,
    Plus,
    Shield,
    Star,
    User,
} from 'lucide-react';
import InfoRow from '@/components/InfoRow';
import SectionCard from '@/components/SectionCard';
import PageHeader, { ActionButton } from '@/components/PageHeader';
import StatsCard from '@/components/StatsCard';
import TimelineCard from '@/components/TimelineCard';

interface BlogComment {
    id: number;
    blog_id?: number | null;
    user_id?: number | null;
    comments: string;
    review?: string;
    rating?: number;
    status: 'pending' | 'approved' | 'rejected';
    blog?: {
        id: number;
        title: string;
        image?: string;
    };
    user?: { id: number; name: string; email?: string };
    created_at?: string;
    updated_at?: string;
}

interface Props {
    blogComment: BlogComment;
}

function getStatusBadge(status: string) {
    switch (status) {
        case 'approved':
            return 'bg-green-500/10 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
        case 'pending':
            return 'bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
        case 'rejected':
            return 'bg-red-500/10 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
        default:
            return 'bg-gray-500/10 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
}

function renderStars(rating?: number) {
    if (!rating) return null;
    return (
        <div className="mt-2 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`h-5 w-5 ${
                        star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
                    }`}
                />
            ))}
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{rating} / 5</span>
        </div>
    );
}

export default function Show({ blogComment }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Blog Comments', href: '/admin/blogscomments' },
        { title: `Comment #${blogComment.id}`, href: '#' },
    ];

    const stats = [];
    if (blogComment.rating) {
        stats.push({ label: 'Rating', value: `${blogComment.rating}/5`, color: 'text-yellow-600 dark:text-yellow-400' });
    }
    if (blogComment.user) {
        stats.push({ label: 'Author', value: blogComment.user.name });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Comment #${blogComment.id}`} />

            <div className="p-3">
                <PageHeader
                    title={`Comment #${blogComment.id}`}
                    backUrl="/admin/blogscomments"
                    actions={<ActionButton href={`/admin/blogscomments/${blogComment.id}/edit`} icon={Edit2} label="Edit Comment" />}
                />

                <div className="mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                            <SectionCard title="Comment Text" icon={MessageSquare}>
                                <div className="space-y-4">
                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                                        <p className="whitespace-pre-wrap leading-relaxed text-gray-900 dark:text-white">
                                            {blogComment.comments}
                                        </p>
                                    </div>
                                    <InfoRow label="Length" value={`${blogComment.comments.length} characters`} />
                                </div>
                            </SectionCard>

                            {blogComment.review && (
                                <SectionCard title="Detailed Review" icon={FileText}>
                                    <div className="space-y-4">
                                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                                            <p className="whitespace-pre-wrap leading-relaxed text-gray-900 dark:text-white">
                                                {blogComment.review}
                                            </p>
                                        </div>
                                        {renderStars(blogComment.rating)}
                                    </div>
                                </SectionCard>
                            )}

                            {blogComment.blog && (
                                <SectionCard title="Related Blog Post" icon={FileText}>
                                    <div className="space-y-3">
                                        <div className="flex justify-end">
                                            <Link
                                                href={`/admin/blogscomments/create?blog_id=${blogComment.blog.id}`}
                                                className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                Add Comment
                                            </Link>
                                        </div>
                                        <Link
                                            href={`/admin/blogs/${blogComment.blog.id}`}
                                            className="block overflow-hidden rounded-lg border border-blue-200 bg-blue-50 transition hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
                                        >
                                            {blogComment.blog.image ? (
                                                <div className="aspect-video w-full overflow-hidden">
                                                    <img
                                                        src={`/storage/${blogComment.blog.image}`}
                                                        alt={blogComment.blog.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40">
                                                    <ImageIcon className="h-16 w-16 text-blue-300 dark:text-blue-700" />
                                                </div>
                                            )}
                                            <div className="p-4">
                                                <p className="font-medium text-blue-900 dark:text-blue-300">{blogComment.blog.title}</p>
                                                <p className="mt-1 text-xs text-blue-700 dark:text-blue-400">Click to view blog post →</p>
                                            </div>
                                        </Link>
                                    </div>
                                </SectionCard>
                            )}
                        </div>

                        <div className="space-y-6">
                            <SectionCard title="Status" icon={Shield}>
                                <span
                                    className={`inline-flex rounded-full border px-4 py-2 text-sm font-medium ${getStatusBadge(blogComment.status)}`}
                                >
                                    {blogComment.status.charAt(0).toUpperCase() + blogComment.status.slice(1)}
                                </span>
                            </SectionCard>

                            {stats.length > 0 && (
                                <StatsCard
                                    stats={stats}
                                    icon={blogComment.rating ? Star : User}
                                />
                            )}

                            <TimelineCard
                                createdAt={blogComment.created_at || ''}
                                updatedAt={blogComment.updated_at}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
