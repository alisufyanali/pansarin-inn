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

    // Auto-expand any section whose child URL matches the current page on first render.
    const initialExpanded = new Set<string>(
        items
            .filter((item) =>
                (item.children ?? []).some(
                    (child) => !!child.href && page.url.startsWith(resolveUrl(child.href)),
                ),
            )
            .map((item) => item.title),
    );

    const [expandedItems, setExpandedItems] = useState<Set<string>>(initialExpanded);

    const toggleExpanded = (title: string) => {
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            newSet.has(title) ? newSet.delete(title) : newSet.add(title);
            return newSet;
        });
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>

            <SidebarMenu>
                {items.map((item) => {
                    const children = item.children ?? [];
                    const hasChildren = children.length > 0;
                    const isExpanded = expandedItems.has(item.title);

                    return (
                        <SidebarMenuItem key={item.title}>
                            {hasChildren ? (
                                <>
                                    {/* FIX: onClick ko SidebarMenuAction se hata kar SidebarMenuButton par shift kar diya */}
                                    <SidebarMenuButton
                                        tooltip={{ children: item.title }}
                                        className="cursor-pointer"
                                        onClick={() => toggleExpanded(item.title)}
                                    >
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                        <ChevronRight
                                            className={`ml-auto transition-transform ${
                                                isExpanded ? 'rotate-90' : ''
                                            }`}
                                        />
                                    </SidebarMenuButton>

                                    {isExpanded && (
                                        <SidebarMenuSub>
                                            {children.map((child) => (
                                                <SidebarMenuSubItem key={child.title}>
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={
                                                            !!child.href &&
                                                            page.url.startsWith(resolveUrl(child.href))
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
                                        !!item.href &&
                                        page.url.startsWith(resolveUrl(item.href))
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