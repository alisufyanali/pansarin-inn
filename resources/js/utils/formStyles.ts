// Reusable form styling utilities

export const inputClass = (hasError?: string) =>
  `w-full px-3 py-2 border rounded-lg bg-white text-gray-900 placeholder-gray-400
  dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500
  focus:outline-none focus:ring-2 transition-colors
  ${hasError
    ? 'border-red-400 dark:border-red-500 focus:ring-red-400'
    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400'
  }`;

export const cardClass = 'bg-white rounded-lg border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700';

export const labelClass = 'block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300';

export const subTextClass = 'text-xs text-gray-500 dark:text-gray-400 mt-1';

export const buttonPrimaryClass = 'w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors';

export const buttonSecondaryClass = 'block w-full text-center border border-gray-300 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors';

// Auto-generate slug from text
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
