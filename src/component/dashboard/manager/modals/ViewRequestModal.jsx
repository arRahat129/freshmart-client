'use client';

import React from 'react';
import { Modal, Button, Chip } from '@heroui/react';
import { FiPackage, FiFileText } from 'react-icons/fi';

export default function ViewRequestModal({ isOpen, onClose, request }) {
    if (!request) return null;

    const getStatusColor = (status) => {
        if (status === 'Approved') return 'success';
        if (status === 'Rejected') return 'danger';
        return 'warning';
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()} size="2xl" scrollBehavior="inside">
            <Modal.Backdrop>
                <Modal.Container>
                    <Modal.Dialog>
                        <Modal.CloseTrigger />
                        <Modal.Header className="flex items-center justify-between gap-2 border-b border-default-100 pb-3">
                            <div className="flex items-center gap-2">
                                <Modal.Icon className="text-primary">
                                    <FiPackage className="text-xl" />
                                </Modal.Icon>
                                <Modal.Heading>Request Details</Modal.Heading>
                            </div>
                            <Chip color={getStatusColor(request.status)} variant="flat" size="sm">
                                {request.status}
                            </Chip>
                        </Modal.Header>
                        <Modal.Body className="py-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4 bg-default-50 p-3 rounded-medium text-xs">
                                <div>
                                    <span className="font-semibold text-default-500">Request Type:</span>
                                    <p className="text-default-800 font-medium">{request.productName ? 'Custom Product' : 'Main Warehouse Restock'}</p>
                                </div>
                                <div>
                                    <span className="font-semibold text-default-500">Created Date:</span>
                                    <p className="text-default-800 font-medium">{new Date(request.createdAt).toLocaleString()}</p>
                                </div>
                            </div>

                            {request.productName && (
                                <div>
                                    <h4 className="text-sm font-semibold mb-1">Product Info</h4>
                                    <p className="text-small text-default-700"><strong>Name:</strong> {request.productName}</p>
                                    {request.description && <p className="text-small text-default-500"><strong>Description:</strong> {request.description}</p>}
                                </div>
                            )}

                            <div>
                                <h4 className="text-sm font-semibold mb-2">Requested Variants</h4>
                                <div className="border border-default-200 rounded-medium overflow-hidden">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-default-100 text-default-600 font-semibold border-b border-default-200">
                                            <tr>
                                                <th className="p-2">Variant SKU</th>
                                                <th className="p-2">Size / Color</th>
                                                <th className="p-2 text-right">Qty</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(request.requestedVariants || request.variants || []).map((v, i) => (
                                                <tr key={i} className="border-b border-default-100 last:border-none">
                                                    <td className="p-2 font-mono">{v.variantSku}</td>
                                                    <td className="p-2">{v.size || '-'} / {v.color || '-'}</td>
                                                    <td className="p-2 text-right font-semibold">{v.quantity || v.requestedStock}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {request.managerNote && (
                                <div className="bg-default-50 p-3 rounded-medium">
                                    <span className="text-xs font-semibold text-default-500 flex items-center gap-1">
                                        <FiFileText /> Manager Note:
                                    </span>
                                    <p className="text-small text-default-700 mt-1">{request.managerNote}</p>
                                </div>
                            )}

                            {request.adminNote && (
                                <div className="bg-danger-50 border border-danger-100 p-3 rounded-medium">
                                    <span className="text-xs font-semibold text-danger-600">Admin Review Note:</span>
                                    <p className="text-small text-danger-700 mt-1">{request.adminNote}</p>
                                </div>
                            )}
                        </Modal.Body>
                        <Modal.Footer className="border-t border-default-100 pt-3">
                            <Button color="primary" variant="light" onPress={onClose}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}