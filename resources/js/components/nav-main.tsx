import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarMenuAction,
} from '@/components/ui/sidebar';
import { resolveUrl } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface NavMainProps {
    items: NavItem[];
}

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    const toggleExpanded = (title: string) => {
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(title)) {
                newSet.delete(title);
            } else {
                newSet.add(title);
            }
            return newSet;
        });
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const isExpanded = expandedItems.has(item.title);
                    const hasChildren = item.children && item.children.length > 0;

                    return (
                        <SidebarMenuItem key={item.title}>
                            {hasChildren ? (
                                <>
                                    <SidebarMenuButton
                                        tooltip={{ children: item.title }}
                                        className="cursor-pointer"
                                    >
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                        <SidebarMenuAction 
                                            onClick={() => toggleExpanded(item.title)}
                                            className="ml-auto"
                                        >
                                            <ChevronRight className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                        </SidebarMenuAction>
                                    </SidebarMenuButton>
                                    {isExpanded && (
                                        <SidebarMenuSub>
                                            {item.children.map(child => (
                                                <SidebarMenuSubItem key={child.title}>
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={
                                                            child.href
                                                                ? page.url.startsWith(resolveUrl(child.href))
                                                                : false
                                                        }
                                                    >
                                                        <Link href={child.href} prefetch>
                                                            {child.icon && <child.icon size={16} />}
                                                            <span>{child.title}</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    )}
                                </>
                            ) : (
                                <SidebarMenuButton
                                    asChild
                                    isActive={
                                        item.href
                                            ? page.url.startsWith(resolveUrl(item.href))
                                            : false
                                    }
                                    tooltip={{ children: item.title }}
                                >
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            )}
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
