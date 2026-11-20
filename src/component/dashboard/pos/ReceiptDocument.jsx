'use client';

import React from 'react';
import { Button } from "@heroui/react";
import { FiPrinter, FiCheckCircle, FiPlusCircle } from 'react-icons/fi';

const getVariantText = (item) =>
    item?.variantLabel ||
    item?.variantValue ||
    (Array.isArray(item?.variantAttributes) && item.variantAttributes.length > 0
        ? item.variantAttributes
            .map((attr) => attr?.variantValue ?? attr?.attributeValue)
            .filter(Boolean)
            .join(' • ')
        : '') ||
    (Array.isArray(item?.attributes) && item.attributes.length > 0
        ? item.attributes
            .map((attr) => attr?.attributeValue ?? attr?.variantValue)
            .filter(Boolean)
            .join(' • ')
        : '');

export default function ReceiptDocument({ receipt, onNewSale }) {
    if (!receipt) return null;

    const items = Array.isArray(receipt.items) ? receipt.items : [];
    const customer = receipt.customer || {};

    const handleDownloadPdf = () => {
        window.print();
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-4 rounded-2xl print:hidden">
                <div className="flex items-center gap-3">
                    <FiCheckCircle className="text-emerald-600 shrink-0" size={24} />
                    <div>
                        <h3 className="font-bold text-emerald-900 text-sm">Payment Recorded & Stock Updated</h3>
                        <p className="text-xs text-emerald-700">Receipt #{receipt.receiptNumber}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="bordered"
                        onPress={handleDownloadPdf}
                        className="bg-white border-emerald-300 text-emerald-800 font-semibold"
                    >
                        <FiPrinter size={16} className="mr-1.5" /> Download / Print PDF
                    </Button>
                    <Button
                        onPress={onNewSale}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                    >
                        <FiPlusCircle size={16} className="mr-1.5" /> New Sale
                    </Button>
                </div>
            </div>

            <div
                id="printable-receipt"
                className="bg-white border border-gray-200 rounded-2xl p-8 shadow-xl print:shadow-none print:border-none print:p-0 space-y-6 text-gray-800"
            >
                <div className="text-center border-b border-dashed border-gray-300 pb-5 space-y-1">
                    <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">FRESHMART</h1>
                    <p className="text-sm font-semibold text-emerald-700">{receipt.branchName || 'Branch Store'}</p>
                    {receipt.branchAddress && <p className="text-xs text-gray-500">{receipt.branchAddress}</p>}
                    {receipt.branchPhones?.length > 0 && (
                        <p className="text-xs text-gray-500">Tel: {receipt.branchPhones.join(', ')}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs border-b border-dashed border-gray-300 pb-4">
                    <div className="space-y-1">
                        <p><span className="text-gray-400">Receipt No:</span> <span className="font-mono font-bold">{receipt.receiptNumber}</span></p>
                        <p><span className="text-gray-400">Date:</span> {new Date(receipt.createdAt).toLocaleString()}</p>
                        <p><span className="text-gray-400">Payment:</span> <span className="font-semibold">{receipt.paymentMethod}</span></p>
                    </div>
                    <div className="space-y-1 text-right">
                        <p><span className="text-gray-400">Cashier:</span> <span className="font-semibold">{receipt.cashierName}</span></p>
                        {customer.name && (
                            <p><span className="text-gray-400">Customer:</span> <span className="font-semibold">{customer.name}</span></p>
                        )}
                        {customer.phone && (
                            <p><span className="text-gray-400">Phone:</span> {customer.phone}</p>
                        )}
                        {customer.email && (
                            <p><span className="text-gray-400">Email:</span> {customer.email}</p>
                        )}
                        {customer.address && (
                            <p><span className="text-gray-400">Address:</span> {customer.address}</p>
                        )}
                    </div>
                </div>

                <div>
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-gray-200 text-gray-500 uppercase">
                                <th className="py-2">Product & Variant</th>
                                <th className="py-2 text-right">Price</th>
                                <th className="py-2 text-center">Qty</th>
                                <th className="py-2 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {items.map((item, idx) => {
                                const variantText = getVariantText(item);
                                const itemKey = `${item.recordId || item.productId || item.variantSku || 'item'}-${item.variantSku || idx}`;

                                return (
                                    <tr key={itemKey}>
                                        <td className="py-2.5 pr-2">
                                            <p className="font-bold text-gray-900">{item.productName}</p>
                                            <p className="text-[11px] text-gray-500">
                                                {item.variantSku}{variantText ? ` (${variantText})` : ''}
                                            </p>
                                        </td>
                                        <td className="py-2.5 text-right">৳{Number(item.unitPrice).toLocaleString()}</td>
                                        <td className="py-2.5 text-center font-semibold">{item.quantity}</td>
                                        <td className="py-2.5 text-right font-bold text-gray-900">
                                            ৳{Number(item.lineTotal).toLocaleString()}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="border-t border-dashed border-gray-300 pt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                        <span>Products Subtotal</span>
                        <span className="font-semibold">৳{Number(receipt.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>

                    {Number(receipt.discountPercentage) > 0 && (
                        <div className="flex justify-between text-emerald-700">
                            <span>Discount ({receipt.discountPercentage}%)</span>
                            <span>- ৳{Number(receipt.discountAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    )}

                    {Number(receipt.vatPercentage) > 0 && (
                        <div className="flex justify-between text-gray-600">
                            <span>VAT / Tax ({receipt.vatPercentage}%)</span>
                            <span>+ ৳{Number(receipt.vatAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    )}

                    <div className="flex justify-between text-lg font-extrabold text-gray-900 pt-3 border-t border-gray-200">
                        <span>Total Bill</span>
                        <span>৳{Number(receipt.totalBill).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>

                {receipt.note && (
                    <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                        <span className="font-semibold">Note:</span> {receipt.note}
                    </div>
                )}

                <div className="text-center text-[11px] text-gray-400 pt-4 border-t border-dashed border-gray-200">
                    Thank you for shopping at FreshMart!
                </div>
            </div>
        </div>
    );
}