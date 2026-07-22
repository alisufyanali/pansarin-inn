// components/sidebar-sections/reports-section.tsx
import { BarChart2 } from 'lucide-react';
import { type NavItem } from '@/types';

interface ReportsSectionProps {
    hasAnyReportsPerm: boolean;
}

export function ReportsSection({ hasAnyReportsPerm }: ReportsSectionProps): NavItem | null {
    if (!hasAnyReportsPerm) return null;

    return {
        title: 'Reports',
        href: '#',
        icon: BarChart2,
        children: [
            {
                title: 'Reports & Analytics',
                href: '/admin/reports',
                icon: BarChart2,
            },
        ],
    };
}
