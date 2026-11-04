import React from 'react';
import EditBranchForm from './EditBranchForm';
import { getBranchById } from '@/lib/api/branch';
import { getAllManagers } from '@/lib/api/manager';

export default async function EditBranchPage({ params }) {
    const { id } = await params;

    let branch = null;
    let managers = [];

    try {
        const branchRes = await getBranchById(id);
        branch = branchRes?.data;
    } catch (err) {
        console.error("Failed to fetch branch details:", err);
    }

    try {
        const managersRes = await getAllManagers();
        managers = managersRes?.data || [];
    } catch (err) {
        console.error("Failed to fetch managers list (non-fatal):", err);
    }

    return <EditBranchForm branch={branch} managers={managers} branchId={id} />;
}