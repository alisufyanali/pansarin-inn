import { Link } from '@inertiajs/react';
import { ShieldX } from 'lucide-react';

export default function Forbidden() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="text-center max-w-md">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-5">
                        <ShieldX className="w-16 h-16 text-red-500 dark:text-red-400" />
                    </div>
                </div>

                {/* Error Code */}
                <h1 className="text-7xl font-extrabold text-red-500 dark:text-red-400 mb-2">403</h1>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                    Access Denied
                </h2>

                {/* Message */}
                <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                    You don't have permission to view this page.
                    <br />
                    Please contact your administrator if you believe this is a mistake.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href={route('admin.dashboard')}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-3 transition-colors"
                    >
                        Back to Dashboard
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium px-6 py-3 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}
