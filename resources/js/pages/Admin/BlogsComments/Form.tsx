import { Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    Check,
    FileText,
    MessageSquare,
    Save,
    Star,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

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
    const commentsRef = useRef<HTMLTextAreaElement>(null);
    const reviewRef = useRef<HTMLTextAreaElement>(null);
    const [hoveredStar, setHoveredStar] = useState<number | null>(null);

    // Get blog_id from URL if provided
    const urlParams = new URLSearchParams(window.location.search);
    const blogIdFromUrl = urlParams.get('blog_id');

    const { data, setData, errors, post, put, processing } =
        useForm<BlogCommentFormData>({
            blog_id:
                initialData?.blog_id ||
                selectedBlogId ||
                (blogIdFromUrl ? Number(blogIdFromUrl) : null),
            comments: initialData?.comments || '',
            review: initialData?.review || '',
            rating: initialData?.rating || null,
            status: initialData?.status || 'pending',
        });

    useEffect(() => {
        if (commentsRef.current) {
            commentsRef.current.style.height = 'auto';
            commentsRef.current.style.height =
                commentsRef.current.scrollHeight + 'px';
        }
    }, [data.comments]);

    useEffect(() => {
        if (reviewRef.current) {
            reviewRef.current.style.height = 'auto';
            reviewRef.current.style.height =
                reviewRef.current.scrollHeight + 'px';
        }
    }, [data.review]);

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (isEdit && initialData?.id) {
            put(`/admin/blogscomments/${initialData.id}`); // FIXED
        } else {
            post('/admin/blogscomments'); // FIXED
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
            case 'pending':
                return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
            case 'rejected':
                return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
            default:
                return '';
        }
    };

    const handleStarClick = (rating: number) => {
        setData('rating', rating);
    };

    const handleStarHover = (rating: number) => {
        setHoveredStar(rating);
    };

    const handleStarLeave = () => {
        setHoveredStar(null);
    };

    const displayRating = hoveredStar || data.rating || 0;

    // Get selected blog details
    const selectedBlog = blogs.find((blog) => blog.id === data.blog_id);

    return (
        <div className="p-3">
            <div className="mb-4 flex items-center gap-2">
                <Link
                    href="/admin/blogscomments"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
            </div>

            <div className="py-6">
                <div className="mx-auto max-w-5xl">
                    <h2 className="mb-2 text-center text-2xl font-semibold text-gray-900 dark:text-white">
                        {isEdit
                            ? 'Edit Blog Comment & Review'
                            : 'Create New Comment & Review'}
                    </h2>
                    <p className="mb-6 text-center text-sm text-gray-600 dark:text-gray-400">
                        {isEdit
                            ? 'Update the comment, review, and rating below.'
                            : 'Add a new comment, review, and rating to a blog post.'}
                    </p>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* Main Content - 2 columns */}
                            <div className="space-y-6 lg:col-span-2">
                                {/* Blog Selection Card */}
                                {blogs.length > 0 && (
                                    <div className="space-y-4 rounded-xl border-2 border-blue-200 bg-white p-6 shadow-lg dark:border-blue-800 dark:bg-gray-900">
                                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                                            <BookOpen className="h-5 w-5 text-blue-600" />
                                            Select Blog Post
                                        </h3>

                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                Choose which blog to comment on
                                                *
                                            </label>
                                            <select
                                                value={data.blog_id || ''}
                                                onChange={(e) =>
                                                    setData(
                                                        'blog_id',
                                                        e.target.value
                                                            ? Number(
                                                                  e.target
                                                                      .value,
                                                              )
                                                            : null,
                                                    )
                                                }
                                                className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                            >
                                                <option value="">
                                                    -- Select a blog post --
                                                </option>
                                                {blogs.map((blog) => (
                                                    <option
                                                        key={blog.id}
                                                        value={blog.id}
                                                    >
                                                        {blog.title}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.blog_id && (
                                                <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                                                    <span>⚠️</span>{' '}
                                                    {errors.blog_id}
                                                </p>
                                            )}

                                            {selectedBlog && (
                                                <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                                                    <p className="text-sm text-blue-800 dark:text-blue-300">
                                                        📝 Commenting on:{' '}
                                                        <span className="font-semibold">
                                                            {selectedBlog.title}
                                                        </span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Comment Details */}
                                <div className="space-y-4 rounded-xl bg-white p-6 shadow-lg dark:bg-gray-900">
                                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                                        <MessageSquare className="h-5 w-5" />
                                        Comment Details
                                    </h3>

                                    {/* Comments Textarea */}
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Comment *
                                        </label>
                                        <textarea
                                            ref={commentsRef}
                                            value={data.comments}
                                            onChange={(e) =>
                                                setData(
                                                    'comments',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Enter your comment here..."
                                            className="min-h-[100px] w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                            rows={4}
                                        />
                                        <div className="mt-1 flex items-center justify-between">
                                            <div>
                                                {errors.comments && (
                                                    <p className="text-xs text-red-500">
                                                        {errors.comments}
                                                    </p>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {data.comments.length} / 1000
                                                characters
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Review Details */}
                                <div className="space-y-4 rounded-xl bg-white p-6 shadow-lg dark:bg-gray-900">
                                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                                        <FileText className="h-5 w-5" />
                                        Review Details
                                    </h3>

                                    {/* Review Textarea */}
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Detailed Review
                                        </label>
                                        <textarea
                                            ref={reviewRef}
                                            value={data.review || ''}
                                            onChange={(e) =>
                                                setData(
                                                    'review',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Write a detailed review (optional)..."
                                            className="min-h-[120px] w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                            rows={5}
                                        />
                                        <div className="mt-1 flex items-center justify-between">
                                            <div>
                                                {errors.review && (
                                                    <p className="text-xs text-red-500">
                                                        {errors.review}
                                                    </p>
                                                )}
                                            </div>
                                            {data.review && (
                                                <p className="text-xs text-gray-500">
                                                    {data.review.length} / 2000
                                                    characters
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Rating */}
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Rating
                                        </label>
                                        <div className="flex items-center gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() =>
                                                        handleStarClick(star)
                                                    }
                                                    onMouseEnter={() =>
                                                        handleStarHover(star)
                                                    }
                                                    onMouseLeave={
                                                        handleStarLeave
                                                    }
                                                    className="transition-transform hover:scale-110 focus:outline-none"
                                                >
                                                    <Star
                                                        className={`h-8 w-8 transition-colors ${
                                                            star <=
                                                            displayRating
                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                : 'text-gray-300 dark:text-gray-600'
                                                        }`}
                                                    />
                                                </button>
                                            ))}
                                            {data.rating && (
                                                <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    {data.rating} / 5
                                                </span>
                                            )}
                                        </div>
                                        {errors.rating && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.rating}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar - 1 column */}
                            <div className="space-y-6 lg:col-span-1">
                                {/* Status Section */}
                                <div className="space-y-4 rounded-xl bg-white p-6 shadow-lg dark:bg-gray-900">
                                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                                        <Check className="h-5 w-5" />
                                        Status
                                    </h3>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Approval Status
                                        </label>
                                        <select
                                            value={data.status}
                                            onChange={(e) =>
                                                setData(
                                                    'status',
                                                    e.target.value as
                                                        | 'pending'
                                                        | 'approved'
                                                        | 'rejected',
                                                )
                                            }
                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                        >
                                            <option value="pending">
                                                Pending
                                            </option>
                                            <option value="approved">
                                                Approved
                                            </option>
                                            <option value="rejected">
                                                Rejected
                                            </option>
                                        </select>
                                        {errors.status && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.status}
                                            </p>
                                        )}
                                    </div>

                                    {/* Status Badge */}
                                    <div className="mt-4">
                                        <span
                                            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(data.status)}`}
                                        >
                                            {data.status
                                                .charAt(0)
                                                .toUpperCase() +
                                                data.status.slice(1)}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-900">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-blue-400"
                                    >
                                        <Save className="h-5 w-5" />
                                        {processing
                                            ? 'Saving...'
                                            : isEdit
                                              ? 'Update Comment'
                                              : 'Post'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
