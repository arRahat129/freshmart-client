'use client';

import React, { useState } from 'react';
import { Button, Input, Select, ListBox, Card } from "@heroui/react";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiPlus, FiTrash2, FiUser, FiArrowLeft, FiEye, FiEyeOff, FiUpload, FiX } from "react-icons/fi";
import toast from 'react-hot-toast';
import { actionCreateUser } from '@/lib/actions/user';
import { uploadImage } from '@/lib/api/upload';
import { useSession } from '@/lib/auth-client';

const DEFAULT_AVATAR = "https://i.ibb.co.com/JjyYmdRQ/pngtree-user-profile-avatar-png-image-10211467.png";

export default function CreateUserForm({ branches = [] }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const { data: session } = useSession();
    const sessionUser = session?.user;
    // console.log(sessionUser);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'staff',
        phone: [''],
        address: '',
        image: '',
        branchId: '',
        employeeId: '',
        status: 'Active'
    });

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

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setFormData({ ...formData, image: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.role === 'manager' && formData.branchId && formData.branchId !== 'no-branch') {
            const selectedBranch = branches.find(b => String(b._id || b.id) === formData.branchId);
            if (selectedBranch && selectedBranch.manager) {
                toast.error('This branch already has a manager assigned.');
                return;
            }
        }

        setLoading(true);
        const toastId = toast.loading('Creating user...');

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

            const finalImageUrl = imageUrl && imageUrl.trim() !== '' ? imageUrl : DEFAULT_AVATAR;

            const authorIdentifier = sessionUser?.employeeId;

            const payload = {
                ...formData,
                image: finalImageUrl,
                phone: formData.phone.filter(p => p.trim() !== ''),
                branchId: (!formData.branchId || formData.branchId === 'no-branch') ? null : formData.branchId,
                createdBy: authorIdentifier,
                updatedBy: authorIdentifier
            };

            const res = await actionCreateUser(payload);
            if (res && res.success) {
                toast.success('User created successfully!', { id: toastId });
                router.push('/dashboard/users');
            } else {
                toast.error(res?.message || 'Failed to create user.', { id: toastId });
            }
        } catch (err) {
            toast.error(err.message || 'An unexpected error occurred.', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

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
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Register New User</h1>
                        <p className="text-sm text-gray-500">Create system staff accounts, assign branch oversight, and define operational roles.</p>
                    </div>
                </div>
            </div>

            <Card className="border border-emerald-100 shadow-xl shadow-emerald-950/5 bg-white/90 backdrop-blur-md rounded-2xl">
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-emerald-200 bg-gray-50 shrink-0 flex items-center justify-center">
                                {imagePreview ? (
                                    <>
                                        <Image src={imagePreview} alt="Profile Preview" fill sizes="96px" unoptimized className="object-cover" />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
                                            title="Remove image"
                                        >
                                            <FiX size={20} />
                                        </button>
                                    </>
                                ) : (
                                    <span className="text-xs font-medium text-gray-400 text-center px-1">Upload an image</span>
                                )}
                            </div>
                            <div className="space-y-2 flex-1">
                                <label className="text-sm font-semibold text-gray-700 block">Profile Picture</label>
                                <label className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-medium text-sm cursor-pointer hover:bg-emerald-100 transition-colors border border-emerald-200">
                                    <FiUpload size={16} /> Upload Image
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                </label>
                                <p className="text-xs text-gray-400">PNG, JPG or WEBP. Max size 5MB. Leave empty to use default avatar.</p>
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
                                <label className="text-sm font-semibold text-gray-700 block">Password</label>
                                <div className="relative">
                                    <Input
                                        placeholder="••••••••"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        variant="bordered"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 block">Employee ID (SKU pattern)</label>
                                <Input placeholder="e.g. EMP-DHN-001" value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} required variant="bordered" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 block">Role</label>
                                <Select selectedKey={formData.role} onSelectionChange={(key) => setFormData({ ...formData, role: key || "staff" })} placeholder="Select role">
                                    <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
                                    <Select.Popover>
                                        <ListBox>
                                            <ListBox.Item key="owner" id="owner" textValue="Owner">Owner<ListBox.ItemIndicator /></ListBox.Item>
                                            <ListBox.Item key="superadmin" id="superadmin" textValue="Super Admin">Super Admin<ListBox.ItemIndicator /></ListBox.Item>
                                            <ListBox.Item key="admin" id="admin" textValue="Admin">Admin<ListBox.ItemIndicator /></ListBox.Item>
                                            <ListBox.Item key="manager" id="manager" textValue="Manager">Manager<ListBox.ItemIndicator /></ListBox.Item>
                                            <ListBox.Item key="cashier" id="cashier" textValue="Cashier">Cashier<ListBox.ItemIndicator /></ListBox.Item>
                                            <ListBox.Item key="staff" id="staff" textValue="Staff / Employee">Staff / Employee<ListBox.ItemIndicator /></ListBox.Item>
                                        </ListBox>
                                    </Select.Popover>
                                </Select>
                            </div>

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
                                                        {b.name} ({b.code}) {b.manager ? '[Has Manager]' : ''}<ListBox.ItemIndicator />
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
                            <Input placeholder="e.g. House 42, Road 11, Banani, Dhaka" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} variant="bordered" />
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
                            <Button variant="bordered" onPress={() => router.back()} className="border-gray-200 text-gray-700 font-medium">Cancel</Button>
                            <Button type="submit" isLoading={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-600/20 px-8">Create User</Button>
                        </div>

                    </form>
                </div>
            </Card>
        </div>
    );
}