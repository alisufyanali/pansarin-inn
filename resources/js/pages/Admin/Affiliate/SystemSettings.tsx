import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';

interface SettingsProps {
    settings: {
        default_commission: string;
        min_payout: string;
        cookie_duration: string;
    }
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Affiliate Settings',
        href: '/admin/affiliate/settings',
    },
];

export default function SystemSettings({ settings }: SettingsProps) {
    // Form handling using Inertia useForm
    const { data, setData, post, processing, errors } = useForm({
        default_commission: settings?.default_commission || '5',
        min_payout: settings?.min_payout || '1000',
        cookie_duration: settings?.cookie_duration || '30',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.affiliate.settings.update'), {
            preserveScroll: true,
            onSuccess: () => {
                // Aap yahan success notification add kar sakte hain
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Affiliate Settings" />

            <div className="flex flex-col gap-8 max-w-3xl">

  {/* Page Header */}
  <div>
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
      Affiliate System Settings
    </h1>
    <p className="mt-2 text-gray-600 dark:text-gray-400">
      Manage global commission rates and payout rules
    </p>
  </div>

  {/* Settings Card */}
  <form
    onSubmit={submit}
    className="bg-white dark:bg-gray-900
      border border-gray-200 dark:border-gray-800
      rounded-2xl shadow-sm p-8 space-y-6"
  >
    {/* Default Commission */}
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
        Default Commission (%)
      </label>

      <input
        type="number"
        value={data.default_commission}
        onChange={e => setData('default_commission', e.target.value)}
        className={`block w-full rounded-lg border
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-white
          shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm
          ${errors.default_commission
            ? 'border-red-500'
            : 'border-gray-300 dark:border-gray-700'
          }`}
        placeholder="5"
      />

      {errors.default_commission && (
        <p className="text-red-500 text-xs mt-1 font-medium">
          {errors.default_commission}
        </p>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        This percentage will be automatically assigned to new affiliates.
      </p>
    </div>

    {/* Minimum Payout */}
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
        Minimum Payout Limit (Rs.)
      </label>

      <input
        type="number"
        value={data.min_payout}
        onChange={e => setData('min_payout', e.target.value)}
        className={`block w-full rounded-lg border
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-white
          shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm
          ${errors.min_payout
            ? 'border-red-500'
            : 'border-gray-300 dark:border-gray-700'
          }`}
        placeholder="1000"
      />

      {errors.min_payout && (
        <p className="text-red-500 text-xs mt-1 font-medium">
          {errors.min_payout}
        </p>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Affiliates can request a payout only after reaching this minimum amount.
      </p>
    </div>

    {/* Cookie Duration */}
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
        Cookie Duration (Days)
      </label>

      <input
        type="number"
        value={data.cookie_duration}
        onChange={e => setData('cookie_duration', e.target.value)}
        className={`block w-full rounded-lg border
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-white
          shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm
          ${errors.cookie_duration
            ? 'border-red-500'
            : 'border-gray-300 dark:border-gray-700'
          }`}
        placeholder="30"
      />

      {errors.cookie_duration && (
        <p className="text-red-500 text-xs mt-1 font-medium">
          {errors.cookie_duration}
        </p>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Number of days a customer will be tracked after clicking an affiliate link.
      </p>
    </div>

    {/* Action Bar */}
    <div className="pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-end">
      <button
        type="submit"
        disabled={processing}
        className="inline-flex items-center px-6 py-2.5
          bg-gradient-to-r from-indigo-600 to-purple-600
          hover:from-indigo-700 hover:to-purple-700
          text-white rounded-xl font-semibold
          shadow-sm hover:shadow-md transition-all
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? 'Saving…' : 'Save Settings'}
      </button>
    </div>
  </form>
</div>

        </AppLayout>
    );
}