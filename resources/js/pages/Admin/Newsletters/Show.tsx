import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit2, Mail, CheckCircle, XCircle, Calendar, Globe, Monitor } from 'lucide-react';

interface Newsletter {
    id: number;
    email: string;
    name?: string;
    status: 'active' | 'unsubscribed' | 'bounced';
    verification_token?: string;
    verified_at?: string;
    source?: string;
    ip_address?: string;
    user_agent?: string;
    created_at: string;
    updated_at: string;
}

export default function Show({ newsletter }: { newsletter: Newsletter }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Newsletter Subscribers', href: '/admin/newsletters' },
        { title: newsletter.email, href: '#' },
    ];

    const getStatusBadge = () => {
        const badges = {
            active: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
            unsubscribed: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: XCircle },
            bounced: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
        };
        const badge = badges[newsletter.status];
        const Icon = badge.icon;
        
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${badge.color}`}>
                <Icon className="w-4 h-4" />
                {newsletter.status.charAt(0).toUpperCase() + newsletter.status.slice(1)}
            </span>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={newsletter.email} />
            
            <div className="p-3">
                {/* Header Actions */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Link
                            href="/admin/newsletters"
                            className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Subscriber Details
                        </h1>
                    </div>
                    
                    <Link
                        href={`/admin/newsletters/${newsletter.id}/edit`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit Subscriber
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                                <Mail className="w-5 h-5 text-blue-600" />
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Subscriber Information
                                </h2>
                            </div>
                            
                            <div className="space-y-4">
                                <InfoRow label="Email" value={newsletter.email} mono />
                                <InfoRow label="Name" value={newsletter.name} />
                                <div className="flex justify-between items-start gap-4">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[140px]">
                                        Status
                                    </span>
                                    <div className="text-right">
                                        {getStatusBadge()}
                                    </div>
                                </div>
                                <InfoRow label="Source" value={newsletter.source} />
                            </div>
                        </div>

                        {/* Technical Information */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                                <Monitor className="w-5 h-5 text-purple-600" />
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Technical Details
                                </h2>
                            </div>
                            
                            <div className="space-y-4">
                                <InfoRow label="IP Address" value={newsletter.ip_address} mono />
                                <InfoRow 
                                    label="User Agent" 
                                    value={newsletter.user_agent}
                                    multiline
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Verification Status */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Verification Status
                            </h3>
                            <div className="space-y-3">
                                <StatItem 
                                    label="Verified" 
                                    value={newsletter.verified_at ? 'Yes' : 'No'} 
                                />
                                {newsletter.verified_at && (
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Verified At</p>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {new Date(newsletter.verified_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Timestamps */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                Timestamps
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Subscribed</p>
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        {new Date(newsletter.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Last Updated</p>
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        {new Date(newsletter.updated_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

// Helper Components
function InfoRow({ 
    label, 
    value, 
    mono = false, 
    multiline = false 
}: { 
    label: string; 
    value?: string | null; 
    mono?: boolean;
    multiline?: boolean;
}) {
    return (
        <div className={multiline ? '' : 'flex justify-between items-start gap-4'}>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[140px]">
                {label}
            </span>
            <span className={`text-sm text-gray-900 dark:text-white ${multiline ? 'mt-2 block' : 'text-right'} ${mono ? 'font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded' : ''}`}>
                {value || '-'}
            </span>
        </div>
    );
}

function StatItem({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
            <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
        </div>
    );
}