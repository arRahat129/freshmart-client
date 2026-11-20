'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@heroui/react';
import { FiX, FiPrinter } from 'react-icons/fi';
import { getReceiptById } from '@/lib/api/checkout';
import ReceiptDocument from '@/component/dashboard/pos/ReceiptDocument';

export default function ReceiptViewModal({
    isOpen,
    onClose,
    receiptId,
    initialReceipt = null,
    autoPrint = false,
}) {
    const [fetchedReceipt, setFetchedReceipt] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const targetId = receiptId || initialReceipt?._id || initialReceipt?.receiptNumber || '';
    const receipt = fetchedReceipt || initialReceipt;

    useEffect(() => {
        if (!isOpen || !targetId) return;

        let active = true;

        Promise.resolve().then(async () => {
            if (!active) return;
            setError('');
            setLoading(true);

            try {
                const res = await getReceiptById(targetId);
                if (!active) return;
                if (res?.success && res?.data) {
                    setFetchedReceipt(res.data);
                } else if (!initialReceipt) {
                    setError(res?.message || 'Unable to load receipt details.');
                }
            } catch (err) {
                if (active && !initialReceipt) {
                    setError(err?.message || 'Unable to load receipt details.');
                }
            } finally {
                if (active) setLoading(false);
            }
        });

        return () => {
            active = false;
        };
    }, [isOpen, targetId, initialReceipt]);

    useEffect(() => {
        if (!isOpen || !autoPrint || !receipt || loading) return;
        const timer = setTimeout(() => {
            window.print();
        }, 250);
        return () => clearTimeout(timer);
    }, [isOpen, autoPrint, receipt, loading]);

    if (!isOpen) return null;

    const handleClose = () => {
        setFetchedReceipt(null);
        setError('');
        setLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-emerald-100 relative my-auto space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 print:hidden">
                    <h2 className="text-lg font-bold text-gray-900">
                        Money Receipt {receipt?.receiptNumber ? `#${receipt.receiptNumber}` : ''}
                    </h2>
                    <div className="flex items-center gap-2">
                        {receipt && (
                            <Button
                                size="sm"
                                variant="outline"
                                onPress={() => window.print()}
                                className="border-emerald-900 text-emerald-800 font-semibold"
                            >
                                <FiPrinter size={14} className="mr-1" /> Print / PDF
                            </Button>
                        )}
                        <button
                            type="button"
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg transition-colors"
                            aria-label="Close modal"
                        >
                            <FiX size={20} />
                        </button>
                    </div>
                </div>

                {loading && !receipt ? (
                    <div className="py-12 text-center text-sm text-gray-500">Loading receipt details...</div>
                ) : error ? (
                    <div className="py-10 text-center text-sm text-red-600 font-medium">{error}</div>
                ) : receipt ? (
                    <ReceiptDocument receipt={receipt} onNewSale={handleClose} showActions={false} />
                ) : (
                    <div className="py-10 text-center text-sm text-gray-500">No receipt data available.</div>
                )}
            </div>
        </div>
    );
}