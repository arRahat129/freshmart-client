'use client';

import React from 'react';
import { Modal, Button, TextArea, Label, TextField, Surface } from '@heroui/react';
import { FiAlertTriangle } from 'react-icons/fi';

export default function RejectRequestModal({
    isOpen,
    onOpenChange,
    request,
    reason,
    onReasonChange,
    deleteAfterReject,
    isLoading,
    onConfirm
}) {
    const handleClose = () => {
        if (!isLoading) onOpenChange(false);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        onConfirm();
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={(open) => { if (!isLoading) onOpenChange(open); }}>
            <Modal.Backdrop>
                <Modal.Container placement="center">
                    <Modal.Dialog className="sm:max-w-md">
                        <Modal.CloseTrigger isDisabled={isLoading} />
                        <Modal.Header>
                            <Modal.Icon className="bg-red-100 text-red-600">
                                <FiAlertTriangle className="size-5" />
                            </Modal.Icon>
                            <Modal.Heading>
                                {deleteAfterReject ? 'Reject & Delete Pending Request' : 'Reject Stock Request'}
                            </Modal.Heading>
                            <p className="mt-1.5 text-sm leading-5 text-muted">
                                Provide a clear reason why you cannot accept{' '}
                                <strong className="text-gray-900">{request?.productName}</strong> right now.
                            </p>
                        </Modal.Header>

                        <Modal.Body className="py-2">
                            <Surface variant="default">
                                <form id="reject-request-form" onSubmit={handleFormSubmit} className="flex flex-col gap-3">
                                    <TextField className="w-full" name="rejectionReason" isRequired>
                                        <Label>Rejection Reason</Label>
                                        <TextArea
                                            placeholder="e.g., Insufficient warehouse stock, seasonal hold, or incorrect variant quantities..."
                                            value={reason}
                                            onChange={(e) => onReasonChange(e.target.value)}
                                            rows={3}
                                            variant="secondary"
                                            required
                                        />
                                    </TextField>

                                    {deleteAfterReject && (
                                        <p className="rounded-lg border border-red-100 bg-red-50 p-2.5 text-xs text-red-700">
                                            Note: Your rejection reason will be recorded in the rejection logs, and this request card will be permanently removed.
                                        </p>
                                    )}
                                </form>
                            </Surface>
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
                                type="submit"
                                form="reject-request-form"
                                color="danger"
                                className="font-semibold"
                                isLoading={isLoading}
                            >
                                {deleteAfterReject ? 'Confirm Reject & Delete' : 'Confirm Reject'}
                            </Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}