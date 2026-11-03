'use client';

import React from 'react';
import { Button, AlertDialog } from "@heroui/react";
import { FiTrash2 } from "react-icons/fi";

export default function DeleteBranch({ isOpen, onOpenChange, branch, onDeleteConfirm, isDeleting }) {
    return (
        <AlertDialog isOpen={isOpen} onOpenChange={onOpenChange}>
            <AlertDialog.Backdrop>
                <AlertDialog.Container>
                    <AlertDialog.Dialog className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full border border-gray-100 space-y-4">
                        <AlertDialog.CloseTrigger />
                        <AlertDialog.Header className="flex items-center gap-3">
                            <AlertDialog.Icon className="text-red-600 bg-red-50 p-2 rounded-xl">
                                <FiTrash2 size={24} />
                            </AlertDialog.Icon>
                            <AlertDialog.Heading className="text-lg font-bold text-gray-900">
                                Delete Branch
                            </AlertDialog.Heading>
                        </AlertDialog.Header>
                        <AlertDialog.Body className="text-sm text-gray-600">
                            Are you sure you want to delete <span className="font-semibold text-gray-900">{branch?.name}</span>? This action cannot be undone.
                        </AlertDialog.Body>
                        <AlertDialog.Footer className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                            <Button
                                variant="bordered"
                                onClick={() => onOpenChange(false)}
                                disabled={isDeleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="danger"
                                onClick={onDeleteConfirm}
                                isLoading={isDeleting}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                            >
                                Confirm Delete
                            </Button>
                        </AlertDialog.Footer>
                    </AlertDialog.Dialog>
                </AlertDialog.Container>
            </AlertDialog.Backdrop>
        </AlertDialog>
    );
}