import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

export type CityOption = { id: number; name: string; province: string; shipping_charges?: number };

const provinceLabel: Record<string, string> = {
    sindh: 'Sindh',
    punjab: 'Punjab',
    balochistan: 'Balochistan',
    kpk: 'KPK',
    gilgit: 'Gilgit-Baltistan',
    azad_kashmir: 'Azad Kashmir',
};

interface CityDropdownProps {
    cities: CityOption[];
    value: string | number;
    onChange: (id: number | string) => void;
    error?: string;
    placeholder?: string;
    label?: string;
    required?: boolean;
}

export default function CityDropdown({
    cities,
    value,
    onChange,
    error,
    placeholder = 'Select city',
    label = 'City',
    required = false,
}: CityDropdownProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, []);

    const selectedName = useMemo(
        () => cities.find(c => String(c.id) === String(value))?.name || '',
        [value, cities],
    );

    const grouped = useMemo(() => {
        const filtered = cities.filter(c =>
            c.name.toLowerCase().includes(search.toLowerCase()),
        );
        return filtered.reduce<Record<string, CityOption[]>>((acc, city) => {
            const key = city.province || 'other';
            (acc[key] ??= []).push(city);
            return acc;
        }, {});
    }, [cities, search]);

    return (
        <div>
            {label && (
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="relative" ref={ref}>
                {/* Trigger */}
                <button
                    type="button"
                    onClick={() => setOpen(o => !o)}
                    className={`w-full flex items-center justify-between px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-sm transition-colors ${
                        error
                            ? 'border-red-400 dark:border-red-500'
                            : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
                    } text-gray-900 dark:text-white`}
                >
                    <span className={selectedName ? '' : 'text-gray-400 dark:text-gray-500'}>
                        {selectedName || placeholder}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                        {value && (
                            <X
                                className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                onClick={e => { e.stopPropagation(); onChange(''); }}
                            />
                        )}
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                    </div>
                </button>

                {/* Panel */}
                {open && (
                    <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
                        {/* Search */}
                        <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search city..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    autoFocus
                                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* List */}
                        <div className="max-h-56 overflow-y-auto">
                            {Object.keys(grouped).length === 0 ? (
                                <p className="px-3 py-4 text-sm text-center text-gray-400">No cities found</p>
                            ) : (
                                Object.entries(grouped).map(([province, provCities]) => (
                                    <div key={province}>
                                        <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 uppercase tracking-wide sticky top-0">
                                            {provinceLabel[province] ?? province}
                                        </div>
                                        {provCities.map(city => (
                                            <button
                                                key={city.id}
                                                type="button"
                                                onClick={() => { onChange(city.id); setOpen(false); setSearch(''); }}
                                                className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20 ${
                                                    String(value) === String(city.id)
                                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                                                        : 'text-gray-700 dark:text-gray-300'
                                                }`}
                                            >
                                                {city.name}
                                            </button>
                                        ))}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {error && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{error}</p>}
        </div>
    );
}
