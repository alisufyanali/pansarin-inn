interface InfoRowProps {
  label: string;
  value?: string | null;
  mono?: boolean;
  multiline?: boolean;
}

export default function InfoRow({ label, value, mono = false, multiline = false }: InfoRowProps) {
  return (
    <div className={multiline ? '' : 'flex justify-between items-start gap-4'}>
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[140px]">
        {label}
      </span>
      <span 
        className={`text-sm text-gray-900 dark:text-white ${multiline ? 'mt-2 block' : 'text-right'} ${
          mono ? 'font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded' : ''
        }`}
      >
        {value || '-'}
      </span>
    </div>
  );
}
