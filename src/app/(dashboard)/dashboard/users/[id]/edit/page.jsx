'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Button, Input, Select, ListBox, Card } from "@heroui/react";
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { FiPlus, FiTrash2, FiUser, FiArrowLeft, FiUpload, FiX, FiAlertTriangle } from "react-icons/fi";
import toast from 'react-hot-toast';
import { uploadImage } from '@/lib/api/upload';
import { getUserById } from '@/lib/api/user';
import { getAllBranches } from '@/lib/api/branch';
import { actionUpdateUser } from '@/lib/actions/user';


function EditUserForm() {
    const router = useRouter();
    const params = useParams();
    const userId = params.id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [branches, setBranches] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: [''],
        address: '',
        image: '',
        branchId: '',
        employeeId: '',
        status: 'Active'
    });

    useEffect(() => {
        if (!userId) return;

        const loadInitialData = async () => {
            try {
                const [userRes, branchRes] = await Promise.all([
                    getUserById(userId),
                    getAllBranches()
                ]);

                if (userRes && (userRes.success || userRes.data)) {
                    const u = userRes.data || userRes;
                    // console.log('something nice', u);
                    const formattedData = {
                        name: u.name || '',
                        email: u.email || '',
                        phone: u.phone?.length ? u.phone : [''],
                        address: u.address || '',
                        image: u.image || '',
                        branchId: u.branchId ? String(u.branchId) : '',
                        employeeId: u.employeeId || '',
                        status: u.status || 'Active'
                    };
                    setFormData(formattedData);
                    setImagePreview(u.image || '');
                } else {
                    toast.error('Failed to load user data.');
                }

                if (branchRes && (branchRes.success || branchRes.data)) {
                    setBranches(branchRes.data || branchRes || []);
                }
            } catch (err) {
                toast.error('Error fetching data.');
            } finally {
                setFetching(false);
            }
        };
        loadInitialData();
    }, [userId]);

    const handlePhoneChange = (index, value) => {
        const newPhones = [...formData.phone];
        newPhones[index] = value;
        setFormData({ ...formData, phone: newPhones });
    };

    const addPhoneField = () => {
        setFormData({ ...formData, phone: [...formData.phone, ''] });
    };

    const removePhoneField = (index) => {
        const newPhones = formData.phone.filter((_, i) => i !== index);
        setFormData({ ...formData, phone: newPhones.length ? newPhones : [''] });
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleFormSubmitClick = (e) => {
        e.preventDefault();
        setShowConfirmModal(true);
    };

    const executeUpdate = async () => {
        setShowConfirmModal(false);
        setLoading(true);
        const toastId = toast.loading('Updating user...');

        try {
            let imageUrl = formData.image;
            if (imageFile) {
                const uploadData = new FormData();
                uploadData.append('image', imageFile);
                const uploadRes = await uploadImage(uploadData);
                if (uploadRes && (uploadRes.url || uploadRes.data?.url)) {
                    imageUrl = uploadRes.url || uploadRes.data.url;
                }
            }

            const payload = {
                ...formData,
                image: imageUrl,
                phone: formData.phone.filter(p => p.trim() !== ''),
                branchId: (!formData.branchId || formData.branchId === 'no-branch') ? null : formData.branchId,
                updatedBy: 'Admin'
            };

            const data = await actionUpdateUser(userId, payload);

            if (data && (data.success !== false)) {
                toast.success('User updated successfully!', { id: toastId });
                router.push('/dashboard/users');
            } else {
                toast.error(data?.message || 'Failed to update user.', { id: toastId });
            }
        } catch (err) {
            toast.error(err.message || 'An unexpected error occurred.', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className="py-20 text-center text-gray-500 font-medium">Loading user information...</div>;
    }

    return (
        <div className="space-y-8">
            <Card className="border border-emerald-100 shadow-xl shadow-emerald-950/5 bg-white/90 backdrop-blur-md rounded-2xl">
                <div className="p-8">
                    <form onSubmit={handleFormSubmitClick} className="space-y-6">

                        <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-emerald-200 bg-gray-50 shrink-0 flex items-center justify-center">
                                {imagePreview ? (
                                    <Image src={imagePreview} alt="Profile Preview" fill sizes="96px" unoptimized className="object-cover" />
                                ) : (
                                    <span className="text-xs font-medium text-gray-400 text-center px-1">No Image</span>
                                )}
                            </div>
                            <div className="space-y-2 flex-1">
                                <label className="text-sm font-semibold text-gray-700 block">Profile Picture</label>
                                <label className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-medium text-sm cursor-pointer hover:bg-emerald-100 transition-colors border border-emerald-200">
                                    <FiUpload size={16} /> Change Image
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                </label>
                                <p className="text-xs text-gray-400">PNG, JPG or WEBP. Max size 5MB.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 block">Full Name</label>
                                <Input placeholder="e.g. John Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required variant="bordered" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 block">Email Address</label>
                                <Input placeholder="e.g. john@freshmart.com" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required variant="bordered" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 block">Employee ID</label>
                                <Input placeholder="e.g. EMP-DHN-001" value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} required variant="bordered" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 block">Status</label>
                                <Select selectedKey={formData.status} onSelectionChange={(key) => setFormData({ ...formData, status: key || "Active" })} placeholder="Select status">
                                    <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
                                    <Select.Popover>
                                        <ListBox>
                                            <ListBox.Item key="Active" id="Active" textValue="Active">Active<ListBox.ItemIndicator /></ListBox.Item>
                                            <ListBox.Item key="Inactive" id="Inactive" textValue="Inactive">Inactive<ListBox.ItemIndicator /></ListBox.Item>
                                        </ListBox>
                                    </Select.Popover>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 block">Assigned Branch</label>
                                <Select selectedKey={formData.branchId} onSelectionChange={(key) => setFormData({ ...formData, branchId: key || "" })} placeholder="Select branch">
                                    <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
                                    <Select.Popover>
                                        <ListBox>
                                            {branches.length > 0 ? branches.map((b) => {
                                                const bId = String(b._id || b.id);
                                                return (
                                                    <ListBox.Item key={bId} id={bId} textValue={b.name}>
                                                        {b.name} ({b.code})<ListBox.ItemIndicator />
                                                    </ListBox.Item>
                                                );
                                            }) : (
                                                <ListBox.Item key="no-branch" id="no-branch" textValue="No branches available" isDisabled>No branches available</ListBox.Item>
                                            )}
                                        </ListBox>
                                    </Select.Popover>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 block">Street Address</label>
                            <Input className={'w-full'} placeholder="e.g. House 42, Road 11, Banani, Dhaka" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} variant="bordered" />
                        </div>

                        <div className="space-y-3 pt-2">
                            <label className="text-sm font-semibold text-gray-700 block">Phone Numbers</label>
                            {formData.phone.map((ph, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <Input placeholder="e.g. +8801700000000" value={ph} onChange={(e) => handlePhoneChange(index, e.target.value)} variant="bordered" className="flex-1" />
                                    {formData.phone.length > 1 && (
                                        <Button isIconOnly color="danger" variant="light" onPress={() => removePhoneField(index)}>
                                            <FiTrash2 size={18} />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button size="sm" variant="flat" className="bg-emerald-50 text-emerald-700 font-medium mt-1 flex items-center gap-2" onPress={addPhoneField}>
                                <FiPlus size={16} /> Add Another Phone
                            </Button>
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
                            <Button type="button" variant="bordered" onPress={() => router.back()} className="border-gray-200 text-gray-700 font-medium">Cancel</Button>
                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-600/20 px-8">Save Changes</Button>
                        </div>

                    </form>
                </div>
            </Card>

            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-emerald-100 space-y-6 relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setShowConfirmModal(false)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <FiX size={20} />
                        </button>

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <FiAlertTriangle size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Confirm Updates</h3>
                                <p className="text-sm text-gray-500">Are you sure you want to save these modifications to user <span className="font-semibold text-gray-700">{formData.name}</span>?</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                            <Button
                                variant="bordered"
                                onPress={() => setShowConfirmModal(false)}
                                className="border-gray-200 text-gray-700 font-medium"
                            >
                                Cancel
                            </Button>
                            <Button
                                onPress={executeUpdate}
                                isLoading={loading}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-600/20"
                            >
                                Yes, Save
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function EditUserPage() {
    const router = useRouter();

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col gap-3">
                <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors w-fit">
                    <FiArrowLeft size={16} /> Back to Users
                </button>
                <div className="flex items-center justify-between bg-white border border-emerald-100 p-6 rounded-2xl shadow-sm">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                            <FiUser size={12} /> Workforce Management
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit User Account</h1>
                        <p className="text-sm text-gray-500">Modify employee profile, permissions, and branch assignments.</p>
                    </div>
                </div>
            </div>

            <Suspense fallback={<div className="py-20 text-center text-gray-500 font-medium">Loading edit form...</div>}>
                <EditUserForm />
            </Suspense>
        </div>
    );
}