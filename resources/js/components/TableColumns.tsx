// components/TableColumns.tsx
import { Link } from '@inertiajs/react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import DeleteConfirm from '@/components/DeleteConfirm';
import React from 'react';

interface StatusBadgeProps {
  status: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}

export function StatusBadge({ status, activeLabel = 'Active', inactiveLabel = 'Inactive' }: StatusBadgeProps): React.ReactElement {
  const isActive = status;
  return (
    <span 
      className={`px-3 py-1 text-xs rounded-full font-medium ${
        isActive 
          ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
          : 'bg-red-500/10 dark:bg-red-500/20 text-red-700 dark:text-red-400'
      }`}
    >
      {isActive ? activeLabel : inactiveLabel}
    </span>
  );
}

interface DateCellProps {
  date: string;
  showTime?: boolean;
}

export function DateCell({ date, showTime = true }: DateCellProps): React.ReactElement {
  const d = new Date(date);
  return (
    <div className="text-sm text-gray-500 dark:text-gray-400">
      {d.toLocaleDateString()}
      {showTime && (
        <div className="text-xs text-gray-400 dark:text-gray-500">
          {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
    </div>
  );
}

interface ActionButtonsProps {
  id: number;
  viewUrl?: string;
  editUrl?: string;
  deleteUrl?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  onDelete?: () => void;
}

export function ActionButtons({
  id,
  viewUrl,
  editUrl,
  deleteUrl,
  canEdit = true,
  canDelete = true,
  onDelete,
}: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* View Button */}
      {viewUrl && (
        <Link
          href={viewUrl}
          className="inline-flex items-center justify-center rounded-lg w-9 h-9 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          title="View Details"
        >
          <Eye className="w-4 h-4" />
        </Link>
      )}

      {/* Edit Button */}
      {canEdit && editUrl ? (
        <Link
          href={editUrl}
          className="inline-flex items-center justify-center rounded-lg w-9 h-9 bg-blue-500/10 hover:bg-blue-500/20 dark:bg-blue-500/20 dark:hover:bg-blue-500/30 text-blue-600 dark:text-blue-400 transition-colors"
          title="Edit"
        >
          <Edit2 className="w-4 h-4" />
        </Link>
      ) : editUrl ? (
        <button
          className="inline-flex items-center justify-center rounded-lg w-9 h-9 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
          title="Edit (disabled)"
          disabled
        >
          <Edit2 className="w-4 h-4" />
        </button>
      ) : null}

      {/* Delete Button */}
      {canDelete && deleteUrl ? (
        <DeleteConfirm id={id} url={deleteUrl} onSuccess={onDelete}>
          <Trash2 size={16} />
        </DeleteConfirm>
      ) : deleteUrl ? (
        <button
          className="inline-flex items-center justify-center rounded-lg w-9 h-9 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
          title="Delete (disabled)"
          disabled
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ) : null}
    </div>
  );
}

interface CodeBadgeProps {
  text: string;
}

export function CodeBadge({ text }: CodeBadgeProps) {
  return (
    <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
      {text}
    </code>
  );
}

// Helper function to create common column definitions
export function createColumn<T = any>(config: {
  name: string;
  selector?: (row: T) => any;
  cell?: (row: T) => React.ReactElement;
  sortable?: boolean;
  width?: string;
  center?: boolean;
  grow?: number;
  ignoreRowClick?: boolean;
  allowOverflow?: boolean;
  button?: boolean;
}) {
  return config;
}

// Common column templates
export const CommonColumns = {
  id: () => createColumn({
    name: 'ID',
    selector: (row: any) => row.id,
    sortable: true,
    width: '80px',
    center: true,
  }),

  name: (label = 'Name', key = 'name') => createColumn({
    name: label,
    selector: (row: any) => row[key],
    sortable: true,
    grow: 2,
  }),

  slug: () => createColumn({
    name: 'Slug',
    selector: (row: any) => row.slug,
    sortable: true,
    cell: (row: any) => <CodeBadge text={row.slug} />,
  }),

  status: () => createColumn({
    name: 'Status',
    selector: (row: any) => row.status ? 'Active' : 'Inactive',
    sortable: true,
    cell: (row: any) => <StatusBadge status={row.status} />,
    width: '120px',
    center: true,
  }),

  createdAt: (showTime = true) => createColumn({
    name: 'Created',
    selector: (row: any) => new Date(row.created_at).toLocaleDateString(),
    sortable: true,
    cell: (row: any) => <DateCell date={row.created_at} showTime={showTime} />,
  }),

  actions: (config: {
    baseUrl: string;
    canEdit?: boolean;
    canDelete?: boolean;
    showView?: boolean;
  }) => createColumn({
    name: 'Actions',
    cell: (row: any, reloadData?: () => void) => (
      <ActionButtons
        id={row.id}
        viewUrl={config.showView !== false ? `${config.baseUrl}/${row.id}` : undefined}
        editUrl={`${config.baseUrl}/${row.id}/edit`}
        deleteUrl={`${config.baseUrl}/${row.id}`}
        canEdit={config.canEdit}
        canDelete={config.canDelete}
        onDelete={reloadData}
      />
    ),
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
    width: '180px',
    center: true,
  }),
};