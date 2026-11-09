'use client';

import React from 'react';
import { Button } from "@heroui/react";
import { FiCheckCircle, FiX } from "react-icons/fi";

export default function EditSuccessModal({ isOpen, onClose, onConfirm, productName, loading }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-5 border border-gray-100 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <FiCheckCircle size={20} />
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
                    >
                        <FiX size={18} />
                    </button>
                </div>

                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-gray-900">Save Changes</h3>
                    <p className="text-sm text-gray-500">
                        Are you sure you want to save updates for <span className="font-semibold text-gray-800">&quot;{productName || 'this product'}&quot;</span>?
                    </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                        variant="bordered"
                        onPress={onClose}
                        isDisabled={loading}
                        className="border-gray-200 text-gray-700 font-medium"
                    >
                        Cancel
                    </Button>
                    <Button
                        isLoading={loading}
                        onPress={onConfirm}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                    >
                        Confirm & Save
                    </Button>
                </div>
            </div>
        </div>
    );
}