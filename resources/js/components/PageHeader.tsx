import { Link } from '@inertiajs/react';
import { ArrowLeft, type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  backUrl: string;
  backLabel?: string;
  actions?: ReactNode;
}

export default function PageHeader({ 
  title, 
  backUrl, 
  backLabel = 'Back',
  actions 
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <Link
          href={backUrl}
          className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10 transition-colors"
          title={backLabel}
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
      </div>
      
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// Reusable action button components
interface ActionButtonProps {
  href: string;
  icon: LucideIcon;
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function ActionButton({ 
  href, 
  icon: Icon, 
  label, 
  variant = 'primary' 
}: ActionButtonProps) {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${variantClasses[variant]}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
}
