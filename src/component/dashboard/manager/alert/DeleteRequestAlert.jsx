'use client';

import React from 'react';
import { AlertDialog, Button } from '@heroui/react';
import { FiAlertTriangle } from 'react-icons/fi';

export default function DeleteRequestAlert({ isOpen, onClose, onConfirm, isLoading }) {
    return (
        <AlertDialog isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
            <AlertDialog.Backdrop>
                <AlertDialog.Container>
                    <AlertDialog.Dialog>
                        <AlertDialog.CloseTrigger />
                        <AlertDialog.Header>
                            <AlertDialog.Icon className="text-danger">
                                <FiAlertTriangle className="text-xl" />
                            </AlertDialog.Icon>
                            <AlertDialog.Heading>Confirm Request Deletion</AlertDialog.Heading>
                        </AlertDialog.Header>
                        <AlertDialog.Body>
                            <p className="text-sm text-default-600">
                                Are you sure you want to delete this pending request? This action cannot be undone.
                            </p>
                        </AlertDialog.Body>
                        <AlertDialog.Footer>
                            <Button variant="flat" color="default" onPress={onClose} isDisabled={isLoading}>
                                Cancel
                            </Button>
                            <Button color="danger" onPress={onConfirm} isLoading={isLoading}>
                                Delete Request
                            </Button>
                        </AlertDialog.Footer>
                    </AlertDialog.Dialog>
                </AlertDialog.Container>
            </AlertDialog.Backdrop>
        </AlertDialog>
    );
}