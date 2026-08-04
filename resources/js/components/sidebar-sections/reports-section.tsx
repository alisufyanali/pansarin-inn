// components/sidebar-sections/reports-section.tsx
import { BarChart2 } from 'lucide-react';
import { type NavItem } from '@/types';

interface ReportsSectionProps {
    hasAnyReportsPerm: boolean;
}

// Reports renders as a direct top-level link — no sub-menu needed since there's
// only one destination (/admin/reports). The page itself handles all sub-sections
// via internal tabs/panels.
export function ReportsSection({ hasAnyReportsPerm }: ReportsSectionProps): NavItem | null {
    if (!hasAnyReportsPerm) return null;

    return {
        title: 'Reports & Analytics',
        href: '/admin/reports',
        icon: BarChart2,
    };
}
