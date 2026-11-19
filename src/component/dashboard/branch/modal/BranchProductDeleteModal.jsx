'use client';

import React from 'react';
import { Button } from '@heroui/react';
import { FiAlertTriangle, FiTrash2, FiX } from 'react-icons/fi';

export default function BranchProductDeleteModal({ isOpen, onClose, onConfirm, product, isPending }) {
    if (!isOpen || !product) return null;

    const currentStock = product.stock ?? product.requestedStock ?? 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl border border-emerald-100 shadow-2xl p-6 sm:p-8 max-w-md w-full text-center space-y-6 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-100 rounded-full blur-2xl opacity-60 pointer-events-none" />

                <button
                    onClick={onClose}
                    disabled={isPending}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors cursor-pointer"
                >
                    <FiX size={18} />
                </button>

                <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-inner border border-red-100">
                    <FiAlertTriangle size={28} />
                </div>

                <div className="space-y-2">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Delete Product?</h2>
                    <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                        Are you sure you want to delete SKU <span className="font-mono font-bold text-gray-800">{product.variantSku}</span> ({product.productName}) from this branch? This action cannot be undone.
                    </p>
                </div>

                {currentStock > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left">
                        <p className="text-xs text-amber-800 font-medium">
                            ⚠️ <span className="font-bold">Warning:</span> This product currently has <span className="font-bold">{currentStock}</span> units in stock. You must sell or return all units before deletion.
                        </p>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                    <Button
                        variant="flat"
                        onPress={onClose}
                        isDisabled={isPending}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs sm:text-sm h-11 rounded-xl transition-all"
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="flat"
                        color="danger"
                        isDisabled={currentStock > 0 || isPending}
                        isLoading={isPending}
                        onPress={onConfirm}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm h-11 rounded-xl shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2"
                    >
                        <FiTrash2 className="size-4" /> Yes, Delete
                    </Button>
                </div>
            </div>
        </div>
    );
}