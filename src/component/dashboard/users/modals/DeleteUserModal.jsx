'use client';

import React from 'react';
import { Button } from "@heroui/react";
import { FiAlertTriangle, FiX } from 'react-icons/fi';

export default function DeleteUserModal({ isOpen, onClose, onConfirm, userName, loading }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-emerald-100 space-y-6 relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <FiX size={20} />
                </button>

                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                        <FiAlertTriangle size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Delete User Account</h3>
                        <p className="text-sm text-gray-500">Are you sure you want to delete <span className="font-semibold text-gray-700">{userName}</span>? This action cannot be undone.</p>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
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
                        onPress={onConfirm}
                        isLoading={loading}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-lg shadow-rose-600/20"
                    >
                        Yes, Delete
                    </Button>
                </div>
            </div>
        </div>
    );
}