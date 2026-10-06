import React, { useEffect, useState } from 'react';
import {
  FiFileText,
  FiShoppingCart,
  FiDollarSign,
  FiCornerUpLeft,
  FiSearch,
  FiCalendar,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiPrinter,
  FiRotateCcw,
  FiX,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/statCard';
import Receipt from '../components/pos/Receipt';
import API_URL from '../config';

const FILTERS = ['All Sales', 'Today', 'This Month', 'Custom Date'];
const STATUS_OPTIONS = ['All Status', 'Completed', 'Returned'];
const ROWS_PER_PAGE = 5;

const inputBase =
  'rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm text-[var(--text-color)] outline-none focus:border-[#0969FF]';
const iconBtn =
  'cursor-pointer rounded-lg bg-[var(--input-bg)] p-2.5 text-[var(--muted-color)] transition-colors hover:text-[var(--text-color)]';

const Sales = () => {
  const navigate = useNavigate();

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Return state — which row is pending confirmation, which is mid-request
  const [confirmReturnId, setConfirmReturnId] = useState(null);
  const [returningId, setReturningId] = useState(null);
  const [returnMsg, setReturnMsg] = useState({ id: null, text: '', type: '' });

  // View / print receipt modal
  const [viewReceipt, setViewReceipt] = useState(null);   // Receipt-shaped object
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState('');

  // Filter / search state
  const [activeFilter, setActiveFilter] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // ============================================================
  // FETCH SALES
  // ============================================================
  async function fetchSales() {
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/sales`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Unable to load sales.');
        return;
      }

      setSales(data);
    } catch (err) {
      console.error(err);
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSales();
  }, []);

  // ============================================================
  // VIEW SALE — open receipt modal
  // ============================================================
  async function handleView(sale) {
    setViewError('');
    setViewLoading(true);

    try {
      const response = await fetch(`${API_URL}/sale/${sale.id}/items`);
      const data = await response.json();

      if (!response.ok) {
        setViewError(data.message || 'Could not load sale details.');
        setViewLoading(false);
        return;
      }

      setViewReceipt({
        saleId: sale.id,
        items: data.items,
        total: sale.total,
        date: new Date(sale.created_at),
      });
      setViewLoading(false);
    } catch (err) {
      console.error(err);
      setViewError('Could not connect to server.');
      setViewLoading(false);
    }
  }

  // ============================================================
  // RETURN SALE — two-step: confirm then execute
  // ============================================================
  function askReturn(saleId) {
    setReturnMsg({ id: null, text: '', type: '' });
    setConfirmReturnId(saleId);
  }

  function cancelReturn() {
    setConfirmReturnId(null);
  }

  async function confirmReturn(sale) {
    setConfirmReturnId(null);
    setReturningId(sale.id);
    setReturnMsg({ id: null, text: '', type: '' });

    try {
      const response = await fetch(`${API_URL}/return-sale/${sale.id}`, {
        method: 'POST',
      });
      const data = await response.json();

      if (response.ok) {
        setSales((prev) =>
          prev.map((s) => (s.id === sale.id ? { ...s, returned: 1 } : s))
        );
        setReturnMsg({ id: sale.id, text: 'Sale returned successfully.', type: 'success' });
      } else {
        setReturnMsg({ id: sale.id, text: data.message || 'Failed to return sale.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setReturnMsg({ id: sale.id, text: 'Could not connect to server.', type: 'error' });
    } finally {
      setReturningId(null);
    }
  }

  // ============================================================
  // DERIVED STATS
  // ============================================================
  const completedSales = sales.filter((s) => !s.returned);
  const totalSales = completedSales.reduce((sum, s) => sum + Number(s.total), 0);
  const totalInvoices = sales.length;
  const returnedCount = sales.filter((s) => s.returned).length;
  const averageSale = completedSales.length ? totalSales / completedSales.length : 0;

  // ============================================================
  // FILTERING
  // ============================================================
  function isSameDay(dateStr, target) {
    const d = new Date(dateStr);
    return (
      d.getFullYear() === target.getFullYear() &&
      d.getMonth() === target.getMonth() &&
      d.getDate() === target.getDate()
    );
  }

  function isThisMonth(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }

  const filteredSales = sales.filter((sale) => {
    if (activeFilter === 1 && !isSameDay(sale.created_at, new Date())) return false;
    if (activeFilter === 2 && !isThisMonth(sale.created_at)) return false;
    if (activeFilter === 3) {
      if (fromDate && new Date(sale.created_at) < new Date(fromDate)) return false;
      if (toDate && new Date(sale.created_at) > new Date(toDate + 'T23:59:59')) return false;
    }
    if (statusFilter === 'Completed' && sale.returned) return false;
    if (statusFilter === 'Returned' && !sale.returned) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const inv = invoiceNo(sale);
      if (
        !inv.toLowerCase().includes(term) &&
        !String(sale.id).includes(term) &&
        !String(sale.total).includes(term)
      ) return false;
    }
    return true;
  });

  // ============================================================
  // PAGINATION
  // ============================================================
  const totalPages = Math.max(1, Math.ceil(filteredSales.length / ROWS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedSales = filteredSales.slice(
    (safePage - 1) * ROWS_PER_PAGE,
    safePage * ROWS_PER_PAGE
  );

  function handleFilterChange(idx) {
    setActiveFilter(idx);
    setCurrentPage(1);
  }

  // ============================================================
  // HELPERS
  // ============================================================
  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return (
      d.toLocaleDateString('en-PK', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' ' +
      d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })
    );
  }

  function invoiceNo(sale) {
    const year = String(new Date(sale.created_at).getFullYear()).slice(-2);
    return `OC-${year}-${String(sale.id).padStart(2, '0')}`;
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="text-[var(--text-color)]">

      {/* View / Print Receipt Modal */}
      {(viewReceipt || viewLoading || viewError) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close"
            onClick={() => { setViewReceipt(null); setViewError(''); }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-md"
          >
            {/* Close button */}
            <button
              type="button"
              aria-label="Close"
              onClick={() => { setViewReceipt(null); setViewError(''); }}
              className="absolute -right-2 -top-2 z-10 cursor-pointer rounded-full bg-[var(--surface-bg)] p-1.5 text-[var(--muted-color)] shadow hover:text-[var(--text-color)]"
            >
              <FiX size={18} />
            </button>

            {viewLoading && (
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-bg)] p-8 text-center text-[var(--muted-color)]">
                Loading sale details...
              </div>
            )}

            {viewError && (
              <div className="rounded-xl border border-red-500/30 bg-[var(--surface-bg)] p-6 text-center text-sm text-red-500">
                {viewError}
              </div>
            )}

            {viewReceipt && (
              <Receipt
                receipt={viewReceipt}
                closeReceipt={() => setViewReceipt(null)}
              />
            )}
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Sales</h1>
        <p className="mt-1 text-sm text-[var(--muted-color)]">
          View and manage all sales invoices
        </p>
      </div>

      {/* Stat Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={FiFileText}
          label="Total Sales"
          value={loading ? '—' : `Rs. ${totalSales.toLocaleString('en-PK')}`}
          iconBg="from-[#0969FF] to-[#6C3EFF]"
          valueColor="text-blue-500"
        />
        <StatCard
          icon={FiShoppingCart}
          label="Total Invoices"
          value={loading ? '—' : totalInvoices}
          iconBg="from-emerald-600 to-emerald-400"
          valueColor="text-emerald-600"
        />
        <StatCard
          icon={FiDollarSign}
          label="Average Sale"
          value={loading ? '—' : `Rs. ${Math.round(averageSale).toLocaleString('en-PK')}`}
          iconBg="from-amber-600 to-amber-400"
          valueColor="text-amber-600"
        />
        <StatCard
          icon={FiCornerUpLeft}
          label="Returned Sales"
          value={loading ? '—' : returnedCount}
          iconBg="from-red-700 to-red-500"
          valueColor="text-red-500"
        />
      </div>

      {/* Main card */}
      <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-bg)] p-3 sm:p-4">

        {/* Tabs + New Sale */}
        <section className="mb-4 flex flex-col gap-3 border-b border-[var(--border-color)] sm:flex-row sm:items-center sm:justify-between">
          <div className="-mb-px flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {FILTERS.map((label, i) => (
              <button
                key={label}
                onClick={() => handleFilterChange(i)}
                className={`shrink-0 cursor-pointer whitespace-nowrap border-b-2 px-5 py-3 text-sm transition-colors ${
                  i === activeFilter
                    ? 'border-[#0969FF] font-semibold text-[var(--text-color)]'
                    : 'border-transparent text-[var(--muted-color)] hover:text-[var(--text-color)]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={() => navigate('/pos')}
            className="mb-3 w-full shrink-0 cursor-pointer whitespace-nowrap rounded-lg bg-[#0969FF] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto"
          >
            + New Sale (POS)
          </button>
        </section>

        {/* Search + Date range + Status */}
        <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-color)]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Search by invoice no or amount..."
              className={`${inputBase} w-full py-2.5 pl-10 pr-3 placeholder:text-[var(--muted-color)]`}
            />
          </div>

          <div className={`${inputBase} flex items-center gap-3 px-3 py-1.5`}>
            <FiCalendar className="shrink-0 text-[var(--muted-color)]" />
            <input
              type="date"
              aria-label="From date"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
              className="min-w-0 flex-1 rounded-md bg-[var(--surface-bg)] px-3 py-1.5 text-sm outline-none"
            />
            <span className="text-[var(--muted-color)]">to</span>
            <input
              type="date"
              aria-label="To date"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
              className="min-w-0 flex-1 rounded-md bg-[var(--surface-bg)] px-3 py-1.5 text-sm outline-none"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className={`${inputBase} w-full cursor-pointer appearance-none py-2.5 pl-3 pr-10 lg:w-48`}
            >
              {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
            <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-color)]" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-[var(--border-color)]">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="bg-[var(--input-bg)]">
              <tr>
                <th className="p-4 font-semibold">#</th>
                <th className="p-4 font-semibold">Invoice No</th>
                <th className="p-4 font-semibold">Date &amp; Time</th>
                <th className="p-4 font-semibold">Items</th>
                <th className="p-4 font-semibold">Total (Rs.)</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--muted-color)]">
                    Loading sales...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-red-500">{error}</td>
                </tr>
              ) : paginatedSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--muted-color)]">
                    No sales found.
                  </td>
                </tr>
              ) : (
                paginatedSales.map((sale, idx) => {
                  const isReturned = Boolean(sale.returned);
                  const isBeingReturned = returningId === sale.id;
                  const isPendingConfirm = confirmReturnId === sale.id;
                  const msg = returnMsg.id === sale.id ? returnMsg : null;

                  return (
                    <React.Fragment key={sale.id}>
                      <tr className={`transition-colors hover:bg-[var(--input-bg)] ${isReturned ? 'opacity-60' : ''}`}>
                        <td className="p-4">{(safePage - 1) * ROWS_PER_PAGE + idx + 1}</td>
                        <td className="p-4 font-medium">{invoiceNo(sale)}</td>
                        <td className="p-4">{formatDate(sale.created_at)}</td>
                        <td className="p-4">{sale.item_count}</td>
                        <td className={`p-4 font-medium ${isReturned ? 'line-through' : ''}`}>
                          {Number(sale.total).toLocaleString('en-PK')}
                        </td>
                        <td className="p-4">
                          {isReturned ? (
                            <span className="inline-block rounded bg-red-500 px-3 py-1 text-xs font-semibold text-white">
                              Returned
                            </span>
                          ) : (
                            <span className="inline-block rounded bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                              Completed
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            {/* View */}
                            <button
                              type="button"
                              aria-label="View invoice"
                              title="View invoice"
                              onClick={() => handleView(sale)}
                              disabled={viewLoading}
                              className={`${iconBtn} disabled:opacity-50`}
                            >
                              <FiEye />
                            </button>

                            {/* Print — opens the receipt modal; user prints from there */}
                            <button
                              type="button"
                              aria-label="Print invoice"
                              title="Print invoice"
                              onClick={() => handleView(sale)}
                              disabled={viewLoading}
                              className={`${iconBtn} disabled:opacity-50`}
                            >
                              <FiPrinter />
                            </button>

                            {/* Return — only for non-returned sales */}
                            {!isReturned && (
                              <button
                                aria-label="Return sale"
                                title="Return this sale"
                                onClick={() => askReturn(sale.id)}
                                disabled={isBeingReturned}
                                className={`${iconBtn} text-red-400 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50`}
                              >
                                <FiRotateCcw className={isBeingReturned ? 'animate-spin' : ''} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Inline confirm row */}
                      {isPendingConfirm && (
                        <tr className="bg-amber-500/5">
                          <td colSpan={7} className="px-4 py-3">
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                              <span className="text-[var(--text-color)]">
                                Return <strong>{invoiceNo(sale)}</strong>? Stock will be restored.
                              </span>
                              <button
                                onClick={() => confirmReturn(sale)}
                                className="rounded-lg bg-red-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
                              >
                                Yes, Return
                              </button>
                              <button
                                onClick={cancelReturn}
                                className="rounded-lg border border-[var(--border-color)] px-4 py-1.5 text-xs font-semibold text-[var(--muted-color)] hover:text-[var(--text-color)]"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Inline result message row */}
                      {msg && msg.text && (
                        <tr>
                          <td colSpan={7} className="px-4 py-2">
                            <p className={`text-xs ${msg.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                              {msg.text}
                            </p>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--muted-color)]">
            {loading
              ? 'Loading...'
              : `Showing ${filteredSales.length === 0 ? 0 : (safePage - 1) * ROWS_PER_PAGE + 1} to ${Math.min(safePage * ROWS_PER_PAGE, filteredSales.length)} of ${filteredSales.length} entries`}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous page"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="cursor-pointer rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] p-2.5 text-[var(--muted-color)] hover:text-[var(--text-color)] disabled:opacity-40"
            >
              <FiChevronLeft />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                type="button"
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`h-9 w-9 cursor-pointer rounded-lg text-sm font-semibold ${
                  page === safePage
                    ? 'bg-[#0969FF] text-white'
                    : 'border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--muted-color)] hover:text-[var(--text-color)]'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              aria-label="Next page"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="cursor-pointer rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] p-2.5 text-[var(--muted-color)] hover:text-[var(--text-color)] disabled:opacity-40"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;
