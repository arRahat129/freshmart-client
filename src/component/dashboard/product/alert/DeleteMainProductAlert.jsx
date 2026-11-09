'use client';

import React from 'react';
import { Button } from "@heroui/react";
import { FiAlertTriangle, FiX } from "react-icons/fi";

export default function DeleteMainProductAlert({ isOpen, onClose, onConfirm, productName, loading }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-5 border border-gray-100 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                        <FiAlertTriangle size={20} />
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
                    >
                        <FiX size={18} />
                    </button>
                </div>

                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-gray-900">Delete Product</h3>
                    <p className="text-sm text-gray-500">
                        Are you sure you want to delete <span className="font-semibold text-gray-800">&quot;{productName}&quot;</span>? This action cannot be undone and will remove associated stock variants.
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
                        color="danger"
                        isLoading={loading}
                        onPress={onConfirm}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                    >
                        Yes, Delete
                    </Button>
                </div>
            </div>
        </div>
    );
}