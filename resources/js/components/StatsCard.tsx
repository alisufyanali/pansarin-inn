import { FileText, type LucideIcon } from 'lucide-react';

interface StatItem {
  label: string;
  value: number | string;
  color?: string;
}

interface StatsCardProps {
  title?: string;
  icon?: LucideIcon;
  stats: StatItem[];
}

export default function StatsCard({ 
  title = 'Statistics',
  icon: Icon = FileText,
  stats 
}: StatsCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>
      <div className="space-y-3">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</span>
            <span 
              className={`text-lg font-bold ${
                stat.color || 'text-gray-900 dark:text-white'
              }`}
            >
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
