import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import { Save, Mail, User, Phone, MessageSquare } from 'lucide-react';
import FieldError from '@/components/FieldError';
import PageHeader from '@/components/PageHeader';
import { inputClass, cardClass, labelClass, buttonPrimaryClass, buttonSecondaryClass } from '@/utils/formStyles';

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

export default function Form({ contact, isEdit = false }: ContactFormProps) {
    const { data, setData, errors, post, put, processing } = useForm<ContactFormData>({
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
            put(`/admin/contacts/${contact.id}`);
        } else {
            post('/admin/contacts');
        }
    }

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <PageHeader
                title={isEdit ? 'Edit Contact' : 'New Contact'}
                backUrl="/admin/contacts"
            />

            <form onSubmit={submit} className="space-y-6">
                {/* Contact Information */}
                <div className={cardClass}>
                    <div className="flex items-center gap-2 mb-4">
                        <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Contact Information</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter full name"
                                className={inputClass(errors.name)}
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                required
                            />
                            <FieldError message={errors.name} />
                        </div>

                        <div>
                            <label className={labelClass}>
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                placeholder="Enter email address"
                                className={inputClass(errors.email)}
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                required
                            />
                            <FieldError message={errors.email} />
                        </div>

                        <div>
                            <label className={labelClass}>
                                Phone
                            </label>
                            <input
                                type="text"
                                placeholder="Enter phone number"
                                className={inputClass(errors.phone)}
                                value={data.phone}
                                onChange={e => setData('phone', e.target.value)}
                            />
                            <FieldError message={errors.phone} />
                        </div>

                        <div>
                            <label className={labelClass}>
                                Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className={inputClass(errors.status)}
                                required
                            >
                                <option value="new">New</option>
                                <option value="read">Read</option>
                                <option value="replied">Replied</option>
                                <option value="resolved">Resolved</option>
                                <option value="spam">Spam</option>
                            </select>
                            <FieldError message={errors.status} />
                        </div>
                    </div>
                </div>

                {/* Message Details */}
                <div className={cardClass}>
                    <div className="flex items-center gap-2 mb-4">
                        <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Message Details</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className={labelClass}>
                                Subject <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter subject"
                                className={inputClass(errors.subject)}
                                value={data.subject}
                                onChange={e => setData('subject', e.target.value)}
                                required
                            />
                            <FieldError message={errors.subject} />
                        </div>

                        <div>
                            <label className={labelClass}>
                                Message <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                placeholder="Enter message content"
                                className={inputClass(errors.message)}
                                rows={6}
                                value={data.message}
                                onChange={e => setData('message', e.target.value)}
                                required
                            />
                            <FieldError message={errors.message} />
                        </div>
                    </div>
                </div>

                {/* Admin Reply */}
                <div className={cardClass}>
                    <div className="flex items-center gap-2 mb-4">
                        <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Admin Reply</h3>
                    </div>

                    <div>
                        <label className={labelClass}>
                            Reply Message
                        </label>
                        <textarea
                            placeholder="Type admin reply here..."
                            className={inputClass(errors.admin_reply)}
                            rows={4}
                            value={data.admin_reply}
                            onChange={e => setData('admin_reply', e.target.value)}
                        />
                        <FieldError message={errors.admin_reply} />
                    </div>
                </div>

                {/* Actions */}
                <div className={cardClass}>
                    <div className="space-y-3">
                        <button type="submit" disabled={processing} className={buttonPrimaryClass}>
                            <Save className="w-4 h-4" />
                            {processing ? 'Saving...' : (isEdit ? 'Update Contact' : 'Create Contact')}
                        </button>
                        <Link href="/admin/contacts" className={buttonSecondaryClass}>
                            Cancel
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
}
