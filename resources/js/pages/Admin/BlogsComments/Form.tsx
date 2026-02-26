import { Link, useForm } from '@inertiajs/react';
import { Save, MessageSquare, Star, Check, BookOpen } from 'lucide-react';
import React, { useState } from 'react';
import FieldError from '@/components/FieldError';
import PageHeader from '@/components/PageHeader';
import { inputClass, cardClass, labelClass, buttonPrimaryClass, buttonSecondaryClass } from '@/utils/formStyles';

export type BlogCommentFormData = {
    blog_id?: number | null;
    comments: string;
    review?: string;
    rating?: number | null;
    status: 'pending' | 'approved' | 'rejected';
};

interface BlogCommentFormProps {
    initialData?: BlogCommentFormData & { id?: number };
    isEdit?: boolean;
    blogs?: { id: number; title: string }[];
    selectedBlogId?: number | null;
}

export default function Form({
    initialData,
    isEdit = false,
    blogs = [],
    selectedBlogId = null,
}: BlogCommentFormProps) {
    const [hoveredStar, setHoveredStar] = useState<number | null>(null);

    const urlParams = new URLSearchParams(window.location.search);
    const blogIdFromUrl = urlParams.get('blog_id');

    const { data, setData, errors, post, put, processing } = useForm<BlogCommentFormData>({
        blog_id: initialData?.blog_id || selectedBlogId || (blogIdFromUrl ? Number(blogIdFromUrl) : null),
        comments: initialData?.comments || '',
        review: initialData?.review || '',
        rating: initialData?.rating || null,
        status: initialData?.status || 'pending',
    });

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (isEdit && initialData?.id) {
            put(`/admin/blogscomments/${initialData.id}`);
        } else {
            post('/admin/blogscomments');
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700';
            case 'pending':  return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-700';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700';
            default: return '';
        }
    };

    const displayRating = hoveredStar || data.rating || 0;
    const selectedBlog = blogs.find((blog) => blog.id === data.blog_id);

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <PageHeader
                title={isEdit ? 'Edit Comment' : 'New Comment'}
                backUrl="/admin/blogscomments"
            />

            {/* Global error */}
            {(errors as any).error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400">
                    {(errors as any).error}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Blog Selection */}
                        <div className={cardClass}>
                            <div className="flex items-center gap-2 mb-4">
                                <BookOpen className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Blog Selection</h3>
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Select Blog <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.blog_id || ''}
                                    onChange={(e) => setData('blog_id', e.target.value ? Number(e.target.value) : null)}
                                    className={inputClass(errors.blog_id)}
                                    required
                                >
                                    <option value="">-- Choose a blog --</option>
                                    {blogs.map((blog) => (
                                        <option key={blog.id} value={blog.id}>
                                            {blog.title}
                                        </option>
                                    ))}
                                </select>
                                <FieldError message={errors.blog_id} />

                                {selectedBlog && (
                                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-700">
                                        <p className="text-sm text-blue-800 dark:text-blue-300">
                                            <span className="font-medium">Selected:</span> {selectedBlog.title}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Comment */}
                        <div className={cardClass}>
                            <div className="flex items-center gap-2 mb-4">
                                <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Comment</h3>
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Comment <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={data.comments}
                                    onChange={(e) => setData('comments', e.target.value)}
                                    placeholder="Write your comment here..."
                                    className={inputClass(errors.comments) + ' min-h-[120px]'}
                                    required
                                />
                                <div className="flex justify-between items-center mt-2">
                                    <FieldError message={errors.comments} />
                                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                                        {data.comments.length}/1000
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Review & Rating */}
                        <div className={cardClass}>
                            <div className="flex items-center gap-2 mb-4">
                                <Star className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Review & Rating</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>
                                        Detailed Review{' '}
                                        <span className="text-xs text-gray-400 dark:text-gray-500">(optional)</span>
                                    </label>
                                    <textarea
                                        value={data.review || ''}
                                        onChange={(e) => setData('review', e.target.value)}
                                        placeholder="Write a detailed review..."
                                        className={inputClass(errors.review) + ' min-h-[100px]'}
                                    />
                                    <div className="flex justify-between items-center mt-1">
                                        <FieldError message={errors.review} />
                                        {data.review && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                                                {data.review.length}/2000
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Star Rating */}
                                <div>
                                    <label className={labelClass}>
                                        Rating{' '}
                                        <span className="text-xs text-gray-400 dark:text-gray-500">(optional)</span>
                                    </label>
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setData('rating', star)}
                                                onMouseEnter={() => setHoveredStar(star)}
                                                onMouseLeave={() => setHoveredStar(null)}
                                                className="focus:outline-none"
                                            >
                                                <Star
                                                    className={`w-7 h-7 transition-colors ${
                                                        star <= displayRating
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'text-gray-300 dark:text-gray-600'
                                                    }`}
                                                />
                                            </button>
                                        ))}
                                        {data.rating && (
                                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                                ({data.rating}/5)
                                            </span>
                                        )}
                                        {data.rating && (
                                            <button
                                                type="button"
                                                onClick={() => setData('rating', null)}
                                                className="ml-2 text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400"
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                    <FieldError message={errors.rating} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Status */}
                        <div className={cardClass}>
                            <div className="flex items-center gap-2 mb-4">
                                <Check className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Status</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>Approval Status</label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value as 'pending' | 'approved' | 'rejected')}
                                        className={inputClass(errors.status)}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                    <FieldError message={errors.status} />
                                </div>

                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(data.status)}`}>
                                    {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className={cardClass}>
                            <div className="space-y-3">
                                <button type="submit" disabled={processing} className={buttonPrimaryClass}>
                                    <Save className="w-4 h-4" />
                                    {processing ? 'Saving...' : isEdit ? 'Update Comment' : 'Create Comment'}
                                </button>
                                <Link href="/admin/blogscomments" className={buttonSecondaryClass}>
                                    Cancel
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}