import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, MessageSquare, Star, Check, BookOpen } from 'lucide-react';
import React, { useState } from 'react';

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
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
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
        <div className="p-4 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link
                    href="/admin/blogscomments"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Link>
                <h1 className="text-2xl font-bold">
                    {isEdit ? 'Edit Comment' : 'New Comment'}
                </h1>
            </div>

            <form onSubmit={submit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Blog Selection */}
                        <div className="bg-white rounded-lg border p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <BookOpen className="w-5 h-5 text-gray-600" />
                                <h3 className="font-semibold text-lg">Blog Selection</h3>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Select Blog <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.blog_id || ''}
                                    onChange={(e) => setData('blog_id', e.target.value ? Number(e.target.value) : null)}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    required
                                >
                                    <option value="">-- Choose a blog --</option>
                                    {blogs.map((blog) => (
                                        <option key={blog.id} value={blog.id}>
                                            {blog.title}
                                        </option>
                                    ))}
                                </select>
                                {errors.blog_id && <p className="text-red-500 text-sm mt-1">{errors.blog_id}</p>}

                                {selectedBlog && (
                                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-800">
                                            <span className="font-medium">Selected:</span> {selectedBlog.title}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Comment */}
                        <div className="bg-white rounded-lg border p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <MessageSquare className="w-5 h-5 text-gray-600" />
                                <h3 className="font-semibold text-lg">Comment</h3>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Comment <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={data.comments}
                                    onChange={(e) => setData('comments', e.target.value)}
                                    placeholder="Write your comment here..."
                                    className="w-full px-3 py-2 border rounded-lg min-h-[120px]"
                                    required
                                />
                                <div className="flex justify-between items-center mt-2">
                                    {errors.comments && <p className="text-red-500 text-sm">{errors.comments}</p>}
                                    <span className="text-xs text-gray-500">
                                        {data.comments.length}/1000 characters
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Review & Rating */}
                        <div className="bg-white rounded-lg border p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Star className="w-5 h-5 text-gray-600" />
                                <h3 className="font-semibold text-lg">Review & Rating</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Detailed Review (Optional)</label>
                                    <textarea
                                        value={data.review || ''}
                                        onChange={(e) => setData('review', e.target.value)}
                                        placeholder="Write a detailed review..."
                                        className="w-full px-3 py-2 border rounded-lg min-h-[100px]"
                                    />
                                    {data.review && (
                                        <span className="text-xs text-gray-500 mt-1 block">
                                            {data.review.length}/2000 characters
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Rating (Optional)</label>
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => handleStarClick(star)}
                                                onMouseEnter={() => handleStarHover(star)}
                                                onMouseLeave={handleStarLeave}
                                                className="focus:outline-none"
                                            >
                                                <Star
                                                    className={`w-7 h-7 ${
                                                        star <= displayRating
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'text-gray-300'
                                                    }`}
                                                />
                                            </button>
                                        ))}
                                        {data.rating && (
                                            <span className="ml-2 text-sm text-gray-600">
                                                ({data.rating}/5)
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Status */}
                        <div className="bg-white rounded-lg border p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Check className="w-5 h-5 text-gray-600" />
                                <h3 className="font-semibold text-lg">Status</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Approval Status</label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value as 'pending' | 'approved' | 'rejected')}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>

                                <div>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(data.status)}`}>
                                        {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="bg-white rounded-lg border p-6">
                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    {processing ? 'Saving...' : (isEdit ? 'Update Comment' : 'Create Comment')}
                                </button>
                                
                                <Link
                                    href="/admin/blogscomments"
                                    className="block w-full text-center border py-2.5 rounded-lg hover:bg-gray-50"
                                >
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