'use client';

import React, { useEffect, useState } from 'react';
import { Card, Button } from "@heroui/react";
import { FiPlus, FiMapPin, FiPhone, FiMail, FiUser, FiTrash2, FiEdit2, FiEye } from "react-icons/fi";
import Link from 'next/link';
import { getAllBranches } from '@/lib/api/branch';

const AllBranchesPage = () => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                setLoading(true);
                const res = await getAllBranches();

                console.log("Fetched Branches Data:", res);

                if (res && res.success) {
                    setBranches(res.data || []);
                } else {
                    setErrorMsg(res?.message || 'Failed to load branches.');
                }
            } catch (err) {
                console.error("Error loading branches:", err);
                setErrorMsg(err.message || 'An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        };

        fetchBranches();
    }, []);

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            <div className="flex items-center justify-between bg-white border border-emerald-100 p-6 rounded-2xl shadow-sm">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                        <FiMapPin size={12} /> Store Network
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Supermarket Branches</h1>
                    <p className="text-sm text-gray-500">Manage all registered physical store outlets, locations, and contact points.</p>
                </div>
                <Link href="/dashboard/owner/branches/create">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-600/20 flex items-center gap-2">
                        <FiPlus size={18} /> Register Branch
                    </Button>
                </Link>
            </div>

            {errorMsg && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                    {errorMsg}
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-48 bg-gray-100 rounded-2xl border border-gray-200"></div>
                    ))}
                </div>
            ) : branches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {branches.map((branch) => {
                        const branchId = branch._id || branch.id;
                        return (
                            <Card key={branchId} className="border border-emerald-100 shadow-xl shadow-emerald-950/5 bg-white/90 backdrop-blur-md rounded-2xl p-6 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">{branch.code}</span>
                                        <h3 className="text-lg font-bold text-gray-900">{branch.name}</h3>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${branch.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                        }`}>
                                        {branch.status || 'Active'}
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-start gap-2">
                                        <FiMapPin className="text-emerald-600 mt-0.5 shrink-0" size={16} />
                                        <span>{branch.address}, {branch.city}</span>
                                    </div>
                                    {branch.phones?.[0] && (
                                        <div className="flex items-center gap-2">
                                            <FiPhone className="text-emerald-600 shrink-0" size={16} />
                                            <span>{branch.phones[0]}</span>
                                        </div>
                                    )}
                                    {branch.emails?.[0] && (
                                        <div className="flex items-center gap-2">
                                            <FiMail className="text-emerald-600 shrink-0" size={16} />
                                            <span>{branch.emails[0]}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center justify-end gap-1 pt-4 border-t border-gray-100 mt-2">
                                    <Link href={`/dashboard/owner/branches/${branchId}`}>
                                        <Button isIconOnly size="sm" variant="light" className="text-gray-500 hover:text-emerald-600 hover:bg-emerald-50">
                                            <FiEye size={16} />
                                        </Button>
                                    </Link>
                                    <Link href={`/dashboard/owner/branches/${branchId}/edit`}>
                                        <Button isIconOnly size="sm" variant="light" className="text-gray-500 hover:text-blue-600 hover:bg-blue-50">
                                            <FiEdit2 size={16} />
                                        </Button>
                                    </Link>
                                    <Button 
                                        isIconOnly 
                                        size="sm" 
                                        variant="light" 
                                        className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => {
                                            console.log("Delete branch:", branchId);
                                        }}
                                    >
                                        <FiTrash2 size={16} />
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 bg-white border border-emerald-100 rounded-2xl space-y-3">
                    <p className="text-gray-500 font-medium">No branches registered yet.</p>
                    <Link href="/dashboard/owner/branches/create">
                        <Button size="sm" variant="flat" className="bg-emerald-50 text-emerald-700 font-semibold">
                            Create your first branch
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default AllBranchesPage;