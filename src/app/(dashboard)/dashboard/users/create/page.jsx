import React from 'react';
import CreateUserForm from './CreateUserForm';
import { getAllBranches } from '@/lib/api/branch';

export default async function SharedCreateUserPage() {
    let branches = [];
    try {
        const res = await getAllBranches();
        branches = res?.data || [];
    } catch (err) {
        console.error("Failed to load branches:", err);
    }

    // Replace this with your actual session getter (e.g., Better Auth session)
    const sessionUser = {
        role: 'admin', // or 'owner', 'super-admin'
        name: 'Store Admin',
        employeeId: 'ADM-01'
    };

    return <CreateUserForm branches={branches} sessionUser={sessionUser} />;
}