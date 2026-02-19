import { Activity, CheckCircle, XCircle } from 'lucide-react';

interface StatusCardProps {
  isActive: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}

export default function StatusCard({ 
  isActive, 
  activeLabel = 'Active',
  inactiveLabel = 'Inactive'
}: StatusCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Status</h2>
      </div>
      <div className="flex items-center gap-2">
        {isActive ? (
          <>
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-700 dark:text-green-400">{activeLabel}</span>
          </>
        ) : (
          <>
            <XCircle className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-700 dark:text-gray-400">{inactiveLabel}</span>
          </>
        )}
      </div>
    </div>
  );
}
