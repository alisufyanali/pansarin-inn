import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import { Toaster } from "react-hot-toast";

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
        <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
                style: {
                    background: 'var(--toast-bg, #1f2937)',
                    color: 'var(--toast-color, #f9fafb)',
                    border: '1px solid var(--toast-border, #374151)',
                    borderRadius: '8px',
                    fontSize: '14px',
                },
                success: {
                    iconTheme: {
                        primary: '#10b981',
                        secondary: '#f9fafb',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#ef4444',
                        secondary: '#f9fafb',
                    },
                },
            }}
        />
        {children}
    </AppLayoutTemplate>
);
