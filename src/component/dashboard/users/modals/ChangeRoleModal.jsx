'use client';

import React, { useState, useEffect } from 'react';
import { Button, Select, ListBox } from "@heroui/react";
import { FiShield, FiX } from 'react-icons/fi';

const ALL_ROLES = [
    { key: 'owner', label: 'Owner' },
    { key: 'superadmin', label: 'Super Admin' },
    { key: 'admin', label: 'Admin' },
    { key: 'manager', label: 'Manager' },
    { key: 'cashier', label: 'Cashier' },
    { key: 'staff', label: 'Staff / Employee' }
];

export default function ChangeRoleModal({ isOpen, onClose, onConfirm, user, loading }) {
    const [selectedRole, setSelectedRole] = useState('');

    useEffect(() => {
        if (user) {
            setSelectedRole(user.role || 'staff');
        }
    }, [user]);

    if (!isOpen || !user) return null;

    const availableRoles = ALL_ROLES.filter(r => r.key !== user.role);

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
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <FiShield size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Change User Role</h3>
                        <p className="text-sm text-gray-500">Update permission access for <span className="font-semibold text-gray-700">{user.name}</span>.</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 block">Select New Role</label>
                    <Select
                        selectedKey={selectedRole}
                        onSelectionChange={(key) => setSelectedRole(key || selectedRole)}
                        placeholder="Select new role"
                        variant="bordered"
                    >
                        <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
                        <Select.Popover>
                            <ListBox>
                                {availableRoles.map((role) => (
                                    <ListBox.Item key={role.key} id={role.key} textValue={role.label}>
                                        {role.label} <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                ))}
                            </ListBox>
                        </Select.Popover>
                    </Select>
                    <p className="text-xs text-gray-400">Current role is <span className="uppercase font-semibold text-emerald-700">{user.role}</span>.</p>
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
                        onPress={() => onConfirm(selectedRole)}
                        isLoading={loading}
                        isDisabled={selectedRole === user.role}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-600/20"
                    >
                        Update Role
                    </Button>
                </div>
            </div>
        </div>
    );
}