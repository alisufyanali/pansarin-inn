// resources/js/components/sidebar-sections/frontend-management-section.tsx
import { BookOpen, Folder, FileText, MessageSquare, Tag } from 'lucide-react';
import { type NavItem } from '@/types';

export function FrontendManagementSection(): NavItem {
    return {
        title: 'Frontend Management',
        href: '#',
        icon: BookOpen,
        children: [
            // {
            //     title: 'Blog List',
            //     href: '/admin/blogs',
            //     icon: FileText,
            // },
            // {
            //     title: 'Blog Categories',
            //     href: '/admin/blogcategories',
            //     icon: Folder,
            // },
            // {
            //     title: 'Blog Comments',
            //     href: '/admin/blogscomments',
            //     icon: MessageSquare,
            // },
            // {
            //     title: 'Blog Tags',
            //     href: '/admin/blogtags',
            //     icon: Tag,
            // },
        ],
    };
}