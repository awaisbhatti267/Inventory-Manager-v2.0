import React from 'react';
import {  FiFileText,  FiShoppingCart,  FiDollarSign,  FiCornerUpLeft,  FiSearch,  FiCalendar,  FiChevronDown,  FiChevronLeft,  FiChevronRight,FiEye,FiPrinter,} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/statCard';

// Styles
const FILTERS = ['All Sales', 'Today', 'This Month', 'Custom Date'];
const inputBase ='rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm text-[var(--text-color)] outline-none focus:border-[#0969FF]';
const iconBtn ='cursor-pointer rounded-lg bg-[var(--input-bg)] p-2.5 text-[var(--muted-color)] transition-colors hover:text-[var(--text-color)]';

const Sales = () => {

  const navigate = useNavigate()

  const handleNavigate = (()=>{
    navigate('/pos')
  })

  // Dummy data, baad mein API se aayega
  const totalSales = 48600;
  const totalInvoices = 6;
  const returnedSales = 1;
  const averageSale = totalInvoices ? totalSales / totalInvoices : 0;

  return (
    <div className="text-[var(--text-color)]">
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
          value={`Rs. ${totalSales.toLocaleString('en-PK')}`}
          iconBg="from-[#0969FF] to-[#6C3EFF]"
          valueColor="text-blue-500"
        />
        <StatCard
          icon={FiShoppingCart}
          label="Total Invoices"
          value={totalInvoices}
          iconBg="from-emerald-600 to-emerald-400"
          valueColor="text-emerald-600"
        />
        <StatCard
          icon={FiDollarSign}
          label="Average Sale"
          value={`Rs. ${Math.round(averageSale).toLocaleString('en-PK')}`}
          iconBg="from-amber-600 to-amber-400"
          valueColor="text-amber-600"
        />
        <StatCard
          icon={FiCornerUpLeft}
          label="Returned Sales"
          value={returnedSales}
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
                className={`shrink-0 cursor-pointer whitespace-nowrap border-b-2 px-5 py-3 text-sm transition-colors ${
                  i === 0
                    ? 'border-[#0969FF] font-semibold text-[var(--text-color)]'
                    : 'border-transparent text-[var(--muted-color)] hover:text-[var(--text-color)]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button onClick={handleNavigate} className="mb-3 w-full shrink-0 cursor-pointer whitespace-nowrap rounded-lg bg-[#0969FF] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto">
            + New Sale (POS)
          </button>
        </section>

        {/* Search + Date range + Status */}
        <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-color)]" />
            <input
              type="text"
              placeholder="Search by invoice no, customer or product..."
              className={`${inputBase} w-full py-2.5 pl-10 pr-3 placeholder:text-[var(--muted-color)]`}
            />
          </div>

          <div className={`${inputBase} flex items-center gap-3 px-3 py-1.5`}>
            <FiCalendar className="shrink-0 text-[var(--muted-color)]" />
            <input
              type="date"
              aria-label="From date"
              className="min-w-0 flex-1 rounded-md bg-[var(--surface-bg)] px-3 py-1.5 text-sm outline-none"
            />
            <span className="text-[var(--muted-color)]">to</span>
            <input
              type="date"
              aria-label="To date"
              className="min-w-0 flex-1 rounded-md bg-[var(--surface-bg)] px-3 py-1.5 text-sm outline-none"
            />
          </div>

          <div className="relative">
            <select
              className={`${inputBase} w-full cursor-pointer appearance-none py-2.5 pl-3 pr-10 lg:w-48`}
            >
              <option>All Status</option>
              <option>Completed</option>
              <option>Returned</option>
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
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Items</th>
                <th className="p-4 font-semibold">Total (Rs.)</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              <tr className="transition-colors hover:bg-[var(--input-bg)]">
                <td className="p-4">1</td>
                <td className="p-4">INV-0001</td>
                <td className="p-4">10/05/2026 03:20 PM</td>
                <td className="p-4">Walk-in</td>
                <td className="p-4">3</td>
                <td className="p-4 font-medium">4,600</td>
                <td className="p-4">
                  <span className="inline-block rounded bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                    Completed
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button aria-label="View invoice" className={iconBtn}>
                      <FiEye />
                    </button>
                    <button aria-label="Print invoice" className={iconBtn}>
                      <FiPrinter />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--muted-color)]">
            Showing 1 to 6 of 6 entries
          </p>
          <div className="flex items-center gap-2">
            <button
              aria-label="Previous page"
              className="cursor-pointer rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] p-2.5 text-[var(--muted-color)] hover:text-[var(--text-color)]"
            >
              <FiChevronLeft />
            </button>
            <button className="h-9 w-9 cursor-pointer rounded-lg bg-[#0969FF] text-sm font-semibold text-white">
              1
            </button>
            <button
              aria-label="Next page"
              className="cursor-pointer rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] p-2.5 text-[var(--muted-color)] hover:text-[var(--text-color)]"
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