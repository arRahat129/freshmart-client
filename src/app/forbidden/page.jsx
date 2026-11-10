import Link from 'next/link';
import { FiLock, FiArrowLeft } from 'react-icons/fi';

export default function ForbiddenPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white rounded-2xl border border-rose-100 shadow-xl p-10 max-w-md w-full text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                    <FiLock size={30} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Access Forbidden</h1>
                    <p className="text-sm text-gray-500 mt-2">
                        You do not have permission to access this resource.
                        Contact your administrator if you believe this is a mistake.
                    </p>
                </div>
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
                >
                    <FiArrowLeft size={15} /> Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
