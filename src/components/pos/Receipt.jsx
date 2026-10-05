import React from 'react';
import { FiPrinter, FiX } from 'react-icons/fi';

const Receipt = ({ receipt, closeReceipt }) => {

    if (!receipt) {
        return null;
    }


    // =========================
    // INVOICE NUMBER
    // Example: OC-26-01
    // =========================
    const year = new Date(receipt.date)
        .getFullYear()
        .toString()
        .slice(-2);

    const invoiceNumber =
        `OC-${year}-${String(receipt.saleId).padStart(2, '0')}`;


    // =========================
    // DATE + TIME
    // =========================
    const receiptDate = new Date(receipt.date);

    const formattedDate =
        receiptDate.toLocaleDateString();

    const formattedTime =
        receiptDate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });


    // =========================
    // PRINT
    // =========================
    function printBill() {
        window.print();
    }


    return (
        <>

            {/* =====================================
                SCREEN RECEIPT
            ====================================== */}
            <div className="screen-receipt rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5">

                {/* Header */}
                <div className="flex items-center justify-between">

                    <div>

                        <h2 className="text-xl font-bold text-[var(--text-color)]">
                            Sale Receipt
                        </h2>

                        <p className="text-sm text-[var(--muted-color)]">
                            Invoice {invoiceNumber}
                        </p>

                    </div>


                    <button
                        onClick={closeReceipt}
                        className="rounded-lg p-2 text-[var(--muted-color)] hover:bg-[var(--input-bg)]"
                    >
                        <FiX size={20} />
                    </button>

                </div>


                {/* Date */}
                <p className="mt-3 text-sm text-[var(--muted-color)]">
                    {formattedDate} • {formattedTime}
                </p>


                {/* Items */}
                <div className="mt-5 space-y-3">

                    {receipt.items.map((item) => (

                        <div
                            key={item.id}
                            className="flex items-center justify-between border-b border-[var(--border-color)] pb-3"
                        >

                            <div>

                                <p className="font-medium text-[var(--text-color)]">
                                    {item.name}
                                </p>

                                <p className="text-sm text-[var(--muted-color)]">
                                    {item.quantity} × Rs. {Number(item.price).toLocaleString()}
                                </p>

                            </div>


                            <p className="font-semibold text-[var(--text-color)]">
                                Rs. {(Number(item.price) * item.quantity).toLocaleString()}
                            </p>

                        </div>

                    ))}

                </div>


                {/* Total */}
                <div className="mt-5 flex items-center justify-between">

                    <span className="font-semibold text-[var(--text-color)]">
                        Total
                    </span>

                    <span className="text-xl font-bold text-[var(--text-color)]">
                        Rs. {Number(receipt.total).toLocaleString()}
                    </span>

                </div>


                {/* Print Button */}
                <button
                    onClick={printBill}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0969FF] py-3 font-semibold text-white hover:bg-[#075bd8]"
                >
                    <FiPrinter size={18} />

                    Print Invoice
                </button>

            </div>



            {/* =====================================
                PRINT INVOICE
            ====================================== */}
            <div id="print-invoice">


                {/* =========================
                    HEADER
                ========================= */}
                <div className="invoice-brand-header">


                    {/* Logo + Business Name */}
                    <div className="invoice-brand">

                        <div className="invoice-logo">
                            <span>MI</span>
                        </div>


                        <div>

                            <h1>
                                MINI INVENTORY
                            </h1>

                            <p>
                                Inventory Management System
                            </p>

                        </div>

                    </div>



                    {/* Invoice Number */}
                    <div className="invoice-number-box">

                        <span>
                            INVOICE
                        </span>

                        <strong>
                            {invoiceNumber}
                        </strong>

                    </div>

                </div>



                {/* Accent Line */}
                <div className="invoice-accent-line"></div>



                {/* =========================
                    SALE DETAILS
                ========================= */}
                <div className="invoice-details">


                    {/* Customer */}
                    <div className="invoice-customer">

                        <span className="invoice-small-label">
                            SALE TO
                        </span>

                        <strong>
                            Walk-in Customer
                        </strong>

                        <p>
                            Point of Sale
                        </p>

                    </div>



                    {/* Date + Time */}
                    <div className="invoice-date-box">

                        <div>

                            <span>
                                DATE
                            </span>

                            <strong>
                                {formattedDate}
                            </strong>

                        </div>


                        <div>

                            <span>
                                TIME
                            </span>

                            <strong>
                                {formattedTime}
                            </strong>

                        </div>

                    </div>

                </div>



                {/* =========================
                    PRODUCTS TABLE
                ========================= */}
                <table className="invoice-table">

                    <thead>

                        <tr>

                            <th>
                                Item
                            </th>

                            <th>
                                Unit Price
                            </th>

                            <th>
                                Qty
                            </th>

                            <th>
                                Amount
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {receipt.items.map((item) => (

                            <tr key={item.id}>

                                <td>
                                    <strong>
                                        {item.name}
                                    </strong>
                                </td>


                                <td>
                                    Rs. {Number(item.price).toLocaleString()}
                                </td>


                                <td>
                                    {item.quantity}
                                </td>


                                <td>
                                    Rs. {(Number(item.price) * item.quantity).toLocaleString()}
                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>



                {/* =========================
                    PAYMENT + TOTAL
                ========================= */}
                <div className="invoice-summary">


                    {/* Payment Status */}
                    <div className="invoice-summary-left">

                        <p>
                            Payment Status
                        </p>

                        <strong>
                            PAID
                        </strong>

                    </div>



                    {/* Grand Total */}
                    <div className="invoice-grand-total">

                        <span>
                            GRAND TOTAL
                        </span>

                        <strong>
                            Rs. {Number(receipt.total).toLocaleString()}
                        </strong>

                    </div>

                </div>



                {/* =========================
                    FOOTER
                ========================= */}
                <div className="invoice-footer">


                    <div className="invoice-footer-logo">
                        <span>MI</span>
                    </div>


                    <strong>
                        Thank you for your purchase!
                    </strong>


                    <p>
                        We appreciate your business.
                    </p>


                    <span>
                        Mini Inventory • Inventory Management System
                    </span>

                </div>

            </div>

        </>
    );
};

export default Receipt;