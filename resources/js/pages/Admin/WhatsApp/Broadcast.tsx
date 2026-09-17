import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
  ArrowLeft,
  CheckSquare,
  Square,
  Search,
  Send,
  Users,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ShieldAlert,
  Clock,
  Phone,
  UserCheck,
  MessageCircle,
} from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'WhatsApp', href: '/admin/whatsapp/chat' },
  { title: 'Bulk Message Broadcast', href: '#' },
];

interface CustomerItem {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  orders_count: number;
}

interface MessageLog {
  id: number;
  phone: string;
  customer_name: string;
  order_id: string;
  messages: string;
  api_response: string;
  created_at: string;
}

interface Props {
  totalCustomers: number;
  customersWithPhone: number;
  recentLogs: MessageLog[];
}

export default function Broadcast({ totalCustomers, customersWithPhone, recentLogs: initialLogs }: Props) {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [selectedCustomerMap, setSelectedCustomerMap] = useState<Record<number, CustomerItem>>({});
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [logs, setLogs] = useState<MessageLog[]>(initialLogs);
  const [refreshingLogs, setRefreshingLogs] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { data, setData, post, processing, reset } = useForm({
    customer_ids: [] as number[],
    message: '',
    send_mode: 'text' as 'text' | 'template',
    template_name: '',
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchCustomers = async (search = '') => {
    try {
      setLoadingCustomers(true);
      const res = await fetch(`/admin/whatsapp/broadcast/customers?search=${encodeURIComponent(search)}&has_phone=1`);
      const json = await res.json();
      setCustomers(json.data || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load customers');
    } finally {
      setLoadingCustomers(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setRefreshingLogs(true);
      const res = await fetch('/admin/whatsapp/broadcast/logs');
      const json = await res.json();
      setLogs(json);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshingLogs(false);
    }
  };

  const toggleCustomer = (customer: CustomerItem) => {
    const next = { ...selectedCustomerMap };
    if (next[customer.id]) {
      delete next[customer.id];
    } else {
      next[customer.id] = customer;
    }
    setSelectedCustomerMap(next);
    setData('customer_ids', Object.keys(next).map(Number));
  };

  const selectAllVisible = () => {
    const next = { ...selectedCustomerMap };
    customers.forEach((c) => {
      next[c.id] = c;
    });
    setSelectedCustomerMap(next);
    setData('customer_ids', Object.keys(next).map(Number));
  };

  const deselectAll = () => {
    setSelectedCustomerMap({});
    setData('customer_ids', []);
  };

  const removeSelected = (id: number) => {
    const next = { ...selectedCustomerMap };
    delete next[id];
    setSelectedCustomerMap(next);
    setData('customer_ids', Object.keys(next).map(Number));
  };

  const selectedCustomersList = useMemo(() => Object.values(selectedCustomerMap), [selectedCustomerMap]);
  const selectedCount = selectedCustomersList.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCount === 0) {
      toast.error('Please select at least one customer.');
      return;
    }
    if (!data.message.trim()) {
      toast.error('Please enter the message body.');
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmSend = () => {
    setShowConfirmModal(false);
    post('/admin/whatsapp/broadcast/send', {
      preserveScroll: true,
      onSuccess: () => {
        toast.success(`Queued WhatsApp messages for ${selectedCount} customer(s)!`);
        reset('message');
        setSelectedCustomerMap({});
        setData('customer_ids', []);
        setTimeout(fetchLogs, 1500);
      },
      onError: (errors) => {
        const firstError = Object.values(errors)[0] as string;
        toast.error(firstError || 'Failed to dispatch broadcast.');
      },
    });
  };

  const parseLogStatus = (responseStr: string) => {
    try {
      const parsed = JSON.parse(responseStr);
      if (parsed.error) {
        return {
          status: 'error',
          message: parsed.error.message || 'Error',
          code: parsed.error.code || 'ERR',
        };
      }
      if (parsed.messages && parsed.messages.length > 0) {
        return {
          status: 'success',
          message: 'Sent / Queued by Meta',
          code: '200',
        };
      }
      return { status: 'unknown', message: 'Unknown response', code: '-' };
    } catch {
      return { status: 'raw', message: responseStr || 'Logged', code: '-' };
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Bulk WhatsApp Message Broadcast" />

      <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/whatsapp/chat"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-emerald-600" />
                Bulk WhatsApp Message Broadcast
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Send WhatsApp notifications and updates to multiple selected customers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3.5 py-1.5 rounded-lg text-xs font-medium text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" />
              <span>{customersWithPhone} of {totalCustomers} with phone numbers</span>
            </div>
          </div>
        </div>

        {/* 24-Hour Meta Business Constraint Warning Banner */}
        <div className="bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 p-4 rounded-r-xl">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-amber-900 dark:text-amber-200">
              <p className="font-semibold text-sm">
                Meta WhatsApp Business API Policy Notice (24-Hour Window)
              </p>
              <p>
                <strong>Free-Text messages:</strong> Meta strictly delivers free-text messages to customers who have messaged your business number within the last <strong>24 hours</strong>.
              </p>
              <p className="text-amber-800/90 dark:text-amber-300/90">
                Customers outside the 24-hour window will result in Meta rejection (Error code <code>131047: Re-engagement message required</code>). For cold outreach to all customers, a pre-approved Meta Template is required.
              </p>
            </div>
          </div>
        </div>

        {/* Main Action Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Customer Picker (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  1. Select Customers
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllVisible}
                  className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  Select Visible
                </button>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-700 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition"
                >
                  <Square className="w-3.5 h-3.5" />
                  Clear
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, phone (03xx / 92xx), or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition"
              />
            </div>

            {/* Customer List Table */}
            <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden max-h-[380px] overflow-y-auto">
              {loadingCustomers ? (
                <div className="py-12 text-center text-sm text-gray-400">Loading customers...</div>
              ) : customers.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-400">No customers found matching search.</div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-gray-50 dark:bg-gray-800/60 sticky top-0 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="p-3 w-10 text-center">Pick</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3 text-right">Orders</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {customers.map((c) => {
                      const isSelected = !!selectedCustomerMap[c.id];
                      const fullName = `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Customer';
                      return (
                        <tr
                          key={c.id}
                          onClick={() => toggleCustomer(c)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-emerald-50/60 dark:bg-emerald-950/20'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'
                          }`}
                        >
                          <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleCustomer(c)}
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                          </td>
                          <td className="p-3">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {fullName}
                            </div>
                            {c.email && (
                              <div className="text-[11px] text-gray-400 truncate max-w-[180px]">
                                {c.email}
                              </div>
                            )}
                          </td>
                          <td className="p-3 font-mono text-gray-700 dark:text-gray-300">
                            {c.phone || <span className="text-gray-400 italic">No phone</span>}
                          </td>
                          <td className="p-3 text-right">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                              {c.orders_count || 0}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Right Column: Selected list + Compose message (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Selected Customers Preview Box */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    2. Selected Recipients
                  </h2>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  {selectedCount} selected
                </span>
              </div>

              {selectedCount === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center italic border border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
                  No customers selected yet. Check boxes from the left list.
                </p>
              ) : (
                <div className="max-h-36 overflow-y-auto border border-gray-100 dark:border-gray-800 rounded-lg p-2 flex flex-wrap gap-1.5 bg-gray-50/50 dark:bg-gray-800/30">
                  {selectedCustomersList.map((c) => {
                    const name = `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Customer';
                    return (
                      <span
                        key={c.id}
                        className="inline-flex items-center gap-1.5 text-[11px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-1 rounded-md text-gray-800 dark:text-gray-200 shadow-2xs"
                      >
                        <span className="font-medium truncate max-w-[110px]">{name}</span>
                        <span className="text-gray-400 text-[10px]">({c.phone})</span>
                        <button
                          type="button"
                          onClick={() => removeSelected(c.id)}
                          className="text-gray-400 hover:text-red-500 ml-0.5"
                        >
                          &times;
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Compose Message Box */}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  3. Compose Message
                </h2>
                <span className="text-[11px] text-gray-400">
                  {data.message.length} / 1024 chars
                </span>
              </div>

              {/* Mode Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Sending Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={`flex items-center gap-2 p-2.5 border rounded-lg cursor-pointer text-xs transition ${
                      data.send_mode === 'text'
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 font-medium'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="send_mode"
                      value="text"
                      checked={data.send_mode === 'text'}
                      onChange={() => setData('send_mode', 'text')}
                      className="w-3.5 h-3.5 text-emerald-600"
                    />
                    <span>Free Text (24h Window)</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-2.5 border rounded-lg cursor-not-allowed opacity-60 text-xs transition ${
                      data.send_mode === 'template'
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-gray-200 dark:border-gray-700 text-gray-400'
                    }`}
                    title="Generic broadcast template approval pending from Meta"
                  >
                    <input
                      type="radio"
                      name="send_mode"
                      value="template"
                      disabled
                      className="w-3.5 h-3.5 text-emerald-600"
                    />
                    <div>
                      <span>Meta Template</span>
                      <span className="block text-[9px] text-amber-600">Pending approval</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Textarea */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  WhatsApp Message Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={6}
                  value={data.message}
                  onChange={(e) => setData('message', e.target.value)}
                  placeholder="Enter your message here... (e.g. Assalam o Alaikum! Special Ramadan discount is live now at Pansari Inn: https://pansariinn.pk)"
                  className="w-full p-3 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Supports emojis 🌿, linebreaks, and WhatsApp formatting (*bold*, _italic_).
                </p>
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={processing || selectedCount === 0 || !data.message.trim()}
                className="w-full py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Send className="w-4 h-4" />
                {processing ? 'Dispatching...' : `Send WhatsApp to ${selectedCount} Customer(s)`}
              </button>
            </form>
          </div>
        </div>

        {/* Section 4: Recent Broadcast Logs & Per-customer Outcomes */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Recent Broadcast Send Logs & Outcomes
              </h2>
            </div>
            <button
              type="button"
              onClick={fetchLogs}
              disabled={refreshingLogs}
              className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${refreshingLogs ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="p-3">Time</th>
                  <th className="p-3">Recipient</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Status / Outcome</th>
                  <th className="p-3 max-w-[280px]">Message Snippet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-400">
                      No bulk message logs found yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const parsed = parseLogStatus(log.api_response);
                    return (
                      <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <td className="p-3 text-gray-500 whitespace-nowrap text-[11px]">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="p-3 font-medium text-gray-900 dark:text-white">
                          {log.customer_name || 'Customer'}
                        </td>
                        <td className="p-3 font-mono text-gray-600 dark:text-gray-300">
                          {log.phone}
                        </td>
                        <td className="p-3">
                          {parsed.status === 'success' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                              <CheckCircle2 className="w-3 h-3" />
                              Delivered / Queued
                            </span>
                          ) : parsed.status === 'error' ? (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300"
                              title={parsed.message}
                            >
                              <XCircle className="w-3 h-3" />
                              {parsed.code === 131047
                                ? '24hr Window Expired'
                                : `Failed (${parsed.code})`}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                              Logged
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-gray-600 dark:text-gray-400 text-[11px] truncate max-w-[280px]">
                          {log.messages}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200 dark:border-gray-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 shrink-0">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Confirm WhatsApp Broadcast
                </h3>
                <p className="text-xs text-gray-500">
                  You are about to send to <strong>{selectedCount} customer(s)</strong>.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-lg text-xs space-y-1">
              <div className="text-gray-500 font-medium">Message Preview:</div>
              <div className="text-gray-800 dark:text-gray-200 italic line-clamp-3">
                "{data.message}"
              </div>
            </div>

            <div className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded border border-amber-200 dark:border-amber-900">
              Note: Free-text will be delivered only to customers whose last inbound message was within 24 hours. Messages to other recipients will be logged with error 131047.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSend}
                className="px-4 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-sm"
              >
                Yes, Send Broadcast
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}