import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import NotificationBell from "@/components/NotificationBell";
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  Trash2, 
  ExternalLink, 
  MessageSquare,
  RotateCcw,
  MessageCircle
} from 'lucide-react';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth } = usePage<PageProps>().props;

    return (
        <header className="flex h-16 items-center justify-between border-b border-sidebar-border/50 px-6">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="flex items-center gap-2 ml-auto">
                <NotificationBell auth={auth} />

                {/* View Website */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open('/home', '_blank')}
                    title="View Website"
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    <ExternalLink className="h-4 w-4" />
                </Button>

                {/* Clear Cache */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open('/clear-cache', '_blank')}
                    title="Clear Cache"
                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-900/20"
                >
                    <RotateCcw className="h-4 w-4" />
                </Button>

                {/* WhatsApp Chat */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open('/admin/whatsapp/chat', '_blank')}
                    title="WhatsApp Chat"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20"
                >
                    <MessageCircle className="h-4 w-4" />
                </Button>
            </div>
        </header>
    );
}