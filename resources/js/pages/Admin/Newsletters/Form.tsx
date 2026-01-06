import React from 'react';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, Check, Mail, User, Shield, Tag } from 'lucide-react';
import { Link } from '@inertiajs/react';

export type NewsletterFormData = {
    email: string;
    name?: string;
    status: 'active' | 'unsubscribed' | 'bounced';
    source?: string;
};

interface NewsletterFormProps {
    newsletter?: NewsletterFormData & { id?: number };
    isEdit?: boolean;
}

export default function NewsletterForm({ newsletter, isEdit = false }: NewsletterFormProps) {
    const { data, setData, errors, post, put, processing } = useForm<NewsletterFormData>({
        email: newsletter?.email || '',
        name: newsletter?.name || '',
        status: newsletter?.status || 'active',
        source: newsletter?.source || '',
    });

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (isEdit && newsletter?.id) {
            put(`/admin/newsletters/${newsletter.id}`);
        } else {
            post('/admin/newsletters');
        }
    }

    return (
        <div className="p-3">
            <div className="flex items-center gap-2 mb-4">
                <Link
                    href="/admin/newsletters"
                    className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
            </div>

            <div className="py-6">
                <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
                        {isEdit ? 'Edit Newsletter Subscriber' : 'Create New Subscriber'}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
                        {isEdit ? 'Update the subscriber details below.' : 'Fill the form below to add a new subscriber.'}
                    </p>

                    <form onSubmit={submit} className="space-y-6">
                        {/* Basic Information Section */}
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                <Mail className="w-5 h-5" />
                                Basic Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="subscriber@example.com"
                                        required
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Name (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="John Doe"
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Status *
                                    </label>
                                    <select
                                        value={data.status}
                                        onChange={e => setData('status', e.target.value as any)}
                                        className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    >
                                        <option value="active">Active</option>
                                        <option value="unsubscribed">Unsubscribed</option>
                                        <option value="bounced">Bounced</option>
                                    </select>
                                    {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
                                </div>

                                {/* Source */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Source
                                    </label>
                                    <select
                                        value={data.source}
                                        onChange={e => setData('source', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="">Select Source</option>
                                        <option value="website">Website</option>
                                        <option value="popup">Popup</option>
                                        <option value="footer">Footer</option>
                                        <option value="landing_page">Landing Page</option>
                                        <option value="manual">Manual Entry</option>
                                    </select>
                                    {errors.source && <p className="text-red-500 text-xs mt-1">{errors.source}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <Link
                                href="/admin/newsletters"
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium transition"
                            >
                                <ArrowLeft size={16} />
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium transition"
                            >
                                <Check size={16} />
                                {isEdit ? 'Update Subscriber' : 'Create Subscriber'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}