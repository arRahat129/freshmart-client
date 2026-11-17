'use client';

import React from 'react';
import { Modal, Button } from '@heroui/react';
import { FiTrash2 } from 'react-icons/fi';

export default function DeleteRequestModal({
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
                    <Modal.Dialog className="sm:max-w-sm">
                        <Modal.CloseTrigger isDisabled={isLoading} />
                        <Modal.Header>
                            <Modal.Icon className="bg-red-100 text-red-600">
                                <FiTrash2 className="size-5" />
                            </Modal.Icon>
                            <Modal.Heading>Delete Request Record</Modal.Heading>
                            <p className="mt-1.5 text-sm leading-5 text-muted">
                                This request for <strong className="text-gray-900">{request?.productName}</strong> has already been processed. Do you want to remove this entry from the list?
                            </p>
                        </Modal.Header>

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
                                color="danger"
                                className="font-semibold"
                                isLoading={isLoading}
                                onPress={onConfirm}
                            >
                                Delete Entry
                            </Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}