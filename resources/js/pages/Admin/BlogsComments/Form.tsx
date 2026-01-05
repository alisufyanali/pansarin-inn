import React, { useEffect, useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, Check, MessageSquare, Save, Star, FileText, BookOpen } from 'lucide-react';
import { Link } from '@inertiajs/react';

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

export default function Form({ initialData, isEdit = false, blogs = [], selectedBlogId = null }: BlogCommentFormProps) {
    const commentsRef = useRef<HTMLTextAreaElement>(null);
    const reviewRef = useRef<HTMLTextAreaElement>(null);
    const [hoveredStar, setHoveredStar] = useState<number | null>(null);
    
    // Get blog_id from URL if provided
    const urlParams = new URLSearchParams(window.location.search);
    const blogIdFromUrl = urlParams.get('blog_id');
    
    const { data, setData, errors, post, put, processing } = useForm<BlogCommentFormData>({
        blog_id: initialData?.blog_id || selectedBlogId || (blogIdFromUrl ? Number(blogIdFromUrl) : null),
        comments: initialData?.comments || '',
        review: initialData?.review || '',
        rating: initialData?.rating || null,
        status: initialData?.status || 'pending',
    });

    useEffect(() => {
        if (commentsRef.current) {
            commentsRef.current.style.height = 'auto';
            commentsRef.current.style.height = commentsRef.current.scrollHeight + 'px';
        }
    }, [data.comments]);

    useEffect(() => {
        if (reviewRef.current) {
            reviewRef.current.style.height = 'auto';
            reviewRef.current.style.height = reviewRef.current.scrollHeight + 'px';
        }
    }, [data.review]);

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        
        if (isEdit && initialData?.id) {
            put(`/admin/blogsComments/${initialData.id}`);
        } else {
            post('/admin/blogsComments');
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
    const selectedBlog = blogs.find(blog => blog.id === data.blog_id);

    return (
        <div className="p-3">
            <div className="flex items-center gap-2 mb-4">
                <Link
                    href="/admin/blogsComments"
                    className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
            </div>

            <div className="py-6">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
                        {isEdit ? 'Edit Blog Comment & Review' : 'Create New Comment & Review'}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
                        {isEdit ? 'Update the comment, review, and rating below.' : 'Add a new comment, review, and rating to a blog post.'}
                    </p>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Content - 2 columns */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Blog Selection Card */}
                                {blogs.length > 0 && (
                                    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg space-y-4 border-2 border-blue-200 dark:border-blue-800">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                            <BookOpen className="w-5 h-5 text-blue-600" />
                                            Select Blog Post
                                        </h3>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Choose which blog to comment on *
                                            </label>
                                            <select
                                                value={data.blog_id || ''}
                                                onChange={e => setData('blog_id', e.target.value ? Number(e.target.value) : null)}
                                                className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            >
                                                <option value="">-- Select a blog post --</option>
                                                {blogs.map(blog => (
                                                    <option key={blog.id} value={blog.id}>
                                                        {blog.title}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.blog_id && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                                    <span>⚠️</span> {errors.blog_id}
                                                </p>
                                            )}
                                            
                                            {selectedBlog && (
                                                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                                    <p className="text-sm text-blue-800 dark:text-blue-300">
                                                        📝 Commenting on: <span className="font-semibold">{selectedBlog.title}</span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Comment Details */}
                                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                        <MessageSquare className="w-5 h-5" />
                                        Comment Details
                                    </h3>

                                    {/* Comments Textarea */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Comment *
                                        </label>
                                        <textarea
                                            ref={commentsRef}
                                            value={data.comments}
                                            onChange={e => setData('comments', e.target.value)}
                                            placeholder="Enter your comment here..."
                                            className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none resize-none min-h-[100px]"
                                            rows={4}
                                        />
                                        <div className="flex justify-between items-center mt-1">
                                            <div>
                                                {errors.comments && (
                                                    <p className="text-red-500 text-xs">{errors.comments}</p>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {data.comments.length} / 1000 characters
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Review Details */}
                                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                        <FileText className="w-5 h-5" />
                                        Review Details
                                    </h3>

                                    {/* Review Textarea */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Detailed Review
                                        </label>
                                        <textarea
                                            ref={reviewRef}
                                            value={data.review || ''}
                                            onChange={e => setData('review', e.target.value)}
                                            placeholder="Write a detailed review (optional)..."
                                            className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none resize-none min-h-[120px]"
                                            rows={5}
                                        />
                                        <div className="flex justify-between items-center mt-1">
                                            <div>
                                                {errors.review && (
                                                    <p className="text-red-500 text-xs">{errors.review}</p>
                                                )}
                                            </div>
                                            {data.review && (
                                                <p className="text-xs text-gray-500">
                                                    {data.review.length} / 2000 characters
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Rating */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Rating
                                        </label>
                                        <div className="flex items-center gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => handleStarClick(star)}
                                                    onMouseEnter={() => handleStarHover(star)}
                                                    onMouseLeave={handleStarLeave}
                                                    className="focus:outline-none transition-transform hover:scale-110"
                                                >
                                                    <Star
                                                        className={`w-8 h-8 transition-colors ${
                                                            star <= displayRating
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
                                            <p className="text-red-500 text-xs mt-1">{errors.rating}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar - 1 column */}
                            <div className="lg:col-span-1 space-y-6">
                                {/* Status Section */}
                                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                        <Check className="w-5 h-5" />
                                        Status
                                    </h3>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Approval Status
                                        </label>
                                        <select
                                            value={data.status}
                                            onChange={e => setData('status', e.target.value as 'pending' | 'approved' | 'rejected')}
                                            className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="approved">Approved</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                        {errors.status && (
                                            <p className="text-red-500 text-xs mt-1">{errors.status}</p>
                                        )}
                                    </div>

                                    {/* Status Badge */}
                                    <div className="mt-4">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(data.status)}`}>
                                            {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Save className="w-5 h-5" />
                                        {processing ? 'Saving...' : (isEdit ? 'Update Comment' : 'Post')}
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