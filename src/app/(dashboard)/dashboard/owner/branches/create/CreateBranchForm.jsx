'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Select, ListBox, Card } from "@heroui/react";
import { useRouter } from 'next/navigation';
import { FiPlus, FiTrash2, FiMapPin, FiArrowLeft } from "react-icons/fi";
import { actionCreateBranch } from '@/lib/actions/branch';
import { getAllManagers } from '@/lib/api/manager';

const CreateBranchForm = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [managers, setManagers] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        address: '',
        city: '',
        phones: [''],
        emails: [''],
        manager: '',
        status: 'active'
    });

    useEffect(() => {
        const fetchManagersList = async () => {
            try {
                const res = await getAllManagers();
                if (res && res.success) {
                    setManagers(res.data || []);
                }
            } catch (err) {
                console.error("Failed to load managers list", err);
            }
        };
        fetchManagersList();
    }, []);

    const handlePhoneChange = (index, value) => {
        const newPhones = [...formData.phones];
        newPhones[index] = value;
        setFormData({ ...formData, phones: newPhones });
    };

    const addPhoneField = () => {
        setFormData({ ...formData, phones: [...formData.phones, ''] });
    };

    const removePhoneField = (index) => {
        const newPhones = formData.phones.filter((_, i) => i !== index);
        setFormData({ ...formData, phones: newPhones.length ? newPhones : [''] });
    };

    const handleEmailChange = (index, value) => {
        const newEmails = [...formData.emails];
        newEmails[index] = value;
        setFormData({ ...formData, emails: newEmails });
    };

    const addEmailField = () => {
        setFormData({ ...formData, emails: [...formData.emails, ''] });
    };

    const removeEmailField = (index) => {
        const newEmails = formData.emails.filter((_, i) => i !== index);
        setFormData({ ...formData, emails: newEmails.length ? newEmails : [''] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            const payload = {
                ...formData,
                phones: formData.phones.filter(p => p.trim() !== ''),
                emails: formData.emails.filter(e => e.trim() !== ''),
                manager: (!formData.manager || formData.manager === '' || formData.manager === 'no-manager') ? null : formData.manager
            };

            const res = await actionCreateBranch(payload);
            if (res && res.success) {
                router.push('/dashboard/owner/branches');
            } else {
                setErrorMsg(res?.message || 'Failed to create branch.');
            }
        } catch (err) {
            setErrorMsg(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">

            <div className="flex flex-col gap-3">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors w-fit"
                >
                    <FiArrowLeft size={16} /> Back to Branches
                </button>
                <div className="flex items-center justify-between bg-white border border-emerald-100 p-6 rounded-2xl shadow-sm">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                            <FiMapPin size={12} /> Store Operations
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Register New Branch</h1>
                        <p className="text-sm text-gray-500">Add a physical supermarket location, set up multi-contact points, and assign administrative oversight.</p>
                    </div>
                </div>
            </div>

            {errorMsg && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                    {errorMsg}
                </div>
            )}

            <Card className="border border-emerald-100 shadow-xl shadow-emerald-950/5 bg-white/90 backdrop-blur-md rounded-2xl">
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 block">Branch Name</label>
                                <Input
                                    placeholder="e.g. FreshMart Dhanmondi Outlet"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    variant="bordered"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 block">Branch Code</label>
                                <Input
                                    placeholder="e.g. DHN-01"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    required
                                    variant="bordered"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 block">Street Address</label>
                                <Input
                                    placeholder="e.g. House 12, Road 5, Dhanmondi"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    required
                                    variant="bordered"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 block">City</label>
                                <Input
                                    placeholder="e.g. Dhaka"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    required
                                    variant="bordered"
                                />
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <label className="text-sm font-semibold text-gray-700 block">Phone Numbers</label>
                            {formData.phones.map((phone, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <Input
                                        placeholder="e.g. +8801700000000"
                                        value={phone}
                                        onChange={(e) => handlePhoneChange(index, e.target.value)}
                                        variant="bordered"
                                        className="flex-1"
                                    />
                                    {formData.phones.length > 1 && (
                                        <Button
                                            isIconOnly
                                            color="danger"
                                            variant="light"
                                            onPress={() => removePhoneField(index)}
                                        >
                                            <FiTrash2 size={18} />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button
                                size="sm"
                                variant="flat"
                                className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium mt-1 flex items-center gap-2"
                                onPress={addPhoneField}
                            >
                                <FiPlus size={16} /> Add Another Phone
                            </Button>
                        </div>

                        <div className="space-y-3 pt-2">
                            <label className="text-sm font-semibold text-gray-700 block">Email Addresses</label>
                            {formData.emails.map((email, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <Input
                                        placeholder="e.g. dhanmondi@freshmart.com"
                                        type="email"
                                        value={email}
                                        onChange={(e) => handleEmailChange(index, e.target.value)}
                                        variant="bordered"
                                        className="flex-1"
                                    />
                                    {formData.emails.length > 1 && (
                                        <Button
                                            isIconOnly
                                            color="danger"
                                            variant="light"
                                            onPress={() => removeEmailField(index)}
                                        >
                                            <FiTrash2 size={18} />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button
                                size="sm"
                                variant="flat"
                                className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium mt-1 flex items-center gap-2"
                                onPress={addEmailField}
                            >
                                <FiPlus size={16} /> Add Another Email
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 block">Branch Manager (Optional)</label>
                                <Select
                                    selectedKey={formData.manager}
                                    onSelectionChange={(key) => setFormData({ ...formData, manager: key || "" })}
                                    placeholder="Select a manager"
                                >
                                    <Select.Trigger>
                                        <Select.Value />
                                        <Select.Indicator />
                                    </Select.Trigger>
                                    <Select.Popover>
                                        <ListBox>
                                            {managers && managers.length > 0 ? (
                                                managers.map((m) => {
                                                    const idStr = String(m._id || m.id);
                                                    return (
                                                        <ListBox.Item key={idStr} id={idStr} textValue={m.name}>
                                                            {m.name} ({m.email || 'No email'})
                                                            <ListBox.ItemIndicator />
                                                        </ListBox.Item>
                                                    );
                                                })
                                            ) : (
                                                <ListBox.Item key="no-manager" id="no-manager" textValue="No manager available" isDisabled>
                                                    No manager available
                                                </ListBox.Item>
                                            )}
                                        </ListBox>
                                    </Select.Popover>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 block">Branch Status</label>
                                <Select
                                    selectedKey={formData.status}
                                    onSelectionChange={(key) => setFormData({ ...formData, status: key || "active" })}
                                    placeholder="Select status"
                                >
                                    <Select.Trigger>
                                        <Select.Value />
                                        <Select.Indicator />
                                    </Select.Trigger>
                                    <Select.Popover>
                                        <ListBox>
                                            <ListBox.Item key="active" id="active" textValue="Active">
                                                Active
                                                <ListBox.ItemIndicator />
                                            </ListBox.Item>
                                            <ListBox.Item key="inactive" id="inactive" textValue="Inactive">
                                                Inactive
                                                <ListBox.ItemIndicator />
                                            </ListBox.Item>
                                            <ListBox.Item key="maintenance" id="maintenance" textValue="Maintenance">
                                                Maintenance
                                                <ListBox.ItemIndicator />
                                            </ListBox.Item>
                                        </ListBox>
                                    </Select.Popover>
                                </Select>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
                            <Button
                                variant="bordered"
                                onPress={() => router.back()}
                                className="border-gray-200 text-gray-700 font-medium"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                isLoading={loading}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-600/20 px-8"
                            >
                                Save Branch
                            </Button>
                        </div>

                    </form>
                </div>
            </Card>

        </div>
    );
};

export default CreateBranchForm;