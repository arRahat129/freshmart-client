'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Card, Button, Chip } from "@heroui/react";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiPlus, FiEye, FiEdit2, FiTrash2, FiUser, FiMapPin, FiPhone, FiMail, FiX, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getAllUsers } from '@/lib/api/user';
import { getAllBranches } from '@/lib/api/branch';
import { actionUpdateUserRole, actionDeleteUser } from '@/lib/actions/user';
import DeleteUserModal from '@/component/dashboard/users/modals/DeleteUserModal';
import ChangeRoleModal from '@/component/dashboard/users/modals/ChangeRoleModal';

function UsersListContent() {
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [branchesMap, setBranchesMap] = useState({});
    const [loadingData, setLoadingData] = useState(true);

    const [selectedUserForView, setSelectedUserForView] = useState(null);
    const [selectedUserForDelete, setSelectedUserForDelete] = useState(null);
    const [selectedUserForRole, setSelectedUserForRole] = useState(null);

    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdatingRole, setIsUpdatingRole] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, branchesRes] = await Promise.all([
                    getAllUsers(),
                    getAllBranches()
                ]);

                setUsers(usersRes?.data || []);
                const branches = branchesRes?.data || [];
                const bMap = {};
                branches.forEach(b => {
                    const bId = String(b._id || b.id);
                    bMap[bId] = b.name;
                });
                setBranchesMap(bMap);
            } catch (error) {
                toast.error("Failed to load users data.");
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, []);

    const handleDeleteConfirm = async () => {
        if (!selectedUserForDelete) return;
        setIsDeleting(true);
        const toastId = toast.loading('Deleting user...');

        try {
            const userId = selectedUserForDelete._id || selectedUserForDelete.id;
            const result = await actionDeleteUser(userId, { deletedBy: 'Admin' });

            if (result && result.success !== false) {
                setUsers(users.filter(u => String(u._id || u.id) !== String(userId)));
                toast.success('User deleted successfully!', { id: toastId });
                setSelectedUserForDelete(null);
            } else {
                toast.error(result?.message || 'Failed to delete user.', { id: toastId });
            }
        } catch (err) {
            toast.error(err.message || 'An unexpected error occurred.', { id: toastId });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleRoleUpdateConfirm = async (newRole) => {
        if (!selectedUserForRole) return;
        setIsUpdatingRole(true);
        const toastId = toast.loading('Updating user role...');

        try {
            const userId = selectedUserForRole._id || selectedUserForRole.id;
            const result = await actionUpdateUserRole(userId, { role: newRole });

            if (result && result.success !== false) {
                setUsers(users.map(u => String(u._id || u.id) === String(userId) ? { ...u, role: newRole } : u));
                toast.success('User role updated successfully!', { id: toastId });
                setSelectedUserForRole(null);
            } else {
                toast.error(result?.message || 'Failed to update role.', { id: toastId });
            }
        } catch (err) {
            toast.error(err.message || 'An unexpected error occurred while updating role.', { id: toastId });
        } finally {
            setIsUpdatingRole(false);
        }
    };

    if (loadingData) {
        return <div className="py-20 text-center text-gray-500 font-medium">Loading users directory...</div>;
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.length > 0 ? (
                    users.map((user) => {
                        const branchName = user.branchId && branchesMap[String(user.branchId)] ? branchesMap[String(user.branchId)] : 'Unassigned Branch';

                        return (
                            <Card key={user._id || user.id} className="border border-emerald-100 shadow-lg shadow-emerald-950/5 bg-white/90 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between space-y-4">
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-14 h-14 rounded-full overflow-hidden border border-emerald-200 bg-gray-50 shrink-0">
                                                <Image src={user.image} alt={user.name || 'User'} fill sizes="56px" unoptimized className="object-cover" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-base">{user.name}</h3>
                                                <p className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                                                    {user.employeeId || 'NO-ID'}
                                                </p>
                                            </div>
                                        </div>
                                        <Chip size="sm" variant="flat" className={`font-medium text-xs ${user.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                            {user.status || 'Active'}
                                        </Chip>
                                    </div>

                                    <div className="space-y-2 text-sm text-gray-600 pt-2 border-t border-gray-100">
                                        <div className="flex items-center gap-2 truncate">
                                            <FiMail size={14} className="text-emerald-600 shrink-0" />
                                            <span className="truncate">{user.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FiPhone size={14} className="text-emerald-600 shrink-0" />
                                            <span>{Array.isArray(user.phone) ? user.phone.join(', ') : (user.phone || 'N/A')}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FiMapPin size={14} className="text-emerald-600 shrink-0" />
                                            <span className="truncate">{branchName}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                        <span className="text-xs font-semibold uppercase bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg">
                                            Role: {user.role}
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="flat"
                                            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold h-7"
                                            onPress={() => setSelectedUserForRole(user)}
                                        >
                                            <FiShield size={12} /> Change Role
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
                                    <div className="text-xs text-gray-400">
                                        Last Login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="light"
                                            className="text-emerald-700 hover:bg-emerald-50"
                                            title="View Details"
                                            onPress={() => setSelectedUserForView(user)}
                                        >
                                            <FiEye size={16} />
                                        </Button>
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="light"
                                            className="text-amber-600 hover:bg-amber-50"
                                            title="Edit User"
                                            onPress={() => router.push(`/dashboard/users/${user._id || user.id}/edit`)}
                                        >
                                            <FiEdit2 size={16} />
                                        </Button>
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="light"
                                            className="text-rose-600 hover:bg-rose-50"
                                            title="Delete User"
                                            onPress={() => setSelectedUserForDelete(user)}
                                        >
                                            <FiTrash2 size={16} />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                ) : (
                    <div className="col-span-full py-16 text-center bg-white border border-emerald-100 rounded-2xl shadow-sm">
                        <p className="text-gray-500 font-medium">No users found in the database.</p>
                        <p className="text-sm text-gray-400 mt-1">Click the button above to register your first system user.</p>
                    </div>
                )}
            </div>

            {selectedUserForView && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-emerald-100 space-y-6 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setSelectedUserForView(null)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <FiX size={20} />
                        </button>

                        <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-200 bg-gray-50 shrink-0">
                                <Image src={selectedUserForView.image} alt="Avatar" fill sizes="64px" unoptimized className="object-cover" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{selectedUserForView.name}</h2>
                                <p className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-1">
                                    {selectedUserForView.employeeId || 'NO-ID'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 text-sm text-gray-600">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold text-gray-400 uppercase block">Email Address</span>
                                    <p className="font-medium text-gray-800 break-all">{selectedUserForView.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold text-gray-400 uppercase block">Role</span>
                                    <p className="font-medium text-gray-800 uppercase">{selectedUserForView.role}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold text-gray-400 uppercase block">Status</span>
                                    <Chip size="sm" variant="flat" className="bg-emerald-100 text-emerald-800 font-medium">
                                        {selectedUserForView.status || 'Active'}
                                    </Chip>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold text-gray-400 uppercase block">Assigned Branch</span>
                                    <p className="font-medium text-gray-800">
                                        {selectedUserForView.branchId && branchesMap[String(selectedUserForView.branchId)] ? branchesMap[String(selectedUserForView.branchId)] : 'Unassigned'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <span className="text-xs font-semibold text-gray-400 uppercase block">Phone Numbers</span>
                                <p className="font-medium text-gray-800">
                                    {Array.isArray(selectedUserForView.phone) ? selectedUserForView.phone.join(', ') : (selectedUserForView.phone || 'N/A')}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <span className="text-xs font-semibold text-gray-400 uppercase block">Street Address</span>
                                <p className="font-medium text-gray-800">{selectedUserForView.address || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            <Button
                                className="bg-emerald-600 text-white font-semibold"
                                onPress={() => setSelectedUserForView(null)}
                            >
                                Close Details
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <DeleteUserModal
                isOpen={!!selectedUserForDelete}
                onClose={() => setSelectedUserForDelete(null)}
                onConfirm={handleDeleteConfirm}
                userName={selectedUserForDelete?.name || 'this user'}
                loading={isDeleting}
            />

            <ChangeRoleModal
                isOpen={!!selectedUserForRole}
                onClose={() => setSelectedUserForRole(null)}
                onConfirm={handleRoleUpdateConfirm}
                user={selectedUserForRole}
                loading={isUpdatingRole}
            />
        </>
    );
}

export default function UsersPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-emerald-100 p-6 rounded-2xl shadow-sm">
                <div className="space-y-1">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors w-fit mb-2">
                        <FiArrowLeft size={16} /> Back to Dashboard
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                            <FiUser size={12} /> Workforce Management
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Users Directory</h1>
                    <p className="text-sm text-gray-500">Manage employee accounts, roles, branch assignments, and system permissions.</p>
                </div>
                <div>
                    <Link href="/dashboard/users/create">
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-600/20 flex items-center gap-2">
                            <FiPlus size={18} /> Add New User
                        </Button>
                    </Link>
                </div>
            </div>

            <Suspense fallback={<div className="py-16 text-center text-gray-500 font-medium">Loading users directory...</div>}>
                <UsersListContent />
            </Suspense>
        </div>
    );
}