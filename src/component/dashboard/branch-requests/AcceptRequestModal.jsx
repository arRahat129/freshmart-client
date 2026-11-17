'use client';

import React from 'react';
import { Modal, Button } from '@heroui/react';
import { FiCheckCircle } from 'react-icons/fi';

export default function AcceptRequestModal({
    isOpen,
    onOpenChange,
    request,
    isLoading,
    onConfirm
}) {
    const handleClose = () => {
        if (!isLoading) onOpenChange(false);
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={(open) => { if (!isLoading) onOpenChange(open); }}>
            <Modal.Backdrop>
                <Modal.Container placement="center">
                    <Modal.Dialog className="sm:max-w-md">
                        <Modal.CloseTrigger isDisabled={isLoading} />
                        <Modal.Header>
                            <Modal.Icon className="bg-emerald-100 text-emerald-700">
                                <FiCheckCircle className="size-5" />
                            </Modal.Icon>
                            <Modal.Heading>Confirm Stock Approval</Modal.Heading>
                            <p className="mt-1.5 text-sm leading-5 text-muted">
                                Are you sure you want to accept this request for{' '}
                                <strong className="text-gray-900">{request?.productName}</strong>?
                            </p>
                        </Modal.Header>

                        <Modal.Body className="py-2">
                            <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 p-3 text-xs leading-relaxed text-emerald-900">
                                Accepting will automatically deduct the requested variant quantities and total stock from the main warehouse inventory and transfer them to{' '}
                                <strong>{request?.branchName || 'the assigned branch'}</strong>.
                            </div>
                        </Modal.Body>

                        <Modal.Footer className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                isDisabled={isLoading}
                                onPress={handleClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="success"
                                className="bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                                isLoading={isLoading}
                                onPress={onConfirm}
                            >
                                Confirm Accept
                            </Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}