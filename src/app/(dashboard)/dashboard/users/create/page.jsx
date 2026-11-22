import React, { Suspense } from 'react';
import { Spinner } from '@heroui/react';
import CreateUserForm from './CreateUserForm';
import { getAllBranches } from '@/lib/api/branch';

async function CreateUserContent() {
    let branches = [];
    try {
        const res = await getAllBranches();
        branches = res?.data || [];
    } catch (err) {
        console.error("Failed to load branches:", err);
    }

    return <CreateUserForm branches={branches} />;
}

export default function SharedCreateUserPage() {
    return (
        <Suspense
            fallback={
                <div className="flex justify-center items-center py-24">
                    <Spinner size="lg" label="Loading branches..." />
                </div>
            }
        >
            <CreateUserContent />
        </Suspense>
    );
}