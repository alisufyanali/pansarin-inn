import {
    SidebarGroup,
    SidebarGroupContent,
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
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from '@inertiajs/react';

export function NavFooter({
    items,
    className,
}: {
    items: NavItem[];
    className?: string;
}) {
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    const toggleExpanded = (title: string) => {
        setExpandedItems(prev => {
            const set = new Set(prev);
            set.has(title) ? set.delete(title) : set.add(title);
            return set;
        });
    };

    return (
        <SidebarGroup className={className}>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map(item => {
                        const hasChildren = item.children && item.children.length > 0;
                        const isExpanded = expandedItems.has(item.title);

                        return (
                            <SidebarMenuItem key={item.title}>
                                {hasChildren ? (
                                    <>
                                        <SidebarMenuButton
                                            className="cursor-pointer"
                                            onClick={() => toggleExpanded(item.title)}
                                        >
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                            <ChevronRight
                                                className={`ml-auto transition-transform ${isExpanded ? 'rotate-90' : ''
                                                    }`}
                                            />
                                        </SidebarMenuButton>

                                        {isExpanded && (
                                            <SidebarMenuSub>
                                                {item.children!.map(child => (
                                                    <SidebarMenuSubItem key={child.title}>
                                                        <SidebarMenuSubButton asChild>
                                                            {/* Add null check */}
                                                            {child.href ? (
                                                                <Link href={resolveUrl(child.href)}>
                                                                    {child.icon && <child.icon size={14} />}
                                                                    <span>{child.title}</span>
                                                                </Link>
                                                            ) : (
                                                                <div className="flex items-center gap-2">
                                                                    {child.icon && <child.icon size={14} />}
                                                                    <span>{child.title}</span>
                                                                </div>
                                                            )}
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        )}
                                    </>
                                ) : (
                                    <SidebarMenuButton asChild>
                                        {/* Add null check */}
                                        {item.href ? (
                                            <Link href={resolveUrl(item.href)}>
                                                {item.icon && <item.icon />}
                                                <span>{item.title}</span>
                                            </Link>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                {item.icon && <item.icon />}
                                                <span>{item.title}</span>
                                            </div>
                                        )}
                                    </SidebarMenuButton>
                                )}
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}