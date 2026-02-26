import { type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  icon: LucideIcon;
  iconColor?: string;
  children: ReactNode;
}

export default function SectionCard({ 
  title, 
  icon: Icon, 
  iconColor = 'text-blue-600',
  children 
}: SectionCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <Icon className={`w-5 h-5 ${iconColor}`} />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}
