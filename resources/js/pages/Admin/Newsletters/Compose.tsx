import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Mail, Send, Users, User, Search, CheckSquare, Square } from 'lucide-react';
import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Newsletter', href: '/admin/newsletters' },
    { title: 'Compose', href: '#' },
];

interface Subscriber {
    id: number;
    email: string;
    name?: string;
}

interface Props {
    subscribers: Subscriber[];
    flash?: { success?: string; error?: string };
}

export default function Compose({ subscribers, flash }: Props) {
    const [search, setSearch] = useState('');
    const [showPreview, setShowPreview] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        subject: '',
        body: '',
        send_to: 'all' as 'all' | 'specific',
        emails: [] as string[],
    });

    const filteredSubscribers = useMemo(
        () =>
            subscribers.filter(
                (s) =>
                    s.email.toLowerCase().includes(search.toLowerCase()) ||
                    (s.name ?? '').toLowerCase().includes(search.toLowerCase()),
            ),
        [subscribers, search],
    );

    const recipientCount =
        data.send_to === 'all' ? subscribers.length : data.emails.length;

    const toggleEmail = (email: string) => {
        setData(
            'emails',
            data.emails.includes(email)
                ? data.emails.filter((e) => e !== email)
                : [...data.emails, email],
        );
    };

    const selectAll = () =>
        setData(
            'emails',
            filteredSubscribers.map((s) => s.email),
        );

    const deselectAll = () => setData('emails', []);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.subject.trim() || !data.body.trim()) {
            toast.error('Subject and body are required.');
            return;
        }
        if (data.send_to === 'specific' && data.emails.length === 0) {
            toast.error('Select at least one subscriber.');
            return;
        }

        post('/admin/newsletters/compose/send', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Email queued for ${recipientCount} subscriber(s)!`);
                reset('subject', 'body');
                setData('emails', []);
            },
            onError: () => toast.error('Failed to send emails. Please try again.'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Compose Newsletter Email" />

            <div className="flex flex-col gap-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/newsletters"
                        className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Mail className="w-6 h-6 text-green-600" />
                            Compose Newsletter Email
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {subscribers.length} active subscriber(s) available
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Subject */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Subject <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.subject}
                            onChange={(e) => setData('subject', e.target.value)}
                            placeholder="Enter email subject..."
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm"
                        />
                    </div>

                    {/* Send To */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Send To
                        </label>
                        <div className="flex flex-col gap-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="send_to"
                                    value="all"
                                    checked={data.send_to === 'all'}
                                    onChange={() => setData('send_to', 'all')}
                                    className="w-4 h-4 text-green-600 focus:ring-green-500"
                                />
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-green-600" />
                                    <span className="font-medium text-gray-800 dark:text-gray-200">
                                        All Subscribers
                                    </span>
                                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                                        {subscribers.length} subscribers
                                    </span>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="send_to"
                                    value="specific"
                                    checked={data.send_to === 'specific'}
                                    onChange={() => setData('send_to', 'specific')}
                                    className="w-4 h-4 text-green-600 focus:ring-green-500"
                                />
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-blue-600" />
                                    <span className="font-medium text-gray-800 dark:text-gray-200">
                                        Specific Subscribers
                                    </span>
                                    {data.send_to === 'specific' && data.emails.length > 0 && (
                                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                                            {data.emails.length} selected
                                        </span>
                                    )}
                                </div>
                            </label>
                        </div>

                        {/* Specific subscriber picker */}
                        {data.send_to === 'specific' && (
                            <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                {/* Toolbar */}
                                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search emails..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-green-500 outline-none"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={selectAll}
                                        className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                    >
                                        <CheckSquare className="w-3.5 h-3.5" />
                                        All
                                    </button>
                                    <button
                                        type="button"
                                        onClick={deselectAll}
                                        className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                                    >
                                        <Square className="w-3.5 h-3.5" />
                                        None
                                    </button>
                                </div>

                                {/* List */}
                                <div className="max-h-52 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                                    {filteredSubscribers.length === 0 ? (
                                        <p className="text-center text-sm text-gray-400 py-6">
                                            No subscribers found
                                        </p>
                                    ) : (
                                        filteredSubscribers.map((s) => {
                                            const checked = data.emails.includes(s.email);
                                            return (
                                                <label
                                                    key={s.id}
                                                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                                                        checked
                                                            ? 'bg-green-50 dark:bg-green-900/20'
                                                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => toggleEmail(s.email)}
                                                        className="w-4 h-4 rounded text-green-600 focus:ring-green-500"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                                            {s.email}
                                                        </p>
                                                        {s.name && (
                                                            <p className="text-xs text-gray-400 truncate">{s.name}</p>
                                                        )}
                                                    </div>
                                                </label>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Body */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Body <span className="text-red-500">*</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowPreview(!showPreview)}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                {showPreview ? 'Hide Preview' : 'Show Preview'}
                            </button>
                        </div>
                        <textarea
                            rows={12}
                            value={data.body}
                            onChange={(e) => setData('body', e.target.value)}
                            placeholder="Write your email content here..."
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm resize-vertical font-mono"
                        />

                        {showPreview && data.body && (
                            <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                    Preview
                                </div>
                                <div className="p-4 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                    {data.body}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Will send to{' '}
                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                                {recipientCount}
                            </span>{' '}
                            subscriber(s)
                        </p>
                        <button
                            type="submit"
                            disabled={
                                processing ||
                                !data.subject.trim() ||
                                !data.body.trim() ||
                                (data.send_to === 'specific' && data.emails.length === 0)
                            }
                            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-all shadow-md disabled:cursor-not-allowed"
                        >
                            {processing ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Send to {recipientCount} subscriber(s)
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
