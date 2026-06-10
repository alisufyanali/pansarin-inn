import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Save, Mail, User, Globe } from 'lucide-react';

interface Newsletter {
    id?: number;
    email?: string;
    name?: string;
    status?: 'active' | 'unsubscribed' | 'bounced';
    source?: string;
    verified_at?: string | null;
}

interface FormProps {
    newsletter?: Newsletter;
    isEdit?: boolean;
}

export default function NewsletterForm({ newsletter, isEdit = false }: FormProps) {
    const { data, setData, post, put, processing, errors } = useForm({
        email: newsletter?.email ?? '',
        name: newsletter?.name ?? '',
        status: newsletter?.status ?? 'active',
        source: newsletter?.source ?? 'admin',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && newsletter?.id) {
            put(`/admin/newsletters/${newsletter.id}`);
        } else {
            post('/admin/newsletters');
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link
                    href="/admin/newsletters"
                    className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {isEdit ? 'Edit Subscriber' : 'Add Subscriber'}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {isEdit ? 'Update subscriber details' : 'Add a new newsletter subscriber'}
                    </p>
                </div>
            </div>

            <form onSubmit={submit}>
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-5">

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                disabled={isEdit}
                                placeholder="subscriber@example.com"
                                className={`w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm
                                    ${errors.email ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                                    ${isEdit ? 'bg-gray-50 dark:bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-white dark:bg-gray-800'}
                                    text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition`}
                            />
                        </div>
                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                        {isEdit && <p className="mt-1 text-xs text-gray-400">Email cannot be changed after creation.</p>}
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Name <span className="text-gray-400 text-xs">(optional)</span>
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                placeholder="Subscriber name"
                                className={`w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm
                                    ${errors.name ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                    focus:ring-2 focus:ring-blue-500 outline-none transition`}
                            />
                        </div>
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Status <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={data.status}
                            onChange={e => setData('status', e.target.value as 'active' | 'unsubscribed' | 'bounced')}
                            className={`w-full px-4 py-2.5 rounded-lg border text-sm
                                ${errors.status ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                                bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                focus:ring-2 focus:ring-blue-500 outline-none transition`}
                        >
                            <option value="active">Active</option>
                            <option value="unsubscribed">Unsubscribed</option>
                            <option value="bounced">Bounced</option>
                        </select>
                        {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status}</p>}
                    </div>

                    {/* Source */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Source <span className="text-gray-400 text-xs">(optional)</span>
                        </label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={data.source}
                                onChange={e => setData('source', e.target.value)}
                                placeholder="e.g. admin, website, popup"
                                className={`w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm
                                    ${errors.source ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                    focus:ring-2 focus:ring-blue-500 outline-none transition`}
                            />
                        </div>
                        {errors.source && <p className="mt-1 text-xs text-red-500">{errors.source}</p>}
                    </div>

                    {/* Info: Auto-verified */}
                    {!isEdit && (
                        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                            <span className="text-blue-600 dark:text-blue-400 text-xs mt-0.5">ℹ️</span>
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                Subscribers added by admin are automatically marked as <strong>verified</strong>.
                            </p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-6">
                    <button
                        type="submit"
                        disabled={processing}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition"
                    >
                        <Save className="w-4 h-4" />
                        {processing ? 'Saving...' : (isEdit ? 'Update Subscriber' : 'Add Subscriber')}
                    </button>
                    <Link
                        href="/admin/newsletters"
                        className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
