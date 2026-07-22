import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Save, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Loyalty Points', href: '/admin/loyalty' },
    { title: 'Earning Rules',  href: '#' },
];

interface Settings {
    loyalty_points_per_rupee:   string;
    loyalty_min_order_amount:   string;
    loyalty_points_expiry_days: string;
    loyalty_redemption_rate:    string;
}

const cx = {
    input:   "w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm",
    label:   "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5",
    hint:    "text-xs text-gray-500 dark:text-gray-400 mt-1",
    card:    "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5",
};

function Field({
    label,
    hint,
    children,
}: {
    label: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className={cx.label}>{label}</label>
            {children}
            {hint && <p className={cx.hint}>{hint}</p>}
        </div>
    );
}

export default function Settings({
    settings: initial,
    flash,
}: {
    settings: Settings;
    flash?: { success?: string; error?: string };
}) {
    const [form, setForm]         = useState<Settings>(initial);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error)   toast.error(flash.error);
    }, [flash]);

    function handleChange(key: keyof Settings, value: string) {
        setForm(prev => ({ ...prev, [key]: value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        router.post('/admin/loyalty/settings', form, {
            onSuccess: () => toast.success('Settings saved.'),
            onError:   () => toast.error('Failed to save settings.'),
            onFinish:  () => setSubmitting(false),
        });
    }

    // Live preview: PKR → points earned
    const pkrExample   = 500;
    const perRupee     = parseFloat(form.loyalty_points_per_rupee) || 0;
    const previewPoints = Math.floor(pkrExample * perRupee);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Loyalty Earning Rules" />

            <div className="p-4 max-w-2xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/loyalty"
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Loyalty Earning Rules
                    </h1>
                </div>

                {/* Live preview banner */}
                <div className="flex items-start gap-3 px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                    <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">
                        <strong>Live preview:</strong> A customer spending PKR {pkrExample.toLocaleString()} will earn{' '}
                        <strong>{previewPoints} point{previewPoints !== 1 ? 's' : ''}</strong> with the current setting.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={cx.card}>
                        {/* Points per rupee */}
                        <Field
                            label="Points Earned per PKR Spent"
                            hint="Example: 0.01 = 1 point per Rs. 100 spent. 0.1 = 1 point per Rs. 10."
                        >
                            <input
                                type="number"
                                step="0.001"
                                min="0"
                                max="100"
                                value={form.loyalty_points_per_rupee}
                                onChange={(e) => handleChange('loyalty_points_per_rupee', e.target.value)}
                                className={cx.input}
                            />
                        </Field>

                        {/* Minimum order amount */}
                        <Field
                            label="Minimum Order Amount to Earn Points (PKR)"
                            hint="Set to 0 to earn points on all orders regardless of amount."
                        >
                            <input
                                type="number"
                                step="1"
                                min="0"
                                value={form.loyalty_min_order_amount}
                                onChange={(e) => handleChange('loyalty_min_order_amount', e.target.value)}
                                className={cx.input}
                            />
                        </Field>

                        {/* Points expiry */}
                        <Field
                            label="Points Expiry (days)"
                            hint="Set to 0 to never expire points. Example: 365 = points expire after 1 year."
                        >
                            <input
                                type="number"
                                step="1"
                                min="0"
                                value={form.loyalty_points_expiry_days}
                                onChange={(e) => handleChange('loyalty_points_expiry_days', e.target.value)}
                                className={cx.input}
                            />
                        </Field>

                        {/* Redemption rate */}
                        <Field
                            label="PKR Value per Point (Redemption Rate)"
                            hint="How much PKR is each point worth when redeemed at checkout? Set to 0 to disable redemption entirely."
                        >
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.loyalty_redemption_rate}
                                onChange={(e) => handleChange('loyalty_redemption_rate', e.target.value)}
                                className={cx.input}
                            />
                        </Field>

                        {/* Save */}
                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
                            >
                                <Save className="w-4 h-4" />
                                {submitting ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Current config note */}
                <div className="text-xs text-gray-400 dark:text-gray-500 px-1">
                    These settings are stored in the system's general settings table and take effect immediately on the next delivered order.
                    The <strong>OrderObserver</strong> reads <code>loyalty_points_per_rupee</code> to calculate earned points.
                    To use the saved config dynamically, update <code>OrderObserver</code> to read from <code>GeneralSetting</code> instead of the hardcoded 0.01 rate.
                </div>

            </div>
        </AppLayout>
    );
}
