import React from 'react';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Mail, User, Phone, MessageSquare } from 'lucide-react';
import { Link } from '@inertiajs/react';

export type ContactFormData = {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    status: string;
    admin_reply: string;
};

interface ContactFormProps {
    contact?: ContactFormData & { id?: number };
    isEdit?: boolean;
}

export default function ContactForm({ contact, isEdit = false }: ContactFormProps) {
    const { data, setData, errors, post, processing } = useForm<ContactFormData>({
        name: contact?.name || '',
        email: contact?.email || '',
        phone: contact?.phone || '',
        subject: contact?.subject || '',
        message: contact?.message || '',
        status: contact?.status || 'new',
        admin_reply: contact?.admin_reply || '',
    });

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        
        if (isEdit && contact?.id) {
            post(`/admin/contacts/${contact.id}`, {
                method: 'put' as any,
            });
        } else {
            post('/admin/contacts');
        }
    }

    return (
        <div className="p-4 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link
                    href="/admin/contacts"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isEdit ? 'Edit Contact' : 'New Contact'}
                </h1>
            </div>

            <form onSubmit={submit} className="space-y-6">
                {/* Contact Information */}
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Contact Information</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter full name"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                required
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                placeholder="Enter email address"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                required
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                Phone
                            </label>
                            <input
                                type="text"
                                placeholder="Enter phone number"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                value={data.phone}
                                onChange={e => setData('phone', e.target.value)}
                            />
                            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            >
                                <option value="new">New</option>
                                <option value="read">Read</option>
                                <option value="replied">Replied</option>
                                <option value="resolved">Resolved</option>
                                <option value="spam">Spam</option>
                            </select>
                            {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
                        </div>
                    </div>
                </div>

                {/* Message Details */}
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Message Details</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                Subject <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter subject"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                value={data.subject}
                                onChange={e => setData('subject', e.target.value)}
                                required
                            />
                            {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                Message <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                placeholder="Enter message content"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                rows={6}
                                value={data.message}
                                onChange={e => setData('message', e.target.value)}
                                required
                            />
                            {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                        </div>
                    </div>
                </div>

                {/* Admin Reply */}
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Admin Reply</h3>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                            Reply Message
                        </label>
                        <textarea
                            placeholder="Type admin reply here..."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            rows={4}
                            value={data.admin_reply}
                            onChange={e => setData('admin_reply', e.target.value)}
                        />
                        {errors.admin_reply && <p className="text-red-500 text-sm mt-1">{errors.admin_reply}</p>}
                    </div>
                </div>

                {/* Actions */}
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex gap-3">
                        <Link
                            href="/admin/contacts"
                            className="flex-1 text-center border border-gray-300 dark:border-gray-600 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                        >
                            Cancel
                        </Link>
                        
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {processing ? 'Saving...' : (isEdit ? 'Update Contact' : 'Create Contact')}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}