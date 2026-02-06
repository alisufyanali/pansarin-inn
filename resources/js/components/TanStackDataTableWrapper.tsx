import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { 
  useReactTable, 
  getCoreRowModel, 
  flexRender, 
  ColumnDef 
} from '@tanstack/react-table';
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
// @ts-ignore
import autoTable from "jspdf-autotable";

// --- Interfaces ---
interface DataTableProps {
  fetchUrl: string;
  columns: any[];
  csvHeaders: { label: string; key: string }[];
  searchableKeys?: string[];
}

interface ApiResponse {
  data: any[];
  current_page: number;
  last_page: number;
  total: number;
}

export default function TanStackDataTableWrapper({
  fetchUrl,
  columns,
  csvHeaders,
}: DataTableProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Helper function to resolve nested keys like 'user.name'
  const resolveKey = useCallback((obj: any, key: string): string => {
    return key.split('.').reduce((acc, k) => (acc && acc[k] != null ? acc[k] : ""), obj)?.toString() || "";
  }, []);

  // API Fetching Logic
  const reloadData = useCallback(async (page: number = currentPage, limit: number = perPage) => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search: filterText
    });

    try {
      const url = `${fetchUrl}${fetchUrl.includes('?') ? '&' : '?'}${params.toString()}`;
      const response = await fetch(url, { signal: abortController.signal });
      const result: ApiResponse = await response.json();
      
      setData(result.data || []);
      setTotalRows(result.total || 0);
      setCurrentPage(result.current_page || 1);
    } catch (e: any) {
      if (e.name !== 'AbortError') console.error("Fetch Error:", e);
    } finally {
      setLoading(false);
    }
  }, [fetchUrl, filterText, perPage]);

  useEffect(() => {
    const timer = setTimeout(() => reloadData(1), 300);
    return () => clearTimeout(timer);
  }, [filterText]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  // PDF Export Logic
  const exportPDF = async () => {
    const doc = new jsPDF();
    const tableData = data.map(row => csvHeaders.map(h => resolveKey(row, h.key)));
    const tableHeaders = csvHeaders.map(h => h.label);

    (autoTable as any)(doc, {
      head: [tableHeaders],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8 },
    });
    doc.save(`report-${Date.now()}.pdf`);
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Top Bar: Search & Exports */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border-b dark:border-slate-800">
        <input
          className="flex-1 min-w-[200px] max-w-sm p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search records..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
        <div className="flex gap-2">
          <CSVLink
            data={data.map(row => {
              const obj: any = {};
              csvHeaders.forEach(h => obj[h.label] = resolveKey(row, h.key));
              return obj;
            })}
            filename="export.csv"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Excel / CSV
          </CSVLink>
          <button
            onClick={exportPDF}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            PDF Export
          </button>
        </div>
      </div>

      {/* Table UI */}
      <div className="overflow-x-auto rounded-lg border dark:border-slate-800">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="p-4 font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y dark:divide-slate-800">
            {loading ? (
              <tr><td colSpan={columns.length} className="p-10 text-center">Loading...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={columns.length} className="p-10 text-center">No records found.</td></tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-4 text-slate-600 dark:text-slate-300">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination UI */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4">
        <div className="text-sm text-slate-500">
          Showing <b>{((currentPage - 1) * perPage) + 1}</b> to <b>{Math.min(currentPage * perPage, totalRows)}</b> of <b>{totalRows}</b>
        </div>
        <div className="flex items-center gap-2">
          <select 
            className="p-1 border rounded dark:bg-slate-800 dark:border-slate-700"
            value={perPage}
            onChange={(e) => { setPerPage(Number(e.target.value)); reloadData(1, Number(e.target.value)); }}
          >
            {[10, 25, 50, 100].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <button 
            disabled={currentPage === 1 || loading}
            onClick={() => reloadData(currentPage - 1)}
            className="px-3 py-1 border rounded disabled:opacity-30 dark:border-slate-700"
          >
            Prev
          </button>
          <button 
            disabled={currentPage * perPage >= totalRows || loading}
            onClick={() => reloadData(currentPage + 1)}
            className="px-3 py-1 border rounded disabled:opacity-30 dark:border-slate-700"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}