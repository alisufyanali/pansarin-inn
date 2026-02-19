import { Calendar } from 'lucide-react';
import { formatDate } from '@/utils/dateFormat';

interface TimelineCardProps {
  createdAt: string;
  updatedAt?: string;
  title?: string;
}

export default function TimelineCard({ 
  createdAt, 
  updatedAt,
  title = 'Timeline'
}: TimelineCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>
      <div className="space-y-3">
        <div>
          <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Created At</p>
          <p className="text-sm text-gray-900 dark:text-white">{formatDate(createdAt)}</p>
        </div>
        {updatedAt && updatedAt !== createdAt && (
          <div>
            <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Last Updated</p>
            <p className="text-sm text-gray-900 dark:text-white">{formatDate(updatedAt)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
