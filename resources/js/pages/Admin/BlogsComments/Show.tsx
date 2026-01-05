import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, MessageSquare, User, FileText, Shield, Star, Image as ImageIcon, Plus } from 'lucide-react';

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

export default function Show({ blogComment }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Blog Comments', href: '/admin/blogsComments' },
    { title: `View #${blogComment.id}`, href: '#' },
  ];

  const getStatusBadge = (status: string) => {
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
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1 mt-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          {rating} / 5
        </span>
      </div>
    );
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Comment #${blogComment.id}`} />

      <div className="p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/blogsComments"
              className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Comment Details
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Comment ID: #{blogComment.id}
              </p>
            </div>
          </div>
          <Link
            href={`/admin/blogsComments/${blogComment.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            Edit Comment
          </Link>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Comment Content */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Comment Text
                  </h2>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                    {blogComment.comments}
                  </p>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  {blogComment.comments.length} characters
                </div>
              </div>

              {/* Review Content (if exists) */}
              {blogComment.review && (
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Detailed Review
                    </h2>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                      {blogComment.review}
                    </p>
                  </div>
                  {renderStars(blogComment.rating)}
                </div>
              )}

              {/* Blog Information with Image */}
              {blogComment.blog && (
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Related Blog Post
                      </h2>
                    </div>
                    <Link
                      href={`/admin/blogsComments/create?blog_id=${blogComment.blog.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-medium transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Comment
                    </Link>
                  </div>

                  <Link
                    href={`/admin/blogs/${blogComment.blog.id}`}
                    className="block bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition overflow-hidden"
                  >
                    {/* Blog Image */}
                    {blogComment.blog.image ? (
                      <div className="aspect-video w-full overflow-hidden">
                        <img
                          src={`/storage/${blogComment.blog.image}`}
                          alt={blogComment.blog.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video w-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-blue-300 dark:text-blue-700" />
                      </div>
                    )}

                    <div className="p-4">
                      <p className="text-blue-900 dark:text-blue-300 font-medium">
                        {blogComment.blog.title}
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                        Click to view blog post →
                      </p>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status Card */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Status
                  </h2>
                </div>
                <span className={`inline-flex px-4 py-2 text-sm rounded-full font-medium border ${getStatusBadge(blogComment.status)}`}>
                  {blogComment.status.charAt(0).toUpperCase() + blogComment.status.slice(1)}
                </span>
              </div>

              {/* Rating Card (if exists) */}
              {blogComment.rating && !blogComment.review && (
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Rating
                    </h2>
                  </div>
                  {renderStars(blogComment.rating)}
                </div>
              )}

              {/* User Information */}
              {blogComment.user && (
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Author
                    </h2>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-900 dark:text-white font-medium">
                      {blogComment.user.name}
                    </p>
                    {blogComment.user.email && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {blogComment.user.email}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Timeline
                  </h2>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Created At
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDate(blogComment.created_at)}
                    </p>
                  </div>
                  {blogComment.updated_at && blogComment.updated_at !== blogComment.created_at && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Last Updated
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatDate(blogComment.updated_at)}
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