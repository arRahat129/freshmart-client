import React from 'react';
import Link from 'next/link';
import { Card, Button } from "@heroui/react";
import { FiArrowLeft, FiMapPin, FiPhone, FiMail, FiEdit2 } from "react-icons/fi";
import { getBranchById } from '@/lib/api/branch';

export default async function BranchDetailsPage({ params }) {
    const { id } = await params;
    const res = await getBranchById(id);
    const branch = res?.data;

    if (!branch) {
        return (
            <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
                <h1 className="text-xl font-bold text-gray-800">Branch not found</h1>
                <Link href="/dashboard/owner/branches">
                    <Button className="bg-emerald-600 text-white">Back to Branches</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col gap-3">
                <Link href="/dashboard/owner/branches" className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors w-fit">
                    <FiArrowLeft size={16} /> Back to Branches
                </Link>
                <div className="flex items-center justify-between bg-white border border-emerald-100 p-6 rounded-2xl shadow-sm">
                    <div className="space-y-1">
                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">{branch.code}</span>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{branch.name}</h1>
                        <p className="text-sm text-gray-500">Detailed overview of branch configurations and data.</p>
                    </div>
                    <Link href={`/dashboard/owner/branches/${id}/edit`}>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2">
                            <FiEdit2 size={16} /> Edit Branch
                        </Button>
                    </Link>
                </div>
            </div>

            <Card className="border border-emerald-100 shadow-xl shadow-emerald-950/5 bg-white/90 backdrop-blur-md rounded-2xl p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <span className="text-xs font-semibold text-gray-400 uppercase">Status</span>
                        <p>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${branch.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                }`}>
                                {branch.status || 'Active'}
                            </span>
                        </p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-xs font-semibold text-gray-400 uppercase">City</span>
                        <p className="text-gray-800 font-medium">{branch.city}</p>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                        <span className="text-xs font-semibold text-gray-400 uppercase">Street Address</span>
                        <p className="text-gray-800 font-medium flex items-center gap-2">
                            <FiMapPin className="text-emerald-600 shrink-0" size={18} />
                            {branch.address}
                        </p>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <span className="text-xs font-semibold text-gray-400 uppercase">Phone Numbers</span>
                        <div className="space-y-1">
                            {branch.phones?.map((phone, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-gray-700 text-sm">
                                    <FiPhone className="text-emerald-600 shrink-0" size={16} />
                                    <span>{phone}</span>
                                </div>
                            )) || <span className="text-sm text-gray-400">No phone numbers</span>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <span className="text-xs font-semibold text-gray-400 uppercase">Email Addresses</span>
                        <div className="space-y-1">
                            {branch.emails?.map((email, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-gray-700 text-sm">
                                    <FiMail className="text-emerald-600 shrink-0" size={16} />
                                    <span>{email}</span>
                                </div>
                            )) || <span className="text-sm text-gray-400">No email addresses</span>}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}