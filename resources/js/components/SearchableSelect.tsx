import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

// ===== CUSTOMER SELECT COMPONENT =====
type Customer = { 
  id: number; 
  first_name: string; 
  last_name: string; 
  phone: string; 
  email: string | null;
};

interface SearchableCustomerSelectProps {
  customers: Customer[];
  value: string | number;
  onChange: (customerId: string | number) => void;
  error?: string;
  required?: boolean;
}

export function SearchableCustomerSelect({ 
  customers, 
  value, 
  onChange, 
  error,
  required = false 
}: SearchableCustomerSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get selected customer
  const selectedCustomer = customers.find(c => c.id === Number(value));

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer => {
    const searchLower = search.toLowerCase();
    return (
      customer.first_name.toLowerCase().includes(searchLower) ||
      customer.last_name.toLowerCase().includes(searchLower) ||
      customer.phone.includes(search) ||
      (customer.email && customer.email.toLowerCase().includes(searchLower))
    );
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (customer: Customer) => {
    onChange(customer.id);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
        Client {required && <span className="text-red-500">*</span>}
      </label>
      
      {/* Selected Value Display */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border ${
          error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
        } cursor-pointer flex items-center justify-between hover:border-blue-500 dark:hover:border-blue-400 transition-colors`}
      >
        <span className={selectedCustomer ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}>
          {selectedCustomer 
            ? `${selectedCustomer.first_name} ${selectedCustomer.last_name} - ${selectedCustomer.phone}`
            : 'Select One'
          }
        </span>
        <div className="flex items-center gap-2">
          {selectedCustomer && (
            <X 
              className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" 
              onClick={handleClear}
            />
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, phone, or email..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredCustomers.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                No customers found
              </div>
            ) : (
              filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => handleSelect(customer)}
                  className={`px-4 py-2.5 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${
                    customer.id === Number(value) ? 'bg-blue-100 dark:bg-blue-900/30' : ''
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {customer.first_name} {customer.last_name}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {customer.phone}
                      </span>
                      {customer.email && (
                        <>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {customer.email}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== PRODUCT SELECT COMPONENT =====
type Product = { 
  id: number; 
  name: string; 
  sku: string; 
  price: number; 
  stock: number;
};

interface SearchableProductSelectProps {
  products: Product[];
  value: string | number;
  onChange: (productId: string | number) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
}

export function SearchableProductSelect({ 
  products, 
  value, 
  onChange, 
  error,
  required = false,
  placeholder = 'Product name'
}: SearchableProductSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debug: Log products on mount
  useEffect(() => {
    console.log('Products received:', products);
  }, [products]);

  // Get selected product
  const selectedProduct = products.find(p => p.id === Number(value));

  // Filter products based on search
  const filteredProducts = products.filter(product => {
    const searchLower = search.toLowerCase();
    const matchesName = product.name.toLowerCase().includes(searchLower);
    const matchesSku = product.sku.toLowerCase().includes(searchLower);
    return matchesName || matchesSku;
  });

  // Debug filtered results
  useEffect(() => {
    if (search) {
      console.log('Search term:', search);
      console.log('Filtered products:', filteredProducts.length);
    }
  }, [search, filteredProducts.length]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (product: Product) => {
    onChange(product.id);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Value Display */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-2 py-1 text-xs rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border ${
          error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
        } cursor-pointer flex items-center justify-between hover:border-blue-500 dark:hover:border-blue-400 transition-colors`}
      >
        <span className={selectedProduct ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}>
          {selectedProduct ? selectedProduct.name : placeholder}
        </span>
        <div className="flex items-center gap-1">
          {selectedProduct && (
            <X 
              className="w-3 h-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" 
              onClick={handleClear}
            />
          )}
          <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-80 overflow-hidden left-0 min-w-[300px]">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or SKU..."
                className="w-full pl-7 pr-2 py-1.5 text-xs rounded bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                No products found
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleSelect(product)}
                  className={`px-3 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${
                    product.id === Number(value) ? 'bg-blue-100 dark:bg-blue-900/30' : ''
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                      {product.name}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        SKU: {product.sku}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        PKR {product.price}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className={`text-xs ${product.stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        Stock: {product.stock}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}