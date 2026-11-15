'use client';

import React from 'react';
import { Modal, Button } from '@heroui/react';
import { FiCheckCircle } from 'react-icons/fi';

export default function UpdateRequestModal({ isOpen, onClose, onConfirm, isLoading }) {
    return (
        <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Modal.Backdrop>
                <Modal.Container>
                    <Modal.Dialog>
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Icon className="text-primary">
                                <FiCheckCircle className="text-xl" />
                            </Modal.Icon>
                            <Modal.Heading>Confirm Changes</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body>
                            <p className="text-sm text-default-600">
                                Are you sure you want to update this stock request details?
                            </p>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="flat" color="default" onPress={onClose} isDisabled={isLoading}>
                                Keep Editing
                            </Button>
                            <Button color="primary" onPress={onConfirm} isLoading={isLoading}>
                                Confirm Update
                            </Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}