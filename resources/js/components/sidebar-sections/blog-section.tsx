// components/sidebar-sections/blog-section.tsx
import { BookOpen, Folder, FileText, MessageSquare, Tag } from 'lucide-react';
import { type NavItem } from '@/types';

interface BlogSectionProps {
    hasAnyBlogPerm: boolean;
    hasAnyBlogCategoryPerm: boolean;
    hasAnyBlogCommentPerm: boolean;
    hasAnyBlogTagPerm: boolean;
}

export function BlogSection({
    hasAnyBlogPerm,
    hasAnyBlogCategoryPerm,
    hasAnyBlogCommentPerm,
    hasAnyBlogTagPerm,
}: BlogSectionProps): NavItem | null {
    if (!hasAnyBlogPerm && !hasAnyBlogCategoryPerm && !hasAnyBlogCommentPerm && !hasAnyBlogTagPerm) {
        return null;
    }

    const children: NavItem[] = [];

    if (hasAnyBlogPerm) {
        children.push({
            title: 'Blog List',
            href: '/admin/blogs',
            icon: FileText,
        });
    }

    if (hasAnyBlogCategoryPerm) {
        children.push({
            title: 'Blog Categories',
            href: '/admin/blogcategories',
            icon: Folder,
        });
    }

    if (hasAnyBlogCommentPerm) {
        children.push({
            title: 'Blog Comments',
            href: '/admin/blogscomments',
            icon: MessageSquare,
        });
    }

    if (hasAnyBlogTagPerm) {
        children.push({
            title: 'Blog Tags',
            href: '/admin/blogtags',
            icon: Tag,
        });
    }

    return {
        title: 'Blog',
        href: '#',
        icon: BookOpen,
        children,
    };
}
