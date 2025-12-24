import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import DataTable from "react-data-table-component";
import { CSVLink } from "react-csv";
import { Link } from "@inertiajs/react";
import jsPDF from "jspdf";
// @ts-ignore
import autoTable from "jspdf-autotable";

interface FilterOption {
  value: string;
  label: string;
}

interface AdditionalFilter {
  name: string;
  label: string;
  type: "select" | "text";
  options?: FilterOption[];
}

interface DataTableWrapperProps {
  fetchUrl: string;
  columns: any[];
  csvHeaders: any[];
  additionalFilters?: AdditionalFilter[];
  searchableKeys?: string[]; // New: Specify which keys to search in
}

interface ApiResponse {
  data: any[];
  current_page: number;
  last_page: number;
  total: number;
  from: number;
  to: number;
}

// Cache for filter options to prevent unnecessary re-renders
const DEFAULT_SEARCH_KEYS = ['company.name', 'company_name', 'user.name', 'id'];

export default function DataTableWrapper({
  fetchUrl,
  columns,
  csvHeaders,
  additionalFilters = [],
  searchableKeys = DEFAULT_SEARCH_KEYS,
}: DataTableWrapperProps) {
  // State
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);

  // Memoized values
  const tableColumns = useMemo(() => 
    columns.map(col => 
      col.name === "Actions" 
        ? { ...col, cell: (row: any) => col.cell(row, reloadData) }
        : col
    ),
    [columns]
  );

  const customStyles = useMemo(() => ({
    light: {
      headCells: {
        style: {
          backgroundColor: "#e5e7eb",
          color: "#111827",
          fontWeight: "600",
          fontSize: "14px",
          borderBottom: "1px solid #d1d5db",
        },
      },
      rows: {
        style: {
          fontSize: "14px",
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #f3f4f6",
          "&:nth-of-type(odd)": {
            backgroundColor: "#f9fafb",
          },
          "&:hover": {
            backgroundColor: "#f3f4f6",
            cursor: "pointer",
          },
        },
      },
      cells: {
        style: {
          color: "#374151",
          padding: "12px 16px",
        },
      },
      pagination: {
        style: {
          backgroundColor: "#ffffff",
          borderTop: "1px solid #e5e7eb",
          color: "#374151",
        },
      },
    },
    dark: {
      table: {
        style: {
          backgroundColor: "#1e293b",
          color: "#e2e8f0",
        },
      },
      headRow: {
        style: {
          backgroundColor: "#334155",
          borderBottom: "2px solid #475569",
          minHeight: "52px",
        },
      },
      headCells: {
        style: {
          backgroundColor: "#334155",
          color: "#f1f5f9",
          fontWeight: "700",
          fontSize: "14px",
          paddingLeft: "16px",
          paddingRight: "16px",
          borderRight: "1px solid #475569",
          "&:last-of-type": {
            borderRight: "none",
          },
        },
      },
      rows: {
        style: {
          fontSize: "14px",
          backgroundColor: "#1e293b",
          color: "#e2e8f0",
          minHeight: "56px",
          borderBottom: "1px solid #334155",
          "&:nth-of-type(odd)": {
            backgroundColor: "#0f172a",
          },
          "&:hover": {
            backgroundColor: "#334155",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
          },
        },
        highlightOnHoverStyle: {
          backgroundColor: "#334155",
          borderBottomColor: "#475569",
          outline: "none",
        },
        stripedStyle: {
          backgroundColor: "#0f172a",
        },
      },
      cells: {
        style: {
          color: "#cbd5e1",
          paddingLeft: "16px",
          paddingRight: "16px",
          fontSize: "14px",
          borderRight: "1px solid #334155",
          "&:last-of-type": {
            borderRight: "none",
          },
        },
      },
      pagination: {
        style: {
          backgroundColor: "#1e293b",
          color: "#e2e8f0",
          borderTop: "2px solid #334155",
          minHeight: "56px",
        },
        pageButtonsStyle: {
          borderRadius: "6px",
          height: "36px",
          width: "36px",
          padding: "8px",
          margin: "0 4px",
          cursor: "pointer",
          transition: "all 0.2s",
          color: "#94a3b8",
          fill: "#94a3b8",
          backgroundColor: "transparent",
          "&:disabled": {
            cursor: "not-allowed",
            color: "#475569",
            fill: "#475569",
          },
          "&:hover:not(:disabled)": {
            backgroundColor: "#334155",
            color: "#e2e8f0",
            fill: "#e2e8f0",
          },
          "&:focus": {
            outline: "none",
            backgroundColor: "#334155",
          },
        },
      },
      noData: {
        style: {
          backgroundColor: "#1e293b",
          color: "#94a3b8",
        },
      },
      progress: {
        style: {
          backgroundColor: "#1e293b",
        },
      },
      rowsPerPageDropdown: {
        style: {
          backgroundColor: '#1f2937',
          color: '#f9fafb',
        },
      },
    },
  }), []);

  // Helper functions
  const resolveKey = useCallback((obj: any, key: string): string => {
    return key.split('.').reduce((acc, k) => (acc && acc[k] != null ? acc[k] : ""), obj)?.toString() || "";
  }, []);

  const searchItem = useCallback((item: any, searchTerm: string): boolean => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    
    return searchableKeys.some(key => {
      const value = resolveKey(item, key);
      return value?.toString().toLowerCase().includes(term);
    });
  }, [searchableKeys, resolveKey]);

  // Data fetching with abort controller
  const reloadData = useCallback(async (page: number = currentPage, limit: number = perPage) => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.append('page', page.toString());
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    if (filterText) {
      params.append('search', filterText);
    }

    try {
      const url = `${fetchUrl}${fetchUrl.includes('?') ? '&' : '?'}${params.toString()}`;
      const response = await fetch(url, {
        signal: abortController.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();

      setData(result.data || []);
      setTotalRows(result.total || 0);
      setCurrentPage(result.current_page || 1);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to fetch data');
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [fetchUrl, filters, filterText, currentPage, perPage]);

  // Debounced filter effects
  useEffect(() => {
    const timer = setTimeout(() => {
      reloadData(1, perPage);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [filters, filterText]);

  // Initial load and cleanup
  useEffect(() => {
    reloadData(1, perPage);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Event handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    reloadData(page, perPage);
  };

  const handlePerRowsChange = async (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
    reloadData(1, newPerPage);
  };

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (value: string) => {
    setFilterText(value);
  };

  // Memoized exports data
  const filteredItemsForExport = useMemo(() => 
    data.filter(item => searchItem(item, filterText)),
    [data, filterText, searchItem]
  );

  const csvData = useMemo(() => 
    filteredItemsForExport.map(row => {
      const newRow: Record<string, any> = {};
      csvHeaders.forEach(h => {
        newRow[h.key] = resolveKey(row, h.key);
      });
      return newRow;
    }),
    [filteredItemsForExport, csvHeaders, resolveKey]
  );

  const pdfTableData = useMemo(() => ({
    columns: csvHeaders.map(h => h.label),
    rows: filteredItemsForExport.map(row =>
      csvHeaders.map(h => resolveKey(row, h.key))
    )
  }), [filteredItemsForExport, csvHeaders, resolveKey]);

  // PDF Export with Promise-based image loading
  const exportPDF = useCallback(async (openInNewTab = false) => {
    const doc = new jsPDF();
    
    const loadImage = (): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = "/logo.png";
        img.onload = () => resolve(img);
        img.onerror = reject;
      });
    };

    try {
      const img = await loadImage();
      
      // Add Logo
      doc.addImage(img, "PNG", 14, 10, 40, 15);

      // Add Title & Date
      doc.setFontSize(12);
      doc.text("Report", 60, 20);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 60, 26);

      // Add Table
      (autoTable as any)(doc, {
        head: [pdfTableData.columns],
        body: pdfTableData.rows,
        startY: 35,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [220, 220, 220] },
        theme: 'striped',
      });

      // Save or Open
      if (openInNewTab) {
        const blob = doc.output("bloburl");
        window.open(blob, '_blank');
      } else {
        doc.save(`export-${new Date().getTime()}.pdf`);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  }, [pdfTableData]);

  // Subheader component
  const subHeaderComponent = useMemo(() => (
    <div className="flex flex-col gap-4 w-full p-4 bg-slate-800/50 dark:bg-slate-900/50 rounded-t-xl border-b border-slate-700">
      {/* Filters */}
      {additionalFilters.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {additionalFilters.map((filter) => (
            <div key={filter.name} className="flex items-center gap-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 whitespace-nowrap">
                {filter.label}:
              </label>
              {filter.type === "select" && filter.options ? (
                <select
                  value={filters[filter.name] || ""}
                  onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                  className="border border-gray-300 dark:border-slate-600 px-4 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all min-w-[150px]"
                >
                  <option value="">All</option>
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={filters[filter.name] || ""}
                  onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                  className="border border-gray-300 dark:border-slate-600 px-4 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all min-w-[200px]"
                  placeholder={`Filter by ${filter.label}`}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Search + Export */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[280px]">
          <input
            type="text"
            placeholder={`Search by ${searchableKeys.join(', ')}`}
            className="w-full border border-gray-300 dark:border-slate-600 px-4 py-2.5 pl-10 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            value={filterText}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
          </div>
        </div>
        <div className="flex gap-2">
          <CSVLink
            data={csvData}
            headers={csvHeaders}
            filename={`export-${new Date().getTime()}.csv`}
            className="rounded-lg bg-green-600 px-4 py-2.5 text-white font-medium hover:bg-green-700 active:bg-green-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Export CSV'}
          </CSVLink>
          <button
            onClick={() => exportPDF(false)}
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2.5 text-white font-medium hover:bg-red-700 active:bg-red-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export PDF
          </button>
          <button
            onClick={() => exportPDF(true)}
            disabled={loading}
            className="rounded-lg bg-slate-600 px-4 py-2.5 text-white font-medium hover:bg-slate-700 active:bg-slate-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            View PDF
          </button>
        </div>
      </div>
    </div>
  ), [additionalFilters, filters, filterText, loading, searchableKeys, csvData, csvHeaders, exportPDF]);

  return (
    <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
      {/* Error Display */}
      {error && (
        <div className="rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 p-4 text-red-700 dark:text-red-300">
          <div className="flex items-center">
            <span className="text-lg mr-2">⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}
      {/* Table Container */}
      <div className="relative flex-1 overflow-hidden rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg dark:shadow-2xl dark:shadow-slate-950/50">
        <DataTable
          columns={tableColumns}
          data={data}
          progressPending={loading}
          progressComponent={
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-slate-600 dark:text-slate-400">Loading data...</p>
            </div>
          }
          noDataComponent={
            <div className="p-8 text-center">
              <p className="text-slate-500 dark:text-slate-400">
                {error ? 'Failed to load data' : 'No records found'}
              </p>
            </div>
          }
          pagination
          paginationServer
          paginationTotalRows={totalRows}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handlePerRowsChange}
          highlightOnHover
          striped
          responsive
          subHeader
          subHeaderComponent={subHeaderComponent}
          customStyles={
            document.documentElement.classList.contains('dark') 
              ? customStyles.dark 
              : customStyles.light
          }
          paginationPerPage={perPage}
          paginationRowsPerPageOptions={[10, 20, 30, 50, 100]}
          paginationComponentOptions={{
            rowsPerPageText: 'Rows per page:',
            rangeSeparatorText: 'of',
            noRowsPerPage: false,
            selectAllRowsItem: false,
          }}
        />
      </div>

    </div>
  );
}